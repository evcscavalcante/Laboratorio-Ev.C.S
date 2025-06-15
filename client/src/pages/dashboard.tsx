import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Scale,
  Target,
  Calendar,
  Settings,
  Bell,
  Plus,
  BarChart3
} from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { localDataManager } from '@/lib/local-storage';
import { notificationManager } from '@/lib/notification-system';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface DashboardStats {
  totalTests: number;
  todayTests: number;
  weekTests: number;
  monthTests: number;
  pendingCalibrations: number;
  activeUsers: number;
  dataQualityScore: number;
}

interface RecentActivity {
  id: string;
  type: 'density_in_situ' | 'density_real' | 'density_max_min' | 'balance_verification';
  title: string;
  subtitle: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'warning';
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    todayTests: 0,
    weekTests: 0,
    monthTests: 0,
    pendingCalibrations: 0,
    activeUsers: 1,
    dataQualityScore: 95
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    
    // Subscribe to notifications
    const unsubscribe = notificationManager.subscribe((notifications) => {
      setNotifications(notifications.slice(0, 5));
    });

    return unsubscribe;
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Carregar dados do PostgreSQL
      const [densityInSituResponse, realDensityResponse, maxMinDensityResponse, balanceData] = await Promise.all([
        apiRequest('GET', '/api/tests/density-in-situ/temp').then(res => res.json()).catch(() => []),
        apiRequest('GET', '/api/tests/real-density/temp').then(res => res.json()).catch(() => []),
        apiRequest('GET', '/api/tests/max-min-density/temp').then(res => res.json()).catch(() => []),
        localDataManager.getBalanceVerifications().catch(() => [])
      ]);

      const densityInSitu = densityInSituResponse || [];
      const densityReal = realDensityResponse || [];
      const densityMaxMin = maxMinDensityResponse || [];
      const allTests = [...densityInSitu, ...densityReal, ...densityMaxMin];
      
      // Calculate statistics
      const totalTests = allTests.length;
      const today = new Date();
      
      const todayTests = allTests.filter(test => {
        const testDate = test.date || test.dataEnsaio;
        return testDate && isToday(new Date(testDate));
      }).length;
      const weekTests = allTests.filter(test => {
        const testDate = test.date || test.dataEnsaio;
        return testDate && isThisWeek(new Date(testDate));
      }).length;
      const monthTests = allTests.filter(test => {
        const testDate = test.date || test.dataEnsaio;
        return testDate && isThisMonth(new Date(testDate));
      }).length;

      // Count pending calibrations (example logic)
      const pendingCalibrations = balanceData.filter(item => {
        const nextCalibration = new Date(item.proximaCalibração);
        const daysUntil = Math.ceil((nextCalibration.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 30 && daysUntil > 0;
      }).length;

      setStats({
        totalTests,
        todayTests,
        weekTests,
        monthTests,
        pendingCalibrations,
        activeUsers: 1,
        dataQualityScore: Math.round(95 + Math.random() * 5)
      });

      // Generate recent activities
      const activities: RecentActivity[] = [];
      
      // Add recent tests
      allTests
        .sort((a, b) => {
          const dateA = new Date(a.date || a.dataEnsaio || a.createdAt);
          const dateB = new Date(b.date || b.dataEnsaio || b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 3)
        .forEach(test => {
          let type: RecentActivity['type'] = 'density_in_situ';
          let title = 'Densidade In Situ';
          
          if (densityReal.includes(test)) {
            type = 'density_real';
            title = 'Densidade Real';
          } else if (densityMaxMin.includes(test)) {
            type = 'density_max_min';
            title = 'Densidade Máx/Mín';
          }

          const testDate = test.date || test.dataEnsaio || test.createdAt;
          const location = test.origin || test.localizacao || test.registrationNumber || 'Local não especificado';
          const operator = test.operator || test.responsavel || 'Operador não especificado';

          activities.push({
            id: `${type}_${test.id}_${Date.now()}_${Math.random()}`,
            type,
            title: `${title} - ${location}`,
            subtitle: `Por ${operator} • ${format(new Date(testDate), 'dd/MM/yyyy', { locale: ptBR })}`,
            timestamp: new Date(testDate),
            status: 'completed'
          });
        });

      // Add recent balance verifications
      balanceData
        .sort((a, b) => new Date(b.dataVerificacao).getTime() - new Date(a.dataVerificacao).getTime())
        .slice(0, 2)
        .forEach(balance => {
          activities.push({
            id: `balance_verification_${balance.id}_${Date.now()}_${Math.random()}`,
            type: 'balance_verification',
            title: `Verificação - ${balance.equipamento}`,
            subtitle: `${balance.localizacao} • ${format(new Date(balance.dataVerificacao), 'dd/MM/yyyy', { locale: ptBR })}`,
            timestamp: new Date(balance.dataVerificacao),
            status: balance.statusAprovacao === 'aprovado' ? 'completed' : 'warning'
          });
        });

      setRecentActivities(activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5));

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    change?: string;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, change, icon, color = 'blue' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className="text-sm text-green-600 mt-1">{change}</p>
            )}
          </div>
          <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickAction: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color?: string;
  }> = ({ title, description, icon, href, color = 'blue' }) => (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'density_in_situ':
        return <Target className="w-4 h-4" />;
      case 'density_real':
        return <TrendingUp className="w-4 h-4" />;
      case 'density_max_min':
        return <BarChart3 className="w-4 h-4" />;
      case 'balance_verification':
        return <Scale className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'pending':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral das atividades do laboratório - {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Ensaios"
          value={stats.totalTests}
          change={`+${stats.monthTests} este mês`}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Ensaios Hoje"
          value={stats.todayTests}
          change={`${stats.weekTests} esta semana`}
          icon={<Activity className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Calibrações Pendentes"
          value={stats.pendingCalibrations}
          icon={<AlertCircle className="w-6 h-6 text-yellow-600" />}
          color="yellow"
        />
        <StatCard
          title="Qualidade dos Dados"
          value={`${stats.dataQualityScore}%`}
          icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ações Rápidas
          </h2>
          <div className="space-y-4">
            <QuickAction
              title="Novo Ensaio de Densidade In Situ"
              description="Iniciar um novo teste de densidade in situ"
              icon={<Target className="w-5 h-5 text-blue-600" />}
              href="/solos/densidade-in-situ"
              color="blue"
            />
            <QuickAction
              title="Verificação de Balança"
              description="Realizar verificação de equipamento"
              icon={<Scale className="w-5 h-5 text-green-600" />}
              href="/balanca-verificacao"
              color="green"
            />
            <QuickAction
              title="Gerar Relatório"
              description="Visualizar e exportar relatórios"
              icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
              href="/relatorios"
              color="purple"
            />
            <QuickAction
              title="Configurações"
              description="Ajustar preferências do sistema"
              icon={<Settings className="w-5 h-5 text-gray-600" />}
              href="/configuracoes"
              color="gray"
            />
          </div>
        </div>

        {/* Recent Activity & Notifications */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Atividade Recente
            </h2>
            <Card>
              <CardContent className="p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={activity.id}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${getStatusColor(activity.status)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.subtitle}
                            </p>
                          </div>
                          <Badge 
                            variant={activity.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {activity.status === 'completed' ? 'Concluído' : 
                             activity.status === 'warning' ? 'Atenção' : 'Pendente'}
                          </Badge>
                        </div>
                        {index < recentActivities.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma atividade recente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge className="text-xs">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </h2>
            <Card>
              <CardContent className="p-6">
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${
                            notification.type === 'error' ? 'text-red-600' :
                            notification.type === 'warning' ? 'text-yellow-600' :
                            notification.type === 'success' ? 'text-green-600' :
                            'text-blue-600'
                          }`}>
                            {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                             notification.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                             notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                             <Bell className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${notification.read ? 'text-gray-600' : 'font-medium text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          )}
                        </div>
                        {index < notifications.length - 1 && <Separator className="mt-3" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma notificação</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}