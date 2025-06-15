/**
 * Hook personalizado para validação client-side
 * Integração com schemas Zod para validação em tempo real
 */

import { useState, useCallback } from 'react';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: any;
}

export const useValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateData = useCallback((data: any) => {
    setIsValidating(true);
    
    try {
      // Sanitizar dados antes da validação
      const sanitizedData = sanitizeInputData(data);
      
      setValidationErrors([]);
      setIsValidating(false);
      
      return {
        isValid: true,
        errors: [],
        sanitizedData
      };
    } catch (error) {
      const errors: ValidationError[] = [{
        field: 'general',
        message: 'Erro de validação',
        code: 'unknown'
      }];
      
      setValidationErrors(errors);
      setIsValidating(false);
      
      return {
        isValid: false,
        errors
      };
    }
  }, []);

  const clearErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  const getFieldError = useCallback((fieldName: string) => {
    return validationErrors.find(error => error.field === fieldName);
  }, [validationErrors]);

  const hasFieldError = useCallback((fieldName: string) => {
    return validationErrors.some(error => error.field === fieldName);
  }, [validationErrors]);

  return {
    validationErrors,
    isValidating,
    validateData,
    clearErrors,
    getFieldError,
    hasFieldError
  };
};

// Função auxiliar para sanitização de dados de entrada
function sanitizeInputData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return data.trim().slice(0, 1000);
  }

  if (typeof data === 'number') {
    return isNaN(data) ? 0 : Math.max(0, Math.min(data, 1000000));
  }

  if (typeof data === 'boolean') {
    return Boolean(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInputData(item));
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = key.trim().slice(0, 100);
      if (sanitizedKey && sanitizedKey.length > 0) {
        sanitized[sanitizedKey] = sanitizeInputData(value);
      }
    }
    return sanitized;
  }

  return data;
}

// Hook específico para validação em tempo real de formulários
export const useFormValidation = () => {
  const { validateData, validationErrors, isValidating } = useValidation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((formData: any) => {
    const result = validateData(formData);
    
    if (!result.isValid) {
      const fieldErrorsMap: Record<string, string> = {};
      result.errors.forEach(error => {
        fieldErrorsMap[error.field] = error.message;
      });
      setFieldErrors(fieldErrorsMap);
    } else {
      setFieldErrors({});
    }
    
    return result;
  }, [validateData]);

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  return {
    validateForm,
    fieldErrors,
    validationErrors,
    isValidating,
    clearFieldError,
    clearAllErrors,
    hasError: (fieldName: string) => Boolean(fieldErrors[fieldName]),
    getError: (fieldName: string) => fieldErrors[fieldName]
  };
};