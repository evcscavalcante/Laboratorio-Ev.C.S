/**
 * Página de Monitoramento do Sistema
 * Interface para visualizar métricas e status do sistema
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MemoryStick, 
  Server,
  RefreshCw,
  Zap
} from 'lucide-react';

interface SystemHealth {
  status: string;
  uptime: number;
  memoryUsage: number;
  requestCount: number;
  errorCount: number;
  issues: string[];
  lastError?: {
    message: string;
    timestamp: string;
  };
}

interface SystemMetrics {
  uptime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
  };
  requestCount: number;
  errorCount: number;
}

export default function SystemMonitoring() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const [healthRes, metricsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/metrics')
      ]);

      if (healthRes.ok && metricsRes.ok) {
        const healthData = await healthRes.json();
        const metricsData = await metricsRes.json();
        
        setHealth(healthData);
        setMetrics(metricsData);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erro ao carregar dados do sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (uptimeMs: number) => {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento do Sistema</h1>
          <p className="text-gray-600">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Status Geral */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Badge className={getStatusColor(health.status)}>
                {getStatusIcon(health.status)}
                <span className="ml-1">{health.status.toUpperCase()}</span>
              </Badge>
              <div className="text-sm text-gray-600">
                Sistema Geotécnico - Laboratório EVCS
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatUptime(health.uptime)}
                </div>
                <div className="text-sm text-gray-600">Tempo Ativo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {health.requestCount}
                </div>
                <div className="text-sm text-gray-600">Requisições</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {health.memoryUsage}%
                </div>
                <div className="text-sm text-gray-600">Memória</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {health.errorCount}
                </div>
                <div className="text-sm text-gray-600">Erros</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Estado do Sistema:</h4>
              {health.issues.map((issue, index) => (
                <Alert key={index}>
                  <AlertDescription>{issue}</AlertDescription>
                </Alert>
              ))}
            </div>

            {health.lastError && (
              <div className="mt-4">
                <h4 className="font-semibold text-red-600 mb-2">Último Erro:</h4>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">{health.lastError.message}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(health.lastError.timestamp).toLocaleString()}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Métricas Detalhadas */}
      {metrics && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MemoryStick className="h-5 w-5" />
                Uso de Memória
              </CardTitle>
              <CardDescription>Detalhes do consumo de memória</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Heap Usado:</span>
                  <span className="font-medium">{formatBytes(metrics.memoryUsage.heapUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heap Total:</span>
                  <span className="font-medium">{formatBytes(metrics.memoryUsage.heapTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Externo:</span>
                  <span className="font-medium">{formatBytes(metrics.memoryUsage.external)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Array Buffers:</span>
                  <span className="font-medium">{formatBytes(metrics.memoryUsage.arrayBuffers)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Atividade do Sistema
              </CardTitle>
              <CardDescription>Estatísticas de uso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total de Requisições:</span>
                  <span className="font-medium">{metrics.requestCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total de Erros:</span>
                  <span className="font-medium text-red-600">{metrics.errorCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Sucesso:</span>
                  <span className="font-medium text-green-600">
                    {metrics.requestCount > 0 
                      ? (((metrics.requestCount - metrics.errorCount) / metrics.requestCount) * 100).toFixed(1)
                      : 100
                    }%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo Ativo:</span>
                  <span className="font-medium">{formatUptime(metrics.uptime)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Versão Node.js:</div>
              <div className="text-gray-600">v20.18.1</div>
            </div>
            <div>
              <div className="font-medium">Ambiente:</div>
              <div className="text-gray-600">development</div>
            </div>
            <div>
              <div className="font-medium">Plataforma:</div>
              <div className="text-gray-600">Linux</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}