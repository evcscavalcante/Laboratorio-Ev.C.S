import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Search, Wifi, WifiOff, Cloud, Database, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseSyncManager } from '@/lib/firebase-sync';

interface Equipamento {
  id: string;
  codigo: string;
  tipo: 'capsula' | 'cilindro';
  subtipo?: string;
  peso?: number;
  volume?: number;
  altura?: number;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const statusColors = {
  ativo: 'bg-green-100 text-green-800 border-green-200',
  inativo: 'bg-gray-100 text-gray-800 border-gray-200'
};

const tipoIcons = {
  capsula: '🧪',
  cilindro: '⚫'
};

export default function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [equipamentoEdit, setEquipamentoEdit] = useState<Equipamento | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [emailLogin, setEmailLogin] = useState('evcsousa@yahoo.com.br');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    firebase: false,
    localStorage: true,
    postgresql: false
  });
  const { toast } = useToast();

  // Carregar equipamentos do PostgreSQL via API
  const carregarEquipamentos = async () => {
    try {
      const response = await fetch('/api/equipamentos/temp');
      
      if (response.ok) {
        const equipamentosData = await response.json();
        setEquipamentos(equipamentosData);
        setSyncStatus(prev => ({ ...prev, postgresql: true }));
        console.log(`✅ ${equipamentosData.length} equipamentos carregados do PostgreSQL`);
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
    }
  };

  // Autenticar no Firebase
  const autenticarFirebase = async () => {
    if (!senhaLogin.trim()) {
      toast({
        title: "Erro",
        description: "Digite a senha para autenticar",
        variant: "destructive",
      });
      return;
    }

    const sucesso = await firebaseSyncManager.authenticateWithEmail(emailLogin, senhaLogin);
    if (sucesso) {
      setAutenticado(true);
      setShowLogin(false);
      setSenhaLogin('');
      toast({
        title: "Sucesso",
        description: "Autenticado com sucesso no Firebase",
      });
      
      // Sincronizar dados locais para Firebase
      await firebaseSyncManager.syncToFirebase();
      await carregarEquipamentos();
    } else {
      toast({
        title: "Erro",
        description: "Falha na autenticação. Verifique as credenciais.",
        variant: "destructive",
      });
    }
  };

  // Salvar equipamento
  const salvarEquipamento = async (dadosForm: any) => {
    try {
      const agora = new Date().toISOString();
      const equipamento: Equipamento = {
        id: equipamentoEdit?.id || `eq_${Date.now()}`,
        codigo: dadosForm.codigo,
        tipo: dadosForm.tipo,
        subtipo: dadosForm.subtipo || undefined,
        peso: dadosForm.peso ? parseFloat(dadosForm.peso) : undefined,
        volume: dadosForm.volume ? parseFloat(dadosForm.volume) : undefined,
        altura: dadosForm.altura ? parseFloat(dadosForm.altura) : undefined,
        status: dadosForm.status,
        observacoes: dadosForm.observacoes || undefined,
        createdAt: equipamentoEdit?.createdAt || agora,
        updatedAt: agora,
        userId: firebaseSyncManager.getCurrentUser()?.uid || 'local'
      };

      // Salvar no localStorage
      const chaveUnica = `equipamento_${equipamento.tipo}_${equipamento.codigo}_${equipamento.subtipo || 'padrao'}`;
      localStorage.setItem(chaveUnica, JSON.stringify(equipamento));

      // Salvar no Firebase se autenticado
      let firebaseSucesso = false;
      if (firebaseSyncManager.isAuthenticated()) {
        firebaseSucesso = await firebaseSyncManager.saveEquipamento(equipamento);
      }

      // Atualizar lista local
      if (equipamentoEdit) {
        setEquipamentos(prev => prev.map(eq => eq.id === equipamento.id ? equipamento : eq));
      } else {
        setEquipamentos(prev => [...prev, equipamento]);
      }

      setSyncStatus(prev => ({
        ...prev,
        firebase: firebaseSucesso,
        localStorage: true
      }));

      console.log('✅ Salvo em todas as fontes');
      
      setIsDialogOpen(false);
      setEquipamentoEdit(null);
      
      toast({
        title: "Sucesso",
        description: `Equipamento ${equipamentoEdit ? 'atualizado' : 'cadastrado'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao salvar equipamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o equipamento",
        variant: "destructive",
      });
    }
  };

  // Excluir equipamento
  const excluirEquipamento = async (equipamento: Equipamento) => {
    try {
      // Remover do localStorage
      const chaveUnica = `equipamento_${equipamento.tipo}_${equipamento.codigo}_${equipamento.subtipo || 'padrao'}`;
      localStorage.removeItem(chaveUnica);

      // Remover do Firebase se autenticado
      if (firebaseSyncManager.isAuthenticated()) {
        await firebaseSyncManager.deleteEquipamento(equipamento.id);
      }

      // Remover da lista local
      setEquipamentos(prev => prev.filter(eq => eq.id !== equipamento.id));

      toast({
        title: "Sucesso",
        description: "Equipamento excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o equipamento",
        variant: "destructive",
      });
    }
  };

  // Filtrar equipamentos
  const equipamentosFiltrados = equipamentos.filter(equipamento => {
    const matchBusca = busca === '' || 
      equipamento.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      (equipamento.subtipo && equipamento.subtipo.toLowerCase().includes(busca.toLowerCase()));
    
    const matchTipo = filtroTipo === 'todos' || equipamento.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || equipamento.status === filtroStatus;
    
    return matchBusca && matchTipo && matchStatus;
  });

  useEffect(() => {
    // Verificar autenticação inicial
    const checkAuth = () => {
      const isAuth = firebaseSyncManager.isAuthenticated();
      setAutenticado(isAuth);
      setSyncStatus(prev => ({ ...prev, firebase: isAuth }));
    };
    
    checkAuth();
    
    // Configurar listener de mudanças em tempo real
    let unsubscribe: (() => void) | null = null;
    
    if (firebaseSyncManager.isAuthenticated()) {
      unsubscribe = firebaseSyncManager.onEquipamentosChange((equipamentosFirebase) => {
        setEquipamentos(equipamentosFirebase);
        setSyncStatus(prev => ({ ...prev, firebase: true }));
      });
    }
    
    carregarEquipamentos();

    // Listener para mudanças de autenticação Firebase
    const handleAuthChange = (event: CustomEvent) => {
      const { authenticated } = event.detail;
      setAutenticado(authenticated);
      setSyncStatus(prev => ({ ...prev, firebase: authenticated }));
      
      if (authenticated) {
        carregarEquipamentos();
      }
    };

    window.addEventListener('firebase-auth-changed', handleAuthChange as EventListener);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('firebase-auth-changed', handleAuthChange as EventListener);
    };
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie cápsulas e cilindros do laboratório
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Status de sincronização */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${syncStatus.localStorage ? 'bg-green-500' : 'bg-red-500'}`} title="localStorage" />
            <Database className="w-4 h-4 text-gray-500" />
            
            <div className={`w-2 h-2 rounded-full ${syncStatus.firebase ? 'bg-green-500' : 'bg-yellow-500'}`} title="Firebase" />
            <Cloud className="w-4 h-4 text-gray-500" />
          </div>

          {/* Botão de login/status */}
          {!autenticado ? (
            <Dialog open={showLogin} onOpenChange={setShowLogin}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Autenticação Firebase</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={emailLogin}
                      onChange={(e) => setEmailLogin(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={senhaLogin}
                      onChange={(e) => setSenhaLogin(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && autenticarFirebase()}
                    />
                  </div>
                  <Button onClick={autenticarFirebase} className="w-full">
                    Autenticar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <Wifi className="w-3 h-3 mr-1" />
              Sincronizado
            </Badge>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEquipamentoEdit(null); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <FormularioEquipamento
                equipamento={equipamentoEdit}
                onSalvar={salvarEquipamento}
                onCancelar={() => { setIsDialogOpen(false); setEquipamentoEdit(null); }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por código..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {equipamentosFiltrados.map((equipamento, index) => (
          <Card key={`${equipamento.id}-${index}`} className="hover:shadow-md transition-shadow">
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
                {equipamento.tipo.charAt(0).toUpperCase() + equipamento.tipo.slice(1)}
                {equipamento.subtipo && ` - ${equipamento.subtipo}`}
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
              {equipamento.altura && (
                <div className="text-sm">
                  <span className="font-medium">Altura:</span> {equipamento.altura}cm
                </div>
              )}
              {equipamento.observacoes && (
                <div className="text-sm text-muted-foreground">
                  {equipamento.observacoes}
                </div>
              )}
              
              <Separator className="my-3" />
              
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEquipamentoEdit(equipamento); setIsDialogOpen(true); }}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => excluirEquipamento(equipamento)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {equipamentosFiltrados.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground">
              {equipamentos.length === 0 
                ? "Nenhum equipamento cadastrado ainda"
                : "Nenhum equipamento encontrado com os filtros aplicados"
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente do formulário
function FormularioEquipamento({ 
  equipamento, 
  onSalvar, 
  onCancelar 
}: {
  equipamento: Equipamento | null;
  onSalvar: (dados: any) => void;
  onCancelar: () => void;
}) {
  const [formData, setFormData] = useState({
    codigo: equipamento?.codigo || '',
    tipo: equipamento?.tipo || 'capsula',
    subtipo: equipamento?.subtipo || '',
    peso: equipamento?.peso?.toString() || '',
    volume: equipamento?.volume?.toString() || '',
    altura: equipamento?.altura?.toString() || '',
    status: equipamento?.status || 'ativo',
    observacoes: equipamento?.observacoes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(formData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {equipamento ? 'Editar Equipamento' : 'Novo Equipamento'}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) => setFormData({...formData, codigo: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value as 'capsula' | 'cilindro'})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="capsula">Cápsula</SelectItem>
                <SelectItem value="cilindro">Cilindro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subtipo">Subtipo</Label>
            <Select value={formData.subtipo} onValueChange={(value) => setFormData({...formData, subtipo: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o subtipo" />
              </SelectTrigger>
              <SelectContent>
                {formData.tipo === 'capsula' && (
                  <>
                    <SelectItem value="pequena">Pequena</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                    <SelectItem value="extra-grande">Extra Grande</SelectItem>
                  </>
                )}
                {formData.tipo === 'cilindro' && (
                  <>
                    <SelectItem value="proctor">Proctor</SelectItem>
                    <SelectItem value="cbr">CBR</SelectItem>
                    <SelectItem value="biselado">Biselado</SelectItem>
                    <SelectItem value="padrao">Padrão</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as 'ativo' | 'inativo'})}>
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="peso">Peso (g)</Label>
            <Input
              id="peso"
              type="number"
              step="0.01"
              value={formData.peso}
              onChange={(e) => setFormData({...formData, peso: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="volume">Volume (cm³)</Label>
            <Input
              id="volume"
              type="number"
              step="0.01"
              value={formData.volume}
              onChange={(e) => setFormData({...formData, volume: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="altura">Altura (cm)</Label>
            <Input
              id="altura"
              type="number"
              step="0.01"
              value={formData.altura}
              onChange={(e) => setFormData({...formData, altura: e.target.value})}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Input
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            placeholder="Observações adicionais..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit">
            {equipamento ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </>
  );
}