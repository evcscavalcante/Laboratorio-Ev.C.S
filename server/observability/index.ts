/**
 * Sistema de Observabilidade Integrado
 * Ponto central para logging, monitoramento e alertas
 */

export { 
  StructuredLogger, 
  LogLevel,
  serverLogger,
  authLogger,
  calculationLogger,
  securityLogger,
  addRequestId,
  requestLogger
} from './logger';

export {
  ErrorMonitor,
  ErrorSeverity,
  ErrorCategory,
  errorMonitor
} from './error-monitoring';

export {
  PerformanceMonitor,
  performanceMonitor
} from './performance-monitor';

export {
  AlertingSystem,
  AlertSeverity,
  AlertType,
  alertingSystem
} from './alerting';

import { serverLogger } from './logger';
import { errorMonitor } from './error-monitoring';
import { performanceMonitor } from './performance-monitor';
import { alertingSystem } from './alerting';

// Middleware integrado para observabilidade completa
export function observabilityMiddleware() {
  return [
    // Adicionar request ID para rastreamento
    (req: any, res: any, next: any) => {
      req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      next();
    },
    
    // Monitoramento de performance
    performanceMonitor.performanceMiddleware(),
    
    // Logging de requests
    (req: any, res: any, next: any) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        serverLogger.logRequest(req, res, duration);
      });
      
      next();
    }
  ];
}

// Handler global de erros
export function globalErrorHandler() {
  return errorMonitor.errorHandler();
}

// Inicialização do sistema de observabilidade
export function initializeObservability() {
  serverLogger.info('Sistema de observabilidade inicializado', {
    modules: ['logger', 'error-monitor', 'performance-monitor', 'alerting'],
    environment: process.env.NODE_ENV || 'development'
  });

  // Configurar alertas padrão do sistema
  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    errorMonitor.captureError(
      error,
      'critical' as any,
      'system' as any,
      { service: 'system', event: 'unhandledRejection' }
    );
  });

  process.on('uncaughtException', (error) => {
    errorMonitor.captureError(
      error,
      'critical' as any,
      'system' as any,
      { service: 'system', event: 'uncaughtException' }
    );
    
    // Em caso de exceção não capturada, fazer shutdown graceful
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Monitorar uso de memória a cada 30 segundos
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const usage = memUsage.heapUsed / memUsage.heapTotal;
    
    if (usage > 0.9) {
      alertingSystem.createAlert(
        'memory_usage' as any,
        'critical' as any,
        'Uso crítico de memória',
        `Uso de memória em ${(usage * 100).toFixed(1)}%`,
        'system',
        { memoryUsage: memUsage }
      );
    }
  }, 30000);
}

// Endpoints para dashboard de observabilidade
export function createObservabilityRoutes(app: any) {
  // Health check
  app.get('/api/health', (req: any, res: any) => {
    const health = performanceMonitor.getSystemHealth();
    res.json(health);
  });

  // Métricas de performance
  app.get('/api/metrics/performance', (req: any, res: any) => {
    const data = performanceMonitor.getDashboardData();
    res.json(data);
  });

  // Métricas de erros
  app.get('/api/metrics/errors', (req: any, res: any) => {
    const data = errorMonitor.getErrorMetrics();
    res.json(data);
  });

  // Alertas ativos
  app.get('/api/alerts', (req: any, res: any) => {
    const alerts = alertingSystem.getActiveAlerts();
    const metrics = alertingSystem.getAlertMetrics();
    res.json({ alerts, metrics });
  });

  // Reconhecer alerta
  app.post('/api/alerts/:id/acknowledge', (req: any, res: any) => {
    const { id } = req.params;
    const { acknowledgedBy } = req.body;
    
    const success = alertingSystem.acknowledgeAlert(id, acknowledgedBy);
    res.json({ success });
  });

  // Resolver alerta
  app.post('/api/alerts/:id/resolve', (req: any, res: any) => {
    const { id } = req.params;
    const { resolvedBy, resolution } = req.body;
    
    const success = alertingSystem.resolveAlert(id, resolvedBy, resolution);
    res.json({ success });
  });

  // Dashboard consolidado
  app.get('/api/observability/dashboard', (req: any, res: any) => {
    const dashboard = {
      timestamp: new Date().toISOString(),
      systemHealth: performanceMonitor.getSystemHealth(),
      performance: performanceMonitor.getDashboardData(),
      errors: errorMonitor.getErrorMetrics(),
      alerts: {
        active: alertingSystem.getActiveAlerts(),
        metrics: alertingSystem.getAlertMetrics()
      }
    };
    
    res.json(dashboard);
  });
}