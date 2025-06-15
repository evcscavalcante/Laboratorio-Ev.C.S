/**
 * Sistema de Alertas para Falhas Críticas
 * Gerencia alertas para diferentes canais de notificação
 */

import { StructuredLogger } from './logger';

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertType {
  ERROR_RATE = 'error_rate',
  RESPONSE_TIME = 'response_time',
  MEMORY_USAGE = 'memory_usage',
  DISK_USAGE = 'disk_usage',
  DATABASE_ERROR = 'database_error',
  SECURITY_THREAT = 'security_threat',
  CALCULATION_ERROR = 'calculation_error',
  SYSTEM_DOWN = 'system_down'
}

export interface Alert {
  id: string;
  timestamp: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  service: string;
  metadata: Record<string, any>;
  acknowledged: boolean;
  resolved: boolean;
  escalated: boolean;
}

export interface AlertChannel {
  name: string;
  enabled: boolean;
  severityThreshold: AlertSeverity;
  send(alert: Alert): Promise<boolean>;
}

export class AlertingSystem {
  private logger: StructuredLogger;
  private alerts: Map<string, Alert> = new Map();
  private channels: AlertChannel[] = [];
  private rateLimiting = new Map<string, number>();
  
  constructor() {
    this.logger = new StructuredLogger('alerting-system');
    this.setupDefaultChannels();
    this.startAlertCleanup();
  }

  private setupDefaultChannels(): void {
    // Canal de Log Estruturado (sempre ativo)
    this.channels.push({
      name: 'structured-log',
      enabled: true,
      severityThreshold: AlertSeverity.LOW,
      send: async (alert: Alert) => {
        this.logger.error(`ALERTA [${alert.severity.toUpperCase()}]: ${alert.title}`, undefined, alert);
        return true;
      }
    });

    // Canal Slack (se configurado)
    if (process.env.SLACK_WEBHOOK_URL) {
      this.channels.push({
        name: 'slack',
        enabled: true,
        severityThreshold: AlertSeverity.MEDIUM,
        send: async (alert: Alert) => this.sendSlackAlert(alert)
      });
    }

    // Canal Email (se configurado)
    if (process.env.ALERT_EMAIL) {
      this.channels.push({
        name: 'email',
        enabled: true,
        severityThreshold: AlertSeverity.HIGH,
        send: async (alert: Alert) => this.sendEmailAlert(alert)
      });
    }

    // Canal Console (desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      this.channels.push({
        name: 'console',
        enabled: true,
        severityThreshold: AlertSeverity.LOW,
        send: async (alert: Alert) => {
          console.log(`🚨 ALERTA ${alert.severity.toUpperCase()}: ${alert.title}`);
          console.log(`📝 ${alert.message}`);
          console.log(`🔧 Serviço: ${alert.service}`);
          console.log(`📊 Metadados:`, alert.metadata);
          return true;
        }
      });
    }
  }

  async createAlert(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
    service: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const alertId = this.generateAlertId(type, service, title);
    
    // Verificar rate limiting
    if (this.isRateLimited(alertId)) {
      this.logger.debug('Alerta limitado por rate limiting', { alertId, type, severity });
      return alertId;
    }

    const alert: Alert = {
      id: alertId,
      timestamp: new Date().toISOString(),
      type,
      severity,
      title,
      message,
      service,
      metadata,
      acknowledged: false,
      resolved: false,
      escalated: false
    };

    this.alerts.set(alertId, alert);
    
    // Enviar para canais apropriados
    await this.sendToChannels(alert);
    
    // Aplicar rate limiting
    this.applyRateLimit(alertId);
    
    return alertId;
  }

  private generateAlertId(type: AlertType, service: string, title: string): string {
    const key = `${type}_${service}_${title}`;
    return Buffer.from(key).toString('base64').substr(0, 16);
  }

  private isRateLimited(alertId: string): boolean {
    const lastSent = this.rateLimiting.get(alertId);
    if (!lastSent) return false;
    
    const now = Date.now();
    const cooldown = 15 * 60 * 1000; // 15 minutos
    
    return (now - lastSent) < cooldown;
  }

  private applyRateLimit(alertId: string): void {
    this.rateLimiting.set(alertId, Date.now());
  }

  private async sendToChannels(alert: Alert): Promise<void> {
    const severityOrder = {
      [AlertSeverity.LOW]: 0,
      [AlertSeverity.MEDIUM]: 1,
      [AlertSeverity.HIGH]: 2,
      [AlertSeverity.CRITICAL]: 3
    };

    for (const channel of this.channels) {
      if (!channel.enabled) continue;
      
      const channelThreshold = severityOrder[channel.severityThreshold];
      const alertSeverity = severityOrder[alert.severity];
      
      if (alertSeverity >= channelThreshold) {
        try {
          const success = await channel.send(alert);
          this.logger.debug(`Alerta enviado para ${channel.name}`, { 
            alertId: alert.id, 
            success 
          });
        } catch (error) {
          this.logger.error(`Falha ao enviar alerta para ${channel.name}`, error as Error, {
            alertId: alert.id,
            channel: channel.name
          });
        }
      }
    }
  }

  private async sendSlackAlert(alert: Alert): Promise<boolean> {
    const colors = {
      [AlertSeverity.LOW]: '#36a64f',
      [AlertSeverity.MEDIUM]: '#ff9900',
      [AlertSeverity.HIGH]: '#ff6600',
      [AlertSeverity.CRITICAL]: '#ff0000'
    };

    const payload = {
      text: `🚨 Alerta ${alert.severity.toUpperCase()}: ${alert.title}`,
      attachments: [
        {
          color: colors[alert.severity],
          fields: [
            {
              title: 'Serviço',
              value: alert.service,
              short: true
            },
            {
              title: 'Tipo',
              value: alert.type.replace('_', ' ').toUpperCase(),
              short: true
            },
            {
              title: 'Mensagem',
              value: alert.message,
              short: false
            },
            {
              title: 'Timestamp',
              value: alert.timestamp,
              short: true
            }
          ]
        }
      ]
    };

    try {
      // Em produção, fazer requisição HTTP real para Slack webhook
      this.logger.info('Alerta Slack simulado', { payload });
      return true;
    } catch (error) {
      this.logger.error('Erro ao enviar para Slack', error as Error);
      return false;
    }
  }

  private async sendEmailAlert(alert: Alert): Promise<boolean> {
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .alert-critical { background-color: #ff4444; }
        .alert-high { background-color: #ff8800; }
        .alert-medium { background-color: #ffcc00; }
        .alert-low { background-color: #44ff44; }
        .alert-header { padding: 20px; color: white; font-weight: bold; }
        .alert-body { padding: 20px; background-color: #f9f9f9; }
    </style>
</head>
<body>
    <div class="alert-${alert.severity}">
        <div class="alert-header">
            🚨 ALERTA ${alert.severity.toUpperCase()}: ${alert.title}
        </div>
    </div>
    <div class="alert-body">
        <h3>Detalhes do Alerta</h3>
        <p><strong>Serviço:</strong> ${alert.service}</p>
        <p><strong>Tipo:</strong> ${alert.type}</p>
        <p><strong>Mensagem:</strong> ${alert.message}</p>
        <p><strong>Timestamp:</strong> ${alert.timestamp}</p>
        
        <h3>Metadados</h3>
        <pre>${JSON.stringify(alert.metadata, null, 2)}</pre>
        
        <h3>Ações Recomendadas</h3>
        ${this.getRecommendedActions(alert)}
    </div>
</body>
</html>
    `;

    try {
      // Em produção, usar serviço de email real
      this.logger.info('Email de alerta simulado', { 
        to: process.env.ALERT_EMAIL,
        subject: `[ALERTA] ${alert.severity.toUpperCase()}: ${alert.title}`,
        content: emailContent.length
      });
      return true;
    } catch (error) {
      this.logger.error('Erro ao enviar email', error as Error);
      return false;
    }
  }

  private getRecommendedActions(alert: Alert): string {
    const actions = {
      [AlertType.ERROR_RATE]: 'Verificar logs de erro recentes e identificar causa raiz',
      [AlertType.RESPONSE_TIME]: 'Monitorar recursos do sistema e otimizar queries lentas',
      [AlertType.MEMORY_USAGE]: 'Reiniciar serviço se necessário, investigar vazamentos de memória',
      [AlertType.DATABASE_ERROR]: 'Verificar conectividade e integridade do banco de dados',
      [AlertType.SECURITY_THREAT]: 'Bloquear IPs suspeitos e revisar logs de segurança',
      [AlertType.CALCULATION_ERROR]: 'Verificar dados de entrada e validar fórmulas NBR',
      [AlertType.SYSTEM_DOWN]: 'Reiniciar serviços e verificar dependências externas'
    };

    return `<ul><li>${actions[alert.type] || 'Investigar causa e aplicar correção apropriada'}</li></ul>`;
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.metadata.acknowledgedBy = acknowledgedBy;
    alert.metadata.acknowledgedAt = new Date().toISOString();

    this.logger.info('Alerta reconhecido', {
      alertId,
      acknowledgedBy,
      title: alert.title
    });

    return true;
  }

  resolveAlert(alertId: string, resolvedBy: string, resolution: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.metadata.resolvedBy = resolvedBy;
    alert.metadata.resolvedAt = new Date().toISOString();
    alert.metadata.resolution = resolution;

    this.logger.info('Alerta resolvido', {
      alertId,
      resolvedBy,
      resolution,
      title: alert.title
    });

    return true;
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => {
        const severityOrder = {
          [AlertSeverity.CRITICAL]: 3,
          [AlertSeverity.HIGH]: 2,
          [AlertSeverity.MEDIUM]: 1,
          [AlertSeverity.LOW]: 0
        };
        
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
  }

  getAlertMetrics(): any {
    const alerts = Array.from(this.alerts.values());
    const now = Date.now();
    const last24h = alerts.filter(a => 
      now - new Date(a.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    return {
      total: alerts.length,
      active: alerts.filter(a => !a.resolved).length,
      acknowledged: alerts.filter(a => a.acknowledged && !a.resolved).length,
      resolved: alerts.filter(a => a.resolved).length,
      last24h: last24h.length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
        high: alerts.filter(a => a.severity === AlertSeverity.HIGH).length,
        medium: alerts.filter(a => a.severity === AlertSeverity.MEDIUM).length,
        low: alerts.filter(a => a.severity === AlertSeverity.LOW).length
      },
      byType: Object.values(AlertType).reduce((acc, type) => {
        acc[type] = alerts.filter(a => a.type === type).length;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  private startAlertCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
      
      for (const [alertId, alert] of this.alerts.entries()) {
        const age = now - new Date(alert.timestamp).getTime();
        if (age > maxAge && alert.resolved) {
          this.alerts.delete(alertId);
        }
      }

      // Limpar rate limiting antigo
      for (const [alertId, lastSent] of this.rateLimiting.entries()) {
        if (now - lastSent > 24 * 60 * 60 * 1000) { // 24 horas
          this.rateLimiting.delete(alertId);
        }
      }
    }, 60 * 60 * 1000); // A cada hora
  }
}

export const alertingSystem = new AlertingSystem();