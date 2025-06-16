/**
 * Middleware de Validação e Sanitização
 * Proteção rigorosa contra injeção SQL, XSS e ataques de validação
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import rateLimit from 'express-rate-limit';
import { sanitizeString, sanitizeNumber } from '../../shared/validation-schemas';

// Interface para requisições validadas
export interface ValidatedRequest<T = any> extends Request {
  validatedData: T;
  sanitizedBody: any;
}

// Middleware de validação genérico
export const validateRequest = <T>(schema: ZodSchema<T>) => {
  return (req: ValidatedRequest<T>, res: Response, next: NextFunction) => {
    try {
      // Sanitizar dados antes da validação
      const sanitizedBody = sanitizeRequestData(req.body);
      req.sanitizedBody = sanitizedBody;

      // Validar com Zod
      const validatedData = schema.parse(sanitizedBody);
      req.validatedData = validatedData;

      console.log(`✅ Validação bem-sucedida para ${req.method} ${req.path}`);
      next();
    } catch (error) {
      console.error(`❌ Erro de validação para ${req.method} ${req.path}:`, error);
      
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          error: 'Dados inválidos',
          details: errorDetails,
          timestamp: new Date().toISOString()
        });
      }

      return res.status(500).json({
        error: 'Erro interno de validação',
        timestamp: new Date().toISOString()
      });
    }
  };
};

// Sanitização recursiva de objetos
function sanitizeRequestData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (typeof data === 'number') {
    return sanitizeNumber(data);
  }

  if (typeof data === 'boolean') {
    return Boolean(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeRequestData(item));
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitizar chave do objeto
      const sanitizedKey = sanitizeString(key);
      if (sanitizedKey && sanitizedKey.length > 0) {
        sanitized[sanitizedKey] = sanitizeRequestData(value);
      }
    }
    return sanitized;
  }

  return data;
}

// Middleware de validação para parâmetros de rota
export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (req: ValidatedRequest<T>, res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.validatedData = validatedParams;
      next();
    } catch (error) {
      console.error(`❌ Erro de validação de parâmetros:`, error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Parâmetros inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      return res.status(500).json({
        error: 'Erro interno de validação de parâmetros'
      });
    }
  };
};

// Middleware de validação para query parameters
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (req: ValidatedRequest<T>, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.validatedData = validatedQuery;
      next();
    } catch (error) {
      console.error(`❌ Erro de validação de query:`, error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Parâmetros de busca inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      return res.status(500).json({
        error: 'Erro interno de validação de query'
      });
    }
  };
};

// Rate limiting para diferentes tipos de endpoint
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      timestamp: new Date().toISOString(),
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`🚫 Rate limit atingido para IP ${req.ip} em ${req.path}`);
      res.status(429).json({
        error: message,
        timestamp: new Date().toISOString(),
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limits específicos - otimizados para desenvolvimento e testes
export const authRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutos
  100, // 100 tentativas para testes
  'Muitas tentativas de login. Tente novamente em 5 minutos.'
);

export const apiRateLimit = createRateLimit(
  1 * 60 * 1000, // 1 minuto
  1000, // 1000 requests para permitir testes automatizados
  'Muitas requisições. Limite de 1000 por minuto.'
);

export const uploadRateLimit = createRateLimit(
  10 * 60 * 1000, // 10 minutos
  10, // 10 uploads
  'Muitos uploads. Limite de 10 por 10 minutos.'
);

// Middleware de log de segurança
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log da requisição
  console.log(`🔍 ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')?.slice(0, 100)}`);
  
  // Interceptar resposta para log
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`📤 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    // Log de erro se status >= 400
    if (res.statusCode >= 400) {
      console.warn(`⚠️ Erro ${res.statusCode} em ${req.method} ${req.path} - IP: ${req.ip}`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};