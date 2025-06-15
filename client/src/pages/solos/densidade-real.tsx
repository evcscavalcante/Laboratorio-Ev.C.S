import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import DensityReal from '@/components/laboratory/density-real';

export default function DensidadeRealPage() {
  const [location] = useLocation();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const loadId = urlParams.get('load');
    
    if (loadId) {
      const event = new CustomEvent('loadTest', { 
        detail: { testId: parseInt(loadId), testType: 'real-density' } 
      });
      window.dispatchEvent(event);
    }
  }, [location]);

  return (
    <div className="p-6">
      <DensityReal />
    </div>
  );
}