import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import DensityMaxMin from '@/components/laboratory/density-max-min';

export default function DensidadeMaxMinPage() {
  const [location] = useLocation();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const loadId = urlParams.get('load');
    
    if (loadId) {
      const event = new CustomEvent('loadTest', { 
        detail: { testId: parseInt(loadId), testType: 'max-min-density' } 
      });
      window.dispatchEvent(event);
    }
  }, [location]);

  return (
    <div className="p-6">
      <DensityMaxMin />
    </div>
  );
}