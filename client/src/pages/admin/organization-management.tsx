import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Building, Users, Mail, Phone, MapPin } from 'lucide-react';
import type { Organization } from '@shared/schema';
import { firebaseSync } from '@/lib/firebase-sync';

interface OrganizationFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
}

export default function OrganizationManagement() {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    active: true
  });

  // Reset form when dialogs close
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      active: true
    });
    setSelectedOrg(null);
  }, []);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch organizations
  const { data: organizations = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['/api/organizations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/organizations');
      const data = await response.json();
      
      // Garantir que sempre retornamos um array
      if (Array.isArray(data)) {
        return data;
      } else {
        console.warn('API retornou dados inválidos para organizations:', data);
        return [];
      }
    }
  });

  // Fetch users count per organization
  const { data: userCounts = {} } = useQuery({
    queryKey: ['/api/organizations/user-counts'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/organizations/user-counts');
        if (!response.ok) {
          console.warn('Falha ao buscar user-counts:', response.status);
          return {};
        }
        const data = await response.json();
        
        // Garantir que sempre retornamos um objeto válido
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          return data;
        } else {
          console.warn('API retornou formato inválido para user-counts:', typeof data);
          return {};
        }
      } catch (error) {
        console.error('Erro ao buscar user-counts:', error);
        return {};
      }
    }
  });

  // Create organization mutation
  const createOrgMutation = useMutation({
    mutationFn: async (orgData: OrganizationFormData) => {
      const response = await apiRequest('POST', '/api/organizations', orgData);
      return response.json();
    },
    onSuccess: async (result) => {
      // Sincronizar com Firebase Firestore
      const firebaseSuccess = await firebaseSync.syncOrganization({
        ...formData,
        id: result.id
      });

      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({ 
        title: 'Organização criada com sucesso!',
        description: firebaseSuccess 
          ? 'Dados salvos no PostgreSQL e sincronizados com Firebase.'
          : 'Dados salvos no PostgreSQL. Sincronização Firebase falhou.'
      });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar organização', description: error.message, variant: 'destructive' });
    }
  });

  // Update organization mutation
  const updateOrgMutation = useMutation({
    mutationFn: async ({ id, orgData }: { id: number; orgData: Partial<OrganizationFormData> }) => {
      const response = await apiRequest('PATCH', `/api/organizations/${id}`, orgData);
      return response.json();
    },
    onSuccess: async (result, { id }) => {
      // Sincronizar com Firebase Firestore
      const firebaseSuccess = await firebaseSync.syncOrganization({
        ...formData,
        id: id
      });

      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      setIsEditDialogOpen(false);
      resetForm();
      
      toast({ 
        title: 'Organização atualizada com sucesso!',
        description: firebaseSuccess 
          ? 'Dados salvos no PostgreSQL e sincronizados com Firebase.'
          : 'Dados salvos no PostgreSQL. Sincronização Firebase falhou.'
      });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar organização', description: error.message, variant: 'destructive' });
    }
  });

  // Delete organization mutation
  const deleteOrgMutation = useMutation({
    mutationFn: async (orgId: number) => {
      await apiRequest('DELETE', `/api/organizations/${orgId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      toast({ title: 'Organização removida com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover organização', description: error.message, variant: 'destructive' });
    }
  });

  const handleCreateOrg = useCallback(() => {
    createOrgMutation.mutate(formData);
  }, [createOrgMutation, formData]);

  const handleEditOrg = useCallback((org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      description: org.description || '',
      address: org.address || '',
      phone: org.phone || '',
      email: org.email || '',
      active: org.active ?? true
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateOrg = useCallback(() => {
    if (selectedOrg) {
      updateOrgMutation.mutate({ id: selectedOrg.id, orgData: formData });
    }
  }, [updateOrgMutation, selectedOrg, formData]);

  const handleDeleteOrg = (orgId: number) => {
    const userCount = userCounts[orgId] || 0;
    if (userCount > 0) {
      toast({ 
        title: 'Não é possível excluir', 
        description: `Esta organização possui ${userCount} usuário(s) vinculado(s)`,
        variant: 'destructive' 
      });
      return;
    }
    
    if (confirm('Tem certeza que deseja remover esta organização?')) {
      deleteOrgMutation.mutate(orgId);
    }
  };

  if (orgsLoading) {
    return <div className="p-6">Carregando organizações...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8" />
            Gerenciamento de Organizações
          </h1>
          <p className="text-muted-foreground">
            Gerencie empresas, laboratórios e instituições do sistema
          </p>
        </div>
        
        <Dialog 
          open={isCreateDialogOpen} 
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Organização
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" key="create-dialog">
            <DialogHeader>
              <DialogTitle>Criar Nova Organização</DialogTitle>
              <DialogDescription>
                Adicione uma nova organização ao sistema para agrupar usuários.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nome da Organização</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Laboratório Geotécnico ABC"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descrição da organização"
                  rows={3}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Endereço completo"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@exemplo.com"
                />
              </div>
              
              <div className="col-span-2 flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Organização ativa</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateOrg} disabled={createOrgMutation.isPending}>
                {createOrgMutation.isPending ? 'Criando...' : 'Criar Organização'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org: Organization) => (
          <Card key={org.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                </div>
                <Badge variant={org.active ? 'default' : 'secondary'}>
                  {org.active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              <CardDescription className="min-h-[2.5rem]">
                {org.description || 'Sem descrição'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                {org.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>{org.address}</span>
                  </div>
                )}
                
                {org.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{org.phone}</span>
                  </div>
                )}
                
                {org.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{org.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{userCounts[org.id] || 0} usuário(s)</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEditOrg(org)} className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteOrg(org.id)}
                  disabled={(userCounts[org.id] || 0) > 0}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
            <DialogDescription>
              Atualize as informações da organização.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit-name">Nome da Organização</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="edit-active">Organização ativa</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateOrg} disabled={updateOrgMutation.isPending}>
              {updateOrgMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}