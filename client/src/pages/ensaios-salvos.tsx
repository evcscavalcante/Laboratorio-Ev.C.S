import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  registrationNumber?: string;
  registro?: string;
  operator?: string;
  operador?: string;
  responsavelCalculo?: string;
  verificador?: string;
  date?: string;
  data?: string;
  hora?: string;
  local?: string;
  quadrante?: string;
  camada?: string;
  origin?: string;
  origem?: string;
  material?: string;
  createdAt: string;
  updatedAt?: string;
  results?: {
    status?: string;
  };
}

const EnsaiosSalvos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const queryClient = useQueryClient();

  // Buscar ensaios de densidade in-situ
  const { data: densityInSituTests = [] } = useQuery<SavedTest[]>({
    queryKey: ['/api/tests/density-in-situ'],
    enabled: true
  });

  // Buscar ensaios de densidade real
  const { data: densityRealTests = [] } = useQuery<SavedTest[]>({
    queryKey: ['/api/tests/real-density'],
    enabled: true
  });

  // Buscar ensaios de densidade máx/mín
  const { data: densityMaxMinTests = [] } = useQuery<SavedTest[]>({
    queryKey: ['/api/tests/max-min-density'],
    enabled: true
  });

  // Combinar todos os ensaios com tipagem correta
  const allTests: SavedTest[] = [
    ...(Array.isArray(densityInSituTests) ? densityInSituTests.map((test: any) => ({ ...test, testType: 'densidade-in-situ' })) : []),
    ...(Array.isArray(densityRealTests) ? densityRealTests.map((test: any) => ({ ...test, testType: 'densidade-real' })) : []),
    ...(Array.isArray(densityMaxMinTests) ? densityMaxMinTests.map((test: any) => ({ ...test, testType: 'densidade-max-min' })) : [])
  ].sort((a, b) => new Date(b.createdAt || b.data || b.date || '').getTime() - new Date(a.createdAt || a.data || a.date || '').getTime());

  // Filtrar ensaios
  const filteredTests = allTests.filter(test => {
    const registro = test.registrationNumber || test.registro || '';
    const operador = test.operator || test.operador || '';
    const local = test.local || '';
    const material = test.material || '';
    const origem = test.origin || test.origem || '';
    
    const matchesSearch = registro.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         local.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         origem.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    // Navegar para a calculadora correspondente
    let route = '';
    switch (test.testType) {
      case 'densidade-in-situ':
        route = '/densidade-in-situ';
        break;
      case 'densidade-real':
        route = '/densidade-real';
        break;
      case 'densidade-max-min':
        route = '/densidade-max-min';
        break;
      default:
        route = '/';
    }
    window.location.href = route;
  };

  const handleDeleteTest = async (test: SavedTest) => {
    const registro = test.registrationNumber || test.registro || `Ensaio #${test.id}`;
    if (confirm(`Tem certeza que deseja excluir o ensaio ${registro}?`)) {
      try {
        // Construir a URL correta para exclusão baseada no tipo
        let deleteUrl = '';
        switch (test.testType) {
          case 'densidade-in-situ':
            deleteUrl = `/api/tests/density-in-situ/${test.id}`;
            break;
          case 'densidade-real':
            deleteUrl = `/api/tests/real-density/${test.id}`;
            break;
          case 'densidade-max-min':
            deleteUrl = `/api/tests/max-min-density/${test.id}`;
            break;
        }

        if (deleteUrl) {
          const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('firebase-token')}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            // Invalidar cache para atualizar automaticamente a lista
            queryClient.invalidateQueries({ queryKey: ['/api/tests/density-in-situ'] });
            queryClient.invalidateQueries({ queryKey: ['/api/tests/real-density'] });
            queryClient.invalidateQueries({ queryKey: ['/api/tests/max-min-density'] });
            alert('Ensaio excluído com sucesso!');
          } else {
            alert('Erro ao excluir o ensaio. Tente novamente.');
          }
        }
      } catch (error) {
        console.error('Erro ao excluir ensaio:', error);
        alert('Erro ao excluir o ensaio. Tente novamente.');
      }
    }
  };

  const handleDownloadPDF = async (test: SavedTest) => {
    try {
      // Implementar download do PDF específico para cada tipo
      alert(`Download de PDF será implementado para ${test.testType}`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
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
                        <h3 className="font-semibold text-lg">
                          {test.registrationNumber || test.registro || `Ensaio #${test.id}`}
                        </h3>
                        {test.results?.status && (
                          <Badge variant={test.results.status === 'APROVADO' ? 'default' : 'secondary'}>
                            {test.results.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>Operador: {test.operator || test.operador || 'Não informado'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            {test.date || test.data || 'Data não informada'}
                            {test.hora && ` às ${test.hora}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>
                            {test.material && `Material: ${test.material}`}
                            {test.origin || test.origem ? ` - ${test.origin || test.origem}` : ''}
                            {test.local && ` - ${test.local}`}
                            {test.quadrante && ` - ${test.quadrante}`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        {test.responsavelCalculo && (
                          <>
                            <span>Responsável: {test.responsavelCalculo}</span>
                            {test.verificador && <span className="mx-2">•</span>}
                          </>
                        )}
                        {test.verificador && <span>Verificador: {test.verificador}</span>}
                        {test.createdAt && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Criado: {new Date(test.createdAt).toLocaleDateString('pt-BR')}</span>
                          </>
                        )}
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