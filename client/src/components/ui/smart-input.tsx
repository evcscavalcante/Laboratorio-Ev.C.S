/**
 * Input Inteligente com Validação em Tempo Real
 * Destaca campos obrigatórios e fornece feedback visual
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Info } from 'lucide-react';

interface SmartInputProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date' | 'time' | 'email';
  placeholder?: string;
  required?: boolean;
  unit?: string;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
  };
  className?: string;
  disabled?: boolean;
}

export const SmartInput: React.FC<SmartInputProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  unit,
  helpText,
  validation,
  className,
  disabled = false
}) => {
  const [isTouched, setIsTouched] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Validação em tempo real
  const validateValue = React.useCallback((val: string) => {
    if (required && !val.trim()) {
      return 'Este campo é obrigatório';
    }

    if (!val.trim()) return null; // Campo vazio e não obrigatório

    if (validation) {
      if (type === 'number') {
        const numVal = parseFloat(val);
        if (isNaN(numVal)) {
          return 'Valor deve ser um número válido';
        }
        if (validation.min !== undefined && numVal < validation.min) {
          return `Valor mínimo: ${validation.min}`;
        }
        if (validation.max !== undefined && numVal > validation.max) {
          return `Valor máximo: ${validation.max}`;
        }
      }

      if (validation.pattern && !validation.pattern.test(val)) {
        return 'Formato inválido';
      }

      if (validation.customValidator) {
        return validation.customValidator(val);
      }
    }

    return null;
  }, [required, validation, type]);

  // Validar quando valor muda
  React.useEffect(() => {
    if (isTouched) {
      const error = validateValue(String(value));
      setValidationError(error);
    }
  }, [value, isTouched, validateValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (!isTouched) {
      setIsTouched(true);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
    const error = validateValue(String(value));
    setValidationError(error);
  };

  const isValid = !validationError && value !== '';
  const hasError = isTouched && validationError;
  const isEmpty = !value;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label com indicadores */}
      <div className="flex items-center space-x-2">
        <Label 
          htmlFor={id}
          className={cn(
            "text-sm font-medium",
            required && "after:content-['*'] after:ml-1 after:text-red-500",
            hasError && "text-red-600",
            isValid && "text-green-600"
          )}
        >
          {label}
        </Label>

        {/* Indicador de status */}
        {isTouched && (
          <div className="flex-shrink-0">
            {hasError ? (
              <AlertCircle size={14} className="text-red-500" />
            ) : isValid ? (
              <Check size={14} className="text-green-500" />
            ) : null}
          </div>
        )}

        {/* Help text icon */}
        {helpText && (
          <div className="group relative">
            <Info size={14} className="text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {helpText}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input com unidade */}
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "transition-all duration-200",
            // Estados de validação
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
            isValid && "border-green-500 focus:border-green-500 focus:ring-green-500",
            // Campo obrigatório vazio
            required && isEmpty && isTouched && "border-orange-400 bg-orange-50",
            // Campo obrigatório preenchido
            required && !isEmpty && !hasError && "border-blue-500",
            // Unidade
            unit && "pr-12"
          )}
        />

        {/* Unidade */}
        {unit && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm text-gray-500 font-medium">
              {unit}
            </span>
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {hasError && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle size={14} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Help text */}
      {helpText && !hasError && (
        <div className="text-xs text-gray-500">
          {helpText}
        </div>
      )}
    </div>
  );
};

// Componente para seção de formulário
interface FormSectionProps {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  completed?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  id,
  title,
  description,
  required = false,
  completed = false,
  children,
  className
}) => {
  return (
    <div id={id} className={cn("scroll-mt-20", className)}>
      <div className={cn(
        "bg-white border rounded-lg shadow-sm",
        completed && "border-green-200 bg-green-50/50",
        required && "border-l-4 border-l-blue-500"
      )}>
        {/* Header da seção */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={cn(
                "text-lg font-semibold text-gray-900",
                required && "after:content-['*'] after:ml-1 after:text-red-500"
              )}>
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>

            {/* Indicador de status */}
            <div className="flex items-center space-x-2">
              {completed && (
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <Check size={16} />
                  <span>Completo</span>
                </div>
              )}
              {required && !completed && (
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Obrigatório
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo da seção */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};