/**
 * Dashboard de Observabilidade
 * Interface para monitoramento de sistema, erros e performance
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MemoryStick, 
  TrendingUp,
  Eye,
  AlertCircle,
  Server
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  metrics: {
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    requestsPerMinute: number;
  };
  issues: string[];
}

interface ErrorMetrics {
  totalErrors: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  recentErrors: any[];
}

interface AlertData {
  alerts: any[];
  metrics: {
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
    bySeverity: Record<string, number>;
  };
}

export function ObservabilityDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetrics | null>(null);
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchObservabilityData();
    const interval = setInterval(fetchObservabilityData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const fetchObservabilityData = async () => {
    try {
      const [healthRes, errorsRes, alertsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/metrics/errors'),
        fetch('/api/alerts')
      ]);

      const health = await healthRes.json();
      const errors = await errorsRes.json();
      const alerts = await alertsRes.json();

      setSystemHealth(health);
      setErrorMetrics(errors);
      setAlertData(alerts);
    } catch (error) {
      console.error('Erro ao carregar dados de observabilidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Observabilidade do Sistema</h2>
        <Button onClick={fetchObservabilityData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Status Geral do Sistema */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Badge className={getStatusColor(systemHealth.status)}>
                {systemHealth.status === 'healthy' && <CheckCircle className="h-4 w-4 mr-1" />}
                {systemHealth.status === 'warning' && <AlertTriangle className="h-4 w-4 mr-1" />}
                {systemHealth.status === 'critical' && <AlertCircle className="h-4 w-4 mr-1" />}
                {systemHealth.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600">
                Última atualização: {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {systemHealth.metrics.averageResponseTime}ms
                </div>
                <div className="text-sm text-gray-600">Tempo Resposta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {systemHealth.metrics.errorRate}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Erro</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {systemHealth.metrics.memoryUsage}%
                </div>
                <div className="text-sm text-gray-600">Uso Memória</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {systemHealth.metrics.requestsPerMinute}
                </div>
                <div className="text-sm text-gray-600">Req/Min</div>
              </div>
            </div>

            {systemHealth.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Problemas Detectados:</h4>
                {systemHealth.issues.map((issue, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{issue}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="errors">Erros</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Aba de Alertas */}
        <TabsContent value="alerts">
          {alertData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {alertData.metrics.active}
                    </div>
                    <p className="text-sm text-gray-600">Alertas Ativos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-yellow-600">
                      {alertData.metrics.acknowledged}
                    </div>
                    <p className="text-sm text-gray-600">Reconhecidos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {alertData.metrics.resolved}
                    </div>
                    <p className="text-sm text-gray-600">Resolvidos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {alertData.metrics.total}
                    </div>
                    <p className="text-sm text-gray-600">Total</p>
                  </CardContent>
                </Card>
              </div>

              {alertData.alerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Alertas Ativos</CardTitle>
                    <CardDescription>
                      Alertas que requerem atenção imediata
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {alertData.alerts.map((alert, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <span className="font-semibold">{alert.title}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{alert.message}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Serviço: {alert.service}</span>
                            <span>•</span>
                            <span>Tipo: {alert.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Aba de Erros */}
        <TabsContent value="errors">
          {errorMetrics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {errorMetrics.bySeverity.critical || 0}
                    </div>
                    <p className="text-sm text-gray-600">Críticos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-orange-600">
                      {errorMetrics.bySeverity.high || 0}
                    </div>
                    <p className="text-sm text-gray-600">Altos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-yellow-600">
                      {errorMetrics.bySeverity.medium || 0}
                    </div>
                    <p className="text-sm text-gray-600">Médios</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {errorMetrics.totalErrors}
                    </div>
                    <p className="text-sm text-gray-600">Total</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Erros por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(errorMetrics.byCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="capitalize">{category.replace('_', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Aba de Performance */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Métricas de Performance
              </CardTitle>
              <CardDescription>
                Dados agregados dos últimos 60 minutos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                <MemoryStick className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Métricas de performance disponíveis via API</p>
                <p className="text-sm">Endpoint: /api/metrics/performance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}