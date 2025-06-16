import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  isVisible: boolean;
}

export function PasswordStrength({ password, isVisible }: PasswordStrengthProps) {
  if (!isVisible) return null;

  const requirements = [
    {
      text: 'Pelo menos 8 caracteres',
      met: password.length >= 8
    },
    {
      text: 'Uma letra maiúscula',
      met: /[A-Z]/.test(password)
    },
    {
      text: 'Uma letra minúscula',
      met: /[a-z]/.test(password)
    },
    {
      text: 'Um número',
      met: /\d/.test(password)
    },
    {
      text: 'Um símbolo especial',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  const strength = requirements.filter(req => req.met).length;
  const strengthColor = strength < 2 ? 'red' : strength < 4 ? 'yellow' : 'green';
  const strengthText = strength < 2 ? 'Fraca' : strength < 4 ? 'Média' : 'Forte';

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Força da senha:
        </span>
        <span className={`text-sm font-bold ${
          strengthColor === 'red' ? 'text-red-600' :
          strengthColor === 'yellow' ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {strengthText}
        </span>
      </div>
      
      <div className="flex space-x-1 mb-3">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`flex-1 h-2 rounded-sm ${
              level <= strength
                ? strengthColor === 'red' ? 'bg-red-500' :
                  strengthColor === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      <div className="space-y-1">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center space-x-2">
            {requirement.met ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-xs ${
              requirement.met ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {requirement.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}