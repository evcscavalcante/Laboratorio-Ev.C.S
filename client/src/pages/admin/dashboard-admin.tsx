import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Users, Building2, TestTube, FileText, Activity, UserCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalTests: number;
  recentActivity: number;
  activeUsers: number;
  pendingApprovals: number;
}

export default function DashboardAdmin() {
  const { token, hasAnyRole } = useAuth();

  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard-stats'],
    enabled: hasAnyRole(['ADMIN', 'DEVELOPER']) && !!token,
    staleTime: 30000, // 30 segundos
  });

  if (!hasAnyRole(['ADMIN', 'DEVELOPER'])) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Acesso negado. Apenas administradores podem acessar este painel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar estatísticas do sistema. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visão geral do sistema e estatísticas em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total de Usuários */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Usuários registrados no sistema</p>
          </CardContent>
        </Card>

        {/* Total de Organizações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizações</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalOrganizations || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Empresas ativas</p>
          </CardContent>
        </Card>

        {/* Total de Ensaios */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ensaios Realizados</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalTests || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Ensaios geotécnicos salvos</p>
          </CardContent>
        </Card>

        {/* Usuários Ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.recentActivity || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Ações nas últimas 24h</p>
          </CardContent>
        </Card>

        {/* Aprovações Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Aguardando revisão</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Ferramentas administrativas mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">Gerenciar Usuários</span>
              <a 
                href="/admin/user-management" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Acessar →
              </a>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">Gerenciar Organizações</span>
              <a 
                href="/admin/organization-management" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Acessar →
              </a>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">Relatórios e Analytics</span>
              <a 
                href="/relatorios" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Acessar →
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>
              Monitoramento em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Banco de Dados</span>
              <span className="text-green-600 font-medium">🟢 Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Autenticação</span>
              <span className="text-green-600 font-medium">🟢 Funcional</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">API</span>
              <span className="text-green-600 font-medium">🟢 Responsiva</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Backups</span>
              <span className="text-yellow-600 font-medium">🟡 Manual</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}