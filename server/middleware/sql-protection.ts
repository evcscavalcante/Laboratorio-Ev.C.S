/**
 * Middleware de Proteção SQL Injection
 * Proteção adicional contra ataques de injeção SQL
 */

import { Request, Response, NextFunction } from 'express';
import { sql } from 'drizzle-orm';

// Padrões perigosos que indicam tentativas de SQL injection
const SQL_INJECTION_PATTERNS = [
  /(\s*|\+)(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+/gi,
  /'(\s*|\+)(or|and)\s+/gi,
  /(\s*|\+)(or|and)\s+[\w\s]+=[\w\s]+/gi,
  /'\s*;\s*(drop|delete|update|insert)/gi,
  /-{2,}/g, // Comentários SQL
  /\/\*[\s\S]*?\*\//g, // Comentários de bloco
  /'.*[;].*'/g, // Strings com ponto e vírgula
  /\bhex\s*\(/gi,
  /\bchar\s*\(/gi,
  /\bascii\s*\(/gi,
  /\bunhex\s*\(/gi,
  /\bload_file\s*\(/gi,
  /\binto\s+outfile\s+/gi,
  /\binto\s+dumpfile\s+/gi,
  /\bbenchmark\s*\(/gi,
  /\bsleep\s*\(/gi,
  /\bpg_sleep\s*\(/gi,
  /\bwaitfor\s+delay\s+/gi,
];

// Padrões XSS perigosos
const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
  /<embed[\s\S]*?>/gi,
  /<link[\s\S]*?>/gi,
  /<meta[\s\S]*?>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:/gi,
  /on\w+\s*=/gi, // Event handlers
];

// Interface para requisições com detecção de ataques
interface SecurityRequest extends Request {
  securityFlags?: {
    sqlInjectionAttempt: boolean;
    xssAttempt: boolean;
    suspiciousPatterns: string[];
  };
}

// Middleware principal de proteção SQL
export const sqlProtection = (req: SecurityRequest, res: Response, next: NextFunction) => {
  try {
    const suspiciousPatterns: string[] = [];
    let sqlInjectionAttempt = false;
    let xssAttempt = false;

    // Verificar todas as entradas da requisição
    const dataToCheck = [
      ...Object.values(req.body || {}),
      ...Object.values(req.query || {}),
      ...Object.values(req.params || {}),
    ];

    for (const data of dataToCheck) {
      if (typeof data === 'string') {
        // Verificar SQL injection
        for (const pattern of SQL_INJECTION_PATTERNS) {
          if (pattern.test(data)) {
            sqlInjectionAttempt = true;
            suspiciousPatterns.push(`SQL: ${pattern.source.slice(0, 50)}`);
            console.error(`🚨 TENTATIVA DE SQL INJECTION detectada: ${data.slice(0, 100)}`);
          }
        }

        // Verificar XSS
        for (const pattern of XSS_PATTERNS) {
          if (pattern.test(data)) {
            xssAttempt = true;
            suspiciousPatterns.push(`XSS: ${pattern.source.slice(0, 50)}`);
            console.error(`🚨 TENTATIVA DE XSS detectada: ${data.slice(0, 100)}`);
          }
        }
      }
    }

    // Adicionar flags de segurança à requisição
    req.securityFlags = {
      sqlInjectionAttempt,
      xssAttempt,
      suspiciousPatterns
    };

    // Bloquear requisições maliciosas
    if (sqlInjectionAttempt || xssAttempt) {
      console.error(`🚨 ATAQUE BLOQUEADO - IP: ${req.ip}, Path: ${req.path}, User-Agent: ${req.get('User-Agent')}`);
      
      return res.status(403).json({
        error: 'Requisição bloqueada por motivos de segurança',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de proteção SQL:', error);
    return res.status(500).json({
      error: 'Erro interno de segurança',
      timestamp: new Date().toISOString()
    });
  }
};

// Gerador de ID único para requisições
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Middleware para escapar strings SQL manualmente (camada extra)
export const escapeSQL = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Escapar recursivamente todas as strings
    if (req.body) {
      req.body = escapeObject(req.body);
    }
    if (req.query) {
      req.query = escapeObject(req.query);
    }
    if (req.params) {
      req.params = escapeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('Erro no escape SQL:', error);
    return res.status(500).json({
      error: 'Erro interno de processamento',
      timestamp: new Date().toISOString()
    });
  }
};

// Função para escapar objeto recursivamente
function escapeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return escapeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => escapeObject(item));
  }

  if (typeof obj === 'object') {
    const escaped: any = {};
    for (const [key, value] of Object.entries(obj)) {
      escaped[escapeString(key)] = escapeObject(value);
    }
    return escaped;
  }

  return obj;
}

// Função para escapar string individual
function escapeString(str: string): string {
  if (typeof str !== 'string') return str;

  return str
    .replace(/'/g, "''") // Escape aspas simples
    .replace(/\\/g, '\\\\') // Escape barras invertidas
    .replace(/\x00/g, '\\0') // Escape null bytes
    .replace(/\n/g, '\\n') // Escape quebras de linha
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\x1a/g, '\\Z'); // Escape ctrl+Z
}

// Middleware para validar IDs de parâmetros
export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  if (id) {
    // Permitir apenas caracteres alfanuméricos, hífens e underscores
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    
    if (!validIdPattern.test(id) || id.length > 50) {
      console.warn(`🚫 ID inválido detectado: ${id} - IP: ${req.ip}`);
      return res.status(400).json({
        error: 'ID de parâmetro inválido',
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
};

// Middleware para detectar payloads suspeitos
export const detectSuspiciousPayload = (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestData = JSON.stringify(req.body || {});
    
    // Verificar tamanho da requisição
    if (requestData.length > 1024 * 1024) { // 1MB
      console.warn(`🚫 Payload muito grande detectado: ${requestData.length} bytes - IP: ${req.ip}`);
      return res.status(413).json({
        error: 'Payload muito grande',
        maxSize: '1MB',
        timestamp: new Date().toISOString()
      });
    }

    // Verificar caracteres de controle suspeitos
    const suspiciousChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
    if (suspiciousChars.test(requestData)) {
      console.warn(`🚫 Caracteres suspeitos detectados - IP: ${req.ip}`);
      return res.status(400).json({
        error: 'Caracteres inválidos detectados',
        timestamp: new Date().toISOString()
      });
    }

    // Verificar encoding suspeito
    if (requestData.includes('%00') || requestData.includes('\x00')) {
      console.warn(`🚫 Null bytes detectados - IP: ${req.ip}`);
      return res.status(400).json({
        error: 'Encoding suspeito detectado',
        timestamp: new Date().toISOString()
      });
    }

    next();
  } catch (error) {
    console.error('Erro na detecção de payload suspeito:', error);
    return res.status(500).json({
      error: 'Erro interno de segurança',
      timestamp: new Date().toISOString()
    });
  }
};

// Middleware para verificar headers de segurança
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Definir headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP com suporte Firebase
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://*.googleapis.com wss://*.firebaseio.com; " +
    "media-src 'self'; " +
    "object-src 'none'; " +
    "child-src 'self'; " +
    "frame-src 'self' https://accounts.google.com; " +
    "worker-src 'self'; " +
    "manifest-src 'self';"
  );

  next();
};