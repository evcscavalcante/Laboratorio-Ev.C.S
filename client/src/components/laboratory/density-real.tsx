import { useState, useEffect } from "react";
import { Info, Droplet, FlaskRound, BarChart, Save, FileText, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { calculateMoistureContent, getWaterDensity } from "@/lib/calculations";
import { generateRealDensityVerticalPDF } from "@/lib/pdf-vertical-tables";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { localDataManager } from "@/lib/local-storage";
import TestHeader from "@/components/test-header";
import { useEquipmentAutofill } from "@/hooks/useEquipmentAutofill";
import { firebaseSync } from "@/lib/firebase-sync";

interface RealDensityData {
  id?: number;
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
  quadrant: string;
  layer: string;
  estaca: string;
  local: string;
  weatherCondition: string;
  humidity: string;
  temperature: string;
  sampleReensayed: boolean;
  balanceId: string;
  ovenId: string;
  thermometerId: string;
  chronometerId: string;
  
  // Moisture determinations
  moisture1: { capsule: string; wetTare: number; dryTare: number; tare: number; };
  moisture2: { capsule: string; wetTare: number; dryTare: number; tare: number; };
  moisture3: { capsule: string; wetTare: number; dryTare: number; tare: number; };
  
  // Picnometer determinations
  picnometer1: {
    massaPicnometro: number;
    massaPicAmostraAgua: number;
    massaPicAgua: number;
    temperatura: number;
    massaSoloUmido: number;
  };
  picnometer2: {
    massaPicnometro: number;
    massaPicAmostraAgua: number;
    massaPicAgua: number;
    temperatura: number;
    massaSoloUmido: number;
  };
}

interface DensityRealProps {
  testId?: number;
  mode?: 'view' | 'edit' | 'new';
}

export default function DensityReal({ testId, mode = 'new' }: DensityRealProps) {
  const { toast } = useToast();
  const [equipamentos, setEquipamentos] = useState<{capsulas: any[]}>({
    capsulas: []
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Query para buscar dados do ensaio específico
  const { data: testData, isLoading: loadingTest } = useQuery({
    queryKey: ['/api/tests/densidade-real/temp', testId],
    queryFn: async () => {
      if (!testId) return null;
      const response = await apiRequest('GET', `/api/tests/densidade-real/temp`);
      const tests = await response.json();
      return tests.find((test: any) => test.id === testId) || null;
    },
    enabled: !!testId
  });
  
  // Função para carregar dados salvos
  const loadSavedData = (): RealDensityData => {
    try {
      const saved = localStorage.getItem('density-real-progress');
      if (saved) {
        const parsedData = JSON.parse(saved);
        return {
          ...parsedData,
          date: parsedData.date || new Date().toISOString().split('T')[0],
        };
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
    
    return {
      registrationNumber: "",
      date: new Date().toISOString().split('T')[0],
      time: "",
      operator: "",
      technicalResponsible: "",
      verifier: "",
      material: "",
      origin: "",
      north: "",
      east: "",
      cota: "",
      elevation: "",
      quadrant: "",
      layer: "",
      estaca: "",
      local: "",
      weatherCondition: "SOL FORTE",
      humidity: "",
      temperature: "",
      sampleReensayed: false,
      balanceId: "",
      ovenId: "",
      thermometerId: "",
      chronometerId: "",
      moisture1: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      moisture2: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      moisture3: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      picnometer1: {
        massaPicnometro: 0,
        massaPicAmostraAgua: 0,
        massaPicAgua: 0,
        temperatura: 0,
        massaSoloUmido: 0
      },
      picnometer2: {
        massaPicnometro: 0,
        massaPicAmostraAgua: 0,
        massaPicAgua: 0,
        temperatura: 0,
        massaSoloUmido: 0
      }
    };
  };

  const [data, setData] = useState<RealDensityData>(loadSavedData);
  
  // Hook para preenchimento automático dos equipamentos
  const { searchEquipment } = useEquipmentAutofill();

  // Preenchimento automático removido para evitar loops infinitos
  // O preenchimento automático será feito através de handlers específicos nos campos

  // Atualizar dados quando testData estiver disponível
  useEffect(() => {
    if (testData && mode !== 'new') {
      setData({
        registrationNumber: testData.registrationNumber || "",
        date: testData.date || new Date().toISOString().split('T')[0],
        time: testData.time || "",
        operator: testData.operator || "",
        technicalResponsible: testData.technicalResponsible || "",
        verifier: testData.verifier || "",
        material: testData.material || "",
        origin: testData.origin || "",
        north: testData.north || "",
        east: testData.east || "",
        cota: testData.cota || "",
        elevation: testData.elevation || "",
        quadrant: testData.quadrant || "",
        layer: testData.layer || "",
        estaca: testData.estaca || "",
        local: testData.local || "",
        weatherCondition: testData.weatherCondition || "SOL FORTE",
        humidity: testData.humidity || "",
        temperature: testData.temperature || "",
        sampleReensayed: testData.sampleReensayed || false,
        balanceId: testData.balanceId || "",
        ovenId: testData.ovenId || "",
        thermometerId: testData.thermometerId || "",
        chronometerId: testData.chronometerId || "",
        moisture1: testData.moisture1 || { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
        moisture2: testData.moisture2 || { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
        moisture3: testData.moisture3 || { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
        picnometer1: testData.picnometer1 || {
          massaPicnometro: 0,
          massaPicAmostraAgua: 0,
          massaPicAgua: 0,
          temperatura: 0,
          massaSoloUmido: 0
        },
        picnometer2: testData.picnometer2 || {
          massaPicnometro: 0,
          massaPicAmostraAgua: 0,
          massaPicAgua: 0,
          temperatura: 0,
          massaSoloUmido: 0
        }
      });
    }
  }, [testData, mode]);

  const [calculations, setCalculations] = useState({
    moisture: { det1: { moisture: 0 }, det2: { moisture: 0 }, det3: { moisture: 0 }, average: 0 },
    picnometer: {
      det1: { waterDensity: 0.99823, dryWeight: 0, realDensity: 0 },
      det2: { waterDensity: 0.99823, dryWeight: 0, realDensity: 0 }
    },
    results: { difference: 0, average: 0, status: "AGUARDANDO" as "AGUARDANDO" | "APROVADO" | "REPROVADO" }
  });

  // Carregamento inicial do progresso salvo
  useEffect(() => {
    const loadSavedProgress = () => {
      try {
        const savedData = localStorage.getItem('density-real-progress');
        if (savedData && mode === 'new') {
          const parsedData = JSON.parse(savedData);
          console.log('🔄 Restaurando progresso salvo do ensaio de densidade real');
          setData(parsedData);
        }
      } catch (error) {
        console.error('Erro ao carregar progresso salvo:', error);
      }
    };

    loadSavedProgress();
  }, [mode]);

  // Salvamento automático sempre que os dados mudarem
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
                                  data.picnometer1.massaPicnometro > 0 ||
                                  data.picnometer2.massaPicnometro > 0;

        if (hasSignificantData) {
          localStorage.setItem('density-real-progress', JSON.stringify(data));
          console.log('💾 Progresso do ensaio de densidade real salvo automaticamente');
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
        const capsulas = await localDataManager.getCapsulas();
        setEquipamentos({ capsulas });
      } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
      }
    };

    loadEquipamentos();
  }, []);

  // Função para buscar peso da cápsula pelo número
  // Handler para mudança no número da cápsula com preenchimento automático
  const handleCapsuleNumberChange = (field: string, value: string) => {
    console.log(`🔍 Densidade Real - Buscando equipamento para código: ${value}`);
    
    // Buscar equipamento usando hook correto (trigger com 1+ caracteres)
    let pesoCapsula = null;
    if (value && value.length >= 1) {
      const result = searchEquipment(value, 'capsula');
      if (result.found && result.type === 'capsula') {
        pesoCapsula = result.data.peso;
        console.log(`✅ Cápsula encontrada: ${value} - ${pesoCapsula}g`);
      }
    }
    
    if (field === 'moisture1') {
      setData(prev => ({
        ...prev,
        moisture1: {
          ...prev.moisture1,
          capsule: value,
          tare: pesoCapsula || (value ? prev.moisture1.tare : 0)
        }
      }));
    } else if (field === 'moisture2') {
      setData(prev => ({
        ...prev,
        moisture2: {
          ...prev.moisture2,
          capsule: value,
          tare: pesoCapsula || (value ? prev.moisture2.tare : 0)
        }
      }));
    } else if (field === 'moisture3') {
      setData(prev => ({
        ...prev,
        moisture3: {
          ...prev.moisture3,
          capsule: value,
          tare: pesoCapsula || (value ? prev.moisture3.tare : 0)
        }
      }));
    }

    if (pesoCapsula) {
      toast({
        title: "Peso preenchido automaticamente",
        description: `Peso da cápsula: ${pesoCapsula}g`,
      });
    }
  };

  const saveTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      return apiRequest("POST", "/api/tests/real-density", testData);
    },
    onSuccess: async (result) => {
      const savedData = result.json ? await result.json() : result;
      console.log('✅ Ensaio densidade real salvo no PostgreSQL:', savedData);
      
      // Sincronizar com Firebase Firestore usando dados salvos
      const ensaioComId = {
        ...data,
        id: savedData.id || data.id,
        results: calculations.results
      };
      console.log('🔥 Iniciando sincronização Firebase para densidade real:', ensaioComId);
      
      const firebaseSuccess = await firebaseSync.syncEnsaio(ensaioComId, 'densidade-real');
      console.log('🔥 Resultado sincronização Firebase densidade real:', firebaseSuccess);

      toast({ 
        title: "✅ Ensaio Salvo com Sucesso!",
        description: firebaseSuccess 
          ? `Ensaio salvo no PostgreSQL e sincronizado com Firebase.`
          : `Ensaio salvo no PostgreSQL. Sincronização Firebase falhou.`,
        duration: 5000,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/tests/real-density"] });
      localStorage.removeItem('density-real-progress');
      console.log('🗑️ Progresso do ensaio de densidade real limpo após salvamento');
      
      if (firebaseSuccess) {
        console.log('✅ Dados sincronizados com Firebase Firestore');
      } else {
        console.log('⚠️ Falha na sincronização Firebase - dados mantidos no PostgreSQL');
      }
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
    // Calculate moisture content
    const moistureResults = calculateMoistureContent([
      data.moisture1,
      data.moisture2,
      data.moisture3
    ]);

    // Calculate picnometer results
    const picnometer1WaterDensity = getWaterDensity(data.picnometer1.temperatura);
    const picnometer2WaterDensity = getWaterDensity(data.picnometer2.temperatura);

    const pic1DryWeight = moistureResults.average > 0 ? 
      data.picnometer1.massaSoloUmido / (1 + moistureResults.average / 100) : 
      data.picnometer1.massaSoloUmido;

    const pic2DryWeight = moistureResults.average > 0 ? 
      data.picnometer2.massaSoloUmido / (1 + moistureResults.average / 100) : 
      data.picnometer2.massaSoloUmido;

    // Calculate real density using picnometer formula
    // ρs = ms / [(mpaa - mpa) / ρw - ms]
    let realDensity1 = 0;
    let realDensity2 = 0;

    if (pic1DryWeight > 0) {
      const volumeDisplaced1 = (data.picnometer1.massaPicAmostraAgua - data.picnometer1.massaPicAgua) / picnometer1WaterDensity;
      const soilVolume1 = volumeDisplaced1 - pic1DryWeight / picnometer1WaterDensity;
      realDensity1 = soilVolume1 > 0 ? pic1DryWeight / soilVolume1 : 0;
    }

    if (pic2DryWeight > 0) {
      const volumeDisplaced2 = (data.picnometer2.massaPicAmostraAgua - data.picnometer2.massaPicAgua) / picnometer2WaterDensity;
      const soilVolume2 = volumeDisplaced2 - pic2DryWeight / picnometer2WaterDensity;
      realDensity2 = soilVolume2 > 0 ? pic2DryWeight / soilVolume2 : 0;
    }

    const difference = Math.abs(realDensity1 - realDensity2);
    const average = (realDensity1 + realDensity2) / 2;

    // Status: APPROVED if difference ≤ 0.02 g/cm³ (corrected from 0.05)
    const status: "AGUARDANDO" | "APROVADO" | "REPROVADO" = 
      difference <= 0.02 && average > 0 ? "APROVADO" : 
      difference === 0 ? "AGUARDANDO" : "REPROVADO";

    setCalculations({
      moisture: moistureResults,
      picnometer: {
        det1: { waterDensity: picnometer1WaterDensity, dryWeight: pic1DryWeight, realDensity: realDensity1 },
        det2: { waterDensity: picnometer2WaterDensity, dryWeight: pic2DryWeight, realDensity: realDensity2 }
      },
      results: { difference, average, status }
    });
  }, [data]);

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedData = (parent: string, field: string, value: any) => {
    if (parent === 'moisture1') {
      setData(prev => ({
        ...prev,
        moisture1: { ...prev.moisture1, [field]: value }
      }));
    } else if (parent === 'moisture2') {
      setData(prev => ({
        ...prev,
        moisture2: { ...prev.moisture2, [field]: value }
      }));
    } else if (parent === 'moisture3') {
      setData(prev => ({
        ...prev,
        moisture3: { ...prev.moisture3, [field]: value }
      }));
    } else if (parent === 'picnometer1') {
      setData(prev => ({
        ...prev,
        picnometer1: { ...prev.picnometer1, [field]: value }
      }));
    } else if (parent === 'picnometer2') {
      setData(prev => ({
        ...prev,
        picnometer2: { ...prev.picnometer2, [field]: value }
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
      moisture: {
        det1: data.moisture1,
        det2: data.moisture2,
        det3: data.moisture3
      },
      picnometer: {
        det1: data.picnometer1,
        det2: data.picnometer2
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
        description: "Preparando relatório do ensaio de densidade real",
        duration: 3000,
      });
      await generateRealDensityVerticalPDF(data, calculations);
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
      time: "",
      operator: "",
      technicalResponsible: "",
      verifier: "",
      material: "",
      origin: "",
      north: "",
      east: "",
      cota: "",
      elevation: "",
      quadrant: "",
      layer: "",
      estaca: "",
      local: "",
      weatherCondition: "SOL FORTE",
      humidity: "",
      temperature: "",
      sampleReensayed: false,
      balanceId: "",
      ovenId: "",
      thermometerId: "",
      chronometerId: "",
      moisture1: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      moisture2: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      moisture3: { capsule: "", wetTare: 0, dryTare: 0, tare: 0 },
      picnometer1: {
        massaPicnometro: 0,
        massaPicAmostraAgua: 0,
        massaPicAgua: 0,
        temperatura: 20,
        massaSoloUmido: 0
      },
      picnometer2: {
        massaPicnometro: 0,
        massaPicAmostraAgua: 0,
        massaPicAgua: 0,
        temperatura: 20,
        massaSoloUmido: 0
      }
    });
  };

  return (
    <div className="laboratory-page space-y-6">
      {/* Cabeçalho Profissional do Ensaio */}
      <TestHeader 
        testType="densidade-real"
        operador={data.operator}
        responsavelCalculo={data.technicalResponsible}
        verificador={data.verifier}
        data={data.date}
        hora={data.time}
        norte={data.north}
        este={data.east}
        cota={data.cota}
        quadrante={data.quadrant}
        camada={data.layer}
        estaca={data.estaca}
        local={data.local}
        material={data.material}
        origem={data.origin}
        registro={data.registrationNumber}
        tempo={{
          sol: data.weatherCondition === "SOL FORTE",
          chuvaFraca: data.weatherCondition === "CHUVA FRACA",
          chuvaForte: data.weatherCondition === "CHUVA FORTE",
          nublado: data.weatherCondition === "NUBLADO"
        }}
        amostreaReensaiada={{
          sim: data.sampleReensayed,
          nao: !data.sampleReensayed
        }}
        dispositivosPrecisao={{
          balanca: data.balanceId,
          estufa: data.ovenId,
          termometro: data.thermometerId,
          cronometro: data.chronometerId
        }}
        onOperadorChange={(value) => updateData("operator", value)}
        onResponsavelCalculoChange={(value) => updateData("technicalResponsible", value)}
        onVerificadorChange={(value) => updateData("verifier", value)}
        onDataChange={(value) => updateData("date", value)}
        onHoraChange={(value) => updateData("time", value)}
        onMaterialChange={(value) => updateData("material", value)}
        onOrigemChange={(value) => updateData("origin", value)}
        onRegistroChange={(value) => updateData("registrationNumber", value)}
        onNorteChange={(value) => updateData("north", value)}
        onEsteChange={(value) => updateData("east", value)}
        onCotaChange={(value) => updateData("cota", value)}
        onQuadranteChange={(value) => updateData("quadrant", value)}
        onCamadaChange={(value) => updateData("layer", value)}
        onEstacaChange={(value) => updateData("estaca", value)}
        onFvsChange={(value) => updateData("local", value)}
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Densidade Real dos Grãos</h2>
        <p className="text-gray-600">Determinação da densidade real por picnometria</p>
      </div>

      {/* Moisture Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Droplet className="mr-2 text-blue-600" size={20} />
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
                <TableCell className="font-medium">Cápsula Nº</TableCell>
                <TableCell>
                  <Input
                    value={data.moisture1.capsule}
                    onChange={(e) => handleCapsuleNumberChange("moisture1", e.target.value)}
                    placeholder="C-01"
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={data.moisture2.capsule}
                    onChange={(e) => handleCapsuleNumberChange("moisture2", e.target.value)}
                    placeholder="C-02"
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={data.moisture3.capsule}
                    onChange={(e) => handleCapsuleNumberChange("moisture3", e.target.value)}
                    placeholder="C-03"
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Solo Úmido + Tara (g)</TableCell>
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
                <TableCell className="font-medium">Solo Seco + Tara (g)</TableCell>
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
                    value={calculations.moisture.det1.moisture.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculations.moisture.det2.moisture.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculations.moisture.det3.moisture.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Umidade Média (%):</span>
              <span className="text-lg font-bold text-blue-600 font-mono">{calculations.moisture.average.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Picnometer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskRound className="mr-2 text-blue-600" size={20} />
            Picnômetro (2 Determinações)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-left">Campo</TableHead>
                <TableHead className="text-center">Det 1</TableHead>
                <TableHead className="text-center">Det 2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Massa do Picnômetro (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.picnometer1.massaPicnometro || ""}
                    onChange={(e) => updateNestedData("picnometer1", "massaPicnometro", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.picnometer2.massaPicnometro || ""}
                    onChange={(e) => updateNestedData("picnometer2", "massaPicnometro", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Massa Pic + Amostra + Água (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.picnometer1.massaPicAmostraAgua || ""}
                    onChange={(e) => updateNestedData("picnometer1", "massaPicAmostraAgua", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.picnometer2.massaPicAmostraAgua || ""}
                    onChange={(e) => updateNestedData("picnometer2", "massaPicAmostraAgua", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Massa Pic + Água (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.picnometer1.massaPicAgua || ""}
                    onChange={(e) => updateNestedData("picnometer1", "massaPicAgua", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.picnometer2.massaPicAgua || ""}
                    onChange={(e) => updateNestedData("picnometer2", "massaPicAgua", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Temperatura (°C)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.1"
                    value={data.picnometer1.temperatura === 0 ? "" : data.picnometer1.temperatura}
                    onChange={(e) => updateNestedData("picnometer1", "temperatura", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                    placeholder="20.0"
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.1"
                    value={data.picnometer2.temperatura === 0 ? "" : data.picnometer2.temperatura}
                    onChange={(e) => updateNestedData("picnometer2", "temperatura", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                    placeholder="20.0"
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-medium">Densidade da Água (g/cm³) <span className="text-xs text-blue-600">📊</span></TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.00001"
                    value={calculations.picnometer.det1.waterDensity.toFixed(5)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.00001"
                    value={calculations.picnometer.det2.waterDensity.toFixed(5)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Massa do Solo Úmido (g)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.picnometer1.massaSoloUmido || ""}
                    onChange={(e) => updateNestedData("picnometer1", "massaSoloUmido", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.picnometer2.massaSoloUmido || ""}
                    onChange={(e) => updateNestedData("picnometer2", "massaSoloUmido", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-medium">Massa do Solo Seco (g) <span className="text-xs text-blue-600">📊</span></TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculations.picnometer.det1.dryWeight.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculations.picnometer.det2.dryWeight.toFixed(2)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-medium">Densidade Real (g/cm³) <span className="text-xs text-blue-600">📊</span></TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    value={calculations.picnometer.det1.realDensity.toFixed(3)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    value={calculations.picnometer.det2.realDensity.toFixed(3)}
                    readOnly
                    className="bg-blue-50 border-blue-200 font-mono text-sm"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Diferença (g/cm³)</div>
              <div className="text-xl font-bold text-gray-900 font-mono">{calculations.results.difference.toFixed(3)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Média Final (g/cm³)</div>
              <div className="text-xl font-bold text-gray-900 font-mono">{calculations.results.average.toFixed(3)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Critério de Aprovação</div>
              <div className="text-sm text-gray-500">Diferença ≤ 0.02 g/cm³</div>
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
              // Lógica para densidade real: diferença ≤ 0.02 g/cm³
              const isApproved = calculations.results.difference <= 0.02 && calculations.results.average > 0;
              
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
