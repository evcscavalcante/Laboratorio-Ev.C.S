import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { organizations, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware de Isolamento de Dados Organizacionais
 * Implementa segurança de dados entre organizações com suporte a hierarquia
 */

interface OrganizationHierarchy {
  id: number;
  name: string;
  parentOrganizationId: number | null;
  organizationType: 'independent' | 'headquarters' | 'affiliate';
  accessLevel: 'isolated' | 'parent_access' | 'full_hierarchy';
  children?: OrganizationHierarchy[];
}

export class DataIsolationService {
  /**
   * Busca a árvore hierárquica da organização
   */
  static async getOrganizationHierarchy(organizationId: number): Promise<OrganizationHierarchy | null> {
    try {
      const org = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
      if (!org.length) return null;

      const organization = org[0];
      
      // Busca organizações filhas
      const children = await db.select().from(organizations)
        .where(eq(organizations.parentOrganizationId, organizationId));

      return {
        id: organization.id,
        name: organization.name,
        parentOrganizationId: organization.parentOrganizationId,
        organizationType: organization.organizationType as any,
        accessLevel: organization.accessLevel as any,
        children: children.map(child => ({
          id: child.id,
          name: child.name,
          parentOrganizationId: child.parentOrganizationId,
          organizationType: child.organizationType as any,
          accessLevel: child.accessLevel as any
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar hierarquia organizacional:', error);
      return null;
    }
  }

  /**
   * Determina quais organizações o usuário pode acessar
   */
  static async getAccessibleOrganizations(userOrganizationId: number): Promise<number[]> {
    const hierarchy = await this.getOrganizationHierarchy(userOrganizationId);
    if (!hierarchy) return [userOrganizationId];

    const accessibleIds = [userOrganizationId];

    // Se é uma matriz (headquarters), pode acessar todas as filiais
    if (hierarchy.organizationType === 'headquarters') {
      const affiliates = await db.select().from(organizations)
        .where(eq(organizations.parentOrganizationId, userOrganizationId));
      
      accessibleIds.push(...affiliates.map(org => org.id));
    }

    // Se tem acesso hierárquico completo
    if (hierarchy.accessLevel === 'full_hierarchy') {
      const allRelated = await this.getAllRelatedOrganizations(userOrganizationId);
      accessibleIds.push(...allRelated);
    }

    return Array.from(new Set(accessibleIds)); // Remove duplicatas
  }

  /**
   * Busca todas as organizações relacionadas na hierarquia
   */
  static async getAllRelatedOrganizations(organizationId: number): Promise<number[]> {
    const related: number[] = [];
    
    // Busca organização pai se existir
    const org = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
    if (org.length && org[0].parentOrganizationId) {
      related.push(org[0].parentOrganizationId);
    }

    // Busca todas as filiais
    const children = await db.select().from(organizations)
      .where(eq(organizations.parentOrganizationId, organizationId));
    
    related.push(...children.map(child => child.id));

    return related;
  }

  /**
   * Verifica se o usuário pode acessar dados de uma organização específica
   */
  static async canAccessOrganization(userOrganizationId: number, targetOrganizationId: number): Promise<boolean> {
    if (userOrganizationId === targetOrganizationId) return true;

    const accessibleOrgs = await this.getAccessibleOrganizations(userOrganizationId);
    return accessibleOrgs.includes(targetOrganizationId);
  }

  /**
   * Middleware para filtrar dados por organização
   */
  static createDataFilter() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (req as any).user;
        
        if (!user || !user.organizationId) {
          console.log('🔒 Acesso negado: usuário sem organização definida');
          return res.status(403).json({ 
            error: 'Acesso negado',
            message: 'Usuário deve estar associado a uma organização'
          });
        }

        // Adiciona informações de isolamento de dados na requisição
        const accessibleOrgs = await DataIsolationService.getAccessibleOrganizations(user.organizationId);
        (req as any).dataIsolation = {
          userOrganizationId: user.organizationId,
          accessibleOrganizations: accessibleOrgs,
          canAccessOrganization: (targetOrgId: number) => accessibleOrgs.includes(targetOrgId)
        };

        console.log(`🔐 Isolamento de dados: usuário org ${user.organizationId} pode acessar orgs [${accessibleOrgs.join(', ')}]`);
        next();
      } catch (error) {
        console.error('Erro no middleware de isolamento de dados:', error);
        res.status(500).json({ error: 'Erro interno de segurança' });
      }
    };
  }

  /**
   * Valida acesso a ensaios específicos
   */
  static async validateTestAccess(userId: number, testOrganizationId: number): Promise<boolean> {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length || !user[0].organizationId) return false;

      return await this.canAccessOrganization(user[0].organizationId, testOrganizationId);
    } catch (error) {
      console.error('Erro ao validar acesso ao ensaio:', error);
      return false;
    }
  }

  /**
   * Cria filtro SQL para consultas organizacionais
   */
  static createOrganizationFilter(userOrganizationId: number, accessibleOrgs: number[]) {
    return {
      userOrganizationId,
      accessibleOrganizations: accessibleOrgs,
      sqlFilter: `organization_id IN (${accessibleOrgs.join(',')})`
    };
  }
}

/**
 * Middleware para aplicar isolamento automático em todas as rotas de API
 */
export const applyDataIsolation = DataIsolationService.createDataFilter();

/**
 * Função utilitária para verificar acesso em controladores
 */
export const checkOrganizationAccess = async (req: Request, targetOrganizationId: number): Promise<boolean> => {
  const dataIsolation = (req as any).dataIsolation;
  if (!dataIsolation) return false;
  
  return dataIsolation.canAccessOrganization(targetOrganizationId);
};

/**
 * Middleware específico para proteção de ensaios
 */
export const protectTestData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const testId = req.params.id;
    
    if (!user || !testId) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }

    // TODO: Implementar verificação específica quando os ensaios tiverem campo organization_id
    // Por enquanto, permite acesso baseado na autenticação do usuário
    console.log(`🧪 Acesso ao ensaio ${testId} liberado para usuário ${user.email}`);
    next();
  } catch (error) {
    console.error('Erro na proteção de dados de ensaio:', error);
    res.status(500).json({ error: 'Erro interno de segurança' });
  }
};

export default DataIsolationService;