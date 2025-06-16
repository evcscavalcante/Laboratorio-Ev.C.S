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
  const { data: equipmentData, isLoading, error } = useQuery<EquipmentData>({
    queryKey: ['/api/equipamentos'],
    enabled: true,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Debug dos dados carregados
  useEffect(() => {
    console.log('🔍 HOOK DEBUG - useEquipmentAutofill:', {
      isLoading,
      hasError: !!error,
      error: error?.message,
      equipmentData: equipmentData ? {
        capsulas: equipmentData.capsulas?.length || 0,
        cilindros: equipmentData.cilindros?.length || 0,
        primeiraCapsule: equipmentData.capsulas?.[0],
        primeiroCilindro: equipmentData.cilindros?.[0]
      } : 'não carregado'
    });
  }, [equipmentData, isLoading, error]);

  const searchEquipment = (codigo: string, tipoPreferido?: 'capsula' | 'cilindro'): AutofillResult => {
    if (!equipmentData || !codigo || codigo.length < 1) {
      return { found: false, type: null, data: null };
    }

    // Limpar entrada - aceitar números, letras e hífen para códigos complexos
    const codigoLimpo = codigo.trim().toUpperCase();

    // Se há preferência por tipo, buscar primeiro no tipo preferido
    if (tipoPreferido === 'cilindro') {
      // Buscar nos cilindros primeiro
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
    }

    if (tipoPreferido === 'capsula') {
      // Buscar nas cápsulas primeiro
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
    }

    // Busca geral (para compatibilidade)
    // Buscar nas cápsulas
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

    // Buscar nos cilindros
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
      if (codigo && codigo.length >= 1) {
        const codigoLimpo = codigo.trim().toUpperCase();
        
        // Evitar pesquisas repetidas do mesmo código
        if (codigoLimpo === lastSearched) {
          return;
        }
        
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
            // setLastSearched(codigoLimpo); // Comentado para evitar loop
            console.log(`✅ Dados preenchidos automaticamente para ${codigo}:`, updates);
          }
        }
      }
    }, [codigo]); // Apenas codigo como dependência
  };

  return {
    searchEquipment,
    useAutofillEffect,
    isLoading,
    equipmentData
  };
};

// Hook específico para densidade in-situ (usa cilindro biselado + cápsulas grandes)
export const useDensityInSituAutofill = (
  cilindroId: string,
  setValues: (values: any) => void
) => {
  const { equipmentData } = useEquipmentAutofill();

  useEffect(() => {
    if (cilindroId && cilindroId.length >= 1 && equipmentData) {
      const codigoLimpo = cilindroId.trim().toUpperCase();
      
      // BUSCAR CILINDROS BISELADOS (códigos 1-2)
      const cilindro = equipmentData.cilindros?.find(
        cil => cil.codigo.toString().toUpperCase() === codigoLimpo && cil.tipo === 'biselado'
      );
      
      // BUSCAR CÁPSULAS GRANDES (códigos 7-8)
      const capsula = equipmentData.capsulas?.find(
        cap => cap.codigo.toString().toUpperCase() === codigoLimpo && 
               cap.descricao?.toLowerCase().includes('grande')
      );
      
      if (cilindro) {
        setValues({
          molde: cilindro.peso,
          volume: cilindro.volume
        });
        console.log(`✅ Cilindro biselado ${cilindroId} carregado: ${cilindro.peso}g, ${cilindro.volume}cm³`);
      } else if (capsula) {
        setValues({
          tara: capsula.peso
        });
        console.log(`✅ Cápsula grande ${cilindroId} carregada: ${capsula.peso}g`);
      }
    }
  }, [cilindroId]);
};

// Hook específico para densidade real (usa apenas cápsulas médias - códigos 4-6)
export const useRealDensityAutofill = (
  capsulaId: string,
  setValues: (values: any) => void,
  determinacao: 'det1' | 'det2' | 'det3'
) => {
  const { equipmentData } = useEquipmentAutofill();

  useEffect(() => {
    if (capsulaId && capsulaId.length >= 1 && equipmentData) {
      const codigoLimpo = capsulaId.trim().toUpperCase();
      
      // BUSCAR APENAS CÁPSULAS MÉDIAS (códigos 4-6)
      const capsula = equipmentData.capsulas?.find(
        cap => cap.codigo.toString().toUpperCase() === codigoLimpo && 
               cap.descricao.toLowerCase().includes('média')
      );
      
      if (capsula) {
        setValues({
          [`picnometer.${determinacao}.capsula`]: capsula.peso
        });
        console.log(`✅ Cápsula média ${capsulaId} carregada para densidade real: ${capsula.peso}g`);
      }
    }
  }, [capsulaId, determinacao]);
};

// Hook específico para densidade máx/mín (usa cilindros vazios_minimos + cápsulas médias)
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
      
      // BUSCAR CILINDROS VAZIOS_MINIMOS (códigos 3-4)
      const cilindro = equipmentData.cilindros?.find(
        cil => cil.codigo.toString().toUpperCase() === codigoLimpo && cil.tipo === 'vazios_minimos'
      );
      
      // BUSCAR CÁPSULAS MÉDIAS (códigos 4-6) para umidade
      const capsula = equipmentData.capsulas?.find(
        cap => cap.codigo.toString().toUpperCase() === codigoLimpo && 
               cap.descricao?.toLowerCase().includes('média')
      );
      
      if (cilindro) {
        setValues({
          [`${tipo}Density.${determinacao}.molde`]: cilindro.peso,
          [`${tipo}Density.${determinacao}.volume`]: cilindro.volume
        });
        console.log(`✅ Cilindro vazios mínimos ${cilindroId} carregado: ${cilindro.peso}g, ${cilindro.volume}cm³`);
      } else if (capsula) {
        setValues({
          [`moisture${determinacao}.capsula`]: capsula.peso
        });
        console.log(`✅ Cápsula média ${cilindroId} carregada para umidade: ${capsula.peso}g`);
      }
    }
  }, [cilindroId, tipo, determinacao]);
};

// Hook para umidade - REMOVIDO para eliminar loops infinitos
// O preenchimento automático será implementado via onChange handlers específicos
export const useMoistureAutofill = () => {
  // Hook removido para evitar loops infinitos com searchEquipment
  return null;
};