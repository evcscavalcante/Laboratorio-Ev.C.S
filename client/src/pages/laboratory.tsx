import { useState, useEffect } from "react";
import { FlaskRound, PanelLeftOpen, PanelLeftClose, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Laboratory() {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useLocation();
  const [selectedTestType, setSelectedTestType] = useState<string | null>(null);

  // Buscar ensaios dos três tipos usando endpoints temporários
  const { data: densityInSituTests = [] } = useQuery({
    queryKey: ['/api/tests/density-in-situ/temp'],
    queryFn: async () => {
      const response = await fetch('/api/tests/density-in-situ/temp');
      if (!response.ok) return [];
      return response.json();
    }
  });

  const { data: realDensityTests = [] } = useQuery({
    queryKey: ['/api/tests/real-density/temp'],
    queryFn: async () => {
      const response = await fetch('/api/tests/real-density/temp');
      if (!response.ok) return [];
      return response.json();
    }
  });

  const { data: maxMinDensityTests = [] } = useQuery({
    queryKey: ['/api/tests/max-min-density/temp'],
    queryFn: async () => {
      const response = await fetch('/api/tests/max-min-density/temp');
      if (!response.ok) return [];
      return response.json();
    }
  });

  // Combinar todos os ensaios
  const allTests = [
    ...(Array.isArray(densityInSituTests) ? densityInSituTests : []).map((test: any) => ({ 
      ...test, 
      type: 'density-in-situ', 
      icon: '⚖️', 
      typeName: 'Densidade In Situ',
      route: '/solos/densidade-in-situ'
    })),
    ...(Array.isArray(realDensityTests) ? realDensityTests : []).map((test: any) => ({ 
      ...test, 
      type: 'real-density', 
      icon: '⚛️', 
      typeName: 'Densidade Real',
      route: '/solos/densidade-real'
    })),
    ...(Array.isArray(maxMinDensityTests) ? maxMinDensityTests : []).map((test: any) => ({ 
      ...test, 
      type: 'max-min-density', 
      icon: '↕️', 
      typeName: 'Densidade Máx/Mín',
      route: '/solos/densidade-max-min'
    }))
  ];

  // Filtrar ensaios pelo tipo selecionado
  const filteredTests = selectedTestType 
    ? allTests.filter(test => test.type === selectedTestType)
    : allTests;

  // Tipos de ensaios disponíveis
  const testTypes = [
    {
      type: 'density-in-situ',
      icon: '⚖️',
      name: 'Massa Específica Aparente In Situ',
      description: 'NBR 9813 - Com emprego do cilindro de cravação',
      count: allTests.filter(t => t.type === 'density-in-situ').length,
      route: '/solos/densidade-in-situ',
      color: 'blue'
    },
    {
      type: 'real-density',
      icon: '⚛️',
      name: 'Massa Específica dos Sólidos',
      description: 'NBR 6508 - Fração passante na peneira de 2,0 mm',
      count: allTests.filter(t => t.type === 'real-density').length,
      route: '/solos/densidade-real',
      color: 'green'
    },
    {
      type: 'max-min-density',
      icon: '↕️',
      name: 'Índices de Vazios Máx/Mín',
      description: 'NBR 12004 e NBR 12051 - Solos não coesivos',
      count: allTests.filter(t => t.type === 'max-min-density').length,
      route: '/solos/densidade-max-min',
      color: 'purple'
    }
  ];

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateTimeString = now.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      setCurrentDateTime(dateTimeString);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-80 bg-white border-r h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} />
              Ensaios Salvos ({allTests.length})
            </h2>
            
            {/* Três botões para novos ensaios */}
            <div className="space-y-3 mb-4">
              <button
                onClick={() => setLocation('/solos/densidade-in-situ')}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-3 px-4 font-medium"
              >
                <span className="text-xl">⚖️</span>
                <span>Densidade In Situ - Cilindro de Cravação</span>
              </button>
              
              <button
                onClick={() => setLocation('/solos/densidade-real')}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-3 px-4 font-medium"
              >
                <span className="text-xl">⚛️</span>
                <span>Densidade Real dos Grãos</span>
              </button>
              
              <button
                onClick={() => setLocation('/solos/densidade-max-min')}
                className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-3 px-4 font-medium"
              >
                <span className="text-xl">↕️</span>
                <span>Densidade Máx/Mín</span>
              </button>
            </div>
          </div>
          
          {/* Lista de ensaios salvos dinâmica */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {allTests.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FileText size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Nenhum ensaio salvo</p>
                </div>
              ) : (
                allTests.map((test: any) => (
                  <div 
                    key={`${test.type}-${test.id}`}
                    onClick={() => setLocation(`${test.route}?load=${test.id}`)}
                    className="p-3 border rounded cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{test.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {test.registrationNumber || test.testNumber || `Ensaio_${test.id}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {test.typeName} • ID: {test.id}
                        </div>
                        {test.client && (
                          <div className="text-xs text-gray-400">
                            Cliente: {test.client}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900">
                    <FlaskRound className="inline mr-2 text-blue-600" size={20} />
                    Laboratório Ev.C.S
                  </h1>
                </div>
                <div className="hidden md:block ml-6">
                  <div className="text-sm text-gray-500">
                    Sistema de Ensaios Geotécnicos - ABNT NBR 6457 e NBR 9813
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{currentDateTime}</span>
                <Link href="/analytics">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <BarChart3 size={16} />
                    Analytics
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="flex items-center gap-2 relative"
                >
                  {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                  {sidebarOpen ? 'Fechar Lista' : 'Ver Ensaios Salvos'}
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {allTests.length}
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedTestType ? (
            /* Visualização inicial - Cards dos tipos de ensaios */
            <div className="text-center py-16">
              <FlaskRound size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Laboratório de Ensaios Geotécnicos
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Selecione um tipo de ensaio para visualizar os ensaios salvos ou criar novos ensaios.
              </p>
              
              {/* Cards de tipos de ensaios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {testTypes.map((testType) => (
                  <div 
                    key={testType.type}
                    onClick={() => setSelectedTestType(testType.type)}
                    className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                  >
                    <div className="text-3xl mb-3">{testType.icon}</div>
                    <h3 className="font-semibold mb-2">{testType.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {testType.description}
                    </p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                      testType.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      testType.color === 'green' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {testType.count} ensaios salvos
                    </div>
                    <div className="text-xs text-gray-500">
                      Clique para visualizar ensaios
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Visualização filtrada - Lista de ensaios do tipo selecionado */
            <div className="py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedTestType(null)}
                    className="flex items-center gap-2"
                  >
                    ← Voltar
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {testTypes.find(t => t.type === selectedTestType)?.icon}
                    </span>
                    <h2 className="text-xl font-bold">
                      {testTypes.find(t => t.type === selectedTestType)?.name}
                    </h2>
                  </div>
                </div>
                <Button 
                  onClick={() => setLocation(testTypes.find(t => t.type === selectedTestType)?.route || '')}
                  className="flex items-center gap-2"
                >
                  <span>+</span>
                  Novo Ensaio
                </Button>
              </div>

              {filteredTests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border">
                  <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum ensaio encontrado</h3>
                  <p className="text-gray-600 mb-6">
                    Ainda não há ensaios salvos deste tipo.
                  </p>
                  <Button 
                    onClick={() => setLocation(testTypes.find(t => t.type === selectedTestType)?.route || '')}
                    className="flex items-center gap-2"
                  >
                    <span>+</span>
                    Criar Primeiro Ensaio
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTests.map((test: any) => (
                    <div 
                      key={`${test.type}-${test.id}`}
                      onClick={() => setLocation(`${test.route}?load=${test.id}`)}
                      className="bg-white p-4 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{test.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">
                            {test.registrationNumber || test.testNumber || `Ensaio_${test.id}`}
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            ID: {test.id}
                          </div>
                          {test.client && (
                            <div className="text-sm text-gray-600 mb-2">
                              Cliente: {test.client}
                            </div>
                          )}
                          {test.date && (
                            <div className="text-xs text-gray-400">
                              Data: {new Date(test.date).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                          <div className="mt-3 text-xs text-blue-600">
                            Clique para abrir na calculadora →
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}