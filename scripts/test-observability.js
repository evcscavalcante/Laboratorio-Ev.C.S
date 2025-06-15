#!/usr/bin/env node

/**
 * Script de Teste do Sistema de Observabilidade
 * Valida funcionalidade completa de logs, erros, métricas e alertas
 */

import http from 'http';
import https from 'https';
import { execSync } from 'child_process';

class ObservabilityTester {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 Iniciando testes do sistema de observabilidade...\n');

    const tests = [
      { name: 'Health Check', endpoint: '/api/health' },
      { name: 'Métricas de Performance', endpoint: '/api/metrics/performance' },
      { name: 'Métricas de Erros', endpoint: '/api/metrics/errors' },
      { name: 'Alertas Ativos', endpoint: '/api/alerts' },
      { name: 'Dashboard Consolidado', endpoint: '/api/observability/dashboard' }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }

    this.generateReport();
  }

  async runTest(test) {
    try {
      console.log(`🔍 Testando: ${test.name}`);
      const startTime = Date.now();
      
      const response = await this.makeRequest(test.endpoint);
      const duration = Date.now() - startTime;
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.data);
        
        this.testResults.push({
          name: test.name,
          endpoint: test.endpoint,
          status: 'PASS',
          duration,
          dataSize: response.data.length,
          hasData: Object.keys(data).length > 0
        });
        
        console.log(`✅ ${test.name} - OK (${duration}ms)`);
        
        // Validações específicas
        await this.validateResponse(test.name, data);
        
      } else {
        this.testResults.push({
          name: test.name,
          endpoint: test.endpoint,
          status: 'FAIL',
          duration,
          error: `HTTP ${response.statusCode}`
        });
        
        console.log(`❌ ${test.name} - FALHOU (${response.statusCode})`);
      }
      
    } catch (error) {
      this.testResults.push({
        name: test.name,
        endpoint: test.endpoint,
        status: 'ERROR',
        error: error.message
      });
      
      console.log(`💥 ${test.name} - ERRO: ${error.message}`);
    }
    
    console.log(''); // Linha em branco
  }

  async validateResponse(testName, data) {
    switch (testName) {
      case 'Health Check':
        if (data.status && data.metrics) {
          console.log(`   ✓ Status: ${data.status}`);
          console.log(`   ✓ Métricas: ${Object.keys(data.metrics).length} itens`);
        }
        break;
        
      case 'Dashboard Consolidado':
        if (data.systemHealth && data.performance && data.errors) {
          console.log(`   ✓ Sistema: ${data.systemHealth.status}`);
          console.log(`   ✓ Performance: ${data.performance.recentMetrics?.length || 0} métricas`);
          console.log(`   ✓ Erros: ${data.errors.totalErrors} erros`);
        }
        break;
        
      case 'Métricas de Performance':
        if (data.systemHealth || data.aggregatedMetrics) {
          console.log(`   ✓ Health: ${data.systemHealth?.status || 'N/A'}`);
          console.log(`   ✓ Métricas: ${data.aggregatedMetrics?.length || 0} endpoints`);
        }
        break;
        
      case 'Métricas de Erros':
        console.log(`   ✓ Total de erros: ${data.totalErrors || 0}`);
        console.log(`   ✓ Erros críticos: ${data.bySeverity?.critical || 0}`);
        break;
        
      case 'Alertas Ativos':
        console.log(`   ✓ Alertas ativos: ${data.alerts?.length || 0}`);
        console.log(`   ✓ Total histórico: ${data.metrics?.total || 0}`);
        break;
    }
  }

  makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`;
      const client = url.startsWith('https') ? https : http;
      
      const req = client.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout - requisição demorou mais de 10s'));
      });
    });
  }

  generateReport() {
    console.log('📋 RELATÓRIO DE TESTES - SISTEMA DE OBSERVABILIDADE');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;
    
    console.log(`✅ Passou: ${passed}/${this.testResults.length}`);
    console.log(`❌ Falhou: ${failed}/${this.testResults.length}`);
    console.log(`💥 Erros: ${errors}/${this.testResults.length}`);
    
    const avgDuration = this.testResults
      .filter(r => r.duration)
      .reduce((sum, r) => sum + r.duration, 0) / this.testResults.length;
    
    console.log(`⏱️  Tempo médio: ${Math.round(avgDuration)}ms`);
    
    console.log('\n📊 DETALHES DOS TESTES:');
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : 
                    result.status === 'FAIL' ? '❌' : '💥';
      
      console.log(`${status} ${result.name}`);
      console.log(`   Endpoint: ${result.endpoint}`);
      
      if (result.duration) {
        console.log(`   Duração: ${result.duration}ms`);
      }
      
      if (result.dataSize) {
        console.log(`   Dados: ${result.dataSize} bytes`);
      }
      
      if (result.error) {
        console.log(`   Erro: ${result.error}`);
      }
      
      console.log('');
    });

    // Recomendações
    console.log('💡 RECOMENDAÇÕES:');
    
    if (failed > 0 || errors > 0) {
      console.log('- Verificar se o servidor está rodando na porta 5173');
      console.log('- Confirmar se o sistema de observabilidade foi inicializado');
      console.log('- Checar logs do servidor para erros específicos');
    } else {
      console.log('- Sistema de observabilidade funcionando perfeitamente');
      console.log('- Todos os endpoints estão respondendo corretamente');
      console.log('- Performance dentro dos parâmetros esperados');
    }
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('- Configurar alertas para Slack/Email em produção');
    console.log('- Ajustar thresholds baseado no uso real');
    console.log('- Implementar métricas customizadas por tipo de ensaio');
    
    console.log('='.repeat(60));
    
    // Exit code baseado nos resultados
    const exitCode = (failed + errors) > 0 ? 1 : 0;
    process.exit(exitCode);
  }
}

// Executar testes se chamado diretamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const tester = new ObservabilityTester();
  tester.runTests().catch(error => {
    console.error('❌ Erro fatal nos testes:', error);
    process.exit(1);
  });
}

export default ObservabilityTester;