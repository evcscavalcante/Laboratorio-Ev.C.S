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
    if (!equipmentData || !codigo || codigo.length < 1) {
      return { found: false, type: null, data: null };
    }

    // Limpar entrada - aceitar números, letras e hífen para códigos complexos
    const codigoLimpo = codigo.trim().toUpperCase();
    
    setLastSearched(codigoLimpo);

    // Buscar nas cápsulas (aceita qualquer código: 1, 2, 100, CAP-001, etc.)
    const capsula = equipmentData.capsulas?.find(
      cap => cap.codigo.toString().toUpperCase() === codigoLimpo
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

    // Buscar nos cilindros (aceita qualquer código: 1, 2, 500, CIL-001, etc.)
    const cilindro = equipmentData.cilindros?.find(
      cil => cil.codigo.toString().toUpperCase() === codigoLimpo
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
      if (codigo && codigo !== lastSearched && codigo.length >= 1) {
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
  const { equipmentData } = useEquipmentAutofill();

  useEffect(() => {
    if (cilindroId && cilindroId.length >= 1 && equipmentData) {
      const codigoLimpo = cilindroId.trim().toUpperCase();
      
      // BUSCAR APENAS NOS CILINDROS (ignorar cápsulas)
      const cilindro = equipmentData.cilindros?.find(
        cil => cil.codigo.toString().toUpperCase() === codigoLimpo && cil.tipo === 'biselado'
      );
      
      if (cilindro) {
        setValues({
          molde: cilindro.peso,
          volume: cilindro.volume
        });
        console.log(`✅ Cilindro biselado ${cilindroId} carregado: ${cilindro.peso}g, ${cilindro.volume}cm³`);
      }
    }
  }, [cilindroId, setValues, equipmentData]);
};

// Hook específico para densidade real (usa cápsulas pequenas para limites físicos)
export const useRealDensityAutofill = (
  capsulaId: string,
  setValues: (values: any) => void,
  determinacao: 'det1' | 'det2' | 'det3'
) => {
  const { equipmentData } = useEquipmentAutofill();

  useEffect(() => {
    if (capsulaId && capsulaId.length >= 1 && equipmentData) {
      const codigoLimpo = capsulaId.trim().toUpperCase();
      
      // BUSCAR APENAS NAS CÁPSULAS (ignorar cilindros)
      const capsula = equipmentData.capsulas?.find(
        cap => cap.codigo.toString().toUpperCase() === codigoLimpo
      );
      
      if (capsula) {
        setValues({
          [`picnometer.${determinacao}.capsula`]: capsula.peso
        });
        console.log(`✅ Cápsula ${capsulaId} carregada para densidade real: ${capsula.peso}g`);
      }
    }
  }, [capsulaId, setValues, determinacao, equipmentData]);
};

// Hook específico para densidade máx/mín (usa cilindro padrão/máximo-mínimos)
export const useMaxMinDensityAutofill = (
  cilindroId: string,
  setValues: (values: any) => void,
  tipo: 'max' | 'min',
  determinacao: 'det1' | 'det2' | 'det3'
) => {
  const { equipmentData } = useEquipmentAutofill();

  useEffect(() => {
    if (cilindroId && cilindroId.length >= 1 && equipmentData) {
      const codigoLimpo = cilindroId.trim().toUpperCase();
      
      // BUSCAR APENAS NOS CILINDROS vazios_minimos (ignorar cápsulas e outros tipos)
      const cilindro = equipmentData.cilindros?.find(
        cil => cil.codigo.toString().toUpperCase() === codigoLimpo && cil.tipo === 'vazios_minimos'
      );
      
      if (cilindro) {
        setValues({
          [`${tipo}Density.${determinacao}.molde`]: cilindro.peso,
          [`${tipo}Density.${determinacao}.volume`]: cilindro.volume
        });
        console.log(`✅ Cilindro vazios mínimos ${cilindroId} carregado: ${cilindro.peso}g, ${cilindro.volume}cm³`);
      }
    }
  }, [cilindroId, setValues, tipo, determinacao, equipmentData]);
};

// Hook para umidade - detecta automaticamente o tipo de cápsula necessária
export const useMoistureAutofill = (
  capsulaId: string,
  setValues: (values: any) => void,
  metodo: 'estufa' | 'frigideira', // estufa = cápsulas médias, frigideira = cápsulas grandes
  campo: string
) => {
  const { searchEquipment } = useEquipmentAutofill();

  useEffect(() => {
    if (capsulaId && capsulaId.length >= 1) {
      const result = searchEquipment(capsulaId);
      
      if (result.found && result.type === 'capsula') {
        // Verifica se o tipo de cápsula corresponde ao método
        const capsulaCorreta = (metodo === 'estufa' && result.data.material === 'media') || 
                              (metodo === 'frigideira' && result.data.material === 'grande');
                              
        if (capsulaCorreta) {
          setValues({
            [campo]: result.data.peso
          });
          console.log(`✅ Cápsula ${metodo === 'estufa' ? 'média' : 'grande'} ${capsulaId} carregada para umidade ${metodo}`);
        }
      }
    }
  }, [capsulaId, setValues, metodo, campo]);
};