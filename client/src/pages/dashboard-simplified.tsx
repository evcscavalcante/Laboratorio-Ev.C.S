import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  FileText,
  Target,
  Scale,
  BarChart3,
  Plus,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DashboardStats {
  totalTests: number;
  todayTests: number;
  weekTests: number;
  monthTests: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    todayTests: 0,
    weekTests: 0,
    monthTests: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [densityInSituResponse, realDensityResponse, maxMinDensityResponse] = await Promise.all([
        apiRequest('GET', '/api/tests/densidade-in-situ/temp').then(res => res.json()).catch(() => []),
        apiRequest('GET', '/api/tests/densidade-real/temp').then(res => res.json()).catch(() => []),
        apiRequest('GET', '/api/tests/densidade-max-min/temp').then(res => res.json()).catch(() => [])
      ]);

      const allTests = [
        ...(densityInSituResponse || []),
        ...(realDensityResponse || []),
        ...(maxMinDensityResponse || [])
      ];
      
      const totalTests = allTests.length;
      const today = new Date();
      const todayTests = allTests.filter(test => {
        const testDate = test.date || test.dataEnsaio;
        return testDate && new Date(testDate).toDateString() === today.toDateString();
      }).length;
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const weekTests = allTests.filter(test => {
        const testDate = test.date || test.dataEnsaio;
        return testDate && new Date(testDate) >= weekStart;
      }).length;
      
      const monthStart = new Date(today);
      monthStart.setDate(today.getDate() - 30);
      const monthTests = allTests.filter(test => {
        const testDate = test.date || test.dataEnsaio;
        return testDate && new Date(testDate) >= monthStart;
      }).length;

      setStats({
        totalTests,
        todayTests,
        weekTests,
        monthTests
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Ensaios</p>
                <p className="text-2xl font-bold">{stats.totalTests}</p>
                <p className="text-sm text-green-600 mt-1">+{stats.monthTests} este mês</p>
              </div>
              <div className="stat-icon stat-icon--primary">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ensaios Hoje</p>
                <p className="text-2xl font-bold">{stats.todayTests}</p>
                <p className="text-sm text-blue-600 mt-1">{stats.weekTests} esta semana</p>
              </div>
              <div className="stat-icon stat-icon--success">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crescimento Semanal</p>
                <p className="text-2xl font-bold">+{Math.round((stats.weekTests / Math.max(stats.totalTests - stats.weekTests, 1)) * 100)}%</p>
                <p className="text-sm text-purple-600 mt-1">vs semana anterior</p>
              </div>
              <div className="stat-icon stat-icon--warning">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produtividade</p>
                <p className="text-2xl font-bold">{stats.monthTests > 0 ? Math.round(stats.monthTests / 30 * 7) : 0}</p>
                <p className="text-sm text-indigo-600 mt-1">ensaios/semana</p>
              </div>
              <div className="stat-icon stat-icon--error">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/densidade-in-situ">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="stat-icon stat-icon--primary">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Densidade In-Situ</h3>
                    <p className="text-sm text-gray-600">Novo ensaio NBR 9813</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/densidade-real">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="stat-icon stat-icon--success">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Densidade Real</h3>
                    <p className="text-sm text-gray-600">Novo ensaio NBR 6508</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/densidade-max-min">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="stat-icon stat-icon--warning">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Densidade Máx/Mín</h3>
                    <p className="text-sm text-gray-600">Novo ensaio NBR 12004</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Performance Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resumo de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalTests}</div>
              <div className="text-sm text-gray-600">Ensaios Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.monthTests}</div>
              <div className="text-sm text-gray-600">Últimos 30 Dias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.monthTests > 0 ? Math.round(stats.monthTests / 30) : 0}</div>
              <div className="text-sm text-gray-600">Média Diária</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}