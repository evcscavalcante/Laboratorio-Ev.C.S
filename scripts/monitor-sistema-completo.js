#!/usr/bin/env node

/**
 * MONITOR COMPLETO DO SISTEMA
 * Combina detecção de segurança + erros de runtime + endpoints novos
 * Detecta automaticamente todos os tipos de problemas que podem ocorrer
 */

import { RuntimeErrorDetector } from './test-runtime-errors.js';
import fetch from 'node-fetch';
import fs from 'fs';

class MonitorSistemaCompleto {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      security: { score: 0, status: '', details: [] },
      runtime: { score: 0, status: '', errors: [] },
      endpoints: { total: 0, working: 0, broken: [] },
      overall: { score: 0, status: '', recommendations: [] }
    };
  }

  async monitorarTudo() {
    console.log('🔍 INICIANDO MONITORAMENTO COMPLETO DO SISTEMA...\n');

    // 1. Detectar erros de runtime
    await this.detectarErrosRuntime();
    
    // 2. Verificar segurança dos endpoints
    await this.verificarSeguranca();
    
    // 3. Testar endpoints críticos com dados reais
    await this.testarEndpointsCriticos();
    
    // 4. Gerar relatório final
    this.gerarRelatorioCompleto();
    
    return this.results.overall.score;
  }

  async detectarErrosRuntime() {
    console.log('🔧 DETECTANDO ERROS DE RUNTIME...');
    
    const detector = new RuntimeErrorDetector(this.baseUrl);
    await detector.runTests();
    
    const criticalErrors = detector.results.runtimeErrors + detector.results.databaseErrors;
    const successRate = (detector.results.success / detector.results.total) * 100;
    
    this.results.runtime = {
      score: Math.max(0, 100 - (criticalErrors * 25)),
      status: criticalErrors === 0 ? 'ESTÁVEL' : criticalErrors <= 2 ? 'PROBLEMAS MENORES' : 'CRÍTICO',
      errors: detector.detailedErrors,
      successRate: successRate.toFixed(1)
    };
    
    console.log(`✅ Runtime: ${this.results.runtime.score}/100 - ${this.results.runtime.status}\n`);
  }

  async verificarSeguranca() {
    console.log('🔒 VERIFICANDO SEGURANÇA DOS ENDPOINTS...');
    
    const endpointsTestados = [
      '/api/organizations', '/api/users', '/api/equipamentos',
      '/api/tests/density-in-situ', '/api/tests/real-density',
      '/api/tests/max-min-density', '/api/notifications'
    ];
    
    let endpointsProblematicos = 0;
    
    for (const endpoint of endpointsTestados) {
      try {
        // Testar sem autenticação (deve retornar 401)
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: { 'User-Agent': 'Security Monitor' }
        });
        
        if (response.status === 200) {
          // Endpoint público - verificar se deveria ser protegido
          this.results.security.details.push({
            endpoint,
            issue: 'Endpoint deveria exigir autenticação',
            severity: 'HIGH'
          });
          endpointsProblematicos++;
        } else if (response.status === 500) {
          // Erro interno - problema crítico
          this.results.security.details.push({
            endpoint,
            issue: 'Erro 500 - falha interna do servidor',
            severity: 'CRITICAL'
          });
          endpointsProblematicos += 2;
        }
      } catch (error) {
        this.results.security.details.push({
          endpoint,
          issue: `Erro de rede: ${error.message}`,
          severity: 'MEDIUM'
        });
        endpointsProblematicos++;
      }
    }
    
    this.results.security = {
      score: Math.max(0, 100 - (endpointsProblematicos * 10)),
      status: endpointsProblematicos === 0 ? 'SEGURO' : endpointsProblematicos <= 2 ? 'ATENÇÃO' : 'VULNERÁVEL',
      details: this.results.security.details,
      endpointsTestados: endpointsTestados.length,
      problematicos: endpointsProblematicos
    };
    
    console.log(`✅ Segurança: ${this.results.security.score}/100 - ${this.results.security.status}\n`);
  }

  async testarEndpointsCriticos() {
    console.log('⚡ TESTANDO ENDPOINTS CRÍTICOS COM DADOS REAIS...');
    
    const endpointsCriticos = [
      { url: '/api/organizations/user-counts', expectedType: 'array', public: true },
      { url: '/api/lgpd/terms', expectedType: 'object', public: true },
      { url: '/api/health', expectedType: 'object', public: true }
    ];
    
    let endpointsFuncionando = 0;
    
    for (const endpoint of endpointsCriticos) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint.url}`, {
          headers: { 'User-Agent': 'Critical Endpoint Tester' }
        });
        
        if (response.status === 200) {
          const data = await response.json();
          
          if (endpoint.expectedType === 'array' && Array.isArray(data)) {
            console.log(`✅ ${endpoint.url}: Array com ${data.length} items`);
            endpointsFuncionando++;
          } else if (endpoint.expectedType === 'object' && typeof data === 'object') {
            console.log(`✅ ${endpoint.url}: Objeto válido`);
            endpointsFuncionando++;
          } else {
            console.log(`❌ ${endpoint.url}: Tipo de dados incorreto`);
            this.results.endpoints.broken.push({
              url: endpoint.url,
              issue: `Esperado ${endpoint.expectedType}, recebido ${typeof data}`
            });
          }
        } else {
          console.log(`❌ ${endpoint.url}: Status ${response.status}`);
          this.results.endpoints.broken.push({
            url: endpoint.url,
            issue: `Status ${response.status}`
          });
        }
      } catch (error) {
        console.log(`❌ ${endpoint.url}: ${error.message}`);
        this.results.endpoints.broken.push({
          url: endpoint.url,
          issue: error.message
        });
      }
    }
    
    this.results.endpoints = {
      total: endpointsCriticos.length,
      working: endpointsFuncionando,
      broken: this.results.endpoints.broken,
      successRate: ((endpointsFuncionando / endpointsCriticos.length) * 100).toFixed(1)
    };
    
    console.log(`✅ Endpoints: ${endpointsFuncionando}/${endpointsCriticos.length} funcionando\n`);
  }

  gerarRelatorioCompleto() {
    console.log('📊 RELATÓRIO COMPLETO DO SISTEMA');
    console.log('=' .repeat(60));
    
    // Calcular score geral
    const scores = [
      this.results.runtime.score,
      this.results.security.score,
      (this.results.endpoints.working / this.results.endpoints.total) * 100
    ];
    
    this.results.overall.score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    // Determinar status geral
    if (this.results.overall.score >= 90) {
      this.results.overall.status = 'EXCELENTE';
    } else if (this.results.overall.score >= 70) {
      this.results.overall.status = 'BOM';
    } else if (this.results.overall.score >= 50) {
      this.results.overall.status = 'ATENÇÃO';
    } else {
      this.results.overall.status = 'CRÍTICO';
    }
    
    console.log(`🎯 PONTUAÇÃO GERAL: ${this.results.overall.score}/100`);
    console.log(`📈 STATUS GERAL: ${this.results.overall.status}`);
    console.log('');
    
    console.log('📋 DETALHAMENTO POR CATEGORIA:');
    console.log(`   🔧 Runtime: ${this.results.runtime.score}/100 (${this.results.runtime.status})`);
    console.log(`   🔒 Segurança: ${this.results.security.score}/100 (${this.results.security.status})`);
    console.log(`   ⚡ Endpoints: ${this.results.endpoints.successRate}% funcionando`);
    console.log('');
    
    // Recomendações
    this.results.overall.recommendations = [];
    
    if (this.results.runtime.score < 80) {
      this.results.overall.recommendations.push('Corrigir erros de runtime detectados');
    }
    
    if (this.results.security.score < 80) {
      this.results.overall.recommendations.push('Verificar vulnerabilidades de segurança');
    }
    
    if (this.results.endpoints.broken.length > 0) {
      this.results.overall.recommendations.push('Corrigir endpoints com falha');
    }
    
    if (this.results.overall.recommendations.length > 0) {
      console.log('🔧 RECOMENDAÇÕES:');
      this.results.overall.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    } else {
      console.log('🎉 SISTEMA OPERACIONAL - NENHUMA AÇÃO NECESSÁRIA');
    }
    
    // Salvar relatório em arquivo
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const relatorio = {
      timestamp,
      score: this.results.overall.score,
      status: this.results.overall.status,
      details: this.results
    };
    
    const filename = `reports/monitor-sistema-${timestamp}.json`;
    
    try {
      if (!fs.existsSync('reports')) {
        fs.mkdirSync('reports');
      }
      fs.writeFileSync(filename, JSON.stringify(relatorio, null, 2));
      console.log(`\n💾 Relatório salvo em: ${filename}`);
    } catch (error) {
      console.log(`\n⚠️ Não foi possível salvar o relatório: ${error.message}`);
    }
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new MonitorSistemaCompleto();
  monitor.monitorarTudo().then(score => {
    const exitCode = score >= 70 ? 0 : score >= 50 ? 1 : 2;
    process.exit(exitCode);
  }).catch(error => {
    console.error('❌ Erro fatal no monitoramento:', error);
    process.exit(3);
  });
}

export { MonitorSistemaCompleto };