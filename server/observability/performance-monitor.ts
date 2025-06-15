/**
 * Sistema de Monitoramento de Performance
 * Coleta métricas de performance e detecta degradações
 */

import { StructuredLogger } from './logger';

export interface PerformanceMetric {
  timestamp: string;
  service: string;
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  memoryUsage: number;
  cpuUsage?: number;
  requestSize?: number;
  responseSize?: number;
  userId?: string;
  requestId?: string;
}

export interface AggregatedMetrics {
  endpoint: string;
  method: string;
  totalRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
  timeWindow: {
    start: string;
    end: string;
  };
}

export class PerformanceMonitor {
  private logger: StructuredLogger;
  private metrics: PerformanceMetric[] = [];
  private alerts = {
    responseTime: {
      warning: 1000,
      critical: 5000
    },
    errorRate: {
      warning: 0.05,
      critical: 0.15
    },
    memoryUsage: {
      warning: 0.80,
      critical: 0.95
    }
  };

  constructor() {
    this.logger = new StructuredLogger('performance-monitor');
    this.startCleanupTask();
    this.startAggregationTask();
  }

  recordMetric(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    context: any = {}
  ): void {
    const metric: PerformanceMetric = {
      timestamp: new Date().toISOString(),
      service: context.service || 'geotechnical-server',
      endpoint,
      method,
      duration,
      statusCode,
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: context.cpuUsage,
      requestSize: context.requestSize,
      responseSize: context.responseSize,
      userId: context.userId,
      requestId: context.requestId
    };

    this.metrics.push(metric);

    if (duration > this.alerts.responseTime.warning) {
      this.logger.warn('Tempo de resposta elevado', {
        endpoint,
        method,
        duration,
        threshold: this.alerts.responseTime.warning
      });
    }

    this.checkPerformanceAlerts(metric);
  }

  private getMemoryUsage(): number {
    const memUsage = process.memoryUsage();
    return memUsage.heapUsed / memUsage.heapTotal;
  }

  private checkPerformanceAlerts(metric: PerformanceMetric): void {
    if (metric.duration > this.alerts.responseTime.critical) {
      this.logger.error('ALERTA: Tempo de resposta crítico', undefined, {
        endpoint: metric.endpoint,
        duration: metric.duration,
        threshold: this.alerts.responseTime.critical,
        severity: 'critical'
      });
    }

    if (metric.memoryUsage > this.alerts.memoryUsage.critical) {
      this.logger.error('ALERTA: Uso de memória crítico', undefined, {
        memoryUsage: metric.memoryUsage,
        threshold: this.alerts.memoryUsage.critical,
        severity: 'critical'
      });
    }
  }

  performanceMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        this.recordMetric(
          req.url,
          req.method,
          duration,
          res.statusCode,
          {
            service: 'geotechnical-server',
            userId: req.user?.id,
            requestId: req.requestId,
            requestSize: req.get('content-length') || 0,
            responseSize: res.get('content-length') || 0
          }
        );
      });

      next();
    };
  }

  aggregateMetrics(timeWindowMinutes: number = 15): AggregatedMetrics[] {
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);
    
    const recentMetrics = this.metrics.filter(
      metric => new Date(metric.timestamp) >= windowStart
    );

    const grouped = recentMetrics.reduce((acc, metric) => {
      const key = `${metric.method}:${metric.endpoint}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    return Object.entries(grouped).map(([key, metrics]) => {
      const [method, endpoint] = key.split(':');
      const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
      const errors = metrics.filter(m => m.statusCode >= 400).length;

      return {
        endpoint,
        method,
        totalRequests: metrics.length,
        averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
        p95ResponseTime: durations[Math.floor(durations.length * 0.95)] || 0,
        p99ResponseTime: durations[Math.floor(durations.length * 0.99)] || 0,
        errorRate: errors / metrics.length,
        requestsPerMinute: metrics.length / timeWindowMinutes,
        timeWindow: {
          start: windowStart.toISOString(),
          end: now.toISOString()
        }
      };
    });
  }

  getSystemHealth(): any {
    const recentMetrics = this.metrics.filter(
      metric => Date.now() - new Date(metric.timestamp).getTime() < 5 * 60 * 1000
    );

    if (recentMetrics.length === 0) {
      return {
        status: 'unknown',
        message: 'Sem métricas recentes disponíveis'
      };
    }

    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
    const errorRate = recentMetrics.filter(m => m.statusCode >= 400).length / recentMetrics.length;
    const avgMemoryUsage = recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length;

    let status = 'healthy';
    let issues = [];

    if (avgResponseTime > this.alerts.responseTime.critical) {
      status = 'critical';
      issues.push(`Tempo de resposta crítico: ${avgResponseTime}ms`);
    } else if (avgResponseTime > this.alerts.responseTime.warning) {
      status = 'warning';
      issues.push(`Tempo de resposta elevado: ${avgResponseTime}ms`);
    }

    if (errorRate > this.alerts.errorRate.critical) {
      status = 'critical';
      issues.push(`Taxa de erro crítica: ${(errorRate * 100).toFixed(1)}%`);
    } else if (errorRate > this.alerts.errorRate.warning) {
      status = 'warning';
      issues.push(`Taxa de erro elevada: ${(errorRate * 100).toFixed(1)}%`);
    }

    if (avgMemoryUsage > this.alerts.memoryUsage.critical) {
      status = 'critical';
      issues.push(`Uso de memória crítico: ${(avgMemoryUsage * 100).toFixed(1)}%`);
    } else if (avgMemoryUsage > this.alerts.memoryUsage.warning) {
      if (status === 'healthy') status = 'warning';
      issues.push(`Uso de memória elevado: ${(avgMemoryUsage * 100).toFixed(1)}%`);
    }

    return {
      status,
      metrics: {
        averageResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100),
        memoryUsage: Math.round(avgMemoryUsage * 100),
        requestsPerMinute: recentMetrics.length
      },
      issues: issues.length > 0 ? issues : ['Sistema funcionando normalmente']
    };
  }

  private startCleanupTask(): void {
    setInterval(() => {
      const maxAge = 24 * 60 * 60 * 1000;
      const cutoff = Date.now() - maxAge;
      
      this.metrics = this.metrics.filter(
        metric => new Date(metric.timestamp).getTime() > cutoff
      );
    }, 60 * 60 * 1000);
  }

  private startAggregationTask(): void {
    setInterval(() => {
      const aggregated = this.aggregateMetrics(15);
      const systemHealth = this.getSystemHealth();
      
      this.logger.info('Métricas agregadas', {
        aggregated,
        systemHealth,
        totalMetrics: this.metrics.length
      });
    }, 15 * 60 * 1000);
  }

  getDashboardData(): any {
    return {
      systemHealth: this.getSystemHealth(),
      aggregatedMetrics: this.aggregateMetrics(60),
      recentMetrics: this.metrics
        .slice(-100)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();