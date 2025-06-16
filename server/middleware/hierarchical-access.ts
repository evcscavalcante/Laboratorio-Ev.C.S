import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { organizations, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Sistema de Acesso Hierárquico Duplo
 * 
 * REGRAS CRÍTICAS (NÃO PODE HAVER RETROCESSO):
 * 1. Organizacional: Matriz acessa filiais, mas filiais NÃO acessam matriz
 * 2. Usuários: Admin acessa dados de Visualizador, mas Visualizador NÃO acessa dados de Admin
 * 3. Empresas independentes: TOTALMENTE isoladas entre si
 * 4. Compatibilidade: Sistema atual deve continuar funcionando 100%
 */

interface UserHierarchy {
  level: number;
  role: string;
  canAccessLowerLevels: boolean;
  canAccessSameLevel: boolean;
  canAccessHigherLevels: boolean;
}

interface OrganizationAccess {
  organizationId: number;
  organizationType: 'independent' | 'headquarters' | 'affiliate';
  parentOrganizationId: number | null;
  accessibleOrganizations: number[];
  restrictedOrganizations: number[];
}

export class HierarchicalAccessService {
  
  /**
   * Mapa de hierarquia de usuários (do menor para o maior nível)
   */
  static readonly USER_HIERARCHY: Record<string, UserHierarchy> = {
    'VIEWER': {
      level: 1,
      role: 'VIEWER',
      canAccessLowerLevels: false, // Não há níveis abaixo
      canAccessSameLevel: true,
      canAccessHigherLevels: false
    },
    'TECHNICIAN': {
      level: 2,
      role: 'TECHNICIAN', 
      canAccessLowerLevels: true,  // Pode acessar VIEWER
      canAccessSameLevel: true,
      canAccessHigherLevels: false
    },
    'MANAGER': {
      level: 3,
      role: 'MANAGER',
      canAccessLowerLevels: true,  // Pode acessar VIEWER, TECHNICIAN
      canAccessSameLevel: true,
      canAccessHigherLevels: false
    },
    'ADMIN': {
      level: 4,
      role: 'ADMIN',
      canAccessLowerLevels: true,  // Pode acessar todos abaixo
      canAccessSameLevel: true,
      canAccessHigherLevels: false
    },
    'DEVELOPER': {
      level: 5,
      role: 'DEVELOPER',
      canAccessLowerLevels: true,  // Acesso total para desenvolvimento
      canAccessSameLevel: true,
      canAccessHigherLevels: false
    }
  };

  /**
   * Verifica se um usuário pode acessar dados de outro usuário baseado na hierarquia
   */
  static canAccessUserData(accessorRole: string, targetRole: string): boolean {
    const accessor = this.USER_HIERARCHY[accessorRole];
    const target = this.USER_HIERARCHY[targetRole];
    
    if (!accessor || !target) {
      console.log(`⚠️ Role não reconhecido: accessor=${accessorRole}, target=${targetRole}`);
      return false;
    }

    // Mesmo nível: sempre permitido
    if (accessor.level === target.level) {
      return accessor.canAccessSameLevel;
    }
    
    // Nível superior acessando inferior: permitido se canAccessLowerLevels
    if (accessor.level > target.level) {
      return accessor.canAccessLowerLevels;
    }
    
    // Nível inferior tentando acessar superior: sempre negado
    return false;
  }

  /**
   * Calcula organizações acessíveis baseado na hierarquia organizacional
   */
  static async calculateOrganizationAccess(userOrganizationId: number): Promise<OrganizationAccess> {
    try {
      const userOrg = await db.select().from(organizations)
        .where(eq(organizations.id, userOrganizationId))
        .limit(1);

      if (!userOrg.length) {
        throw new Error(`Organização ${userOrganizationId} não encontrada`);
      }

      const org = userOrg[0];
      const accessibleOrganizations = [userOrganizationId]; // Sempre pode acessar própria org
      const restrictedOrganizations: number[] = [];

      // REGRA 1: Se é MATRIZ, pode acessar FILIAIS
      if (org.organizationType === 'headquarters') {
        const affiliates = await db.select().from(organizations)
          .where(eq(organizations.parentOrganizationId, userOrganizationId));
        
        accessibleOrganizations.push(...affiliates.map(affiliate => affiliate.id));
        console.log(`🏢 Matriz ${userOrganizationId} pode acessar filiais: [${affiliates.map(a => a.id).join(', ')}]`);
      }

      // REGRA 2: Se é FILIAL, NÃO pode acessar MATRIZ
      if (org.organizationType === 'affiliate' && org.parentOrganizationId) {
        restrictedOrganizations.push(org.parentOrganizationId);
        console.log(`🔒 Filial ${userOrganizationId} NÃO pode acessar matriz ${org.parentOrganizationId}`);
      }

      // REGRA 3: Organizações independentes não acessam outras organizações
      if (org.organizationType === 'independent') {
        const otherOrgs = await db.select().from(organizations)
          .where(eq(organizations.organizationType, 'independent'));
        
        restrictedOrganizations.push(
          ...otherOrgs
            .filter(other => other.id !== userOrganizationId)
            .map(other => other.id)
        );
        console.log(`🔐 Organização independente ${userOrganizationId} isolada de outras independentes`);
      }

      return {
        organizationId: userOrganizationId,
        organizationType: org.organizationType as any,
        parentOrganizationId: org.parentOrganizationId,
        accessibleOrganizations,
        restrictedOrganizations
      };

    } catch (error) {
      console.error('Erro ao calcular acesso organizacional:', error);
      // Fallback seguro: acesso apenas à própria organização
      return {
        organizationId: userOrganizationId,
        organizationType: 'independent',
        parentOrganizationId: null,
        accessibleOrganizations: [userOrganizationId],
        restrictedOrganizations: []
      };
    }
  }

  /**
   * Filtra usuários baseado na hierarquia dupla
   */
  static async filterUsersByHierarchy(
    requestingUser: any, 
    allUsers: any[]
  ): Promise<any[]> {
    if (!requestingUser?.role || !requestingUser?.organizationId) {
      console.log('⚠️ Usuário sem role ou organização definida');
      return [];
    }

    // Calcula organizações acessíveis
    const orgAccess = await this.calculateOrganizationAccess(requestingUser.organizationId);
    
    // Filtra usuários por organização E hierarquia de roles
    const filteredUsers = allUsers.filter(user => {
      // FILTRO 1: Organização acessível
      const orgAccessible = orgAccess.accessibleOrganizations.includes(user.organizationId);
      
      // FILTRO 2: Hierarquia de usuários
      const roleAccessible = this.canAccessUserData(requestingUser.role, user.role);
      
      // Deve passar em AMBOS os filtros
      const canAccess = orgAccessible && roleAccessible;
      
      if (!canAccess) {
        console.log(`🔒 Acesso negado: ${requestingUser.role}@org${requestingUser.organizationId} → ${user.role}@org${user.organizationId}`);
      }
      
      return canAccess;
    });

    console.log(`👥 Filtro hierárquico: ${filteredUsers.length}/${allUsers.length} usuários acessíveis`);
    return filteredUsers;
  }

  /**
   * Middleware de proteção hierárquica (COMPATÍVEL COM SISTEMA EXISTENTE)
   */
  static createHierarchicalFilter(options: { 
    preserveExisting?: boolean,
    logOnly?: boolean 
  } = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (req as any).user;
        
        // MODO COMPATIBILIDADE: Se não há usuário autenticado, mantém comportamento existente
        if (!user && options.preserveExisting) {
          console.log('🔄 Modo compatibilidade: usuário não autenticado, mantendo comportamento existente');
          return next();
        }

        // MODO LOG: Apenas registra sem bloquear (para testes)
        if (options.logOnly) {
          console.log(`📋 LOG: Acesso de ${user?.role || 'não-autenticado'}@org${user?.organizationId || 'N/A'}`);
          return next();
        }

        // PROTEÇÃO ATIVA: Aplica filtros hierárquicos
        if (user?.organizationId) {
          const orgAccess = await this.calculateOrganizationAccess(user.organizationId);
          
          (req as any).hierarchicalAccess = {
            userRole: user.role,
            userOrganizationId: user.organizationId,
            organizationAccess: orgAccess,
            canAccessUserRole: (targetRole: string) => this.canAccessUserData(user.role, targetRole),
            canAccessOrganization: (targetOrgId: number) => orgAccess.accessibleOrganizations.includes(targetOrgId)
          };
        }

        next();
      } catch (error) {
        console.error('Erro no middleware hierárquico:', error);
        
        // FALLBACK SEGURO: Em caso de erro, mantém comportamento existente
        if (options.preserveExisting) {
          next();
        } else {
          res.status(500).json({ error: 'Erro interno de segurança hierárquica' });
        }
      }
    };
  }

  /**
   * Valida acesso específico (para usar em endpoints críticos)
   */
  static async validateAccess(
    requestingUserId: number,
    targetUserId: number,
    targetOrganizationId?: number
  ): Promise<{ allowed: boolean; reason: string }> {
    try {
      const requestingUser = await db.select().from(users)
        .where(eq(users.id, requestingUserId))
        .limit(1);

      const targetUser = await db.select().from(users)
        .where(eq(users.id, targetUserId))
        .limit(1);

      if (!requestingUser.length || !targetUser.length) {
        return { allowed: false, reason: 'Usuário não encontrado' };
      }

      const requester = requestingUser[0];
      const target = targetUser[0];

      // Verifica hierarquia de roles
      const roleAllowed = this.canAccessUserData(requester.role, target.role);
      if (!roleAllowed) {
        return { 
          allowed: false, 
          reason: `Role ${requester.role} não pode acessar dados de ${target.role}` 
        };
      }

      // Verifica hierarquia organizacional
      if (requester.organizationId && target.organizationId) {
        const orgAccess = await this.calculateOrganizationAccess(requester.organizationId);
        const orgAllowed = orgAccess.accessibleOrganizations.includes(target.organizationId);
        
        if (!orgAllowed) {
          return { 
            allowed: false, 
            reason: `Organização ${requester.organizationId} não pode acessar dados da organização ${target.organizationId}` 
          };
        }
      }

      return { allowed: true, reason: 'Acesso autorizado pela hierarquia dupla' };

    } catch (error) {
      console.error('Erro na validação de acesso:', error);
      return { allowed: false, reason: 'Erro interno na validação' };
    }
  }
}

/**
 * Middleware pronto para uso (modo compatibilidade ativo)
 */
export const hierarchicalAccess = HierarchicalAccessService.createHierarchicalFilter({
  preserveExisting: true,
  logOnly: false
});

/**
 * Middleware para testes (apenas logs)
 */
export const hierarchicalAccessTest = HierarchicalAccessService.createHierarchicalFilter({
  preserveExisting: true,
  logOnly: true
});

export default HierarchicalAccessService;