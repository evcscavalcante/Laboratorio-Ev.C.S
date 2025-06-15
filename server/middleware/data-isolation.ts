/**
 * Middleware de Isolamento de Dados por Organização
 * Previne vazamento de informações entre camadas hierárquicas
 */

import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
    firebaseUid: string;
  };
}

/**
 * Middleware para filtrar dados por organização
 * Apenas DEVELOPER pode ver dados de todas as organizações
 */
export const enforceDataIsolation = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  // DEVELOPER tem acesso global - pode ver dados de todas as organizações
  if (user.role === 'DEVELOPER') {
    req.query.enforceIsolation = 'false';
    return next();
  }

  // Todos os outros roles só veem dados da própria organização
  if (!user.organizationId) {
    return res.status(403).json({ 
      error: 'Usuário não associado a uma organização',
      details: 'Contate o administrador para associar sua conta a uma organização'
    });
  }

  // Força filtro por organização
  req.query.organizationId = user.organizationId;
  req.query.enforceIsolation = 'true';
  
  next();
};

/**
 * Middleware para sanitizar dados sensíveis baseado no role
 */
export const sanitizeDataByRole = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  // Função para sanitizar objetos baseado no role
  const originalJson = res.json;
  res.json = function(data: any) {
    const sanitizedData = sanitizeDataBasedOnRole(data, user.role);
    return originalJson.call(this, sanitizedData);
  };
  
  next();
};

/**
 * Sanitiza dados baseado no nível hierárquico
 */
function sanitizeDataBasedOnRole(data: any, role: string): any {
  if (!data) return data;

  const roleLevel = getRoleLevel(role);
  
  // DEVELOPER vê tudo
  if (role === 'DEVELOPER') {
    return data;
  }

  // Para arrays, sanitiza cada item
  if (Array.isArray(data)) {
    return data.map(item => sanitizeDataBasedOnRole(item, role));
  }

  // Para objetos, remove campos sensíveis baseado no role
  if (typeof data === 'object') {
    const sanitized = { ...data };

    // Campos removidos para VIEWER
    if (roleLevel <= 1) {
      delete sanitized.created_at;
      delete sanitized.updated_at;
      delete sanitized.createdBy;
      delete sanitized.userId;
      delete sanitized.firebaseUid;
    }

    // Campos removidos para TECHNICIAN
    if (roleLevel <= 2) {
      delete sanitized.organizationId;
      delete sanitized.internalId;
    }

    // Campos administrativos apenas para ADMIN+
    if (roleLevel < 4) {
      delete sanitized.systemConfig;
      delete sanitized.debugInfo;
      delete sanitized.rawData;
    }

    return sanitized;
  }

  return data;
}

/**
 * Retorna o nível numérico do role para comparações
 */
function getRoleLevel(role: string): number {
  const levels: { [key: string]: number } = {
    'VIEWER': 1,
    'TECHNICIAN': 2,
    'MANAGER': 3,
    'ADMIN': 4,
    'DEVELOPER': 5
  };
  return levels[role] || 0;
}

/**
 * Middleware para verificar permissões específicas de ação
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const hasPermission = checkUserPermission(user.role, permission);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Permissão insuficiente',
        required: permission,
        userRole: user.role
      });
    }

    next();
  };
};

/**
 * Verifica se um role tem uma permissão específica
 */
function checkUserPermission(role: string, permission: string): boolean {
  const permissions: { [key: string]: string[] } = {
    'VIEWER': ['view_tests'],
    'TECHNICIAN': ['view_tests', 'create_tests'],
    'MANAGER': ['view_tests', 'create_tests', 'edit_tests', 'view_reports'],
    'ADMIN': ['view_tests', 'create_tests', 'edit_tests', 'view_reports', 'manage_users', 'system_config'],
    'DEVELOPER': ['all_permissions']
  };

  const userPermissions = permissions[role] || [];
  
  // DEVELOPER tem todas as permissões
  if (userPermissions.includes('all_permissions')) {
    return true;
  }

  return userPermissions.includes(permission);
}

/**
 * Log de auditoria para ações sensíveis
 */
export const auditLog = (action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    console.log(`🔐 AUDIT: ${user?.email || 'unknown'} (${user?.role || 'unknown'}) executou ${action} em ${req.originalUrl}`);
    
    // Em produção, isso deveria ir para um sistema de logs centralizados
    next();
  };
};