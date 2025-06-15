/**
 * Sistema Integrado de Proteção de Dados Sensíveis
 * Ponto central para segurança, criptografia, backup e auditoria
 */

export { 
  dataEncryption,
  DataEncryption,
  encryptSensitiveFields,
  decryptSensitiveFields
} from './encryption';

export {
  backupSystem,
  BackupSystem
} from './backup-system';

export {
  auditSystem,
  AuditSystem,
  AuditEventType,
  AuditSeverity,
  auditMiddleware
} from './audit-system';

export {
  accessControl,
  AccessControlSystem,
  SystemRole,
  Permission
} from './access-control';

import { dataEncryption } from './encryption';
import { backupSystem } from './backup-system';
import { auditSystem } from './audit-system';
import { accessControl } from './access-control';
import { serverLogger } from '../observability-simple';

/**
 * Inicializa todos os sistemas de segurança
 */
export function initializeSecurity() {
  serverLogger.info('Inicializando sistemas de segurança', {
    modules: ['encryption', 'backup', 'audit', 'access-control']
  });

  // Verificar se chave de criptografia está configurada
  if (!process.env.ENCRYPTION_MASTER_KEY) {
    serverLogger.warn('Chave mestra de criptografia não configurada - usando chave temporária');
  }

  // Inicializar backup automático
  const backupStatus = backupSystem.getStatus();
  serverLogger.info('Sistema de backup configurado', {
    nextFullBackup: backupStatus.nextScheduled.full,
    nextIncremental: backupStatus.nextScheduled.incremental,
    totalBackups: backupStatus.totalBackups
  });

  serverLogger.info('Sistemas de segurança inicializados com sucesso');
}

/**
 * Middleware integrado de segurança para Express
 */
export function securityMiddleware() {
  return [
    // Middleware de auditoria
    async (req: any, res: any, next: any) => {
      // Registrar acesso a APIs protegidas
      if (req.user && req.url.startsWith('/api/')) {
        await auditSystem.logDataAccess(
          req.user.id,
          'api',
          req.url,
          `${req.method} ${req.url}`,
          req
        );
      }
      next();
    },

    // Middleware de controle de sessão
    async (req: any, res: any, next: any) => {
      if (req.user && req.sessionID) {
        // Atualizar atividade da sessão
        await accessControl.updateSessionActivity(req.sessionID);
        
        // Obter contexto de acesso
        const context = await accessControl.getUserAccessContext(req.user.id, req.sessionID);
        req.accessContext = context;
      }
      next();
    }
  ];
}

/**
 * Utilitários de segurança para dados sensíveis
 */
export const SecurityUtils = {
  // Criptografar dados de ensaios
  encryptTestData: (testData: any) => {
    const sensitiveFields = ['operator', 'responsible', 'location', 'notes'];
    return encryptSensitiveFields(testData, sensitiveFields);
  },

  // Descriptografar dados de ensaios
  decryptTestData: (encryptedTestData: any) => {
    const sensitiveFields = ['operator', 'responsible', 'location', 'notes'];
    return decryptSensitiveFields(encryptedTestData, sensitiveFields);
  },

  // Criptografar dados de usuário
  encryptUserData: (userData: any) => {
    const sensitiveFields = ['email', 'name', 'phone', 'address'];
    return encryptSensitiveFields(userData, sensitiveFields);
  },

  // Descriptografar dados de usuário
  decryptUserData: (encryptedUserData: any) => {
    const sensitiveFields = ['email', 'name', 'phone', 'address'];
    return decryptSensitiveFields(encryptedUserData, sensitiveFields);
  },

  // Gerar hash seguro para senhas
  hashPassword: (password: string) => {
    return dataEncryption.hashPassword(password);
  },

  // Verificar senha
  verifyPassword: (password: string, hash: string, salt: string) => {
    return dataEncryption.verifyPassword(password, hash, salt);
  },

  // Gerar token seguro
  generateSecureToken: (length: number = 32) => {
    return dataEncryption.generateSecureToken(length);
  }
};

/**
 * Status geral dos sistemas de segurança
 */
export async function getSecurityStatus() {
  try {
    const [backupStatus, accessStats] = await Promise.all([
      backupSystem.getStatus(),
      accessControl.getSystemStats()
    ]);

    return {
      timestamp: new Date().toISOString(),
      encryption: {
        status: 'active',
        algorithm: 'AES-256-GCM',
        masterKeyConfigured: !!process.env.ENCRYPTION_MASTER_KEY
      },
      backup: {
        status: 'active',
        lastFullBackup: backupStatus.lastFullBackup,
        lastIncremental: backupStatus.lastIncremental,
        totalBackups: backupStatus.totalBackups,
        nextScheduled: backupStatus.nextScheduled
      },
      audit: {
        status: 'active',
        logsEnabled: true,
        criticalAlertsEnabled: true
      },
      accessControl: {
        status: 'active',
        totalSessions: accessStats.sessions?.total_sessions || 0,
        activeSessions: accessStats.sessions?.active_sessions || 0,
        roleDistribution: accessStats.roles || []
      }
    };

  } catch (error) {
    serverLogger.error('Erro ao obter status de segurança', error as Error);
    return {
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Endpoints de segurança para administração
 */
export function createSecurityRoutes(app: any) {
  // Status geral de segurança
  app.get('/api/security/status', 
    accessControl.requirePermission(Permission.SYSTEM_MONITORING),
    async (req: any, res: any) => {
      const status = await getSecurityStatus();
      res.json(status);
    }
  );

  // Criar backup manual
  app.post('/api/security/backup',
    accessControl.requirePermission(Permission.SYSTEM_BACKUP),
    async (req: any, res: any) => {
      try {
        const backupPath = await backupSystem.createFullBackup();
        
        await auditSystem.logBackupOperation(
          'manual_backup_created',
          true,
          { backupPath },
          req.user.id
        );

        res.json({ 
          success: true, 
          backupPath,
          message: 'Backup criado com sucesso'
        });
      } catch (error) {
        await auditSystem.logBackupOperation(
          'manual_backup_failed',
          false,
          { error: error.message },
          req.user.id
        );

        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    }
  );

  // Listar backups
  app.get('/api/security/backups',
    accessControl.requirePermission(Permission.SYSTEM_BACKUP),
    async (req: any, res: any) => {
      const backups = backupSystem.listBackups();
      res.json(backups);
    }
  );

  // Logs de auditoria
  app.get('/api/security/audit-logs',
    accessControl.requirePermission(Permission.SYSTEM_AUDIT),
    async (req: any, res: any) => {
      const { 
        userId, 
        eventType, 
        severity, 
        startDate, 
        endDate, 
        limit = 100, 
        offset = 0 
      } = req.query;

      const filters = {
        userId,
        eventType,
        severity,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const logs = await auditSystem.getAuditLogs(filters);
      res.json(logs);
    }
  );

  // Resumo de auditoria
  app.get('/api/security/audit-summary',
    accessControl.requirePermission(Permission.SYSTEM_AUDIT),
    async (req: any, res: any) => {
      const { timeframe = 'week' } = req.query;
      const summary = await auditSystem.getAuditSummary(timeframe);
      res.json(summary);
    }
  );

  // Gerenciar permissões de usuário
  app.post('/api/security/users/:userId/permissions',
    accessControl.requirePermission(Permission.USER_ASSIGN_ROLES),
    async (req: any, res: any) => {
      const { userId } = req.params;
      const { permission, granted, reason } = req.body;

      try {
        let success;
        if (granted) {
          success = await accessControl.grantPermission(
            userId, 
            permission, 
            req.user.id, 
            reason,
            undefined,
            req
          );
        } else {
          success = await accessControl.revokePermission(
            userId, 
            permission, 
            req.user.id, 
            reason,
            req
          );
        }

        res.json({ success });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Gerenciar roles de usuário
  app.post('/api/security/users/:userId/roles',
    accessControl.requirePermission(Permission.USER_ASSIGN_ROLES),
    async (req: any, res: any) => {
      const { userId } = req.params;
      const { role, action } = req.body; // action: 'assign' | 'revoke'

      try {
        let success;
        if (action === 'assign') {
          success = await accessControl.assignRole(userId, role, req.user.id, undefined, req);
        } else {
          success = await accessControl.revokeRole(userId, role, req.user.id, req);
        }

        res.json({ success });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
}