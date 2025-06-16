import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface EquipmentData {
  capsulas: Array<{
    id: number;
    codigo: string;
    peso: number;
    descricao?: string;
    material?: string;
  }>;
  cilindros: Array<{
    id: number;
    codigo: string;
    peso: number;
    volume: number;
    altura?: number;
    diametro?: number;
    tipo: string;
    descricao?: string;
  }>;
}

interface AutofillResult {
  found: boolean;
  type: 'capsula' | 'cilindro' | null;
  data: any;
}

export const useEquipmentAutofill = () => {
  const [lastSearched, setLastSearched] = useState<string>('');

  // Buscar todos os equipamentos
  const { data: equipmentData, isLoading } = useQuery<EquipmentData>({
    queryKey: ['/api/equipamentos'],
    enabled: true,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const searchEquipment = (codigo: string): AutofillResult => {
    if (!equipmentData || !codigo) {
      return { found: false, type: null, data: null };
    }

    setLastSearched(codigo);

    // Buscar nas cápsulas
    const capsula = equipmentData.capsulas?.find(
      cap => cap.codigo.toLowerCase() === codigo.toLowerCase()
    );

    if (capsula) {
      return {
        found: true,
        type: 'capsula',
        data: {
          codigo: capsula.codigo,
          peso: capsula.peso,
          descricao: capsula.descricao,
          material: capsula.material
        }
      };
    }

    // Buscar nos cilindros
    const cilindro = equipmentData.cilindros?.find(
      cil => cil.codigo.toLowerCase() === codigo.toLowerCase()
    );

    if (cilindro) {
      return {
        found: true,
        type: 'cilindro',
        data: {
          codigo: cilindro.codigo,
          peso: cilindro.peso,
          volume: cilindro.volume,
          altura: cilindro.altura,
          diametro: cilindro.diametro,
          tipo: cilindro.tipo,
          descricao: cilindro.descricao
        }
      };
    }

    return { found: false, type: null, data: null };
  };

  // Hook para preenchimento automático quando o código mudar
  const useAutofillEffect = (
    codigo: string,
    setValues: (values: any) => void,
    fieldMapping: Record<string, string>
  ) => {
    useEffect(() => {
      if (codigo && codigo !== lastSearched && codigo.length >= 3) {
        const result = searchEquipment(codigo);
        
        if (result.found && result.data) {
          const updates: any = {};
          
          // Mapear os campos baseado no tipo de equipamento
          Object.entries(fieldMapping).forEach(([sourceField, targetField]) => {
            if (result.data[sourceField] !== undefined) {
              updates[targetField] = result.data[sourceField];
            }
          });

          if (Object.keys(updates).length > 0) {
            setValues(updates);
            console.log(`✅ Dados preenchidos automaticamente para ${codigo}:`, updates);
          }
        }
      }
    }, [codigo, setValues, fieldMapping]);
  };

  return {
    searchEquipment,
    useAutofillEffect,
    isLoading,
    equipmentData
  };
};

// Hook específico para densidade in-situ (usa cilindro de cravação)
export const useDensityInSituAutofill = (
  cilindroId: string,
  setValues: (values: any) => void
) => {
  const { searchEquipment } = useEquipmentAutofill();

  useEffect(() => {
    if (cilindroId && cilindroId.length >= 3) {
      const result = searchEquipment(cilindroId);
      
      if (result.found && result.type === 'cilindro' && result.data.tipo === 'biselado') {
        setValues({
          molde: result.data.peso,
          volume: result.data.volume
        });
        console.log(`✅ Cilindro de cravação ${cilindroId} carregado automaticamente`);
      }
    }
  }, [cilindroId, setValues]);
};

// Hook específico para densidade real (cápsulas)
export const useRealDensityAutofill = (
  capsulaId: string,
  setValues: (values: any) => void,
  determinacao: 'det1' | 'det2' | 'det3'
) => {
  const { useAutofillEffect } = useEquipmentAutofill();

  useAutofillEffect(capsulaId, setValues, {
    peso: `picnometer.${determinacao}.capsula`
  });
};

// Hook específico para densidade máx/mín (cilindros)
export const useMaxMinDensityAutofill = (
  cilindroId: string,
  setValues: (values: any) => void,
  tipo: 'max' | 'min',
  determinacao: 'det1' | 'det2' | 'det3'
) => {
  const { useAutofillEffect } = useEquipmentAutofill();

  useAutofillEffect(cilindroId, setValues, {
    peso: `${tipo}Density.${determinacao}.molde`,
    volume: `${tipo}Density.${determinacao}.volume`
  });
};