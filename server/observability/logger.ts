/**
 * Sistema de Logs Estruturados
 * Implementa logging hierárquico com níveis apropriados para produção
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack: string;
    code?: string;
  };
  performance?: {
    duration: number;
    endpoint: string;
    method: string;
    statusCode: number;
  };
  security?: {
    ip: string;
    userAgent: string;
    action: string;
    threat?: string;
  };
}

export class StructuredLogger {
  private level: LogLevel;
  private service: string;

  constructor(service: string, level: LogLevel = LogLevel.INFO) {
    this.service = service;
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      metadata: metadata || {}
    };
  }

  private output(entry: LogEntry): void {
    const output = JSON.stringify(entry);
    
    if (process.env.NODE_ENV === 'development') {
      const colors = {
        [LogLevel.ERROR]: '\x1b[31m',
        [LogLevel.WARN]: '\x1b[33m',
        [LogLevel.INFO]: '\x1b[36m',
        [LogLevel.DEBUG]: '\x1b[90m',
        [LogLevel.TRACE]: '\x1b[37m'
      };
      
      const color = colors[entry.level] || '\x1b[0m';
      const reset = '\x1b[0m';
      
      console.log(`${color}[${LogLevel[entry.level]}]${reset} ${entry.message}`, 
        entry.metadata && Object.keys(entry.metadata).length > 0 ? entry.metadata : '');
    } else {
      console.log(output);
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry(LogLevel.ERROR, message, metadata);
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack || '',
        code: (error as any).code
      };
    }

    this.output(entry);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    this.output(this.createLogEntry(LogLevel.WARN, message, metadata));
  }

  info(message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.output(this.createLogEntry(LogLevel.INFO, message, metadata));
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.output(this.createLogEntry(LogLevel.DEBUG, message, metadata));
  }

  trace(message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.TRACE)) return;
    this.output(this.createLogEntry(LogLevel.TRACE, message, metadata));
  }

  logRequest(req: any, res: any, duration: number): void {
    const entry = this.createLogEntry(LogLevel.INFO, 'HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    entry.performance = {
      duration,
      endpoint: req.url,
      method: req.method,
      statusCode: res.statusCode
    };

    this.output(entry);
  }

  logSecurity(action: string, threat: string, req: any, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, `Ameaça de segurança: ${action}`, metadata);
    
    entry.security = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      action,
      threat
    };

    this.output(entry);
  }
}

export const serverLogger = new StructuredLogger('geotechnical-server');
export const authLogger = new StructuredLogger('auth-service');
export const calculationLogger = new StructuredLogger('calculation-service');
export const securityLogger = new StructuredLogger('security-service');

export function addRequestId(req: any, res: any, next: any): void {
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
}

export function requestLogger(logger: StructuredLogger) {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.logRequest(req, res, duration);
    });
    
    next();
  };
}