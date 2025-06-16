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
import { useAuth } from '@/hooks/useAuth';
import { firebaseSync } from '@/lib/firebase-sync';

interface Equipamento {
  id: string | number;
  codigo: string;
  tipo: 'capsula' | 'cilindro';
  tipoEspecifico?: string; // Para cilindros: 'biselado', 'proctor', 'cbr', 'vazios_minimos'
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
  proximaConferencia?: string;
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

// Tipos específicos conforme banco de dados
const tiposCilindro = [
  'biselado',
  'proctor', 
  'cbr',
  'vazios_minimos'
];

const tiposCapsula = [
  'pequena',
  'media',
  'grande'
];

const descricoesTipos = {
  // Cilindros
  biselado: 'Cilindro Biselado - NBR 9813',
  proctor: 'Cilindro Proctor - NBR 7182',
  cbr: 'Cilindro CBR - NBR 9895',
  vazios_minimos: 'Cilindro Vazios Mínimos - NBR 12004',
  // Cápsulas
  pequena: 'Cápsula Pequena (15-25g)',
  media: 'Cápsula Média (25-35g)',
  grande: 'Cápsula Grande (35-50g)'
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
  const { user, token } = useAuth();

  // Carregar equipamentos do PostgreSQL
  const carregarEquipamentos = async () => {
    if (!token) {
      console.log('🔐 Token não disponível para carregar equipamentos');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/equipamentos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const equipamentosData = await response.json();
        
        // Verificar se os dados estão no formato correto
        if (equipamentosData && typeof equipamentosData === 'object') {
          const { capsulas = [], cilindros = [] } = equipamentosData;
          
          // Combinar cápsulas e cilindros em um array único
          const equipamentosCombinados: Equipamento[] = [
            ...capsulas.map((cap: any) => ({
              id: cap.id,
              codigo: cap.codigo,
              tipo: 'capsula' as const,
              tipoEspecifico: cap.tipo || 'pequena',
              descricao: cap.descricao || (descricoesTipos as any)[cap.tipo] || 'Cápsula para ensaios',
              peso: cap.peso,
              material: cap.material,
              status: 'ativo' as const,
              createdAt: cap.createdAt || new Date().toISOString(),
              updatedAt: cap.updatedAt || new Date().toISOString()
            })),
            ...cilindros.map((cil: any) => ({
              id: cil.id,
              codigo: cil.codigo,
              tipo: 'cilindro' as const,
              tipoEspecifico: cil.tipo || 'biselado',
              descricao: cil.descricao || (descricoesTipos as any)[cil.tipo] || 'Cilindro para ensaios',
              peso: cil.peso,
              volume: cil.volume,
              altura: cil.altura,
              diametro: cil.diametro,
              status: 'ativo' as const,
              createdAt: cil.createdAt || new Date().toISOString(),
              updatedAt: cil.updatedAt || new Date().toISOString()
            }))
          ];
          
          setEquipamentos(equipamentosCombinados);
          console.log(`✅ ${equipamentosCombinados.length} equipamentos carregados (${capsulas.length} cápsulas, ${cilindros.length} cilindros)`);
          
          if (equipamentosCombinados.length > 0) {
            toast({
              title: "Equipamentos carregados",
              description: `${equipamentosCombinados.length} equipamento(s) encontrado(s)`,
            });
          }
        } else {
          console.error('Formato de dados inválido:', equipamentosData);
          setEquipamentos([]);
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
      tipoEspecifico: '',
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
      proximaConferencia: '',
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
    if (!equipamentoSelecionado || !token) return;

    try {
      setSalvando(true);
      
      const url = editando 
        ? `/api/equipamentos/${equipamentoSelecionado.id}`
        : '/api/equipamentos';
      
      const method = editando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipamentoSelecionado),
      });

      if (response.ok) {
        const savedData = await response.json();
        console.log('✅ Equipamento salvo no PostgreSQL:', savedData);
        
        // Sincronizar com Firebase Firestore usando dados salvos
        const equipamentoComId = { ...equipamentoSelecionado, id: savedData.id || equipamentoSelecionado.id };
        console.log('🔥 Iniciando sincronização Firebase para equipamento:', equipamentoComId);
        
        const firebaseSuccess = await firebaseSync.syncEquipamento(equipamentoComId);
        console.log('🔥 Resultado sincronização Firebase:', firebaseSuccess);
        
        await carregarEquipamentos();
        setDialogOpen(false);
        setEquipamentoSelecionado(null);
        
        toast({
          title: editando ? "Equipamento atualizado" : "Equipamento criado",
          description: firebaseSuccess 
            ? `${equipamentoSelecionado.codigo} salvo no PostgreSQL e sincronizado com Firebase.`
            : `${equipamentoSelecionado.codigo} salvo no PostgreSQL. Sincronização Firebase falhou.`,
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
    if (!token) {
      toast({
        title: "Erro de autenticação",
        description: "Token não disponível para exclusão",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o equipamento ${equipamento.codigo}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/equipamentos/${equipamento.id}?tipo=${equipamento.tipo}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

  // Filtrar equipamentos com validação de segurança
  const equipamentosFiltrados = Array.isArray(equipamentos) ? equipamentos.filter(equipamento => {
    if (!equipamento || typeof equipamento !== 'object') return false;
    
    const matchTipo = filtroTipo === 'todos' || equipamento.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || equipamento.status === filtroStatus;
    const matchBusca = !busca || 
      equipamento.codigo?.toLowerCase().includes(busca.toLowerCase()) ||
      equipamento.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      equipamento.material?.toLowerCase().includes(busca.toLowerCase());
    
    return matchTipo && matchStatus && matchBusca;
  }) : [];

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
          {equipamentosFiltrados.map((equipamento, index) => (
            <Card key={`${equipamento.tipo}-${equipamento.id}-${equipamento.codigo}-${index}`} className="hover:shadow-md transition-shadow">
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
                
                {/* Botões de ação */}
                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editarEquipamento(equipamento)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => excluirEquipamento(equipamento)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Edição/Criação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar Equipamento' : 'Novo Equipamento'}
            </DialogTitle>
            <DialogDescription>
              {editando ? 'Atualize as informações do equipamento' : 'Cadastre um novo equipamento no laboratório'}
            </DialogDescription>
          </DialogHeader>

          {equipamentoSelecionado && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código*</Label>
                  <Input
                    id="codigo"
                    value={equipamentoSelecionado.codigo}
                    onChange={(e) => setEquipamentoSelecionado({
                      ...equipamentoSelecionado,
                      codigo: e.target.value
                    })}
                    placeholder="Ex: CAP-001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo*</Label>
                  <Select
                    value={equipamentoSelecionado.tipo}
                    onValueChange={(value: 'capsula' | 'cilindro') => setEquipamentoSelecionado({
                      ...equipamentoSelecionado,
                      tipo: value,
                      tipoEspecifico: '' // Reset tipo específico
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="capsula">Cápsula</SelectItem>
                      <SelectItem value="cilindro">Cilindro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {equipamentoSelecionado.tipo && (
                <div className="space-y-2">
                  <Label htmlFor="tipoEspecifico">
                    {equipamentoSelecionado.tipo === 'capsula' ? 'Tamanho' : 'Tipo Específico'}
                  </Label>
                  <Select
                    value={equipamentoSelecionado.tipoEspecifico || ''}
                    onValueChange={(value) => setEquipamentoSelecionado({
                      ...equipamentoSelecionado,
                      tipoEspecifico: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo específico" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipamentoSelecionado.tipo === 'capsula' 
                        ? tiposCapsula.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>
                              {descricoesTipos[tipo as keyof typeof descricoesTipos]}
                            </SelectItem>
                          ))
                        : tiposCilindro.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>
                              {descricoesTipos[tipo as keyof typeof descricoesTipos]}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={equipamentoSelecionado.descricao || ''}
                  onChange={(e) => setEquipamentoSelecionado({
                    ...equipamentoSelecionado,
                    descricao: e.target.value
                  })}
                  placeholder="Descrição do equipamento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (g)*</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.001"
                    value={equipamentoSelecionado.peso || ''}
                    onChange={(e) => setEquipamentoSelecionado({
                      ...equipamentoSelecionado,
                      peso: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0.000"
                  />
                </div>

                {equipamentoSelecionado.tipo === 'cilindro' && (
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume (cm³)*</Label>
                    <Input
                      id="volume"
                      type="number"
                      step="0.001"
                      value={equipamentoSelecionado.volume || ''}
                      onChange={(e) => setEquipamentoSelecionado({
                        ...equipamentoSelecionado,
                        volume: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0.000"
                    />
                  </div>
                )}
              </div>

              {equipamentoSelecionado.tipo === 'cilindro' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="altura">Altura (mm)</Label>
                    <Input
                      id="altura"
                      type="number"
                      step="0.01"
                      value={equipamentoSelecionado.altura || ''}
                      onChange={(e) => setEquipamentoSelecionado({
                        ...equipamentoSelecionado,
                        altura: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diametro">Diâmetro (mm)</Label>
                    <Input
                      id="diametro"
                      type="number"
                      step="0.01"
                      value={equipamentoSelecionado.diametro || ''}
                      onChange={(e) => setEquipamentoSelecionado({
                        ...equipamentoSelecionado,
                        diametro: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={equipamentoSelecionado.material || ''}
                    onChange={(e) => setEquipamentoSelecionado({
                      ...equipamentoSelecionado,
                      material: e.target.value
                    })}
                    placeholder="Ex: Alumínio, Aço Inox"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fabricante">Fabricante</Label>
                  <Input
                    id="fabricante"
                    value={equipamentoSelecionado.fabricante || ''}
                    onChange={(e) => setEquipamentoSelecionado({
                      ...equipamentoSelecionado,
                      fabricante: e.target.value
                    })}
                    placeholder="Fabricante"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={equipamentoSelecionado.localizacao || ''}
                    onChange={(e) => setEquipamentoSelecionado({
                      ...equipamentoSelecionado,
                      localizacao: e.target.value
                    })}
                    placeholder="Local de armazenamento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={equipamentoSelecionado.status}
                    onValueChange={(value: 'ativo' | 'inativo') => setEquipamentoSelecionado({
                      ...equipamentoSelecionado,
                      status: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={equipamentoSelecionado.observacoes || ''}
                  onChange={(e) => setEquipamentoSelecionado({
                    ...equipamentoSelecionado,
                    observacoes: e.target.value
                  })}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarEquipamento} disabled={salvando}>
              {salvando ? 'Salvando...' : (editando ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}