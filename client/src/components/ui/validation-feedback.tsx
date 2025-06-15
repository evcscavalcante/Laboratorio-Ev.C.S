/**
 * Componente de Feedback de Validação
 * Exibe erros e sucessos de validação de forma visual
 */

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription } from './alert';
import { ValidationError } from '../../hooks/useValidation';

interface ValidationFeedbackProps {
  errors?: ValidationError[];
  success?: boolean;
  successMessage?: string;
  className?: string;
}

export function ValidationFeedback({ 
  errors = [], 
  success = false, 
  successMessage = 'Dados validados com sucesso',
  className = '' 
}: ValidationFeedbackProps) {
  if (success && errors.length === 0) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          {successMessage}
        </AlertDescription>
      </Alert>
    );
  }

  if (errors.length === 0) {
    return null;
  }

  // Agrupar erros por severidade
  const criticalErrors = errors.filter(err => 
    err.code === 'invalid_type' || err.code === 'too_small' || err.code === 'too_big'
  );
  const warningErrors = errors.filter(err => 
    err.code === 'invalid_string' || err.code === 'custom'
  );
  const infoErrors = errors.filter(err => 
    !criticalErrors.includes(err) && !warningErrors.includes(err)
  );

  return (
    <div className={`space-y-2 ${className}`}>
      {criticalErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-1">Erros críticos encontrados:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {criticalErrors.map((error, index) => (
                <li key={index}>
                  <span className="font-medium">{getFieldDisplayName(error.field)}:</span> {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warningErrors.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium mb-1">Atenção:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {warningErrors.map((error, index) => (
                <li key={index}>
                  <span className="font-medium">{getFieldDisplayName(error.field)}:</span> {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {infoErrors.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="font-medium mb-1">Informações:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {infoErrors.map((error, index) => (
                <li key={index}>
                  <span className="font-medium">{getFieldDisplayName(error.field)}:</span> {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Converte nomes de campos técnicos em nomes amigáveis
function getFieldDisplayName(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    'registrationNumber': 'Número de Registro',
    'date': 'Data',
    'time': 'Hora',
    'operator': 'Operador',
    'technicalResponsible': 'Responsável Técnico',
    'verifier': 'Verificador',
    'material': 'Material',
    'origin': 'Origem',
    'weatherCondition': 'Condição Climática',
    'north': 'Norte',
    'east': 'Leste',
    'coordinates': 'Coordenadas',
    'quadrant': 'Quadrante',
    'layer': 'Camada',
    'balanceId': 'Balança',
    'ovenId': 'Estufa',
    'thermometerId': 'Termômetro',
    'chronometerId': 'Cronômetro',
    'humidity': 'Umidade',
    'temperature': 'Temperatura',
    'sampleReensayed': 'Amostra Reensaiada',
    'moisture1.capsule': 'Cápsula (Determinação 1)',
    'moisture1.wetTare': 'Tara Úmida (Det. 1)',
    'moisture1.dryTare': 'Tara Seca (Det. 1)',
    'moisture1.tare': 'Tara (Det. 1)',
    'moisture2.capsule': 'Cápsula (Determinação 2)',
    'moisture2.wetTare': 'Tara Úmida (Det. 2)',
    'moisture2.dryTare': 'Tara Seca (Det. 2)',
    'moisture2.tare': 'Tara (Det. 2)',
    'moisture3.capsule': 'Cápsula (Determinação 3)',
    'moisture3.wetTare': 'Tara Úmida (Det. 3)',
    'moisture3.dryTare': 'Tara Seca (Det. 3)',
    'moisture3.tare': 'Tara (Det. 3)',
    'cylinder1.cylinderNumber': 'Cilindro (Det. 1)',
    'cylinder1.soilCylinder': 'Solo + Cilindro (Det. 1)',
    'cylinder1.cylinder': 'Cilindro (Det. 1)',
    'cylinder1.volume': 'Volume (Det. 1)',
    'cylinder2.cylinderNumber': 'Cilindro (Det. 2)',
    'cylinder2.soilCylinder': 'Solo + Cilindro (Det. 2)',
    'cylinder2.cylinder': 'Cilindro (Det. 2)',
    'cylinder2.volume': 'Volume (Det. 2)',
    'cylinder3.cylinderNumber': 'Cilindro (Det. 3)',
    'cylinder3.soilCylinder': 'Solo + Cilindro (Det. 3)',
    'cylinder3.cylinder': 'Cilindro (Det. 3)',
    'cylinder3.volume': 'Volume (Det. 3)',
    'picnometer1.massaPicnometro': 'Massa Picnômetro (Det. 1)',
    'picnometer1.massaPicAmostraAgua': 'Massa Pic+Amostra+Água (Det. 1)',
    'picnometer1.massaPicAgua': 'Massa Pic+Água (Det. 1)',
    'picnometer1.temperatura': 'Temperatura (Det. 1)',
    'picnometer1.massaSoloUmido': 'Massa Solo Úmido (Det. 1)',
    'picnometer2.massaPicnometro': 'Massa Picnômetro (Det. 2)',
    'picnometer2.massaPicAmostraAgua': 'Massa Pic+Amostra+Água (Det. 2)',
    'picnometer2.massaPicAgua': 'Massa Pic+Água (Det. 2)',
    'picnometer2.temperatura': 'Temperatura (Det. 2)',
    'picnometer2.massaSoloUmido': 'Massa Solo Úmido (Det. 2)',
    'compactionMethod': 'Método de Compactação',
    'compactionEnergy': 'Energia de Compactação',
  };

  return fieldMap[fieldName] || fieldName;
}

// Componente para feedback inline em campos específicos
interface FieldValidationProps {
  error?: string;
  success?: boolean;
  className?: string;
}

export function FieldValidation({ error, success = false, className = '' }: FieldValidationProps) {
  if (success && !error) {
    return (
      <div className={`flex items-center gap-1 text-green-600 text-sm mt-1 ${className}`}>
        <CheckCircle2 className="h-3 w-3" />
        <span>Válido</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-1 text-red-600 text-sm mt-1 ${className}`}>
        <AlertCircle className="h-3 w-3" />
        <span>{error}</span>
      </div>
    );
  }

  return null;
}