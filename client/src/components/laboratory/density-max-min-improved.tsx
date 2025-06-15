import { useState, useEffect } from "react";
import { Info, ArrowUp, ArrowDown, BarChart, Save, FileText, RotateCcw, Droplets, Calculator, Settings, Target, Check } from "lucide-react";
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
  coordinates: string;
  quadrant: string;
  layer: string;
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

export default function DensityMaxMinImproved() {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [data, setData] = useState<MaxMinDensityData>({
    registrationNumber: '',
    date: '',
    time: '',
    operator: '',
    technicalResponsible: '',
    verifier: '',
    material: '',
    origin: '',
    north: '',
    east: '',
    cota: '',
    coordinates: '',
    quadrant: '',
    layer: '',
    balanceId: '',
    ovenId: '',
    compactionMethod: '',
    compactionEnergy: '',
    
    moisture1: { capsule: '', wetTare: 0, dryTare: 0, tare: 0 },
    moisture2: { capsule: '', wetTare: 0, dryTare: 0, tare: 0 },
    moisture3: { capsule: '', wetTare: 0, dryTare: 0, tare: 0 },
    
    maxDensity1: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
    maxDensity2: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
    maxDensity3: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
    
    minDensity1: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
    minDensity2: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
    minDensity3: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
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
        name: 'Localização da Amostra', 
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
        id: 'moisture', 
        name: 'Determinação de Umidade', 
        icon: <Droplets size={16} />,
        completed: !!(data.moisture1.capsule && data.moisture2.capsule && data.moisture3.capsule), 
        required: true 
      },
      { 
        id: 'maxDensity', 
        name: 'Densidade Máxima', 
        icon: <ArrowUp size={16} />,
        completed: !!(data.maxDensity1.cylinderNumber && data.maxDensity2.cylinderNumber && data.maxDensity3.cylinderNumber), 
        required: true 
      },
      { 
        id: 'minDensity', 
        name: 'Densidade Mínima', 
        icon: <ArrowDown size={16} />,
        completed: !!(data.minDensity1.cylinderNumber && data.minDensity2.cylinderNumber && data.minDensity3.cylinderNumber), 
        required: true 
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

  // Função para navegar para seção
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  };

  // Mutations para salvar
  const saveTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      return apiRequest('/api/tests/densidade-max-min/temp', {
        method: 'POST',
        body: testData
      });
    },
    onSuccess: () => {
      toast({
        title: "Ensaio salvo com sucesso!",
        description: "Os dados foram salvos e estão disponíveis na lista de ensaios.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tests/max-min-density'] });
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
      await generateMaxMinDensityVerticalPDF(data);
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
      north: '',
      east: '',
      cota: '',
      coordinates: '',
      quadrant: '',
      layer: '',
      balanceId: '',
      ovenId: '',
      compactionMethod: '',
      compactionEnergy: '',
      
      moisture1: { capsule: '', wetTare: 0, dryTare: 0, tare: 0 },
      moisture2: { capsule: '', wetTare: 0, dryTare: 0, tare: 0 },
      moisture3: { capsule: '', wetTare: 0, dryTare: 0, tare: 0 },
      
      maxDensity1: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
      maxDensity2: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
      maxDensity3: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
      
      minDensity1: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
      minDensity2: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
      minDensity3: { cylinderNumber: '', moldeSolo: 0, molde: 0, volume: 0 },
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
              <h1 className="text-xl font-semibold text-gray-900">Densidade Máxima e Mínima</h1>
              <p className="text-sm text-gray-600 mt-1">Determinação dos índices de vazios máximo e mínimo</p>
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
          {/* Header do ensaio */}
          <TestHeader 
            testType="densidade-max-min"
            operador={data.operator}
            responsavelCalculo={data.technicalResponsible}
            verificador={data.verifier}
            data={data.date}
            norte={data.north}
            este={data.east}
            cota={data.cota}
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
                  label="Número do Registro"
                  value={data.registrationNumber}
                  onChange={(value: string) => updateData("registrationNumber", value)}
                  placeholder="Ex: DM-001/2024"
                  helpText="Identificação única do ensaio"
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
                  helpText="Responsável pela execução"
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
                  Localização da Amostra
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
                  helpText="Descrição do tipo de solo"
                />
                <RequiredInput
                  id="origin"
                  label="Origem"
                  value={data.origin}
                  onChange={(value: string) => updateData("origin", value)}
                  placeholder="Local de origem"
                />
                <div>
                  <Label htmlFor="north" className="text-sm font-medium text-gray-900">Norte</Label>
                  <Input
                    id="north"
                    value={data.north}
                    onChange={(e) => updateData("north", e.target.value)}
                    placeholder="Coordenada UTM Norte"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="east" className="text-sm font-medium text-gray-900">Este</Label>
                  <Input
                    id="east"
                    value={data.east}
                    onChange={(e) => updateData("east", e.target.value)}
                    placeholder="Coordenada UTM Este"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cota" className="text-sm font-medium text-gray-900">Cota</Label>
                  <div className="relative mt-1">
                    <Input
                      id="cota"
                      value={data.cota}
                      onChange={(e) => updateData("cota", e.target.value)}
                      placeholder="Cota altimétrica"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">m</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="coordinates" className="text-sm font-medium text-gray-900">Coordenadas GPS</Label>
                  <Input
                    id="coordinates"
                    value={data.coordinates}
                    onChange={(e) => updateData("coordinates", e.target.value)}
                    placeholder="Lat, Lng"
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
              </div>
            </CardContent>
          </Card>

          {/* Equipamentos */}
          <Card id="equipment" className={`scroll-mt-20 ${sections.find(s => s.id === 'equipment')?.completed ? 'border-green-200 bg-green-50/30' : 'border-l-4 border-l-blue-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings className="mr-2 text-blue-600" size={20} />
                  Equipamentos e Métodos
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
                <div>
                  <Label htmlFor="compactionMethod" className="text-sm font-medium text-gray-900">Método de Compactação</Label>
                  <Input
                    id="compactionMethod"
                    value={data.compactionMethod}
                    onChange={(e) => updateData("compactionMethod", e.target.value)}
                    placeholder="Ex: Proctor Normal"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Método de compactação conforme NBR</p>
                </div>
                <div>
                  <Label htmlFor="compactionEnergy" className="text-sm font-medium text-gray-900">Energia de Compactação</Label>
                  <div className="relative mt-1">
                    <Input
                      id="compactionEnergy"
                      value={data.compactionEnergy}
                      onChange={(e) => updateData("compactionEnergy", e.target.value)}
                      placeholder="Ex: Normal, Modificado"
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">kJ/m³</span>
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