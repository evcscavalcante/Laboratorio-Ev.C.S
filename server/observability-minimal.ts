/**
 * Sistema de Observabilidade Mínimo
 * Apenas health check básico sem overhead de memória
 */

export class MinimalObservability {
  private static instance: MinimalObservability;
  private startTime: number;
  private requestCount: number = 0;

  private constructor() {
    this.startTime = Date.now();
  }

  static getInstance(): MinimalObservability {
    if (!MinimalObservability.instance) {
      MinimalObservability.instance = new MinimalObservability();
    }
    return MinimalObservability.instance;
  }

  middleware() {
    return (req: any, res: any, next: any) => {
      this.requestCount++;
      next();
    };
  }

  getHealthStatus(): any {
    return {
      status: 'healthy',
      uptime: Date.now() - this.startTime,
      requestCount: this.requestCount
    };
  }

  getMetrics(): any {
    return {
      uptime: Date.now() - this.startTime,
      requestCount: this.requestCount
    };
  }
}

export const observability = MinimalObservability.getInstance();