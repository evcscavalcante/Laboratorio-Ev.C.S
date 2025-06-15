import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  MapPin,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedTest {
  id: number;
  testType: string;
  registro: string;
  operador: string;
  responsavelCalculo: string;
  verificador: string;
  data: string;
  hora: string;
  local: string;
  quadrante: string;
  camada: string;
  origem: string;
  createdAt: string;
  updatedAt: string;
}

const EnsaiosSalvos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');

  // Buscar ensaios de densidade in-situ
  const { data: densityInSituTests = [] } = useQuery({
    queryKey: ['/api/tests/densidade-in-situ/temp'],
    enabled: true
  });

  // Buscar ensaios de densidade real
  const { data: densityRealTests = [] } = useQuery({
    queryKey: ['/api/tests/densidade-real/temp'],
    enabled: true
  });

  // Buscar ensaios de densidade máx/mín
  const { data: densityMaxMinTests = [] } = useQuery({
    queryKey: ['/api/tests/densidade-max-min/temp'],
    enabled: true
  });

  // Combinar todos os ensaios
  const allTests: SavedTest[] = [
    ...densityInSituTests.map((test: any) => ({ ...test, testType: 'densidade-in-situ' })),
    ...densityRealTests.map((test: any) => ({ ...test, testType: 'densidade-real' })),
    ...densityMaxMinTests.map((test: any) => ({ ...test, testType: 'densidade-max-min' }))
  ].sort((a, b) => new Date(b.createdAt || b.data).getTime() - new Date(a.createdAt || a.data).getTime());

  // Filtrar ensaios
  const filteredTests = allTests.filter(test => {
    const matchesSearch = test.registro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.operador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.local?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'todos' || test.testType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getTestTypeLabel = (type: string) => {
    switch (type) {
      case 'densidade-in-situ':
        return 'Densidade In-Situ';
      case 'densidade-real':
        return 'Densidade Real';
      case 'densidade-max-min':
        return 'Densidade Máx/Mín';
      default:
        return type;
    }
  };

  const getTestTypeColor = (type: string) => {
    switch (type) {
      case 'densidade-in-situ':
        return 'bg-blue-100 text-blue-800';
      case 'densidade-real':
        return 'bg-green-100 text-green-800';
      case 'densidade-max-min':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewTest = (test: SavedTest) => {
    // Navegar para a calculadora correspondente com os dados carregados
    const route = `/solos/${test.testType}?loadTest=${test.id}`;
    window.location.href = route;
  };

  const handleDeleteTest = async (test: SavedTest) => {
    if (confirm(`Tem certeza que deseja excluir o ensaio ${test.registro}?`)) {
      // Implementar exclusão
      console.log('Excluir ensaio:', test.id);
    }
  };

  const handleDownloadPDF = (test: SavedTest) => {
    // Implementar download do PDF
    console.log('Download PDF:', test.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-1 md:px-4 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ensaios Salvos</h1>
          <p className="text-gray-600">
            Gerencie e visualize todos os ensaios salvos no sistema
          </p>
        </div>

        {/* Controles de busca e filtro */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Buscar por registro, operador ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('todos')}
                >
                  Todos ({allTests.length})
                </Button>
                <Button
                  variant={filterType === 'densidade-in-situ' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('densidade-in-situ')}
                >
                  In-Situ ({densityInSituTests.length})
                </Button>
                <Button
                  variant={filterType === 'densidade-real' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('densidade-real')}
                >
                  Real ({densityRealTests.length})
                </Button>
                <Button
                  variant={filterType === 'densidade-max-min' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('densidade-max-min')}
                >
                  Máx/Mín ({densityMaxMinTests.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de ensaios */}
        <div className="grid gap-4">
          {filteredTests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum ensaio encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterType !== 'todos' 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Ainda não há ensaios salvos no sistema'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTests.map((test) => (
              <Card key={`${test.testType}-${test.id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getTestTypeColor(test.testType)}>
                          {getTestTypeLabel(test.testType)}
                        </Badge>
                        <h3 className="font-semibold text-lg">{test.registro}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>Operador: {test.operador}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            {test.data} às {test.hora}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{test.local} - {test.quadrante}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        <span>Responsável: {test.responsavelCalculo}</span>
                        <span className="mx-2">•</span>
                        <span>Verificador: {test.verificador}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTest(test)}
                      >
                        <Eye size={16} className="mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(test)}
                      >
                        <Download size={16} className="mr-1" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTest(test)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Estatísticas */}
        {allTests.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{allTests.length}</div>
                  <div className="text-sm text-gray-600">Total de Ensaios</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{densityInSituTests.length}</div>
                  <div className="text-sm text-gray-600">Densidade In-Situ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{densityRealTests.length}</div>
                  <div className="text-sm text-gray-600">Densidade Real</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{densityMaxMinTests.length}</div>
                  <div className="text-sm text-gray-600">Densidade Máx/Mín</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnsaiosSalvos;