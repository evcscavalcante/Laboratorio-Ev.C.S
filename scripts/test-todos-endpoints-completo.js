/**
 * TESTE ABRANGENTE DE TODOS OS ENDPOINTS DO PROJETO
 * Verifica vazamentos de dados e vulnerabilidades de segurança
 * Executa testes rigorosos em TODOS os endpoints identificados
 */

import fetch from 'node-fetch';

class TestadorEndpointsCompleto {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      critical: 0,
      details: []
    };
    
    // MAPEAMENTO COMPLETO DE TODOS OS ENDPOINTS DO PROJETO
    this.endpoints = [
      // === ENDPOINTS DE OBSERVABILIDADE (PÚBLICOS) ===
      { method: 'GET', url: '/api/health', description: 'Health check do sistema', requiresAuth: false, category: 'observability' },
      { method: 'GET', url: '/api/metrics', description: 'Métricas do sistema', requiresAuth: false, category: 'observability' },
      { method: 'GET', url: '/api/metrics/performance', description: 'Métricas de performance', requiresAuth: false, category: 'observability' },
      { method: 'GET', url: '/api/metrics/errors', description: 'Métricas de erros', requiresAuth: false, category: 'observability' },
      { method: 'GET', url: '/api/alerts', description: 'Alertas do sistema', requiresAuth: false, category: 'observability' },
      { method: 'GET', url: '/api/observability/dashboard', description: 'Dashboard de observabilidade', requiresAuth: false, category: 'observability' },
      
      // === ENDPOINTS DE AUTENTICAÇÃO ===
      { method: 'GET', url: '/api/auth/user', description: 'Dados do usuário autenticado', requiresAuth: true, category: 'auth', roles: ['ALL'] },
      { method: 'POST', url: '/api/auth/sync-user', description: 'Sincronizar usuário Firebase-PostgreSQL', requiresAuth: true, category: 'auth', roles: ['ALL'] },
      { method: 'POST', url: '/api/auth/set-role', description: 'Definir role de usuário', requiresAuth: true, category: 'auth', roles: ['ADMIN', 'DEVELOPER'] },
      
      // === ENDPOINTS DE ASSINATURA (PÚBLICOS) ===
      { method: 'GET', url: '/api/subscription/plans', description: 'Planos de assinatura', requiresAuth: false, category: 'subscription' },
      
      // === ENDPOINTS DE USUÁRIO ===
      { method: 'GET', url: '/api/user/permissions', description: 'Permissões do usuário', requiresAuth: true, category: 'user', roles: ['ALL'] },
      
      // === ENDPOINTS ADMINISTRATIVOS ===
      { method: 'GET', url: '/api/admin/users', description: 'Lista de usuários (ADMIN)', requiresAuth: true, category: 'admin', roles: ['ADMIN'] },
      { method: 'GET', url: '/api/developer/system-info', description: 'Informações do sistema (DEVELOPER)', requiresAuth: true, category: 'admin', roles: ['DEVELOPER'] },
      
      // === ENDPOINTS DE NOTIFICAÇÕES ===
      { method: 'GET', url: '/api/notifications', description: 'Buscar notificações', requiresAuth: true, category: 'notifications', roles: ['ADMIN', 'DEVELOPER'] },
      { method: 'PATCH', url: '/api/notifications/1/read', description: 'Marcar notificação como lida', requiresAuth: true, category: 'notifications', roles: ['ADMIN', 'DEVELOPER'] },
      { method: 'PATCH', url: '/api/notifications/mark-all-read', description: 'Marcar todas como lidas', requiresAuth: true, category: 'notifications', roles: ['ADMIN', 'DEVELOPER'] },
      
      // === ENDPOINTS DE PAGAMENTO ===
      { method: 'GET', url: '/api/payment/config', description: 'Configuração de pagamento', requiresAuth: true, category: 'payment', roles: ['ALL'] },
      
      // === ENDPOINTS DE ENSAIOS - DENSIDADE IN-SITU ===
      { method: 'GET', url: '/api/ensaios/densidade-in-situ', description: 'Ensaios densidade in-situ (legacy)', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      { method: 'GET', url: '/api/tests/density-in-situ', description: 'Buscar ensaios densidade in-situ', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      { method: 'POST', url: '/api/tests/density-in-situ', description: 'Criar ensaio densidade in-situ', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      { method: 'PUT', url: '/api/tests/density-in-situ/1', description: 'Atualizar ensaio densidade in-situ', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      { method: 'DELETE', url: '/api/tests/density-in-situ/1', description: 'Excluir ensaio densidade in-situ', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      
      // === ENDPOINTS DE ENSAIOS - DENSIDADE REAL ===
      { method: 'GET', url: '/api/tests/real-density', description: 'Buscar ensaios densidade real', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      { method: 'POST', url: '/api/tests/real-density', description: 'Criar ensaio densidade real', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      { method: 'PUT', url: '/api/tests/real-density/1', description: 'Atualizar ensaio densidade real', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      { method: 'DELETE', url: '/api/tests/real-density/1', description: 'Excluir ensaio densidade real', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      
      // === ENDPOINTS DE ENSAIOS - DENSIDADE MÁX/MÍN ===
      { method: 'GET', url: '/api/tests/max-min-density', description: 'Buscar ensaios densidade máx/mín', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      { method: 'POST', url: '/api/tests/max-min-density', description: 'Criar ensaio densidade máx/mín', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      { method: 'PUT', url: '/api/tests/max-min-density/1', description: 'Atualizar ensaio densidade máx/mín', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      { method: 'DELETE', url: '/api/tests/max-min-density/1', description: 'Excluir ensaio densidade máx/mín', requiresAuth: true, category: 'tests', roles: ['ALL'] },
      
      // === ENDPOINTS DE ORGANIZAÇÕES ===
      { method: 'GET', url: '/api/organizations/user-counts', description: 'Contadores de usuários por organização', requiresAuth: false, category: 'organizations', critical: true },
      { method: 'GET', url: '/api/organizations', description: 'Lista de organizações', requiresAuth: true, category: 'organizations', roles: ['ALL'] },
      { method: 'POST', url: '/api/organizations', description: 'Criar organização', requiresAuth: true, category: 'organizations', roles: ['ADMIN', 'DEVELOPER'] },
      
      // === ENDPOINTS DE USUÁRIOS (CRÍTICO - VAZAMENTO DETECTADO) ===
      { method: 'GET', url: '/api/users', description: 'Lista de usuários', requiresAuth: true, category: 'users', roles: ['ALL'], critical: true },
      
      // === ENDPOINTS DE EQUIPAMENTOS ===
      { method: 'GET', url: '/api/equipamentos', description: 'Buscar equipamentos', requiresAuth: true, category: 'equipment', roles: ['ALL'] },
      { method: 'POST', url: '/api/equipamentos', description: 'Criar equipamento', requiresAuth: true, category: 'equipment', roles: ['ALL'] },
      { method: 'PUT', url: '/api/equipamentos/1', description: 'Atualizar equipamento', requiresAuth: true, category: 'equipment', roles: ['ALL'] },
      { method: 'DELETE', url: '/api/equipamentos/1', description: 'Excluir equipamento', requiresAuth: true, category: 'equipment', roles: ['MANAGER', 'ADMIN', 'DEVELOPER'] },
      
      // === ENDPOINTS LGPD (PÚBLICOS) ===
      { method: 'GET', url: '/api/lgpd/terms', description: 'Termos de uso LGPD', requiresAuth: false, category: 'lgpd' },
      { method: 'GET', url: '/api/lgpd/privacy-policy', description: 'Política de privacidade LGPD', requiresAuth: false, category: 'lgpd' },
      { method: 'POST', url: '/api/lgpd/consent', description: 'Registrar consentimento LGPD', requiresAuth: false, category: 'lgpd' },
      { method: 'GET', url: '/api/lgpd/my-data', description: 'Meus dados LGPD', requiresAuth: false, category: 'lgpd' },
      { method: 'POST', url: '/api/lgpd/request-deletion', description: 'Solicitar exclusão LGPD', requiresAuth: false, category: 'lgpd' }
    ];
  }

  async testEndpoint(endpoint) {
    const testResult = {
      endpoint: `${endpoint.method} ${endpoint.url}`,
      description: endpoint.description,
      category: endpoint.category,
      requiresAuth: endpoint.requiresAuth,
      roles: endpoint.roles || [],
      status: 'UNKNOWN',
      responseCode: null,
      securityIssues: [],
      dataLeakage: false,
      critical: endpoint.critical || false
    };

    try {
      // Teste 1: Acesso sem autenticação
      const unauthResponse = await this.makeRequest(endpoint.method, endpoint.url);
      testResult.responseCode = unauthResponse.status;

      if (endpoint.requiresAuth) {
        // Endpoint protegido - deve retornar 401
        if (unauthResponse.status === 200) {
          testResult.status = 'CRITICAL_VULNERABILITY';
          testResult.securityIssues.push('Endpoint protegido acessível sem autenticação');
          testResult.dataLeakage = true;
          this.results.critical++;
        } else if (unauthResponse.status === 401) {
          testResult.status = 'SECURE';
        } else {
          testResult.status = 'WARNING';
          testResult.securityIssues.push(`Status inesperado: ${unauthResponse.status}`);
        }
      } else {
        // Endpoint público - deve ser acessível
        if (unauthResponse.status === 200) {
          testResult.status = 'OK';
        } else {
          testResult.status = 'WARNING';
          testResult.securityIssues.push(`Endpoint público inacessível: ${unauthResponse.status}`);
        }
      }

      // Teste 2: Verificar vazamento de dados (apenas para endpoints que retornaram 200)
      if (unauthResponse.status === 200) {
        const responseText = await unauthResponse.text();
        if (this.detectDataLeakage(responseText, endpoint)) {
          testResult.dataLeakage = true;
          testResult.securityIssues.push('Possível vazamento de dados detectado');
          if (endpoint.requiresAuth) {
            testResult.status = 'CRITICAL_VULNERABILITY';
            this.results.critical++;
          }
        }
      }

      // Teste 3: Para endpoints protegidos, testar com token válido
      if (endpoint.requiresAuth && testResult.status !== 'CRITICAL_VULNERABILITY') {
        const authResponse = await this.makeRequest(endpoint.method, endpoint.url, true);
        if (authResponse.status === 200) {
          testResult.securityIssues.push('Autenticação funcionando corretamente');
        } else if (authResponse.status === 500) {
          testResult.status = 'CRITICAL_VULNERABILITY';
          testResult.securityIssues.push(`Erro 500 (falha interna do servidor) - possível problema de banco de dados`);
          this.results.critical++;
        } else if (authResponse.status >= 400) {
          testResult.status = 'WARNING';
          testResult.securityIssues.push(`Erro ${authResponse.status} com autenticação válida`);
        }
      }

    } catch (error) {
      testResult.status = 'ERROR';
      testResult.securityIssues.push(`Erro no teste: ${error.message}`);
    }

    return testResult;
  }

  async makeRequest(method, url, useAuth = false) {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Security Test Suite)'
      }
    };

    if (useAuth) {
      options.headers['Authorization'] = 'Bearer fake-token-for-testing';
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      options.body = JSON.stringify({ test: 'data' });
    }

    return await fetch(`${this.baseUrl}${url}`, options);
  }

  detectDataLeakage(responseText, endpoint) {
    // Padrões que indicam vazamento de dados sensíveis
    const sensitivePatterns = [
      /email.*@.*\./i,  // Email addresses
      /password/i,      // Password fields
      /token/i,         // Tokens
      /uid.*[a-zA-Z0-9]/i, // UIDs
      /organizationId.*\d+/i, // Organization IDs
      /firebase_uid/i,  // Firebase UIDs
      /"id":\s*\d+/i,   // Database IDs
      /\b[0-9]{10,}\b/  // Long numbers (possible IDs)
    ];

    // Para endpoints LGPD e observabilidade, alguns dados são esperados
    if (endpoint.category === 'lgpd' || endpoint.category === 'observability') {
      return false;
    }

    return sensitivePatterns.some(pattern => pattern.test(responseText));
  }

  async executarTestes() {
    console.log('\n🔒 TESTE ABRANGENTE DE TODOS OS ENDPOINTS');
    console.log('==========================================');
    console.log(`📊 Total de endpoints a testar: ${this.endpoints.length}`);
    console.log(`🌐 URL base: ${this.baseUrl}`);
    
    const startTime = Date.now();
    
    for (const endpoint of this.endpoints) {
      console.log(`\n🔍 Testando ${endpoint.method} ${endpoint.url}...`);
      const result = await this.testEndpoint(endpoint);
      this.results.details.push(result);
      this.results.total++;
      
      if (result.status === 'SECURE' || result.status === 'OK') {
        this.results.passed++;
        console.log(`✅ ${result.status}`);
      } else {
        this.results.failed++;
        console.log(`❌ ${result.status} - ${result.securityIssues.join(', ')}`);
      }
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    await this.gerarRelatorioFinal(duration);
  }

  async gerarRelatorioFinal(duration) {
    console.log('\n📋 RELATÓRIO FINAL DE SEGURANÇA');
    console.log('===============================');
    console.log(`⏱️  Duração dos testes: ${duration}s`);
    console.log(`📊 Endpoints testados: ${this.results.total}`);
    console.log(`✅ Aprovados: ${this.results.passed}`);
    console.log(`❌ Reprovados: ${this.results.failed}`);
    console.log(`🚨 Vulnerabilidades críticas: ${this.results.critical}`);
    
    // Categorizar problemas
    const categories = {};
    const criticalIssues = [];
    
    this.results.details.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = { total: 0, passed: 0, failed: 0 };
      }
      categories[result.category].total++;
      
      if (result.status === 'SECURE' || result.status === 'OK') {
        categories[result.category].passed++;
      } else {
        categories[result.category].failed++;
        
        if (result.status === 'CRITICAL_VULNERABILITY' || result.critical) {
          criticalIssues.push(result);
        }
      }
    });
    
    console.log('\n📈 RESULTADOS POR CATEGORIA:');
    Object.entries(categories).forEach(([category, stats]) => {
      const percentage = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`   ${category}: ${stats.passed}/${stats.total} (${percentage}%)`);
    });
    
    if (criticalIssues.length > 0) {
      console.log('\n🚨 VULNERABILIDADES CRÍTICAS DETECTADAS:');
      criticalIssues.forEach(issue => {
        console.log(`   ❌ ${issue.endpoint}: ${issue.securityIssues.join(', ')}`);
      });
    }
    
    // Calcular score de segurança
    const securityScore = Math.round(((this.results.passed - this.results.critical * 2) / this.results.total) * 100);
    let securityStatus = 'CRÍTICO';
    
    if (securityScore >= 90) securityStatus = 'EXCELENTE';
    else if (securityScore >= 80) securityStatus = 'BOM';
    else if (securityScore >= 70) securityStatus = 'ACEITÁVEL';
    else if (securityScore >= 60) securityStatus = 'PREOCUPANTE';
    
    console.log(`\n🎯 PONTUAÇÃO DE SEGURANÇA: ${securityScore}/100 - STATUS ${securityStatus}`);
    
    if (this.results.critical > 0) {
      console.log('\n⚠️  SISTEMA NÃO ESTÁ PRONTO PARA PRODUÇÃO');
      console.log('    Vulnerabilidades críticas precisam ser corrigidas');
      return false;
    } else if (securityScore >= 80) {
      console.log('\n✅ SISTEMA APROVADO PARA PRODUÇÃO');
      return true;
    } else {
      console.log('\n⚠️  SISTEMA PRECISA DE MELHORIAS DE SEGURANÇA');
      return false;
    }
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const testador = new TestadorEndpointsCompleto();
  testador.executarTestes()
    .then(result => {
      process.exit(result ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro durante execução dos testes:', error);
      process.exit(1);
    });
}

export default TestadorEndpointsCompleto;