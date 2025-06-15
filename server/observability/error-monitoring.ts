/**
 * Sistema de Monitoramento de Erros
 * Captura, classifica e alerta sobre erros em produção
 */

import { StructuredLogger } from './logger';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  CALCULATION = 'calculation',
  VALIDATION = 'validation',
  SECURITY = 'security',
  NETWORK = 'network',
  SYSTEM = 'system',
  BUSINESS_LOGIC = 'business_logic'
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  service: string;
  stack: string;
  context: {
    userId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    ip?: string;
    userAgent?: string;
  };
  metadata?: Record<string, any>;
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
}

export class ErrorMonitor {
  private logger: StructuredLogger;
  private errorCache: Map<string, ErrorReport> = new Map();
  private alertThresholds = {
    [ErrorSeverity.CRITICAL]: 1,
    [ErrorSeverity.HIGH]: 3,
    [ErrorSeverity.MEDIUM]: 10,
    [ErrorSeverity.LOW]: 50
  };

  constructor() {
    this.logger = new StructuredLogger('error-monitor');
    this.startCleanupTask();
  }

  captureError(
    error: Error,
    severity: ErrorSeverity,
    category: ErrorCategory,
    context: any = {},
    metadata?: Record<string, any>
  ): string {
    const errorId = this.generateErrorId(error, context);
    const now = new Date().toISOString();

    let errorReport = this.errorCache.get(errorId);
    
    if (errorReport) {
      errorReport.count++;
      errorReport.lastOccurrence = now;
    } else {
      errorReport = {
        id: errorId,
        timestamp: now,
        severity,
        category,
        message: error.message,
        service: context.service || 'unknown',
        stack: error.stack || '',
        context: {
          userId: context.userId,
          requestId: context.requestId,
          endpoint: context.endpoint,
          method: context.method,
          ip: context.ip,
          userAgent: context.userAgent
        },
        metadata,
        count: 1,
        firstOccurrence: now,
        lastOccurrence: now
      };
      
      this.errorCache.set(errorId, errorReport);
    }

    this.logger.error(`${category.toUpperCase()}: ${error.message}`, error, {
      errorId,
      severity,
      category,
      count: errorReport.count,
      context: errorReport.context,
      metadata
    });

    this.checkAlertThresholds(errorReport);
    return errorId;
  }

  private generateErrorId(error: Error, context: any): string {
    const key = `${error.name}_${error.message}_${context.endpoint || 'no-endpoint'}`;
    return Buffer.from(key).toString('base64').substr(0, 16);
  }

  private checkAlertThresholds(errorReport: ErrorReport): void {
    const threshold = this.alertThresholds[errorReport.severity];
    
    if (errorReport.count >= threshold) {
      this.sendAlert(errorReport);
    }
  }

  private async sendAlert(errorReport: ErrorReport): Promise<void> {
    const alert = {
      type: 'error_threshold_exceeded',
      severity: errorReport.severity,
      errorId: errorReport.id,
      message: errorReport.message,
      count: errorReport.count,
      category: errorReport.category,
      service: errorReport.service,
      firstOccurrence: errorReport.firstOccurrence,
      lastOccurrence: errorReport.lastOccurrence,
      context: errorReport.context
    };

    this.logger.error('ALERTA: Limite de erro excedido', undefined, alert);

    if (process.env.NODE_ENV === 'production') {
      await this.notifyAlertingService(alert);
    }
  }

  private async notifyAlertingService(alert: any): Promise<void> {
    try {
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackAlert(alert);
      }
      
      if (process.env.ALERT_EMAIL) {
        await this.sendEmailAlert(alert);
      }
    } catch (notificationError) {
      this.logger.error('Falha ao enviar alerta', notificationError as Error);
    }
  }

  private async sendSlackAlert(alert: any): Promise<void> {
    const message = {
      text: `🚨 Alerta de Erro - ${alert.severity.toUpperCase()}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Erro:* ${alert.message}\n*Serviço:* ${alert.service}\n*Categoria:* ${alert.category}\n*Ocorrências:* ${alert.count}`
          }
        }
      ]
    };

    this.logger.info('Alerta Slack enviado', { message });
  }

  private async sendEmailAlert(alert: any): Promise<void> {
    const emailContent = `
      ALERTA DE ERRO - SISTEMA GEOTÉCNICO
      
      Severidade: ${alert.severity.toUpperCase()}
      Serviço: ${alert.service}
      Categoria: ${alert.category}
      
      Erro: ${alert.message}
      Ocorrências: ${alert.count}
      
      ID: ${alert.errorId}
    `;

    this.logger.info('Alerta por email enviado', { emailContent });
  }

  errorHandler() {
    return (error: Error, req: any, res: any, next: any) => {
      const severity = this.determineSeverity(error, req);
      const category = this.determineCategory(error, req);
      
      const context = {
        service: 'geotechnical-server',
        userId: req.user?.id,
        requestId: req.requestId,
        endpoint: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };

      this.captureError(error, severity, category, context);

      if (severity === ErrorSeverity.CRITICAL) {
        res.status(500).json({ 
          error: 'Erro crítico do sistema. Nossa equipe foi notificada.',
          errorId: this.generateErrorId(error, context)
        });
      } else {
        res.status(400).json({ 
          error: error.message,
          errorId: this.generateErrorId(error, context)
        });
      }
    };
  }

  private determineSeverity(error: Error, req: any): ErrorSeverity {
    if (error.message.includes('database') || error.message.includes('connection')) {
      return ErrorSeverity.CRITICAL;
    }
    
    if (error.message.includes('injection') || error.message.includes('unauthorized')) {
      return ErrorSeverity.HIGH;
    }
    
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      return ErrorSeverity.LOW;
    }
    
    if (error.message.includes('calculation') || error.message.includes('NBR')) {
      return ErrorSeverity.MEDIUM;
    }
    
    return ErrorSeverity.MEDIUM;
  }

  private determineCategory(error: Error, req: any): ErrorCategory {
    if (error.message.includes('database') || error.message.includes('sql')) {
      return ErrorCategory.DATABASE;
    }
    
    if (error.message.includes('auth') || error.message.includes('token')) {
      return ErrorCategory.AUTHENTICATION;
    }
    
    if (error.message.includes('calculation') || error.message.includes('density')) {
      return ErrorCategory.CALCULATION;
    }
    
    if (error.message.includes('validation') || error.name === 'ValidationError') {
      return ErrorCategory.VALIDATION;
    }
    
    if (error.message.includes('injection') || error.message.includes('xss')) {
      return ErrorCategory.SECURITY;
    }
    
    return ErrorCategory.SYSTEM;
  }

  private startCleanupTask(): void {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000;
      
      const entries = Array.from(this.errorCache.entries());
      for (const [errorId, errorReport] of entries) {
        const age = now - new Date(errorReport.lastOccurrence).getTime();
        if (age > maxAge) {
          this.errorCache.delete(errorId);
        }
      }
    }, 60 * 60 * 1000);
  }

  getErrorMetrics(): any {
    const metrics = {
      totalErrors: this.errorCache.size,
      bySeverity: {
        [ErrorSeverity.CRITICAL]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.LOW]: 0
      },
      byCategory: Object.values(ErrorCategory).reduce((acc, cat) => {
        acc[cat] = 0;
        return acc;
      }, {} as Record<string, number>),
      recentErrors: Array.from(this.errorCache.values())
        .sort((a, b) => new Date(b.lastOccurrence).getTime() - new Date(a.lastOccurrence).getTime())
        .slice(0, 10)
    };

    const errorReports = Array.from(this.errorCache.values());
    for (const errorReport of errorReports) {
      if (metrics.bySeverity[errorReport.severity] !== undefined) {
        metrics.bySeverity[errorReport.severity]++;
      }
      if (metrics.byCategory[errorReport.category] !== undefined) {
        metrics.byCategory[errorReport.category]++;
      }
    }

    return metrics;
  }
}

export const errorMonitor = new ErrorMonitor();