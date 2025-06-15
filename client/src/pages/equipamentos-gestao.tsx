import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit,
  Trash2,
  BarChart3,
  FileText,
  Download,
  Settings,
  Scale,
  TestTube
} from 'lucide-react';
import { format, addMonths, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { localDataManager } from '@/lib/local-storage';

// Schema definitions for equipment validation
const capsulaSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().optional(),
  peso: z.number().min(0, 'Peso deve ser positivo'),
  material: z.string().optional(),
  fabricante: z.string().optional(),
  dataAquisicao: z.date().optional(),
  localizacao: z.string().optional(),
  observacoes: z.string().optional(),
  proximaConferencia: z.date()
});

const cilindroSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  tipo: z.enum(['biselado', 'proctor', 'cbr', 'vazios_minimos']),
  descricao: z.string().optional(),
  peso: z.number().min(0, 'Peso deve ser positivo'),
  volume: z.number().min(0, 'Volume deve ser positivo'),
  altura: z.number().min(0, 'Altura deve ser positiva').optional(),
  diametro: z.number().min(0, 'Diâmetro deve ser positivo').optional(),
  material: z.string().optional(),
  fabricante: z.string().optional(),
  dataAquisicao: z.date().optional(),
  localizacao: z.string().optional(),
  observacoes: z.string().optional(),
  proximaConferencia: z.date()
});

const conferenciaSchema = z.object({
  equipamentoTipo: z.enum(['capsula', 'cilindro']),
  equipamentoId: z.number(),
  dataConferencia: z.date(),
  responsavel: z.string().min(1, 'Responsável é obrigatório'),
  status: z.enum(['APROVADO', 'REPROVADO', 'PENDENTE']),
  observacoes: z.string().optional(),
  pesoAferido: z.number().optional(),
  volumeAferido: z.number().optional(),
  alturaAferida: z.number().optional(),
  diametroAferido: z.number().optional(),
  aprovado: z.boolean(),
  proximaConferencia: z.date()
});

type CapsulaFormData = z.infer<typeof capsulaSchema>;
type CilindroFormData = z.infer<typeof cilindroSchema>;
type ConferenciaFormData = z.infer<typeof conferenciaSchema>;

interface Capsula {
  id: number;
  codigo: string;
  descricao?: string;
  peso: number;
  material?: string;
  fabricante?: string;
  dataAquisicao?: Date;
  status: string;
  localizacao?: string;
  observacoes?: string;
  proximaConferencia?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Cilindro {
  id: number;
  codigo: string;
  tipo: string;
  descricao?: string;
  peso: number;
  volume: number;
  altura?: number;
  diametro?: number;
  material?: string;
  fabricante?: string;
  dataAquisicao?: Date;
  status: string;
  localizacao?: string;
  observacoes?: string;
  proximaConferencia?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ConferenciaEquipamento {
  id: number;
  equipamentoTipo: string;
  equipamentoId: number;
  dataConferencia: Date;
  responsavel: string;
  status: string;
  observacoes?: string;
  pesoAferido?: number;
  volumeAferido?: number;
  alturaAferida?: number;
  diametroAferido?: number;
  aprovado: boolean;
  proximaConferencia?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function EquipamentosGestao() {
  const [capsulas, setCapsulas] = useState<Capsula[]>([]);
  const [cilindros, setCilindros] = useState<Cilindro[]>([]);
  const [conferencias, setConferencias] = useState<ConferenciaEquipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('capsulas');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConferenciaDialogOpen, setIsConferenciaDialogOpen] = useState(false);
  const [selectedEquipamento, setSelectedEquipamento] = useState<any>(null);
  const { toast } = useToast();

  const capsulaForm = useForm<CapsulaFormData>({
    resolver: zodResolver(capsulaSchema),
    defaultValues: {
      codigo: '',
      peso: 0,
      proximaConferencia: addMonths(new Date(), 3)
    }
  });

  const cilindroForm = useForm<CilindroFormData>({
    resolver: zodResolver(cilindroSchema),
    defaultValues: {
      codigo: '',
      tipo: 'biselado',
      peso: 0,
      volume: 0,
      proximaConferencia: addMonths(new Date(), 3)
    }
  });

  const conferenciaForm = useForm<ConferenciaFormData>({
    resolver: zodResolver(conferenciaSchema),
    defaultValues: {
      dataConferencia: new Date(),
      aprovado: true,
      proximaConferencia: addMonths(new Date(), 3)
    }
  });

  useEffect(() => {
    loadEquipamentos();
  }, []);

  const loadEquipamentos = async () => {
    setLoading(true);
    try {
      // Simulating data loading since we need to implement local storage methods
      const mockCapsulas = localDataManager.getCapsulas ? await localDataManager.getCapsulas() : [];
      const mockCilindros = localDataManager.getCilindros ? await localDataManager.getCilindros() : [];
      const mockConferencias = localDataManager.getConferenciasEquipamentos ? await localDataManager.getConferenciasEquipamentos() : [];

      setCapsulas(mockCapsulas);
      setCilindros(mockCilindros);
      setConferencias(mockConferencias);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      toast({
        title: "Erro ao carregar equipamentos",
        description: "Não foi possível carregar a lista de equipamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitCapsula = async (data: CapsulaFormData) => {
    try {
      const newCapsula: Capsula = {
        id: Date.now(),
        ...data,
        status: 'ATIVO',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCapsulas(prev => [...prev, newCapsula]);
      
      // Save to localStorage
      if (localDataManager.createCapsula) {
        await localDataManager.createCapsula(newCapsula);
      }
      
      capsulaForm.reset();
      setIsAddDialogOpen(false);
      toast({
        title: "Cápsula cadastrada",
        description: "Cápsula foi cadastrada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao cadastrar cápsula",
        description: "Não foi possível cadastrar a cápsula.",
        variant: "destructive",
      });
    }
  };

  const onSubmitCilindro = async (data: CilindroFormData) => {
    try {
      const newCilindro: Cilindro = {
        id: Date.now(),
        ...data,
        status: 'ATIVO',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCilindros(prev => [...prev, newCilindro]);
      
      // Save to localStorage
      if (localDataManager.createCilindro) {
        await localDataManager.createCilindro(newCilindro);
      }
      
      cilindroForm.reset();
      setIsAddDialogOpen(false);
      toast({
        title: "Cilindro cadastrado",
        description: "Cilindro foi cadastrado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao cadastrar cilindro",
        description: "Não foi possível cadastrar o cilindro.",
        variant: "destructive",
      });
    }
  };

  const onSubmitConferencia = async (data: ConferenciaFormData) => {
    try {
      const newConferencia: ConferenciaEquipamento = {
        id: Date.now(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setConferencias(prev => [...prev, newConferencia]);
      
      // Update equipment next inspection date
      if (data.equipamentoTipo === 'capsula') {
        setCapsulas(prev => prev.map(c => 
          c.id === data.equipamentoId 
            ? { ...c, proximaConferencia: data.proximaConferencia }
            : c
        ));
      } else {
        setCilindros(prev => prev.map(c => 
          c.id === data.equipamentoId 
            ? { ...c, proximaConferencia: data.proximaConferencia }
            : c
        ));
      }
      
      // Save to localStorage
      if (localDataManager.createConferenciaEquipamento) {
        await localDataManager.createConferenciaEquipamento(newConferencia);
      }
      
      conferenciaForm.reset();
      setIsConferenciaDialogOpen(false);
      setSelectedEquipamento(null);
      toast({
        title: "Conferência registrada",
        description: "Conferência foi registrada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao registrar conferência",
        description: "Não foi possível registrar a conferência.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'INATIVO':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      case 'MANUTENCAO':
        return <Badge className="bg-yellow-100 text-yellow-800">Manutenção</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConferenciaStatus = (proximaConferencia?: Date | string) => {
    if (!proximaConferencia) return 'pendente';
    
    // Garantir que temos um objeto Date válido
    const dataConferencia = proximaConferencia instanceof Date 
      ? proximaConferencia 
      : new Date(proximaConferencia);
    
    // Verificar se a data é válida
    if (isNaN(dataConferencia.getTime())) return 'pendente';
    
    const hoje = new Date();
    const diasRestantes = Math.ceil((dataConferencia.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) return 'vencido';
    if (diasRestantes <= 30) return 'proximo';
    return 'ok';
  };

  const getConferenciaIcon = (status: string) => {
    switch (status) {
      case 'vencido':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'proximo':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const openConferenciaDialog = (equipamento: any, tipo: 'capsula' | 'cilindro') => {
    setSelectedEquipamento({ ...equipamento, tipo });
    conferenciaForm.setValue('equipamentoTipo', tipo);
    conferenciaForm.setValue('equipamentoId', equipamento.id);
    setIsConferenciaDialogOpen(true);
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      biselado: 'Cilindro Biselado',
      proctor: 'Cilindro de Proctor',
      cbr: 'Cilindro de CBR',
      vazios_minimos: 'Cilindro para Vazios Mínimos'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const filteredCapsulas = capsulas.filter(capsula => {
    const matchesSearch = capsula.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capsula.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || capsula.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCilindros = cilindros.filter(cilindro => {
    const matchesSearch = cilindro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cilindro.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cilindro.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Package className="w-8 h-8" />
          Gestão de Equipamentos
        </h1>
        <p className="text-gray-600 mt-2">
          Gerenciamento de cápsulas e cilindros com controle de conferências trimestrais
        </p>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por código ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
                <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Equipamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="capsula" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="capsula">Cápsula</TabsTrigger>
                    <TabsTrigger value="cilindro">Cilindro</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="capsula">
                    <Form {...capsulaForm}>
                      <form onSubmit={capsulaForm.handleSubmit(onSubmitCapsula)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={capsulaForm.control}
                            name="codigo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Código *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={capsulaForm.control}
                            name="peso"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Peso (g) *</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.001" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={capsulaForm.control}
                          name="descricao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={capsulaForm.control}
                            name="material"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Material</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={capsulaForm.control}
                            name="fabricante"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fabricante</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={capsulaForm.control}
                          name="localizacao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Localização</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={capsulaForm.control}
                          name="observacoes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">Cadastrar Cápsula</Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="cilindro">
                    <Form {...cilindroForm}>
                      <form onSubmit={cilindroForm.handleSubmit(onSubmitCilindro)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={cilindroForm.control}
                            name="codigo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Código *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={cilindroForm.control}
                            name="tipo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="biselado">Cilindro Biselado</SelectItem>
                                    <SelectItem value="proctor">Cilindro de Proctor</SelectItem>
                                    <SelectItem value="cbr">Cilindro de CBR</SelectItem>
                                    <SelectItem value="vazios_minimos">Cilindro para Vazios Mínimos</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={cilindroForm.control}
                            name="peso"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Peso (g) *</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.001" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={cilindroForm.control}
                            name="volume"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Volume (cm³) *</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.001" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={cilindroForm.control}
                            name="altura"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Altura (cm)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.001" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={cilindroForm.control}
                            name="diametro"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Diâmetro (cm)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.001" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={cilindroForm.control}
                          name="descricao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={cilindroForm.control}
                            name="material"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Material</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={cilindroForm.control}
                            name="fabricante"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fabricante</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={cilindroForm.control}
                          name="localizacao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Localização</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={cilindroForm.control}
                          name="observacoes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">Cadastrar Cilindro</Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="capsulas" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Cápsulas ({filteredCapsulas.length})
          </TabsTrigger>
          <TabsTrigger value="cilindros" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Cilindros ({filteredCilindros.length})
          </TabsTrigger>
          <TabsTrigger value="conferencias" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Conferências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capsulas">
          {filteredCapsulas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCapsulas.map((capsula) => {
                const conferenciaStatus = getConferenciaStatus(capsula.proximaConferencia);
                return (
                  <Card key={capsula.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{capsula.codigo}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getConferenciaIcon(conferenciaStatus)}
                          {getStatusBadge(capsula.status)}
                        </div>
                      </div>
                      {capsula.descricao && (
                        <p className="text-sm text-gray-600">{capsula.descricao}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Peso:</span>
                          <p>{capsula.peso}g</p>
                        </div>
                        {capsula.material && (
                          <div>
                            <span className="font-medium">Material:</span>
                            <p>{capsula.material}</p>
                          </div>
                        )}
                      </div>
                      
                      {capsula.proximaConferencia && (
                        <div className="text-sm">
                          <span className="font-medium">Próxima Conferência:</span>
                          <p className={cn(
                            conferenciaStatus === 'vencido' && 'text-red-600',
                            conferenciaStatus === 'proximo' && 'text-yellow-600',
                            conferenciaStatus === 'ok' && 'text-green-600'
                          )}>
                            {format(capsula.proximaConferencia, 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openConferenciaDialog(capsula, 'capsula')}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Conferir
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma cápsula encontrada</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar primeira cápsula
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cilindros">
          {filteredCilindros.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCilindros.map((cilindro) => {
                const conferenciaStatus = getConferenciaStatus(cilindro.proximaConferencia);
                return (
                  <Card key={cilindro.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{cilindro.codigo}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getConferenciaIcon(conferenciaStatus)}
                          {getStatusBadge(cilindro.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getTipoLabel(cilindro.tipo)}</Badge>
                      </div>
                      {cilindro.descricao && (
                        <p className="text-sm text-gray-600">{cilindro.descricao}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Peso:</span>
                          <p>{cilindro.peso}g</p>
                        </div>
                        <div>
                          <span className="font-medium">Volume:</span>
                          <p>{cilindro.volume}cm³</p>
                        </div>
                        {cilindro.altura && (
                          <div>
                            <span className="font-medium">Altura:</span>
                            <p>{cilindro.altura}cm</p>
                          </div>
                        )}
                        {cilindro.diametro && (
                          <div>
                            <span className="font-medium">Diâmetro:</span>
                            <p>{cilindro.diametro}cm</p>
                          </div>
                        )}
                      </div>
                      
                      {cilindro.proximaConferencia && (
                        <div className="text-sm">
                          <span className="font-medium">Próxima Conferência:</span>
                          <p className={cn(
                            conferenciaStatus === 'vencido' && 'text-red-600',
                            conferenciaStatus === 'proximo' && 'text-yellow-600',
                            conferenciaStatus === 'ok' && 'text-green-600'
                          )}>
                            {format(cilindro.proximaConferencia, 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openConferenciaDialog(cilindro, 'cilindro')}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Conferir
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum cilindro encontrado</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar primeiro cilindro
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="conferencias">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Conferências Trimestrais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conferencias.length > 0 ? (
                  conferencias
                    .sort((a, b) => new Date(b.dataConferencia).getTime() - new Date(a.dataConferencia).getTime())
                    .map((conferencia) => (
                      <div key={conferencia.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={conferencia.aprovado ? "default" : "destructive"}>
                              {conferencia.status}
                            </Badge>
                            <span className="font-medium">
                              {conferencia.equipamentoTipo === 'capsula' ? 'Cápsula' : 'Cilindro'} #{conferencia.equipamentoId}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {format(new Date(conferencia.dataConferencia), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Responsável:</span>
                            <p>{conferencia.responsavel}</p>
                          </div>
                          {conferencia.pesoAferido && (
                            <div>
                              <span className="font-medium">Peso Aferido:</span>
                              <p>{conferencia.pesoAferido}g</p>
                            </div>
                          )}
                          {conferencia.volumeAferido && (
                            <div>
                              <span className="font-medium">Volume Aferido:</span>
                              <p>{conferencia.volumeAferido}cm³</p>
                            </div>
                          )}
                          {conferencia.proximaConferencia && (
                            <div>
                              <span className="font-medium">Próxima Conferência:</span>
                              <p>{format(new Date(conferencia.proximaConferencia), 'dd/MM/yyyy', { locale: ptBR })}</p>
                            </div>
                          )}
                        </div>
                        {conferencia.observacoes && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Observações:</span>
                            <p className="text-gray-600">{conferencia.observacoes}</p>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma conferência registrada</p>
                    <p className="text-sm text-gray-400 mt-1">
                      As conferências aparecerão aqui quando realizadas
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Conferência */}
      <Dialog open={isConferenciaDialogOpen} onOpenChange={setIsConferenciaDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Registrar Conferência Trimestral - {selectedEquipamento?.codigo}
            </DialogTitle>
          </DialogHeader>
          <Form {...conferenciaForm}>
            <form onSubmit={conferenciaForm.handleSubmit(onSubmitConferencia)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={conferenciaForm.control}
                  name="dataConferencia"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data da Conferência *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={conferenciaForm.control}
                  name="responsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do responsável" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={conferenciaForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status da Conferência *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="APROVADO">Aprovado</SelectItem>
                        <SelectItem value="REPROVADO">Reprovado</SelectItem>
                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedEquipamento?.tipo === 'capsula' && (
                <FormField
                  control={conferenciaForm.control}
                  name="pesoAferido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso Aferido (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} onChange={e => field.onChange(Number(e.target.value))} placeholder="Peso medido na conferência" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedEquipamento?.tipo === 'cilindro' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={conferenciaForm.control}
                    name="volumeAferido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume Aferido (cm³)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" {...field} onChange={e => field.onChange(Number(e.target.value))} placeholder="Volume medido" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={conferenciaForm.control}
                    name="alturaAferida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura Aferida (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" {...field} onChange={e => field.onChange(Number(e.target.value))} placeholder="Altura medida" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={conferenciaForm.control}
                name="proximaConferencia"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Próxima Conferência *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={conferenciaForm.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Observações sobre a conferência..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsConferenciaDialogOpen(false);
                    setSelectedEquipamento(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Registrar Conferência</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}