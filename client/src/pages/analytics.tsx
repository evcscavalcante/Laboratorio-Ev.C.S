import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  BarChart3,
  Target,
  Award
} from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TestData {
  id: number;
  testType: string;
  registrationNumber?: string;
  operator?: string;
  date?: string;
  createdAt: string;
  results?: {
    status?: string;
  };
}

const Analytics: React.FC = () => {
  // Buscar dados de todos os tipos de ensaios
  const { data: densityInSituTests = [] } = useQuery<TestData[]>({
    queryKey: ['/api/tests/density-in-situ'],
    enabled: true
  });

  const { data: densityRealTests = [] } = useQuery<TestData[]>({
    queryKey: ['/api/tests/real-density'],
    enabled: true
  });

  const { data: densityMaxMinTests = [] } = useQuery<TestData[]>({
    queryKey: ['/api/tests/max-min-density'],
    enabled: true
  });

  // Combinar todos os dados
  const allTests: TestData[] = [
    ...(Array.isArray(densityInSituTests) ? densityInSituTests.map((test: any) => ({ ...test, testType: 'densidade-in-situ' })) : []),
    ...(Array.isArray(densityRealTests) ? densityRealTests.map((test: any) => ({ ...test, testType: 'densidade-real' })) : []),
    ...(Array.isArray(densityMaxMinTests) ? densityMaxMinTests.map((test: any) => ({ ...test, testType: 'densidade-max-min' })) : [])
  ];

  // Calcular métricas
  const totalTests = allTests.length;
  const testsThisWeek = allTests.filter(test => {
    const testDate = new Date(test.createdAt || test.date || '');
    const weekAgo = subDays(new Date(), 7);
    return testDate >= weekAgo;
  }).length;

  const uniqueOperators = Array.from(new Set(allTests.map(test => test.operator).filter(Boolean) as string[])).length;
  
  const approvedTests = allTests.filter(test => 
    test.results?.status === 'APROVADO' || 
    test.results?.status === 'PASSED'
  ).length;

  // Dados para gráficos
  const testsByType = [
    { name: 'Densidade In-Situ', value: densityInSituTests.length, color: '#3B82F6' },
    { name: 'Densidade Real', value: densityRealTests.length, color: '#10B981' },
    { name: 'Densidade Máx/Mín', value: densityMaxMinTests.length, color: '#F59E0B' }
  ];

  // Dados por semana (últimas 4 semanas)
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = subDays(new Date(), (i + 1) * 7);
    const weekEnd = subDays(new Date(), i * 7);
    
    const weekTests = allTests.filter(test => {
      const testDate = new Date(test.createdAt || test.date || '');
      return testDate >= weekStart && testDate < weekEnd;
    });

    weeklyData.push({
      semana: `Sem ${4 - i}`,
      'Densidade In-Situ': weekTests.filter(t => t.testType === 'densidade-in-situ').length,
      'Densidade Real': weekTests.filter(t => t.testType === 'densidade-real').length,
      'Densidade Máx/Mín': weekTests.filter(t => t.testType === 'densidade-max-min').length,
      total: weekTests.length
    });
  }

  // Produtividade por operador
  const operatorData = allTests.reduce((acc, test) => {
    const operator = test.operator || 'Não Informado';
    if (!acc[operator]) {
      acc[operator] = 0;
    }
    acc[operator]++;
    return acc;
  }, {} as Record<string, number>);

  const topOperators = Object.entries(operatorData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics do Laboratório</h1>
          <p className="text-gray-600">Indicadores de performance e análise de dados geotécnicos</p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Ensaios</p>
                  <p className="text-3xl font-bold text-gray-900">{totalTests}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+{testsThisWeek} esta semana</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Operadores Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">{uniqueOperators}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Badge variant="secondary">Equipe técnica</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Aprovação</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalTests > 0 ? Math.round((approvedTests / totalTests) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">{approvedTests} de {totalTests} ensaios</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média Semanal</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(totalTests / 4)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-gray-600">ensaios/semana</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Distribuição por Tipo de Ensaio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={testsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {testsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Evolução Semanal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Evolução Semanal de Ensaios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Densidade In-Situ" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Densidade Real" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Densidade Máx/Mín" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Produtividade e Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Operadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top 5 Operadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topOperators.map((operator, index) => (
                  <div key={operator.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                        ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}
                      `}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{operator.name}</span>
                    </div>
                    <Badge variant="secondary">{operator.count} ensaios</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparativo Semanal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comparativo Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Densidade In-Situ" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="Densidade Real" stackId="a" fill="#10B981" />
                  <Bar dataKey="Densidade Máx/Mín" stackId="a" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Performance do Laboratório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{totalTests}</div>
                <div className="text-sm text-gray-600">Ensaios Realizados</div>
                <div className="text-xs text-gray-500 mt-1">Total histórico</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {totalTests > 0 ? (totalTests / 4).toFixed(1) : '0'}
                </div>
                <div className="text-sm text-gray-600">Ensaios por Semana</div>
                <div className="text-xs text-gray-500 mt-1">Média das últimas 4 semanas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">{uniqueOperators}</div>
                <div className="text-sm text-gray-600">Técnicos Ativos</div>
                <div className="text-xs text-gray-500 mt-1">Equipe especializada</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;