/**
 * Sistema de Observabilidade Simplificado
 * Logs estruturados, métricas básicas e health check
 */

export interface SystemMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  requestCount: number;
  errorCount: number;
  lastError?: {
    message: string;
    timestamp: string;
    stack?: string;
  };
}

export class SimpleObservability {
  private static instance: SimpleObservability;
  private metrics: SystemMetrics;
  private startTime: number;

  private constructor() {
    this.startTime = Date.now();
    this.metrics = {
      uptime: 0,
      memoryUsage: process.memoryUsage(),
      requestCount: 0,
      errorCount: 0
    };
  }

  static getInstance(): SimpleObservability {
    if (!SimpleObservability.instance) {
      SimpleObservability.instance = new SimpleObservability();
    }
    return SimpleObservability.instance;
  }

  logRequest(method: string, url: string, statusCode: number, duration: number): void {
    this.metrics.requestCount++;
    
    if (statusCode >= 400) {
      this.metrics.errorCount++;
    }

    console.log(`${new Date().toISOString()} [${method}] ${url} - ${statusCode} (${duration}ms)`);
  }

  logError(error: Error, context?: any): void {
    this.metrics.errorCount++;
    this.metrics.lastError = {
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };

    console.error(`${new Date().toISOString()} [ERROR]`, error.message, context || '');
  }

  getMetrics(): SystemMetrics {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage()
    };
  }

  getHealthStatus() {
    const metrics = this.getMetrics();
    const memoryUsagePercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
    
    let status = 'healthy';
    const issues = [];

    if (memoryUsagePercent > 90) {
      status = 'critical';
      issues.push('Uso de memória crítico');
    } else if (memoryUsagePercent > 70) {
      status = 'warning';
      issues.push('Uso de memória elevado');
    }

    if (metrics.errorCount > 10) {
      status = status === 'critical' ? 'critical' : 'warning';
      issues.push('Muitos erros recentes');
    }

    return {
      status,
      uptime: metrics.uptime,
      memoryUsage: Math.round(memoryUsagePercent),
      requestCount: metrics.requestCount,
      errorCount: metrics.errorCount,
      issues: issues.length > 0 ? issues : ['Sistema funcionando normalmente'],
      lastError: metrics.lastError
    };
  }

  middleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.logRequest(req.method, req.url, res.statusCode, duration);
      });

      next();
    };
  }

  errorHandler() {
    return (error: Error, req: any, res: any, next: any) => {
      this.logError(error, {
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    };
  }
}

export const observability = SimpleObservability.getInstance();