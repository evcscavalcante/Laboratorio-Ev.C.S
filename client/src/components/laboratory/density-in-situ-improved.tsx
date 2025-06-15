import { useState, useEffect } from "react";
import { Info, Settings, Calculator, Droplet, BarChart, Save, FileText, RotateCcw, Target, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { calculateMoistureContent, calculateDensityInSitu } from "@/lib/calculations";
import { generateDensityInSituVerticalPDF } from "@/lib/pdf-vertical-tables";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { localDataManager } from "@/lib/local-storage";
import TestHeader from "@/components/test-header";

interface DensityInSituData {
  registrationNumber: string;
  date: string;
  time: string;
  operator: string;
  technicalResponsible: string;
  verifier: string;
  material: string;
  origin: string;
  coordinates: string;
  quadrant: string;
  layer: string;
  balanceId: string;
  ovenId: string;
  realDensityRef: string;
  
  // Determinações dos cilindros - conforme planilha
  det1: {
    cylinderNumber: string;
    moldeSolo: number;
    molde: number;
    solo: number;
    volume: number;
    rhoNat: number;
    rhoSeca: number;
  };
  det2: {
    cylinderNumber: string;
    moldeSolo: number;
    molde: number;
    solo: number;
    volume: number;
    rhoNat: number;
    rhoSeca: number;
  };
  
  // Umidade TOPO - 3 cápsulas
  moistureTop1: { capsule: string; soloUmidoTara: number; soloSecoTara: number; tara: number; soloSeco: number; agua: number; umidade: number; };
  moistureTop2: { capsule: string; soloUmidoTara: number; soloSecoTara: number; tara: number; soloSeco: number; agua: number; umidade: number; };
  moistureTop3: { capsule: string; soloUmidoTara: number; soloSecoTara: number; tara: number; soloSeco: number; agua: number; umidade: number; };
  
  // Umidade BASE - 3 cápsulas
  moistureBase1: { capsule: string; soloUmidoTara: number; soloSecoTara: number; tara: number; soloSeco: number; agua: number; umidade: number; };
  moistureBase2: { capsule: string; soloUmidoTara: number; soloSecoTara: number; tara: number; soloSeco: number; agua: number; umidade: number; };
  moistureBase3: { capsule: string; soloUmidoTara: number; soloSecoTara: number; tara: number; soloSeco: number; agua: number; umidade: number; };
  
  // Médias e cálculos finais
  rhoSecaMedia: number;
  umidadeMediaTopo: number;
  umidadeMediaBase: number;
  
  // Compacidade relativa (CR) e Índice de vazios (IV)
  realDensity: number; // γs
  crTopo: number;
  ivTopo: number;
  crBase: number;
  ivBase: number;
  
  status: 'APROVADO' | 'REPROVADO' | 'PENDENTE';
}

export default function DensityInSituImproved() {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [data, setData] = useState<DensityInSituData>({
    registrationNumber: '',
    date: '',
    time: '',
    operator: '',
    technicalResponsible: '',
    verifier: '',
    material: '',
    origin: '',
    coordinates: '',
    quadrant: '',
    layer: '',
    balanceId: '',
    ovenId: '',
    realDensityRef: '',
    
    det1: {
      cylinderNumber: '',
      moldeSolo: 0,
      molde: 0,
      solo: 0,
      volume: 0,
      rhoNat: 0,
      rhoSeca: 0,
    },
    det2: {
      cylinderNumber: '',
      moldeSolo: 0,
      molde: 0,
      solo: 0,
      volume: 0,
      rhoNat: 0,
      rhoSeca: 0,
    },
    
    moistureTop1: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
    moistureTop2: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
    moistureTop3: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
    
    moistureBase1: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
    moistureBase2: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
    moistureBase3: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
    
    rhoSecaMedia: 0,
    umidadeMediaTopo: 0,
    umidadeMediaBase: 0,
    
    realDensity: 3.149, // Exemplo da planilha
    crTopo: 0,
    ivTopo: 0,
    crBase: 0,
    ivBase: 0,
    
    status: 'PENDENTE'
  });

  // Calcular progresso das seções
  const getSectionProgress = () => {
    const sections = [
      { 
        id: 'general', 
        name: 'Informações Gerais', 
        icon: <Info size={16} />,
        completed: !!(data.registrationNumber && data.date && data.operator), 
        required: true 
      },
      { 
        id: 'sample', 
        name: 'Amostra e Local', 
        icon: <Target size={16} />,
        completed: !!(data.material && data.origin), 
        required: true 
      },
      { 
        id: 'equipment', 
        name: 'Equipamentos', 
        icon: <Settings size={16} />,
        completed: !!(data.balanceId && data.ovenId), 
        required: true 
      },
      { 
        id: 'cylinders', 
        name: 'Cilindros de Cravação', 
        icon: <Calculator size={16} />,
        completed: !!(data.det1.cylinderNumber && data.det2.cylinderNumber), 
        required: true 
      },
      { 
        id: 'moisture', 
        name: 'Umidade (Fogareiro)', 
        icon: <Droplet size={16} />,
        completed: !!(data.moistureTop1.capsule && data.moistureBase1.capsule), 
        required: true 
      },
      { 
        id: 'results', 
        name: 'Resultados e CR/IV', 
        icon: <BarChart size={16} />,
        completed: data.rhoSecaMedia > 0 && data.crTopo > 0, 
        required: false 
      },
    ];
    
    const completedSections = sections.filter(s => s.completed).length;
    const totalSections = sections.length;
    const progressPercent = Math.round((completedSections / totalSections) * 100);
    
    return { sections, completedSections, totalSections, progressPercent };
  };

  const { sections, completedSections, totalSections, progressPercent } = getSectionProgress();

  // Função para atualizar dados
  const updateData = (field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Atualizar dados aninhados (cilindros)
  const updateCylinder = (det: 'det1' | 'det2', field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [det]: {
        ...prev[det],
        [field]: value
      }
    }));
  };

  // Atualizar dados de umidade
  const updateMoisture = (moisture: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [moisture]: {
        ...prev[moisture as keyof DensityInSituData] as any,
        [field]: value
      }
    }));
  };

  // Função para navegar para seção
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  };

  // Cálculos automáticos
  useEffect(() => {
    // Calcular solo para cada cilindro
    if (data.det1.moldeSolo && data.det1.molde) {
      const solo1 = data.det1.moldeSolo - data.det1.molde;
      updateCylinder('det1', 'solo', solo1);
      
      if (data.det1.volume > 0) {
        const rhoNat1 = solo1 / data.det1.volume;
        updateCylinder('det1', 'rhoNat', Number(rhoNat1.toFixed(3)));
      }
    }

    if (data.det2.moldeSolo && data.det2.molde) {
      const solo2 = data.det2.moldeSolo - data.det2.molde;
      updateCylinder('det2', 'solo', solo2);
      
      if (data.det2.volume > 0) {
        const rhoNat2 = solo2 / data.det2.volume;
        updateCylinder('det2', 'rhoNat', Number(rhoNat2.toFixed(3)));
      }
    }

    // Calcular densidade seca média
    if (data.det1.rhoSeca && data.det2.rhoSeca) {
      const media = (data.det1.rhoSeca + data.det2.rhoSeca) / 2;
      setData(prev => ({ ...prev, rhoSecaMedia: Number(media.toFixed(3)) }));
    }
  }, [data.det1, data.det2]);

  // Cálculos de umidade
  useEffect(() => {
    // Calcular dados de umidade para cada cápsula
    const moistures = ['moistureTop1', 'moistureTop2', 'moistureTop3', 'moistureBase1', 'moistureBase2', 'moistureBase3'];
    
    moistures.forEach(key => {
      const moisture = data[key as keyof DensityInSituData] as any;
      if (moisture.soloUmidoTara && moisture.soloSecoTara && moisture.tara) {
        const soloSeco = moisture.soloSecoTara - moisture.tara;
        const agua = moisture.soloUmidoTara - moisture.soloSecoTara;
        const umidade = (agua / soloSeco) * 100;
        
        updateMoisture(key, 'soloSeco', Number(soloSeco.toFixed(2)));
        updateMoisture(key, 'agua', Number(agua.toFixed(2)));
        updateMoisture(key, 'umidade', Number(umidade.toFixed(1)));
      }
    });

    // Calcular médias de umidade
    const topoUmidades = [data.moistureTop1.umidade, data.moistureTop2.umidade, data.moistureTop3.umidade].filter(u => u > 0);
    const baseUmidades = [data.moistureBase1.umidade, data.moistureBase2.umidade, data.moistureBase3.umidade].filter(u => u > 0);
    
    if (topoUmidades.length > 0) {
      const mediaTopo = topoUmidades.reduce((a, b) => a + b, 0) / topoUmidades.length;
      setData(prev => ({ ...prev, umidadeMediaTopo: Number(mediaTopo.toFixed(1)) }));
    }
    
    if (baseUmidades.length > 0) {
      const mediaBase = baseUmidades.reduce((a, b) => a + b, 0) / baseUmidades.length;
      setData(prev => ({ ...prev, umidadeMediaBase: Number(mediaBase.toFixed(1)) }));
    }
  }, [data.moistureTop1, data.moistureTop2, data.moistureTop3, data.moistureBase1, data.moistureBase2, data.moistureBase3]);

  // Mutations para salvar
  const saveTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const response = await fetch('/api/ensaios/densidade-in-situ/temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar ensaio');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ensaio salvo com sucesso!",
        description: "Os dados foram salvos e estão disponíveis na lista de ensaios.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ensaios/densidade-in-situ'] });
    },
    onError: (error) => {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o ensaio. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    saveTestMutation.mutate(data);
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const calculations = {
        densityAverage: data.rhoSecaMedia,
        moistureTopAverage: data.umidadeMediaTopo,
        moistureBaseAverage: data.umidadeMediaBase
      };
      
      await generateDensityInSituVerticalPDF(data, calculations);
      toast({
        title: "PDF gerado com sucesso!",
        description: "O relatório foi gerado e baixado.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleClear = () => {
    setData({
      registrationNumber: '',
      date: '',
      time: '',
      operator: '',
      technicalResponsible: '',
      verifier: '',
      material: '',
      origin: '',
      coordinates: '',
      quadrant: '',
      layer: '',
      balanceId: '',
      ovenId: '',
      realDensityRef: '',
      
      det1: {
        cylinderNumber: '',
        moldeSolo: 0,
        molde: 0,
        solo: 0,
        volume: 0,
        rhoNat: 0,
        rhoSeca: 0,
      },
      det2: {
        cylinderNumber: '',
        moldeSolo: 0,
        molde: 0,
        solo: 0,
        volume: 0,
        rhoNat: 0,
        rhoSeca: 0,
      },
      
      moistureTop1: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
      moistureTop2: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
      moistureTop3: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
      
      moistureBase1: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
      moistureBase2: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
      moistureBase3: { capsule: '', soloUmidoTara: 0, soloSecoTara: 0, tara: 0, soloSeco: 0, agua: 0, umidade: 0 },
      
      rhoSecaMedia: 0,
      umidadeMediaTopo: 0,
      umidadeMediaBase: 0,
      
      realDensity: 3.149,
      crTopo: 0,
      ivTopo: 0,
      crBase: 0,
      ivBase: 0,
      
      status: 'PENDENTE'
    });
  };

  // Componente para campos obrigatórios
  const RequiredInput = ({ id, label, value, onChange, type = "text", placeholder, unit, helpText }: any) => (
    <div>
      <Label htmlFor={id} className="text-sm font-medium text-gray-900">
        {label}
        <span className="ml-1 text-red-500">*</span>
      </Label>
      <div className="relative mt-1">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${!value ? 'border-orange-300 bg-orange-50' : 'border-green-300'} transition-colors`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            {unit}
          </span>
        )}
      </div>
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo com progresso */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900">Densidade "In Situ" - Cilindro de Cravação</h1>
              <p className="text-sm text-gray-600 mt-1">NBR 9813:2016</p>
            </div>
            
            {/* Indicador de progresso compacto */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">{completedSections}/{totalSections} seções</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-blue-600 font-medium">{progressPercent}%</span>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={saveTestMutation.isPending}
                >
                  <Save size={16} className="mr-1" />
                  {saveTestMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                >
                  <FileText size={16} className="mr-1" />
                  {isGeneratingPDF ? 'Gerando...' : 'PDF'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navegação por seções */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  section.completed
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : section.required
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.completed && <Check size={14} className="mr-1" />}
                {section.name}
                {section.required && !section.completed && <span className="ml-1 text-red-500">*</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Cabeçalho Profissional do Ensaio */}
          <TestHeader 
            testType="densidade-in-situ"
            operador={data.operator}
            responsavelCalculo={data.technicalResponsible}
            verificador={data.verifier}
            data={data.date}
            norte=""
            este=""
            cota=""
            quadrante={data.quadrant}
            camada={data.layer}
            fvs=""
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
          />

          {/* Informações Gerais */}
          <Card id="general" className={`scroll-mt-20 ${sections.find(s => s.id === 'general')?.completed ? 'border-green-200 bg-green-50/30' : 'border-l-4 border-l-blue-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Info className="mr-2 text-blue-600" size={20} />
                  Informações Gerais
                  <span className="ml-2 text-red-500 text-sm">*</span>
                </div>
                {sections.find(s => s.id === 'general')?.completed && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check size={16} className="mr-1" />
                    Completo
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <RequiredInput
                  id="registrationNumber"
                  label="Registro"
                  value={data.registrationNumber}
                  onChange={(value: string) => updateData("registrationNumber", value)}
                  placeholder="Ex: MRG-022"
                  helpText="Número de registro do ensaio"
                />
                <RequiredInput
                  id="date"
                  label="Data do Ensaio"
                  type="date"
                  value={data.date}
                  onChange={(value: string) => updateData("date", value)}
                />
                <div>
                  <Label htmlFor="time" className="text-sm font-medium text-gray-900">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={data.time}
                    onChange={(e) => updateData("time", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <RequiredInput
                  id="operator"
                  label="Operador"
                  value={data.operator}
                  onChange={(value: string) => updateData("operator", value)}
                  placeholder="Nome do operador"
                  helpText="Responsável pela execução do ensaio"
                />
                <RequiredInput
                  id="technicalResponsible"
                  label="Responsável Técnico"
                  value={data.technicalResponsible}
                  onChange={(value: string) => updateData("technicalResponsible", value)}
                  placeholder="Responsável pelo cálculo"
                />
                <div>
                  <Label htmlFor="verifier" className="text-sm font-medium text-gray-900">Verificador</Label>
                  <Input
                    id="verifier"
                    value={data.verifier}
                    onChange={(e) => updateData("verifier", e.target.value)}
                    placeholder="Nome do verificador"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Profissional que conferiu os resultados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localização da Amostra */}
          <Card id="sample" className={`scroll-mt-20 ${sections.find(s => s.id === 'sample')?.completed ? 'border-green-200 bg-green-50/30' : 'border-l-4 border-l-blue-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="mr-2 text-blue-600" size={20} />
                  Amostra e Localização
                  <span className="ml-2 text-red-500 text-sm">*</span>
                </div>
                {sections.find(s => s.id === 'sample')?.completed && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check size={16} className="mr-1" />
                    Completo
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <RequiredInput
                  id="material"
                  label="Material"
                  value={data.material}
                  onChange={(value: string) => updateData("material", value)}
                  placeholder="Tipo de material"
                  helpText="Descrição do tipo de solo ensaiado"
                />
                <RequiredInput
                  id="origin"
                  label="Origem"
                  value={data.origin}
                  onChange={(value: string) => updateData("origin", value)}
                  placeholder="Local de origem"
                />
                <div>
                  <Label htmlFor="coordinates" className="text-sm font-medium text-gray-900">Coordenadas</Label>
                  <Input
                    id="coordinates"
                    value={data.coordinates}
                    onChange={(e) => updateData("coordinates", e.target.value)}
                    placeholder="Coordenadas do local"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quadrant" className="text-sm font-medium text-gray-900">Quadrante</Label>
                  <Input
                    id="quadrant"
                    value={data.quadrant}
                    onChange={(e) => updateData("quadrant", e.target.value)}
                    placeholder="Quadrante"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="layer" className="text-sm font-medium text-gray-900">Camada</Label>
                  <Input
                    id="layer"
                    value={data.layer}
                    onChange={(e) => updateData("layer", e.target.value)}
                    placeholder="Camada do solo"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Identificação da camada ensaiada</p>
                </div>
                <div>
                  <Label htmlFor="realDensityRef" className="text-sm font-medium text-gray-900">Densidade Real dos Grãos (γs)</Label>
                  <div className="relative mt-1">
                    <Input
                      id="realDensityRef"
                      type="number"
                      step="0.001"
                      value={data.realDensity}
                      onChange={(e) => updateData("realDensity", parseFloat(e.target.value) || 0)}
                      placeholder="3.149"
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">g/cm³</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Referência do ensaio de densidade real</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipamentos */}
          <Card id="equipment" className={`scroll-mt-20 ${sections.find(s => s.id === 'equipment')?.completed ? 'border-green-200 bg-green-50/30' : 'border-l-4 border-l-blue-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings className="mr-2 text-blue-600" size={20} />
                  Equipamentos
                  <span className="ml-2 text-red-500 text-sm">*</span>
                </div>
                {sections.find(s => s.id === 'equipment')?.completed && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check size={16} className="mr-1" />
                    Completo
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RequiredInput
                  id="balanceId"
                  label="Balança"
                  value={data.balanceId}
                  onChange={(value: string) => updateData("balanceId", value)}
                  placeholder="ID da balança"
                  helpText="Identificação da balança utilizada"
                />
                <RequiredInput
                  id="ovenId"
                  label="Estufa"
                  value={data.ovenId}
                  onChange={(value: string) => updateData("ovenId", value)}
                  placeholder="ID da estufa"
                  helpText="Identificação da estufa utilizada"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cilindros de Cravação */}
          <Card id="cylinders" className={`scroll-mt-20 ${sections.find(s => s.id === 'cylinders')?.completed ? 'border-green-200 bg-green-50/30' : 'border-l-4 border-l-blue-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calculator className="mr-2 text-blue-600" size={20} />
                  Cilindros de Cravação
                  <span className="ml-2 text-red-500 text-sm">*</span>
                </div>
                {sections.find(s => s.id === 'cylinders')?.completed && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check size={16} className="mr-1" />
                    Completo
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">NÚMERO DO CILINDRO</TableHead>
                      <TableHead className="text-center">MOLDE + SOLO (g)</TableHead>
                      <TableHead className="text-center">MOLDE (g)</TableHead>
                      <TableHead className="text-center">SOLO (g)</TableHead>
                      <TableHead className="text-center">VOLUME (cm³)</TableHead>
                      <TableHead className="text-center">ρₙₐₜ (g/cm³)</TableHead>
                      <TableHead className="text-center">ρₛₑcₐ (g/cm³)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Input
                          value={data.det1.cylinderNumber}
                          onChange={(e) => updateCylinder('det1', 'cylinderNumber', e.target.value)}
                          placeholder="3"
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={data.det1.moldeSolo || ''}
                          onChange={(e) => updateCylinder('det1', 'moldeSolo', parseFloat(e.target.value) || 0)}
                          placeholder="3190"
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={data.det1.molde || ''}
                          onChange={(e) => updateCylinder('det1', 'molde', parseFloat(e.target.value) || 0)}
                          placeholder="1092"
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={data.det1.solo || ''}
                          readOnly
                          className="text-center bg-gray-100"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={data.det1.volume || ''}
                          onChange={(e) => updateCylinder('det1', 'volume', parseFloat(e.target.value) || 0)}
                          placeholder="997"
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.001"
                          value={data.det1.rhoNat || ''}
                          readOnly
                          className="text-center bg-gray-100"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.001"
                          value={data.det1.rhoSeca || ''}
                          onChange={(e) => updateCylinder('det1', 'rhoSeca', parseFloat(e.target.value) || 0)}
                          placeholder="1.908"
                          className="text-center"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Input
                          value={data.det2.cylinderNumber}
                          onChange={(e) => updateCylinder('det2', 'cylinderNumber', e.target.value)}
                          placeholder="4"
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={data.det2.moldeSolo || ''}
                          onChange={(e) => updateCylinder('det2', 'moldeSolo', parseFloat(e.target.value) || 0)}
                          placeholder="3201"
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={data.det2.molde || ''}
                          onChange={(e) => updateCylinder('det2', 'molde', parseFloat(e.target.value) || 0)}
                          placeholder="1114"
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={data.det2.solo || ''}
                          readOnly
                          className="text-center bg-gray-100"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={data.det2.volume || ''}
                          onChange={(e) => updateCylinder('det2', 'volume', parseFloat(e.target.value) || 0)}
                          placeholder="999"
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.001"
                          value={data.det2.rhoNat || ''}
                          readOnly
                          className="text-center bg-gray-100"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.001"
                          value={data.det2.rhoSeca || ''}
                          onChange={(e) => updateCylinder('det2', 'rhoSeca', parseFloat(e.target.value) || 0)}
                          placeholder="1.888"
                          className="text-center"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-50">
                      <TableCell colSpan={6} className="text-center font-medium">
                        ρₛₑcₐ (g/cm³) Média
                      </TableCell>
                      <TableCell className="text-center font-bold text-blue-600">
                        {data.rhoSecaMedia.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Umidade (Fogareiro) */}
          <Card id="moisture" className={`scroll-mt-20 ${sections.find(s => s.id === 'moisture')?.completed ? 'border-green-200 bg-green-50/30' : 'border-l-4 border-l-blue-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Droplet className="mr-2 text-blue-600" size={20} />
                  Umidade (Fogareiro)
                  <span className="ml-2 text-red-500 text-sm">*</span>
                </div>
                {sections.find(s => s.id === 'moisture')?.completed && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check size={16} className="mr-1" />
                    Completo
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* TOPO */}
                <div>
                  <h4 className="text-lg font-semibold text-center mb-4 bg-blue-100 py-2 rounded">TOPO</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center text-xs">CÁPSULA Nº</TableHead>
                          <TableHead className="text-center text-xs">SOLO ÚMIDO + TARA (g)</TableHead>
                          <TableHead className="text-center text-xs">SOLO SECO + TARA (g)</TableHead>
                          <TableHead className="text-center text-xs">TARA (g)</TableHead>
                          <TableHead className="text-center text-xs">SOLO SECO (g)</TableHead>
                          <TableHead className="text-center text-xs">ÁGUA (g)</TableHead>
                          <TableHead className="text-center text-xs">UMIDADE (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { key: 'moistureTop1', placeholder: '37' },
                          { key: 'moistureTop2', placeholder: '46' },
                          { key: 'moistureTop3', placeholder: '55' }
                        ].map(({ key, placeholder }) => (
                          <TableRow key={key}>
                            <TableCell>
                              <Input
                                value={(data as any)[key].capsule}
                                onChange={(e) => updateMoisture(key, 'capsule', e.target.value)}
                                placeholder={placeholder}
                                className="text-center w-16"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={(data as any)[key].soloUmidoTara || ''}
                                onChange={(e) => updateMoisture(key, 'soloUmidoTara', parseFloat(e.target.value) || 0)}
                                className="text-center w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={(data as any)[key].soloSecoTara || ''}
                                onChange={(e) => updateMoisture(key, 'soloSecoTara', parseFloat(e.target.value) || 0)}
                                className="text-center w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={(data as any)[key].tara || ''}
                                onChange={(e) => updateMoisture(key, 'tara', parseFloat(e.target.value) || 0)}
                                className="text-center w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={(data as any)[key].soloSeco || ''}
                                readOnly
                                className="text-center w-20 bg-gray-100"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={(data as any)[key].agua || ''}
                                readOnly
                                className="text-center w-20 bg-gray-100"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={(data as any)[key].umidade || ''}
                                readOnly
                                className="text-center w-20 bg-gray-100"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-blue-50">
                          <TableCell colSpan={6} className="text-center font-medium">
                            UMIDADE MÉDIA (%)
                          </TableCell>
                          <TableCell className="text-center font-bold text-blue-600">
                            {data.umidadeMediaTopo.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* BASE */}
                <div>
                  <h4 className="text-lg font-semibold text-center mb-4 bg-green-100 py-2 rounded">BASE</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center text-xs">CÁPSULA Nº</TableHead>
                          <TableHead className="text-center text-xs">SOLO ÚMIDO + TARA (g)</TableHead>
                          <TableHead className="text-center text-xs">SOLO SECO + TARA (g)</TableHead>
                          <TableHead className="text-center text-xs">TARA (g)</TableHead>
                          <TableHead className="text-center text-xs">SOLO SECO (g)</TableHead>
                          <TableHead className="text-center text-xs">ÁGUA (g)</TableHead>
                          <TableHead className="text-center text-xs">UMIDADE (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { key: 'moistureBase1', placeholder: '7' },
                          { key: 'moistureBase2', placeholder: '8' },
                          { key: 'moistureBase3', placeholder: '9' }
                        ].map(({ key, placeholder }) => (
                          <TableRow key={key}>
                            <TableCell>
                              <Input
                                value={(data as any)[key].capsule}
                                onChange={(e) => updateMoisture(key, 'capsule', e.target.value)}
                                placeholder={placeholder}
                                className="text-center w-16"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={(data as any)[key].soloUmidoTara || ''}
                                onChange={(e) => updateMoisture(key, 'soloUmidoTara', parseFloat(e.target.value) || 0)}
                                className="text-center w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={(data as any)[key].soloSecoTara || ''}
                                onChange={(e) => updateMoisture(key, 'soloSecoTara', parseFloat(e.target.value) || 0)}
                                className="text-center w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={(data as any)[key].tara || ''}
                                onChange={(e) => updateMoisture(key, 'tara', parseFloat(e.target.value) || 0)}
                                className="text-center w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={(data as any)[key].soloSeco || ''}
                                readOnly
                                className="text-center w-20 bg-gray-100"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={(data as any)[key].agua || ''}
                                readOnly
                                className="text-center w-20 bg-gray-100"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={(data as any)[key].umidade || ''}
                                readOnly
                                className="text-center w-20 bg-gray-100"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-green-50">
                          <TableCell colSpan={6} className="text-center font-medium">
                            UMIDADE MÉDIA (%)
                          </TableCell>
                          <TableCell className="text-center font-bold text-green-600">
                            {data.umidadeMediaBase.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados e Análise */}
          <Card id="results" className={`scroll-mt-20 ${sections.find(s => s.id === 'results')?.completed ? 'border-green-200 bg-green-50/30' : 'border-l-4 border-l-gray-300'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart className="mr-2 text-blue-600" size={20} />
                  Resultados e Análise
                </div>
                {sections.find(s => s.id === 'results')?.completed && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check size={16} className="mr-1" />
                    Completo
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Massa Específica Real dos Grãos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-center font-bold mb-4">MASSA ESPECÍFICA REAL DOS GRÃOS (g/cm³):</h4>
                  <div className="text-center text-2xl font-bold text-blue-600">
                    {data.realDensity.toFixed(3)}
                  </div>
                </div>

                {/* Cálculos de Compacidade Relativa e Índice de Vazios */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* TOPO */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-center font-bold mb-4 text-blue-700">TOPO</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Umidade Média (%):</span>
                        <span className="font-bold">{data.umidadeMediaTopo.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Densidade Seca Média (g/cm³):</span>
                        <span className="font-bold">{data.rhoSecaMedia.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>CR (%):</span>
                        <span className="font-bold text-blue-600">{data.crTopo.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>IV:</span>
                        <span className="font-bold text-blue-600">{data.ivTopo.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* BASE */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-center font-bold mb-4 text-green-700">BASE</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Umidade Média (%):</span>
                        <span className="font-bold">{data.umidadeMediaBase.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Densidade Seca Média (g/cm³):</span>
                        <span className="font-bold">{data.rhoSecaMedia.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>CR (%):</span>
                        <span className="font-bold text-green-600">{data.crBase.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>IV:</span>
                        <span className="font-bold text-green-600">{data.ivBase.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status do Ensaio */}
                <div className="text-center">
                  <div className="inline-block">
                    <Label htmlFor="status" className="text-lg font-bold mr-4">STATUS DO ENSAIO:</Label>
                    <div className={`inline-block px-6 py-2 rounded text-white font-bold text-lg ${
                      data.status === 'APROVADO' ? 'bg-green-500' :
                      data.status === 'REPROVADO' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {data.status}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação fixos no bottom mobile */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-30">
            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                disabled={saveTestMutation.isPending}
                className="flex-1"
              >
                <Save className="mr-2" size={16} />
                {saveTestMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                variant="outline"
                className="px-6"
              >
                <FileText size={16} />
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="px-6 text-red-600"
              >
                <RotateCcw size={16} />
              </Button>
            </div>
          </div>

          {/* Espaço para botões fixos no mobile */}
          <div className="lg:hidden h-20"></div>
        </div>
      </div>
    </div>
  );
}