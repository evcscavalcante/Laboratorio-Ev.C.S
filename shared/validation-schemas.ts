/**
 * Schemas de Validação Zod - Sistema Geotécnico
 * Validação rigorosa para todas as entradas do sistema
 */

import { z } from 'zod';

// Schema base para dados técnicos
const technicalDataSchema = z.object({
  registrationNumber: z.string().min(1, 'Número de registro obrigatório').max(50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  operator: z.string().min(2, 'Nome do operador deve ter pelo menos 2 caracteres').max(100),
  material: z.string().min(1, 'Material obrigatório').max(200),
  origin: z.string().min(1, 'Origem obrigatória').max(200),
});

// Schema estendido para ensaios in-situ e máx/mín
const extendedTechnicalDataSchema = technicalDataSchema.extend({
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora deve estar no formato HH:MM'),
  technicalResponsible: z.string().min(2, 'Responsável técnico obrigatório').max(100),
  verifier: z.string().min(2, 'Verificador obrigatório').max(100),
  north: z.string().max(50).optional(),
  east: z.string().max(50).optional(),
  coordinates: z.string().max(100).optional(),
  quadrant: z.string().max(50).optional(),
  layer: z.string().max(50).optional(),
  balanceId: z.string().max(50).optional(),
  ovenId: z.string().max(50).optional(),
});

// Schema para determinações de umidade
const moistureSchema = z.object({
  capsule: z.string().min(1, 'Número da cápsula obrigatório').max(20),
  wetTare: z.number().min(0, 'Tara úmida deve ser positiva').max(10000),
  dryTare: z.number().min(0, 'Tara seca deve ser positiva').max(10000),
  tare: z.number().min(0, 'Tara deve ser positiva').max(10000),
});

// Schema para cilindros (densidade in-situ)
const cylinderSchema = z.object({
  cylinderNumber: z.string().min(1, 'Número do cilindro obrigatório').max(20),
  soilCylinder: z.number().min(0, 'Massa solo+cilindro deve ser positiva').max(50000),
  cylinder: z.number().min(0, 'Massa cilindro deve ser positiva').max(50000),
  volume: z.number().min(0.001, 'Volume deve ser maior que zero').max(10000),
});

// Schema para picnômetros (densidade real)
const picnometerSchema = z.object({
  massaPicnometro: z.number().min(0, 'Massa picnômetro deve ser positiva').max(10000),
  massaPicAmostraAgua: z.number().min(0, 'Massa pic+amostra+água deve ser positiva').max(20000),
  massaPicAgua: z.number().min(0, 'Massa pic+água deve ser positiva').max(20000),
  temperatura: z.number().min(0, 'Temperatura deve ser positiva').max(100),
  massaSoloUmido: z.number().min(0, 'Massa solo úmido deve ser positiva').max(10000),
});

// Schema para determinações de densidade máx/mín
const densityDeterminationSchema = z.object({
  cylinderNumber: z.string().min(1, 'Número do cilindro obrigatório').max(20),
  moldeSolo: z.number().min(0, 'Massa molde+solo deve ser positiva').max(50000),
  molde: z.number().min(0, 'Massa molde deve ser positiva').max(50000),
  volume: z.number().min(0.001, 'Volume deve ser maior que zero').max(10000),
});

// Schemas para ensaios específicos

// NBR 9813:2021 - Densidade In-Situ
export const densityInSituSchema = extendedTechnicalDataSchema.extend({
  weatherCondition: z.enum(['SOL FORTE', 'CHUVA FRACA', 'CHUVA FORTE', 'NUBLADO'], {
    errorMap: () => ({ message: 'Condição climática inválida' })
  }),
  moisture1: moistureSchema,
  moisture2: moistureSchema,
  moisture3: moistureSchema,
  cylinder1: cylinderSchema,
  cylinder2: cylinderSchema,
  cylinder3: cylinderSchema,
  // Campos opcionais
  humidity: z.string().max(20).optional(),
  temperature: z.string().max(20).optional(),
  sampleReensayed: z.boolean().optional(),
  thermometerId: z.string().max(50).optional(),
  chronometerId: z.string().max(50).optional(),
});

// NBR 17212:2025 - Densidade Real dos Sólidos
export const realDensitySchema = extendedTechnicalDataSchema.extend({
  cota: z.string().max(50).optional(),
  local: z.string().max(100).optional(),
  weatherCondition: z.enum(['SOL FORTE', 'CHUVA FRACA', 'CHUVA FORTE', 'NUBLADO']),
  humidity: z.string().max(20).optional(),
  temperature: z.string().max(20).optional(),
  sampleReensayed: z.boolean().default(false),
  thermometerId: z.string().max(50).optional(),
  chronometerId: z.string().max(50).optional(),
  moisture1: moistureSchema,
  moisture2: moistureSchema,
  moisture3: moistureSchema,
  picnometer1: picnometerSchema,
  picnometer2: picnometerSchema,
});

// NBR 12004/12051:2021 - Índices de Vazios Máximo e Mínimo
export const maxMinDensitySchema = extendedTechnicalDataSchema.extend({
  compactionMethod: z.string().min(1, 'Método de compactação obrigatório').max(100),
  compactionEnergy: z.string().min(1, 'Energia de compactação obrigatória').max(100),
  moisture1: moistureSchema,
  moisture2: moistureSchema,
  moisture3: moistureSchema,
  maxDensity1: densityDeterminationSchema,
  maxDensity2: densityDeterminationSchema,
  maxDensity3: densityDeterminationSchema,
  minDensity1: densityDeterminationSchema,
  minDensity2: densityDeterminationSchema,
  minDensity3: densityDeterminationSchema,
});

// Schema para autenticação
export const authSchema = z.object({
  email: z.string().email('Email inválido').min(5).max(254),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(128),
});

// Schema para criação de usuário
export const createUserSchema = authSchema.extend({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  role: z.enum(['USER', 'ADMIN', 'TECH', 'DEVELOPER'], {
    errorMap: () => ({ message: 'Role inválida' })
  }).optional(),
});

// Schema para equipamentos
export const equipmentSchema = z.object({
  name: z.string().min(1, 'Nome do equipamento obrigatório').max(100),
  category: z.enum(['BALANCA', 'ESTUFA', 'TERMOMETRO', 'CRONOMETRO', 'OUTROS'], {
    errorMap: () => ({ message: 'Categoria inválida' })
  }),
  model: z.string().max(100).optional(),
  serialNumber: z.string().max(100).optional(),
  calibrationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  nextCalibration: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  precision: z.string().max(50).optional(),
  status: z.enum(['ATIVO', 'INATIVO', 'MANUTENCAO']).default('ATIVO'),
});

// Função para sanitização de strings
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove caracteres potencialmente perigosos
    .replace(/\s+/g, ' ') // Normaliza espaços
    .slice(0, 1000); // Limita tamanho
};

// Função para sanitização de números
export const sanitizeNumber = (input: any): number => {
  const num = parseFloat(input);
  return isNaN(num) ? 0 : Math.max(0, Math.min(num, 1000000)); // Limita range
};

// Função de validação customizada para IDs
export const validateId = z.string().regex(/^[a-zA-Z0-9_-]+$/, 'ID contém caracteres inválidos').min(1).max(50);

// Schema para queries de busca
export const searchQuerySchema = z.object({
  query: z.string().max(100).optional(),
  type: z.enum(['density-in-situ', 'real-density', 'max-min-density']).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  operator: z.string().max(100).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Schema para parâmetros de rota
export const routeParamsSchema = z.object({
  id: validateId,
});

// Tipos TypeScript derivados dos schemas
export type DensityInSituData = z.infer<typeof densityInSituSchema>;
export type RealDensityData = z.infer<typeof realDensitySchema>;
export type MaxMinDensityData = z.infer<typeof maxMinDensitySchema>;
export type AuthData = z.infer<typeof authSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type EquipmentData = z.infer<typeof equipmentSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type RouteParams = z.infer<typeof routeParamsSchema>;