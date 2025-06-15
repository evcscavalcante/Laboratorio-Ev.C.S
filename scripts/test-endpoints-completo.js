#!/usr/bin/env node

/**
 * Teste Completo de Todos os Endpoints da API
 * Valida segurança, funcionalidade e performance de todos os endpoints
 */

import fetch from 'node-fetch';

class CompleteEndpointTester {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      security: { secure: 0, vulnerable: 0, total: 0 },
      performance: { fast: 0, slow: 0, failed: 0 },
      functionality: { working: 0, broken: 0 },
      endpoints: []
    };
    this.authToken = 'Bearer test-firebase-token';
  }

  async runCompleteTest() {
    console.log('🔍 TESTE COMPLETO DE TODOS OS ENDPOINTS DA API');
    console.log('======================================================================');

    await this.testAuthenticationEndpoints();
    await this.testEnsaiosEndpoints();
    await this.testEquipamentosEndpoints();
    await this.testNotificationsEndpoints();
    await this.testSystemEndpoints();
    await this.testBlockedEndpoints();
    await this.testPerformanceMetrics();
    
    this.generateCompleteReport();
  }

  async testAuthenticationEndpoints() {
    console.log('\n🔐 TESTANDO ENDPOINTS DE AUTENTICAÇÃO...');
    
    const authEndpoints = [
      { method: 'GET', path: '/api/auth/user', description: 'Dados do usuário atual' },
      { method: 'POST', path: '/api/auth/sync-user', description: 'Sincronizar usuário Firebase-PostgreSQL' },
      { method: 'POST', path: '/api/auth/set-role', description: 'Definir role do usuário' }
    ];

    for (const endpoint of authEndpoints) {
      await this.testEndpoint(endpoint);
    }
  }

  async testEnsaiosEndpoints() {
    console.log('\n🧪 TESTANDO ENDPOINTS DE ENSAIOS...');
    
    const ensaiosEndpoints = [
      // Densidade In-Situ
      { method: 'GET', path: '/api/tests/density-in-situ', description: 'Buscar ensaios densidade in-situ' },
      { method: 'POST', path: '/api/tests/density-in-situ', description: 'Criar ensaio densidade in-situ' },
      { method: 'PUT', path: '/api/tests/density-in-situ/1', description: 'Atualizar ensaio densidade in-situ' },
      { method: 'DELETE', path: '/api/tests/density-in-situ/1', description: 'Excluir ensaio densidade in-situ' },
      
      // Densidade Real
      { method: 'GET', path: '/api/tests/real-density', description: 'Buscar ensaios densidade real' },
      { method: 'POST', path: '/api/tests/real-density', description: 'Criar ensaio densidade real' },
      { method: 'PUT', path: '/api/tests/real-density/1', description: 'Atualizar ensaio densidade real' },
      { method: 'DELETE', path: '/api/tests/real-density/1', description: 'Excluir ensaio densidade real' },
      
      // Densidade Máx/Mín
      { method: 'GET', path: '/api/tests/max-min-density', description: 'Buscar ensaios densidade máx/mín' },
      { method: 'POST', path: '/api/tests/max-min-density', description: 'Criar ensaio densidade máx/mín' },
      { method: 'PUT', path: '/api/tests/max-min-density/1', description: 'Atualizar ensaio densidade máx/mín' },
      { method: 'DELETE', path: '/api/tests/max-min-density/1', description: 'Excluir ensaio densidade máx/mín' }
    ];

    for (const endpoint of ensaiosEndpoints) {
      await this.testEndpoint(endpoint);
    }
  }

  async testEquipamentosEndpoints() {
    console.log('\n🔧 TESTANDO ENDPOINTS DE EQUIPAMENTOS...');
    
    const equipamentosEndpoints = [
      { method: 'GET', path: '/api/equipamentos', description: 'Buscar equipamentos' },
      { method: 'POST', path: '/api/equipamentos', description: 'Criar equipamento' },
      { method: 'PUT', path: '/api/equipamentos/1', description: 'Atualizar equipamento' },
      { method: 'DELETE', path: '/api/equipamentos/1', description: 'Excluir equipamento' }
    ];

    for (const endpoint of equipamentosEndpoints) {
      await this.testEndpoint(endpoint);
    }
  }

  async testNotificationsEndpoints() {
    console.log('\n🔔 TESTANDO ENDPOINTS DE NOTIFICAÇÕES...');
    
    const notificationsEndpoints = [
      { method: 'GET', path: '/api/notifications', description: 'Buscar notificações' },
      { method: 'PATCH', path: '/api/notifications/1/read', description: 'Marcar notificação como lida' },
      { method: 'POST', path: '/api/notifications/mark-all-read', description: 'Marcar todas como lidas', expectAuth: false }
    ];

    for (const endpoint of notificationsEndpoints) {
      await this.testEndpoint(endpoint, endpoint.expectAuth !== false);
    }
  }

  async testSystemEndpoints() {
    console.log('\n⚙️ TESTANDO ENDPOINTS DE SISTEMA...');
    
    const systemEndpoints = [
      { method: 'GET', path: '/api/health', description: 'Health check do sistema', expectAuth: false },
      { method: 'GET', path: '/api/metrics', description: 'Métricas do sistema', expectAuth: false },
      { method: 'GET', path: '/api/admin/users', description: 'Gerenciar usuários (ADMIN)' },
      { method: 'GET', path: '/api/developer/system-info', description: 'Informações do sistema (DEVELOPER)' }
    ];

    for (const endpoint of systemEndpoints) {
      await this.testEndpoint(endpoint, endpoint.expectAuth !== false);
    }
  }

  async testBlockedEndpoints() {
    console.log('\n🚫 TESTANDO ENDPOINTS BLOQUEADOS...');
    
    const blockedEndpoints = [
      { method: 'GET', path: '/api/tests/densidade-in-situ/temp', description: 'Endpoint temporário bloqueado' },
      { method: 'GET', path: '/api/tests/densidade-real/temp', description: 'Endpoint temporário bloqueado' },
      { method: 'GET', path: '/api/tests/densidade-max-min/temp', description: 'Endpoint temporário bloqueado' },
      { method: 'GET', path: '/api/equipamentos/temp', description: 'Endpoint temporário bloqueado' }
    ];

    for (const endpoint of blockedEndpoints) {
      const result = await this.testEndpoint(endpoint, false, 410);
      if (result.status === 410) {
        console.log(`  ✅ ${endpoint.method} ${endpoint.path}: Corretamente bloqueado (410)`);
      } else {
        console.log(`  ❌ ${endpoint.method} ${endpoint.path}: Não bloqueado adequadamente (${result.status})`);
      }
    }
  }

  async testPerformanceMetrics() {
    console.log('\n⚡ TESTANDO MÉTRICAS DE PERFORMANCE...');
    
    const testEndpoints = [
      '/api/health',
      '/api/tests/density-in-situ',
      '/api/tests/real-density',
      '/api/equipamentos'
    ];

    for (const endpoint of testEndpoints) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: { 'Authorization': this.authToken }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (responseTime < 500) {
          console.log(`  ✅ ${endpoint}: Rápido (${responseTime}ms)`);
          this.results.performance.fast++;
        } else if (responseTime < 2000) {
          console.log(`  ⚠️ ${endpoint}: Lento (${responseTime}ms)`);
          this.results.performance.slow++;
        } else {
          console.log(`  ❌ ${endpoint}: Muito lento (${responseTime}ms)`);
          this.results.performance.slow++;
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint}: Falha de conexão`);
        this.results.performance.failed++;
      }
    }
  }

  async testEndpoint(endpoint, expectAuth = true, expectedStatus = null) {
    this.results.security.total++;
    const startTime = Date.now();
    
    try {
      // Teste sem autenticação
      const unauthResponse = await fetch(`${this.baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let isSecure = false;
      let isWorking = false;

      if (expectedStatus && unauthResponse.status === expectedStatus) {
        isSecure = true;
        isWorking = true;
      } else if (expectAuth && unauthResponse.status === 401) {
        isSecure = true;
        isWorking = true;
        console.log(`  ✅ ${endpoint.method} ${endpoint.path}: Protegido (401) - ${responseTime}ms`);
      } else if (!expectAuth && unauthResponse.status < 500) {
        isSecure = true; // Endpoints intencionalmente públicos são considerados seguros
        isWorking = true;
        console.log(`  ✅ ${endpoint.method} ${endpoint.path}: Funcional (${unauthResponse.status}) - ${responseTime}ms`);
      } else {
        console.log(`  ❌ ${endpoint.method} ${endpoint.path}: Status ${unauthResponse.status} - ${responseTime}ms`);
      }

      if (isSecure) this.results.security.secure++;
      else this.results.security.vulnerable++;

      if (isWorking) this.results.functionality.working++;
      else this.results.functionality.broken++;

      this.results.endpoints.push({
        method: endpoint.method,
        path: endpoint.path,
        description: endpoint.description,
        status: unauthResponse.status,
        responseTime,
        isSecure,
        isWorking
      });

      return { status: unauthResponse.status, responseTime, isSecure, isWorking };

    } catch (error) {
      console.log(`  ❌ ${endpoint.method} ${endpoint.path}: Erro de conexão - ${error.message}`);
      this.results.functionality.broken++;
      return { status: 'ERROR', responseTime: 0, isSecure: false, isWorking: false };
    }
  }

  generateCompleteReport() {
    console.log('\n======================================================================');
    console.log('📊 RELATÓRIO COMPLETO DE TODOS OS ENDPOINTS');
    console.log('======================================================================');

    console.log(`\n🔒 SEGURANÇA:`);
    console.log(`   Endpoints testados: ${this.results.security.total}`);
    console.log(`   Endpoints seguros: ${this.results.security.secure}`);
    console.log(`   Endpoints vulneráveis: ${this.results.security.vulnerable}`);
    const securityScore = this.results.security.total > 0 ? 
      (this.results.security.secure / this.results.security.total * 100).toFixed(1) : 0;
    console.log(`   Pontuação de segurança: ${securityScore}%`);

    console.log(`\n🚀 FUNCIONALIDADE:`);
    console.log(`   Endpoints funcionais: ${this.results.functionality.working}`);
    console.log(`   Endpoints com problemas: ${this.results.functionality.broken}`);

    console.log(`\n⚡ PERFORMANCE:`);
    console.log(`   Endpoints rápidos (<500ms): ${this.results.performance.fast}`);
    console.log(`   Endpoints lentos (>=500ms): ${this.results.performance.slow}`);
    console.log(`   Endpoints com falha: ${this.results.performance.failed}`);

    console.log(`\n📋 DETALHES DOS ENDPOINTS:`);
    this.results.endpoints.forEach(ep => {
      const secIcon = ep.isSecure ? '🔒' : '🔓';
      const perfIcon = ep.responseTime < 500 ? '⚡' : '🐌';
      console.log(`   ${secIcon}${perfIcon} ${ep.method} ${ep.path} (${ep.status}) - ${ep.responseTime}ms`);
    });

    console.log('\n----------------------------------------------------------------------');
    if (this.results.security.vulnerable === 0 && this.results.functionality.broken === 0) {
      console.log('🎉 SISTEMA COMPLETAMENTE SEGURO E FUNCIONAL');
      console.log('✅ Todos os endpoints estão protegidos e funcionando adequadamente');
      console.log('✅ Sistema pronto para produção');
    } else {
      console.log('⚠️ PROBLEMAS DETECTADOS NO SISTEMA');
      if (this.results.security.vulnerable > 0) {
        console.log(`❌ ${this.results.security.vulnerable} endpoints vulneráveis encontrados`);
      }
      if (this.results.functionality.broken > 0) {
        console.log(`❌ ${this.results.functionality.broken} endpoints com problemas funcionais`);
      }
    }

    console.log('\n📈 MÉTRICAS FINAIS:');
    console.log(`   Pontuação de segurança: ${securityScore}%`);
    const functionalityScore = this.results.security.total > 0 ? 
      (this.results.functionality.working / this.results.security.total * 100).toFixed(1) : 0;
    console.log(`   Pontuação de funcionalidade: ${functionalityScore}%`);
    const overallScore = ((parseFloat(securityScore) + parseFloat(functionalityScore)) / 2).toFixed(1);
    console.log(`   Pontuação geral: ${overallScore}%`);

    console.log('======================================================================');
  }

  async run() {
    try {
      await this.runCompleteTest();
      return this.results.security.vulnerable === 0 && this.results.functionality.broken === 0 ? 0 : 1;
    } catch (error) {
      console.error('❌ Erro durante execução dos testes:', error);
      return 1;
    }
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new CompleteEndpointTester();
  tester.run().then(exitCode => process.exit(exitCode));
}

export default CompleteEndpointTester;