import { useState, useEffect } from "react";
import { Info, ArrowUp, ArrowDown, BarChart, Save, FileText, RotateCcw, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { generateMaxMinDensityVerticalPDF } from "@/lib/pdf-vertical-tables";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { localDataManager } from "@/lib/local-storage";
import TestHeader from "@/components/test-header";
import { useEquipmentAutofill } from "@/hooks/useEquipmentAutofill";
import { firebaseSync } from "@/lib/firebase-sync";

interface MaxMinDensityData {
  registrationNumber: string;
  date: string;
  time: string;
  operator: string;
  technicalResponsible: string;
  verifier: string;
  material: string;
  origin: string;
  north: string;
  east: string;
  cota: string;
  elevation: string;
  coordinates: string;
  quadrant: string;
  layer: string;
  estaca: string;
  balanceId: string;
  ovenId: string;
  compactionMethod: string;
  compactionEnergy: string;
  
  // Moisture determinations
  moisture1: { capsule: string; wetTare: number; dryTare: number; tare: number; };
  moisture2: { capsule: string; wetTare: number; dryTare: number; tare: number; };
  moisture3: { capsule: string; wetTare: number; dryTare: number; tare: number; };
  
  // Maximum density determinations
  maxDensity1: { cylinderNumber: string; moldeSolo: number; molde: number; volume: number; };
  maxDensity2: { cylinderNumber: string; moldeSolo: number; molde: number; volume: number; };
  maxDensity3: { cylinderNumber: string; moldeSolo: number; molde: number; volume: number; };
  
  // Minimum density determinations
  minDensity1: { cylinderNumber: string; moldeSolo: number; molde: number; volume: number; };
  minDensity2: { cylinderNumber: string; moldeSolo: number; molde: number; volume: number; };
  minDensity3: { cylinderNumber: string; moldeSolo: number; molde: number; volume: number; };
}

interface DensityMaxMinProps {
  testId?: number;
  mode?: 'view' | 'edit' | 'new';
}

export default function DensityMaxMin({ testId, mode = 'new' }: DensityMaxMinProps) {
  const { toast } = useToast();
  const [equipamentos, setEquipamentos] = useState<{cilindros: any[]}>({
    cilindros: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Query para buscar dados do ensaio específico
  const { data: testData, isLoading: loadingTest } = useQuery({
    queryKey: ['/api/tests/densidade-max-min/temp', testId],
    queryFn: async () => {
      if (!testId) return null;
      const response = await apiRequest('GET', `/api/tests/densidade-max-min/temp`);
      const tests = await response.json();
      return tests.find((test: any) => test.id === testId) || null;
    },
    enabled: !!testId
  });
  
  // Função para carregar dados salvos
  const loadSavedData = (): MaxMinDensityData => {
    try {
      const saved = localStorage.getItem('density-max-min-progress');
      if (saved) {
        const parsedData = JSON.parse(saved);
        return {
          ...parsedData,
          date: parsedData.date || new Date().toISOString().split('T')[0],
          time: parsedData.time || new Date().toTimeString().slice(0, 5),
          layer: parsedData.layer || "",
          estaca: parsedData.estaca || "",
          quadrant: parsedData.quadrant || "",
          cota: parsedData.cota || "",
          north: parsedData.north || "",
          east: parsedData.east || "",
        };
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
    
    return {
      registrationNumber: "",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      operator: "",
      technicalResponsible: "",
      verifier: "",
      material: "",
      origin: "",
      north: "",
      east: "",
      cota: "",
      elevation: "",
      coordinates: "",
      quadrant: "",
      layer: "",
      estaca: "",
      balanceId: "",
      ovenId: "",
      compactionMethod: "",
      compactionEnergy: "",
      moisture1: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      moisture2: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      moisture3: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      maxDensity1: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      maxDensity2: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      maxDensity3: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      minDensity1: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      minDensity2: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      minDensity3: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
    };
  };

  const [data, setData] = useState<MaxMinDensityData>(loadSavedData);
  
  // Hook para preenchimento automático dos equipamentos
  const { searchEquipment } = useEquipmentAutofill();

  // TODOS os useEffect de preenchimento automático removidos para eliminar loops infinitos
  // O preenchimento automático será implementado via onChange handlers específicos

  // Atualizar dados quando testData estiver disponível
  useEffect(() => {
    if (testData && mode !== 'new') {
      setData({
        registrationNumber: testData.registrationNumber || "",
        date: testData.date || new Date().toISOString().split('T')[0],
        time: testData.time || new Date().toTimeString().slice(0, 5),
        operator: testData.operator || "",
        technicalResponsible: testData.technicalResponsible || "",
        verifier: testData.verifier || "",
        material: testData.material || "",
        origin: testData.origin || "",
        north: testData.north || "",
        east: testData.east || "",
        cota: testData.cota || "",
        elevation: testData.elevation || "",
        coordinates: testData.coordinates || "",
        quadrant: testData.quadrant || "",
        layer: testData.layer || "",
        estaca: testData.estaca || "",
        balanceId: testData.balanceId || "",
        ovenId: testData.ovenId || "",
        compactionMethod: testData.compactionMethod || "",
        compactionEnergy: testData.compactionEnergy || "",
        moisture1: testData.moisture1 || { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
        moisture2: testData.moisture2 || { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
        moisture3: testData.moisture3 || { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
        maxDensity1: testData.maxDensity1 || { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
        maxDensity2: testData.maxDensity2 || { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
        maxDensity3: testData.maxDensity3 || { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
        minDensity1: testData.minDensity1 || { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
        minDensity2: testData.minDensity2 || { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
        minDensity3: testData.minDensity3 || { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      });
    }
  }, [testData, mode]);

  const [calculations, setCalculations] = useState({
    maxDensity: {
      det1: { soil: 0, gammaDMax: 0 },
      det2: { soil: 0, gammaDMax: 0 },
      det3: { soil: 0, gammaDMax: 0 },
      average: 0
    },
    minDensity: {
      det1: { soil: 0, gammaDMin: 0 },
      det2: { soil: 0, gammaDMin: 0 },
      det3: { soil: 0, gammaDMin: 0 },
      average: 0
    },
    results: {
      gammaDMax: 0,
      gammaDMin: 0,
      emax: 0,
      emin: 0,
      status: "AGUARDANDO" as "AGUARDANDO" | "APROVADO" | "REPROVADO"
    }
  });

  // Salvamento automático sempre que os dados mudarem
  // Carregamento inicial do progresso salvo
  useEffect(() => {
    const loadSavedProgress = () => {
      try {
        const savedData = localStorage.getItem('density-max-min-progress');
        if (savedData && mode === 'new') {
          const parsedData = JSON.parse(savedData);
          console.log('🔄 Restaurando progresso salvo do ensaio de densidade máx/mín');
          setData(parsedData);
        }
      } catch (error) {
        console.error('Erro ao carregar progresso salvo:', error);
      }
    };

    loadSavedProgress();
  }, [mode]);

  useEffect(() => {
    const saveProgress = () => {
      try {
        // Só salva se houver dados significativos
        const hasSignificantData = data.registrationNumber || 
                                  data.operator || 
                                  data.material || 
                                  data.origin ||
                                  data.moisture1.capsule ||
                                  data.moisture2.capsule ||
                                  data.moisture3.capsule ||
                                  data.maxDensity1.cylinderNumber ||
                                  data.maxDensity2.cylinderNumber ||
                                  data.maxDensity3.cylinderNumber ||
                                  data.minDensity1.cylinderNumber ||
                                  data.minDensity2.cylinderNumber ||
                                  data.minDensity3.cylinderNumber;

        if (hasSignificantData) {
          localStorage.setItem('density-max-min-progress', JSON.stringify(data));
          console.log('💾 Progresso do ensaio de densidade máx/mín salvo automaticamente');
        }
      } catch (error) {
        console.error('Erro ao salvar progresso:', error);
      }
    };

    const timeoutId = setTimeout(saveProgress, 500);
    return () => clearTimeout(timeoutId);
  }, [data]);

  // Carregar equipamentos ao montar o componente
  useEffect(() => {
    const loadEquipamentos = async () => {
      try {
        const cilindros = await localDataManager.getCilindros();
        setEquipamentos({ cilindros });
      } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
      }
    };

    loadEquipamentos();
  }, []);

  // Função para calcular umidade individual
  const calculateMoisture = (wet: number, dry: number, tare: number): number => {
    if (dry === 0 || tare === 0) return 0;
    const moistureContent = ((wet - dry) / (dry - tare)) * 100;
    return Number(moistureContent.toFixed(2));
  };

  // Função para calcular umidade média
  const calculateAverageMoisture = (): number => {
    const moisture1 = calculateMoisture(data.moisture1.wetTare, data.moisture1.dryTare, data.moisture1.tare);
    const moisture2 = calculateMoisture(data.moisture2.wetTare, data.moisture2.dryTare, data.moisture2.tare);
    const moisture3 = calculateMoisture(data.moisture3.wetTare, data.moisture3.dryTare, data.moisture3.tare);
    
    const validMoistures = [moisture1, moisture2, moisture3].filter(m => m > 0);
    if (validMoistures.length === 0) return 0;
    
    const average = validMoistures.reduce((sum, m) => sum + m, 0) / validMoistures.length;
    return Number(average.toFixed(2));
  };

  // Função para buscar dados do cilindro pelo número
  const buscarDadosCilindro = (codigo: string) => {
    if (!codigo || !searchEquipment) return null;
    
    // Buscar usando o hook searchEquipment
    const resultado = searchEquipment(codigo, 'cilindro');
    if (resultado.found && resultado.data && resultado.data.peso && resultado.data.volume) {
      console.log(`✅ Cilindro ${codigo} encontrado: ${resultado.data.peso}g, ${resultado.data.volume}cm³`);
      return {
        codigo: resultado.data.codigo,
        peso: resultado.data.peso,
        volume: resultado.data.volume,
        tipo: resultado.data.tipo
      };
    }
    
    console.log(`❌ Cilindro ${codigo} não encontrado`);
    return null;
  };

  // Função para buscar peso da cápsula pelo número
  const buscarPesoCapsula = (numero: string) => {
    if (!numero || !searchEquipment) return null;
    
    // Buscar usando o hook searchEquipment
    const resultado = searchEquipment(numero, 'capsula');
    if (resultado.found && resultado.data && resultado.data.peso) {
      console.log(`✅ Cápsula ${numero} encontrada: ${resultado.data.peso}g`);
      return resultado.data.peso;
    }
    
    console.log(`❌ Cápsula ${numero} não encontrada`);
    return null;
  };

  // Handler para mudança no número da cápsula
  const handleCapsuleNumberChange = (field: 'moisture1' | 'moisture2' | 'moisture3', value: string) => {
    const pesoCapsula = buscarPesoCapsula(value);
    
    setData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        capsule: value,
        tare: pesoCapsula || (value ? prev[field].tare : 0)
      }
    }));

    if (pesoCapsula) {
      toast({
        title: "Cápsula - Dados Preenchidos",
        description: `Cápsula ${value}: Peso ${pesoCapsula}g`,
      });
    }
  };

  // Handler para mudança no número do cilindro
  const handleCylinderNumberChange = (field: string, value: string) => {
    const dadosCilindro = buscarDadosCilindro(value);
    
    if (field === 'maxDensity1') {
      setData(prev => ({
        ...prev,
        maxDensity1: {
          ...prev.maxDensity1,
          cylinderNumber: value,
          molde: dadosCilindro ? dadosCilindro.peso : (value ? prev.maxDensity1.molde : 0),
          volume: dadosCilindro ? dadosCilindro.volume : (value ? prev.maxDensity1.volume : 0)
        }
      }));
    } else if (field === 'maxDensity2') {
      setData(prev => ({
        ...prev,
        maxDensity2: {
          ...prev.maxDensity2,
          cylinderNumber: value,
          molde: dadosCilindro ? dadosCilindro.peso : (value ? prev.maxDensity2.molde : 0),
          volume: dadosCilindro ? dadosCilindro.volume : (value ? prev.maxDensity2.volume : 0)
        }
      }));
    } else if (field === 'maxDensity3') {
      setData(prev => ({
        ...prev,
        maxDensity3: {
          ...prev.maxDensity3,
          cylinderNumber: value,
          molde: dadosCilindro ? dadosCilindro.peso : (value ? prev.maxDensity3.molde : 0),
          volume: dadosCilindro ? dadosCilindro.volume : (value ? prev.maxDensity3.volume : 0)
        }
      }));
    } else if (field === 'minDensity1') {
      setData(prev => ({
        ...prev,
        minDensity1: {
          ...prev.minDensity1,
          cylinderNumber: value,
          molde: dadosCilindro ? dadosCilindro.peso : (value ? prev.minDensity1.molde : 0),
          volume: dadosCilindro ? dadosCilindro.volume : (value ? prev.minDensity1.volume : 0)
        }
      }));
    } else if (field === 'minDensity2') {
      setData(prev => ({
        ...prev,
        minDensity2: {
          ...prev.minDensity2,
          cylinderNumber: value,
          molde: dadosCilindro ? dadosCilindro.peso : (value ? prev.minDensity2.molde : 0),
          volume: dadosCilindro ? dadosCilindro.volume : (value ? prev.minDensity2.volume : 0)
        }
      }));
    } else if (field === 'minDensity3') {
      setData(prev => ({
        ...prev,
        minDensity3: {
          ...prev.minDensity3,
          cylinderNumber: value,
          molde: dadosCilindro ? dadosCilindro.peso : (value ? prev.minDensity3.molde : 0),
          volume: dadosCilindro ? dadosCilindro.volume : (value ? prev.minDensity3.volume : 0)
        }
      }));
    }

    if (dadosCilindro) {
      toast({
        title: "Cilindro - Dados Preenchidos",
        description: `Cilindro ${dadosCilindro.codigo} (${dadosCilindro.tipo}): Peso ${dadosCilindro.peso}g, Volume ${dadosCilindro.volume}cm³`,
      });
    }
  };

  const saveTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      return apiRequest("POST", "/api/tests/max-min-density", testData);
    },
    onSuccess: async (result) => {
      // Sincronizar com Firebase Firestore
      const firebaseSuccess = await firebaseSync.syncEnsaio({
        ...data,
        results: calculations.results
      }, 'densidade-max-min');

      toast({ 
        title: "✅ Ensaio Salvo com Sucesso!",
        description: firebaseSuccess 
          ? "Ensaio salvo no PostgreSQL e sincronizado com Firebase."
          : "Ensaio salvo no PostgreSQL. Sincronização Firebase falhou.",
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tests/max-min-density"] });
      localStorage.removeItem('density-max-min-progress');
      console.log('🗑️ Progresso do ensaio de densidade máx/mín limpo após salvamento');
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao salvar ensaio", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  useEffect(() => {
    // Calcular umidade média para correção
    const moisture1 = calculateMoisture(data.moisture1.wetTare, data.moisture1.dryTare, data.moisture1.tare);
    const moisture2 = calculateMoisture(data.moisture2.wetTare, data.moisture2.dryTare, data.moisture2.tare);
    const moisture3 = calculateMoisture(data.moisture3.wetTare, data.moisture3.dryTare, data.moisture3.tare);
    
    const validMoistures = [moisture1, moisture2, moisture3].filter(m => m > 0);
    const averageMoisture = validMoistures.length > 0 ? validMoistures.reduce((sum, m) => sum + m, 0) / validMoistures.length : 0;

    // Calculate maximum density determinations
    const maxDet1Soil = data.maxDensity1.moldeSolo - data.maxDensity1.molde;
    const maxDet2Soil = data.maxDensity2.moldeSolo - data.maxDensity2.molde;
    const maxDet3Soil = data.maxDensity3.moldeSolo - data.maxDensity3.molde;

    // γd úmido = peso_solo / volume
    const maxDet1GammaDWet = data.maxDensity1.volume > 0 ? maxDet1Soil / data.maxDensity1.volume : 0;
    const maxDet2GammaDWet = data.maxDensity2.volume > 0 ? maxDet2Soil / data.maxDensity2.volume : 0;
    const maxDet3GammaDWet = data.maxDensity3.volume > 0 ? maxDet3Soil / data.maxDensity3.volume : 0;

    // γdmax = (γd / (umidade + 100)) × 100
    const maxDet1GammaD = averageMoisture > 0 ? (maxDet1GammaDWet / (averageMoisture + 100)) * 100 : maxDet1GammaDWet;
    const maxDet2GammaD = averageMoisture > 0 ? (maxDet2GammaDWet / (averageMoisture + 100)) * 100 : maxDet2GammaDWet;
    const maxDet3GammaD = averageMoisture > 0 ? (maxDet3GammaDWet / (averageMoisture + 100)) * 100 : maxDet3GammaDWet;

    const maxDensities = [maxDet1GammaD, maxDet2GammaD, maxDet3GammaD].filter(d => d > 0);
    const maxAverage = maxDensities.length > 0 ? maxDensities.reduce((a, b) => a + b, 0) / maxDensities.length : 0;

    // Calculate minimum density determinations
    const minDet1Soil = data.minDensity1.moldeSolo - data.minDensity1.molde;
    const minDet2Soil = data.minDensity2.moldeSolo - data.minDensity2.molde;
    const minDet3Soil = data.minDensity3.moldeSolo - data.minDensity3.molde;

    // γd úmido = peso_solo / volume
    const minDet1GammaDWet = data.minDensity1.volume > 0 ? minDet1Soil / data.minDensity1.volume : 0;
    const minDet2GammaDWet = data.minDensity2.volume > 0 ? minDet2Soil / data.minDensity2.volume : 0;
    const minDet3GammaDWet = data.minDensity3.volume > 0 ? minDet3Soil / data.minDensity3.volume : 0;

    // γdmin = (γd / (umidade + 100)) × 100
    const minDet1GammaD = averageMoisture > 0 ? (minDet1GammaDWet / (averageMoisture + 100)) * 100 : minDet1GammaDWet;
    const minDet2GammaD = averageMoisture > 0 ? (minDet2GammaDWet / (averageMoisture + 100)) * 100 : minDet2GammaDWet;
    const minDet3GammaD = averageMoisture > 0 ? (minDet3GammaDWet / (averageMoisture + 100)) * 100 : minDet3GammaDWet;

    const minDensities = [minDet1GammaD, minDet2GammaD, minDet3GammaD].filter(d => d > 0);
    const minAverage = minDensities.length > 0 ? minDensities.reduce((a, b) => a + b, 0) / minDensities.length : 0;

    // Calculate void indices (assuming γs = 2.67 g/cm³ for typical soil)
    const gammaS = 2.67;
    const emin = maxAverage > 0 ? (gammaS / maxAverage) - 1 : 0;
    const emax = minAverage > 0 ? (gammaS / minAverage) - 1 : 0;

    // Determine status based on consistency
    const isConsistent = (maxAverage - minAverage) > 0.1 && maxAverage > 0 && minAverage > 0;
    const status: "AGUARDANDO" | "APROVADO" | "REPROVADO" = isConsistent ? "APROVADO" : 
                   maxAverage === 0 && minAverage === 0 ? "AGUARDANDO" : "REPROVADO";

    setCalculations({
      maxDensity: {
        det1: { soil: maxDet1Soil, gammaDMax: maxDet1GammaD },
        det2: { soil: maxDet2Soil, gammaDMax: maxDet2GammaD },
        det3: { soil: maxDet3Soil, gammaDMax: maxDet3GammaD },
        average: maxAverage
      },
      minDensity: {
        det1: { soil: minDet1Soil, gammaDMin: minDet1GammaD },
        det2: { soil: minDet2Soil, gammaDMin: minDet2GammaD },
        det3: { soil: minDet3Soil, gammaDMin: minDet3GammaD },
        average: minAverage
      },
      results: {
        gammaDMax: maxAverage,
        gammaDMin: minAverage,
        emax,
        emin,
        status
      }
    });
  }, [data]);

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedData = (parent: string, field: string, value: any) => {
    if (parent === 'maxDensity1') {
      setData(prev => ({
        ...prev,
        maxDensity1: { 
          ...prev.maxDensity1,
          [field]: value 
        }
      }));
    } else if (parent === 'maxDensity2') {
      setData(prev => ({
        ...prev,
        maxDensity2: { 
          ...prev.maxDensity2,
          [field]: value 
        }
      }));
    } else if (parent === 'maxDensity3') {
      setData(prev => ({
        ...prev,
        maxDensity3: { 
          ...prev.maxDensity3,
          [field]: value 
        }
      }));
    } else if (parent === 'moisture1') {
      setData(prev => ({
        ...prev,
        moisture1: { 
          ...prev.moisture1,
          [field]: value 
        }
      }));
    } else if (parent === 'moisture2') {
      setData(prev => ({
        ...prev,
        moisture2: { 
          ...prev.moisture2,
          [field]: value 
        }
      }));
    } else if (parent === 'moisture3') {
      setData(prev => ({
        ...prev,
        moisture3: { 
          ...prev.moisture3,
          [field]: value 
        }
      }));
    } else if (parent === 'minDensity1') {
      setData(prev => ({
        ...prev,
        minDensity1: { 
          ...prev.minDensity1,
          [field]: value 
        }
      }));
    } else if (parent === 'minDensity2') {
      setData(prev => ({
        ...prev,
        minDensity2: { 
          ...prev.minDensity2,
          [field]: value 
        }
      }));
    } else if (parent === 'minDensity3') {
      setData(prev => ({
        ...prev,
        minDensity3: { 
          ...prev.minDensity3,
          [field]: value 
        }
      }));
    }
  };

  const handleSave = () => {
    const testData = {
      registrationNumber: data.registrationNumber,
      date: data.date,
      operator: data.operator,
      material: data.material,
      origin: data.origin,
      maxDensity: {
        det1: data.maxDensity1,
        det2: data.maxDensity2,
        det3: data.maxDensity3
      },
      minDensity: {
        det1: data.minDensity1,
        det2: data.minDensity2,
        det3: data.minDensity3
      },
      results: calculations.results
    };

    saveTestMutation.mutate(testData);
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "🔄 Gerando PDF...",
        description: "Preparando relatório do ensaio de densidade máx/mín",
        duration: 3000,
      });
      await generateMaxMinDensityVerticalPDF(data, calculations);
      toast({
        title: "📄 PDF Gerado com Sucesso!",
        description: "O relatório foi baixado para seu computador.",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao Gerar PDF",
        description: "Não foi possível gerar o relatório. Verifique os dados.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleClear = () => {
    setData({
      registrationNumber: "",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      operator: "",
      technicalResponsible: "",
      verifier: "",
      material: "",
      origin: "",
      north: "",
      east: "",
      cota: "",
      elevation: "",
      coordinates: "",
      quadrant: "",
      layer: "",
      estaca: "",
      balanceId: "",
      ovenId: "",
      compactionMethod: "",
      compactionEnergy: "",
      moisture1: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      moisture2: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      moisture3: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      maxDensity1: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      maxDensity2: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      maxDensity3: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      minDensity1: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      minDensity2: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
      minDensity3: { cylinderNumber: "", moldeSolo: 0, molde: 0, volume: 0 },
    });
  };

  return (
    <div className="laboratory-page space-y-6">
      {/* Cabeçalho Profissional do Ensaio */}
      <TestHeader 
        testType="densidade-max-min"
        operador={data.operator}
        responsavelCalculo={data.technicalResponsible}
        verificador={data.verifier}
        data={data.date}
        norte={data.north}
        este={data.east}
        cota={data.elevation}
        quadrante={data.quadrant}
        camada={data.layer}
        estaca={data.estaca}
        material={data.material}
        origem={data.origin}
        registro={data.registrationNumber}
        hora={data.time}
        tempo={{
          sol: false,
          chuvaFraca: false,
          chuvaForte: false,
          nublado: false
        }}
        amostreaReensaiada={{
          sim: false,
          nao: true
        }}
        dispositivosPrecisao={{
          balanca: data.balanceId,
          estufa: data.ovenId,
          termometro: "",
          cronometro: ""
        }}
        onOperadorChange={(value) => updateData("operator", value)}
        onResponsavelCalculoChange={(value) => updateData("technicalResponsible", value)}
        onVerificadorChange={(value) => updateData("verifier", value)}
        onDataChange={(value) => updateData("date", value)}
        onMaterialChange={(value) => updateData("material", value)}
        onOrigemChange={(value) => updateData("origin", value)}
        onRegistroChange={(value) => updateData("registrationNumber", value)}
        onNorteChange={(value) => updateData("north", value)}
        onEsteChange={(value) => updateData("east", value)}
        onCotaChange={(value) => updateData("cota", value)}
        onHoraChange={(value) => updateData("time", value)}
        onQuadranteChange={(value) => updateData("quadrant", value)}
        onCamadaChange={(value) => updateData("layer", value)}
        onEstacaChange={(value) => updateData("estaca", value)}
        onFvsChange={(value) => updateData("coordinates", value)}
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Densidade Máxima e Mínima</h2>
        <p className="text-gray-600">Determinação dos índices de vazios máximo e mínimo</p>
      </div>

      {/* Moisture Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Droplets className="mr-2 text-blue-600" size={20} />
            Teor de Umidade (3 Determinações)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-left">Campo</TableHead>
                <TableHead className="text-center">Det 1</TableHead>
                <TableHead className="text-center">Det 2</TableHead>
                <TableHead className="text-center">Det 3</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Cápsula</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={data.moisture1.capsule}
                    onChange={(e) => handleCapsuleNumberChange("moisture1", e.target.value)}
                    className="text-sm"
                    placeholder="ID"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={data.moisture2.capsule}
                    onChange={(e) => handleCapsuleNumberChange("moisture2", e.target.value)}
                    className="text-sm"
                    placeholder="ID"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={data.moisture3.capsule}
                    onChange={(e) => handleCapsuleNumberChange("moisture3", e.target.value)}
                    className="text-sm"
                    placeholder="ID"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Úmido + Tara (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.moisture1.wetTare || ""}
                    onChange={(e) => updateNestedData("moisture1", "wetTare", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.moisture2.wetTare || ""}
                    onChange={(e) => updateNestedData("moisture2", "wetTare", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.moisture3.wetTare || ""}
                    onChange={(e) => updateNestedData("moisture3", "wetTare", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Seco + Tara (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.moisture1.dryTare || ""}
                    onChange={(e) => updateNestedData("moisture1", "dryTare", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.moisture2.dryTare || ""}
                    onChange={(e) => updateNestedData("moisture2", "dryTare", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.moisture3.dryTare || ""}
                    onChange={(e) => updateNestedData("moisture3", "dryTare", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Tara (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.moisture1.tare || ""}
                    onChange={(e) => updateNestedData("moisture1", "tare", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.moisture2.tare || ""}
                    onChange={(e) => updateNestedData("moisture2", "tare", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.moisture3.tare || ""}
                    onChange={(e) => updateNestedData("moisture3", "tare", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-medium">Umidade (%) <span className="text-xs text-blue-600">📊</span></TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculateMoisture(data.moisture1.wetTare, data.moisture1.dryTare, data.moisture1.tare).toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculateMoisture(data.moisture2.wetTare, data.moisture2.dryTare, data.moisture2.tare).toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculateMoisture(data.moisture3.wetTare, data.moisture3.dryTare, data.moisture3.tare).toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-green-50">
                <TableCell className="font-medium">Umidade Média (%) <span className="text-xs text-green-600">📊</span></TableCell>
                <TableCell colSpan={3}>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculateAverageMoisture().toFixed(2)}
                    readOnly
                    className="bg-green-50 border-green-200 font-mono text-sm text-center font-bold"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Maximum Density */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowUp className="mr-2 text-blue-600" size={20} />
            Densidade Máxima (3 Determinações)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-left">Campo</TableHead>
                <TableHead className="text-center">Det 1</TableHead>
                <TableHead className="text-center">Det 2</TableHead>
                <TableHead className="text-center">Det 3</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Número do Cilindro</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={data.maxDensity1.cylinderNumber}
                    onChange={(e) => handleCylinderNumberChange("maxDensity1", e.target.value)}
                    className="text-sm"
                    placeholder="Ex: C001"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={data.maxDensity2.cylinderNumber}
                    onChange={(e) => handleCylinderNumberChange("maxDensity2", e.target.value)}
                    className="text-sm"
                    placeholder="Ex: C002"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={data.maxDensity3.cylinderNumber}
                    onChange={(e) => handleCylinderNumberChange("maxDensity3", e.target.value)}
                    className="text-sm"
                    placeholder="Ex: C003"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Molde + Solo (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.maxDensity1.moldeSolo || ""}
                    onChange={(e) => updateNestedData("maxDensity1", "moldeSolo", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.maxDensity2.moldeSolo || ""}
                    onChange={(e) => updateNestedData("maxDensity2", "moldeSolo", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.maxDensity3.moldeSolo || ""}
                    onChange={(e) => updateNestedData("maxDensity3", "moldeSolo", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Molde (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.maxDensity1.molde || ""}
                    onChange={(e) => updateNestedData("maxDensity1", "molde", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.maxDensity2.molde || ""}
                    onChange={(e) => updateNestedData("maxDensity2", "molde", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.maxDensity3.molde || ""}
                    onChange={(e) => updateNestedData("maxDensity3", "molde", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-medium">Solo (g) <span className="text-xs text-blue-600">📊</span></TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculations.maxDensity.det1.soil.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculations.maxDensity.det2.soil.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculations.maxDensity.det3.soil.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Volume (cm³)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.maxDensity1.volume || ""}
                    onChange={(e) => updateNestedData("maxDensity1", "volume", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.maxDensity2.volume || ""}
                    onChange={(e) => updateNestedData("maxDensity2", "volume", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.maxDensity3.volume || ""}
                    onChange={(e) => updateNestedData("maxDensity3", "volume", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-medium">γd (g/cm³) <span className="text-xs text-blue-600">📊</span></TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    value={calculations.maxDensity.det1.gammaDMax.toFixed(3)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    value={calculations.maxDensity.det2.gammaDMax.toFixed(3)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    value={calculations.maxDensity.det3.gammaDMax.toFixed(3)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-green-50">
                <TableCell className="font-medium">Umidade (%) <span className="text-xs text-green-600">📊 Média</span></TableCell>
                <TableCell colSpan={3}>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculateAverageMoisture().toFixed(2)}
                    readOnly
                    className="bg-green-50 border-green-200 font-mono text-sm text-center font-bold"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">γdmax (g/cm³):</span>
              <span className="text-lg font-bold text-blue-600 font-mono">{calculations.maxDensity.average.toFixed(3)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Minimum Density */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowDown className="mr-2 text-blue-600" size={20} />
            Densidade Mínima (3 Determinações)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-left">Campo</TableHead>
                <TableHead className="text-center">Det 1</TableHead>
                <TableHead className="text-center">Det 2</TableHead>
                <TableHead className="text-center">Det 3</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Número do Cilindro</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={data.minDensity1.cylinderNumber}
                    onChange={(e) => handleCylinderNumberChange("minDensity1", e.target.value)}
                    className="text-sm"
                    placeholder="Ex: C004"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={data.minDensity2.cylinderNumber}
                    onChange={(e) => handleCylinderNumberChange("minDensity2", e.target.value)}
                    className="text-sm"
                    placeholder="Ex: C005"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={data.minDensity3.cylinderNumber}
                    onChange={(e) => handleCylinderNumberChange("minDensity3", e.target.value)}
                    className="text-sm"
                    placeholder="Ex: C006"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Molde + Solo (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.minDensity1.moldeSolo || ""}
                    onChange={(e) => updateNestedData("minDensity1", "moldeSolo", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.minDensity2.moldeSolo || ""}
                    onChange={(e) => updateNestedData("minDensity2", "moldeSolo", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.minDensity3.moldeSolo || ""}
                    onChange={(e) => updateNestedData("minDensity3", "moldeSolo", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Molde (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.minDensity1.molde || ""}
                    onChange={(e) => updateNestedData("minDensity1", "molde", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.minDensity2.molde || ""}
                    onChange={(e) => updateNestedData("minDensity2", "molde", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.minDensity3.molde || ""}
                    onChange={(e) => updateNestedData("minDensity3", "molde", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-medium">Solo (g) <span className="text-xs text-blue-600">📊</span></TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculations.minDensity.det1.soil.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculations.minDensity.det2.soil.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculations.minDensity.det3.soil.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Volume (cm³)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.minDensity1.volume || ""}
                    onChange={(e) => updateNestedData("minDensity1", "volume", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.minDensity2.volume || ""}
                    onChange={(e) => updateNestedData("minDensity2", "volume", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.minDensity3.volume || ""}
                    onChange={(e) => updateNestedData("minDensity3", "volume", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-medium">γd (g/cm³) <span className="text-xs text-blue-600">📊</span></TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    value={calculations.minDensity.det1.gammaDMin.toFixed(3)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    value={calculations.minDensity.det2.gammaDMin.toFixed(3)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    value={calculations.minDensity.det3.gammaDMin.toFixed(3)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-green-50">
                <TableCell className="font-medium">Umidade (%) <span className="text-xs text-green-600">📊 Média</span></TableCell>
                <TableCell colSpan={3}>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculateAverageMoisture().toFixed(2)}
                    readOnly
                    className="bg-green-50 border-green-200 font-mono text-sm text-center font-bold"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">γdmin (g/cm³):</span>
              <span className="text-lg font-bold text-blue-600 font-mono">{calculations.minDensity.average.toFixed(3)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="mr-2 text-blue-600" size={20} />
            Resultados Finais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">γdmax (g/cm³)</div>
              <div className="text-xl font-bold text-gray-900 font-mono">{calculations.results.gammaDMax.toFixed(3)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">γdmin (g/cm³)</div>
              <div className="text-xl font-bold text-gray-900 font-mono">{calculations.results.gammaDMin.toFixed(3)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">emax</div>
              <div className="text-xl font-bold text-gray-900 font-mono">{calculations.results.emax.toFixed(3)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">emin</div>
              <div className="text-xl font-bold text-gray-900 font-mono">{calculations.results.emin.toFixed(3)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status do Ensaio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="mr-2 text-green-600" size={20} />
            Status do Ensaio
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <div className="flex justify-center">
            {(() => {
              // Lógica para densidade máx/mín: diferença razoável entre max e min
              const isApproved = (calculations.results.gammaDMax - calculations.results.gammaDMin) > 0.1 && 
                                calculations.results.gammaDMax > 0 && calculations.results.gammaDMin > 0;
              
              return (
                <div className={`${isApproved ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'} border-2 rounded-lg px-8 py-4`}>
                  <div className="text-2xl font-bold text-center">
                    {isApproved ? 'APROVADO' : 'REPROVADO'}
                  </div>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleSave}
              disabled={saveTestMutation.isPending}
              className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2" size={16} />
              {saveTestMutation.isPending ? "Salvando..." : "Salvar Ensaio"}
            </Button>
            <Button 
              onClick={handleGeneratePDF}
              className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700"
              disabled={isGeneratingPDF}
            >
              <FileText className="mr-2" size={16} />
              {isGeneratingPDF ? "Gerando PDF..." : "Gerar PDF"}
            </Button>
            <Button 
              onClick={handleClear}
              variant="outline"
              className="flex-1 min-w-[200px]"
            >
              <RotateCcw className="mr-2" size={16} />
              Limpar Dados
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
