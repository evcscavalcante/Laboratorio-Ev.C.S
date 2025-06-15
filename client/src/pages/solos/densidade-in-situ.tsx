import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import DensityInSitu from '@/components/laboratory/density-in-situ';

export default function DensidadeInSituPage() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Detectar parâmetro load na URL para carregamento automático
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const loadId = urlParams.get('load');
    
    if (loadId) {
      // Disparar evento personalizado para a calculadora carregar o ensaio
      const event = new CustomEvent('loadTest', { 
        detail: { testId: parseInt(loadId), testType: 'density-in-situ' } 
      });
      window.dispatchEvent(event);
    }
  }, [location]);

  return (
    <div className="p-6">
      <DensityInSitu />
    </div>
  );
}