import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Package, Wrench, Edit, Trash2 } from 'lucide-react';

interface Equipamento {
  id: string | number;
  codigo: string;
  tipo: 'capsula' | 'cilindro';
  descricao?: string;
  peso?: number;
  volume?: number;
  altura?: number;
  diametro?: number;
  material?: string;
  fabricante?: string;
  localizacao?: string;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  ativo: 'bg-green-100 text-green-800 border-green-200',
  inativo: 'bg-gray-100 text-gray-800 border-gray-200'
};

const tipoIcons = {
  capsula: '🧪',
  cilindro: '⚫'
};

export default function EquipamentosFixed() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<Equipamento | null>(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { toast } = useToast();

  // Carregar equipamentos do PostgreSQL
  const carregarEquipamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/equipamentos/temp');
      
      if (response.ok) {
        const equipamentosData = await response.json();
        setEquipamentos(equipamentosData);
        console.log(`✅ ${equipamentosData.length} equipamentos carregados do PostgreSQL`);
        
        if (equipamentosData.length > 0) {
          toast({
            title: "Equipamentos carregados",
            description: `${equipamentosData.length} equipamento(s) encontrado(s)`,
          });
        }
      } else {
        console.error('Erro na resposta da API:', response.status);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os equipamentos do servidor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível conectar com o servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar automaticamente quando a página for carregada
  useEffect(() => {
    carregarEquipamentos();
  }, []);

  // Criar novo equipamento
  const novoEquipamento = () => {
    const equipamentoVazio: Equipamento = {
      id: '',
      codigo: '',
      tipo: 'capsula',
      descricao: '',
      peso: 0,
      volume: 0,
      altura: 0,
      diametro: 0,
      material: '',
      fabricante: '',
      localizacao: '',
      status: 'ativo',
      observacoes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEquipamentoSelecionado(equipamentoVazio);
    setEditando(false);
    setDialogOpen(true);
  };

  // Editar equipamento
  const editarEquipamento = (equipamento: Equipamento) => {
    setEquipamentoSelecionado({ ...equipamento });
    setEditando(true);
    setDialogOpen(true);
  };

  // Salvar equipamento (criar ou editar)
  const salvarEquipamento = async () => {
    if (!equipamentoSelecionado) return;

    try {
      setSalvando(true);
      
      const url = editando 
        ? `/api/equipamentos/temp/${equipamentoSelecionado.id}`
        : '/api/equipamentos/temp';
      
      const method = editando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipamentoSelecionado),
      });

      if (response.ok) {
        await carregarEquipamentos();
        setDialogOpen(false);
        setEquipamentoSelecionado(null);
        
        toast({
          title: editando ? "Equipamento atualizado" : "Equipamento criado",
          description: `${equipamentoSelecionado.codigo} foi ${editando ? 'atualizado' : 'criado'} com sucesso.`,
        });
      } else {
        throw new Error(`Falha ao ${editando ? 'salvar' : 'criar'} equipamento`);
      }
    } catch (error) {
      console.error('Erro ao salvar equipamento:', error);
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível ${editando ? 'salvar as alterações' : 'criar o equipamento'}.`,
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  // Excluir equipamento
  const excluirEquipamento = async (equipamento: Equipamento) => {
    if (!confirm(`Tem certeza que deseja excluir o equipamento ${equipamento.codigo}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/equipamentos/temp/${equipamento.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await carregarEquipamentos();
        
        toast({
          title: "Equipamento excluído",
          description: `${equipamento.codigo} foi excluído com sucesso.`,
        });
      } else {
        throw new Error('Falha ao excluir equipamento');
      }
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o equipamento.",
        variant: "destructive",
      });
    }
  };

  // Filtrar equipamentos
  const equipamentosFiltrados = equipamentos.filter(equipamento => {
    const matchTipo = filtroTipo === 'todos' || equipamento.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || equipamento.status === filtroStatus;
    const matchBusca = !busca || 
      equipamento.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      equipamento.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      equipamento.material?.toLowerCase().includes(busca.toLowerCase());
    
    return matchTipo && matchStatus && matchBusca;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Equipamentos</h1>
          <p className="text-gray-600">Gerenciamento de equipamentos do laboratório</p>
        </div>
        <Button onClick={novoEquipamento}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Equipamento
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold">{equipamentos.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cápsulas</p>
                <p className="text-3xl font-bold">{equipamentos.filter(eq => eq.tipo === 'capsula').length}</p>
              </div>
              <span className="text-2xl">🧪</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cilindros</p>
                <p className="text-3xl font-bold">{equipamentos.filter(eq => eq.tipo === 'cilindro').length}</p>
              </div>
              <span className="text-2xl">⚫</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-3xl font-bold text-green-600">{equipamentos.filter(eq => eq.status === 'ativo').length}</p>
              </div>
              <Wrench className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Buscar por código, descrição ou material..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="capsula">Cápsulas</SelectItem>
                <SelectItem value="cilindro">Cilindros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de equipamentos */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando equipamentos...</p>
          </CardContent>
        </Card>
      ) : equipamentosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum equipamento encontrado</h3>
            <p className="text-gray-600">
              {equipamentos.length === 0 
                ? "Nenhum equipamento foi cadastrado ainda." 
                : "Tente ajustar os filtros para encontrar equipamentos."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {equipamentosFiltrados.map((equipamento) => (
            <Card key={`${equipamento.id}-${equipamento.codigo}`} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-xl">{tipoIcons[equipamento.tipo]}</span>
                    {equipamento.codigo}
                  </CardTitle>
                  <Badge className={statusColors[equipamento.status]}>
                    {equipamento.status}
                  </Badge>
                </div>
                <CardDescription>
                  {equipamento.descricao || `${equipamento.tipo.charAt(0).toUpperCase() + equipamento.tipo.slice(1)}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-2">
                {equipamento.peso && (
                  <div className="text-sm">
                    <span className="font-medium">Peso:</span> {equipamento.peso}g
                  </div>
                )}
                {equipamento.volume && (
                  <div className="text-sm">
                    <span className="font-medium">Volume:</span> {equipamento.volume}cm³
                  </div>
                )}
                {equipamento.material && (
                  <div className="text-sm">
                    <span className="font-medium">Material:</span> {equipamento.material}
                  </div>
                )}
                {equipamento.fabricante && (
                  <div className="text-sm">
                    <span className="font-medium">Fabricante:</span> {equipamento.fabricante}
                  </div>
                )}
                {equipamento.localizacao && (
                  <div className="text-sm">
                    <span className="font-medium">Localização:</span> {equipamento.localizacao}
                  </div>
                )}
                <div className="text-xs text-gray-500 pt-2">
                  Criado em: {new Date(equipamento.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}