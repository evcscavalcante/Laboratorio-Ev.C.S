/**
 * Indicador de Progresso para Ensaios
 * Mostra etapas do preenchimento e progresso atual
 */

import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  label: string;
  isCompleted: boolean;
  isActive: boolean;
  isRequired: boolean;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  steps, 
  className 
}) => {
  const completedSteps = steps.filter(step => step.isCompleted).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className={cn("bg-white border rounded-lg p-4 shadow-sm", className)}>
      {/* Barra de progresso geral */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progresso do Ensaio</span>
          <span>{completedSteps} de {totalSteps} seções</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Etapas individuais */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={cn(
              "flex items-center space-x-3 p-2 rounded-md transition-colors",
              step.isActive && "bg-blue-50 border border-blue-200",
              step.isCompleted && "bg-green-50"
            )}
          >
            {/* Ícone de status */}
            <div className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
              step.isCompleted ? "bg-green-600 text-white" :
              step.isActive ? "bg-blue-600 text-white" :
              "bg-gray-300 text-gray-600"
            )}>
              {step.isCompleted ? (
                <Check size={14} />
              ) : (
                <Circle size={14} fill="currentColor" />
              )}
            </div>

            {/* Label da etapa */}
            <span className={cn(
              "text-sm font-medium",
              step.isCompleted ? "text-green-700" :
              step.isActive ? "text-blue-700" :
              step.isRequired ? "text-gray-900" : "text-gray-600"
            )}>
              {step.label}
              {step.isRequired && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Status geral */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className={cn(
          "text-sm font-medium",
          progressPercentage === 100 ? "text-green-600" :
          progressPercentage > 50 ? "text-blue-600" : "text-gray-600"
        )}>
          {progressPercentage === 100 ? "✓ Ensaio Completo" :
           progressPercentage > 50 ? "→ Em Progresso" : "○ Iniciando"}
        </div>
      </div>
    </div>
  );
};