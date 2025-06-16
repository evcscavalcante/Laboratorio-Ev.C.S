#!/usr/bin/env node

/**
 * SISTEMA DE DETECÇÃO DE ERROS DE RUNTIME
 * Detecta automaticamente problemas que escapam dos testes tradicionais
 * Inclui: erros 500, problemas de banco de dados, falhas de parsing JSON
 */

import fetch from 'node-fetch';

class RuntimeErrorDetector {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      total: 0,
      success: 0,
      runtimeErrors: 0,
      databaseErrors: 0,
      authErrors: 0,
      otherErrors: 0
    };
    this.detailedErrors = [];
  }

  async testEndpoint(endpoint, method = 'GET', requiresAuth = false) {
    this.results.total++;
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      console.log(`🔍 Testando ${method} ${endpoint}...`);
      
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Runtime Error Detector'
      };

      // Se requer autenticação, adicionar token de desenvolvimento
      if (requiresAuth) {
        headers['Authorization'] = 'Bearer dev-token-123';
      }

      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify({}) : undefined
      });

      const responseText = await response.text();
      
      // Analisar diferentes tipos de erro
      if (response.status === 500) {
        this.results.runtimeErrors++;
        this.detailedErrors.push({
          endpoint,
          type: 'RUNTIME_ERROR',
          status: 500,
          message: 'Erro interno do servidor',
          details: responseText
        });
        console.log(`❌ ERRO 500: ${endpoint}`);
        return false;
      }
      
      if (response.status === 401 || response.status === 403) {
        this.results.authErrors++;
        console.log(`🔐 AUTH: ${endpoint} (${response.status})`);
        return true; // Auth errors são esperados
      }

      // Verificar se resposta é JSON válido quando esperado
      if (response.headers.get('content-type')?.includes('application/json')) {
        try {
          const jsonData = JSON.parse(responseText);
          
          // Detectar erros específicos de banco de dados
          if (jsonData.error && jsonData.error.includes('database')) {
            this.results.databaseErrors++;
            this.detailedErrors.push({
              endpoint,
              type: 'DATABASE_ERROR',
              status: response.status,
              message: jsonData.error,
              details: jsonData
            });
            console.log(`💾 DB ERROR: ${endpoint}`);
            return false;
          }

          // Verificar se array é realmente array (problema do organizations.map)
          if (Array.isArray(jsonData)) {
            console.log(`✅ ARRAY OK: ${endpoint} (${jsonData.length} items)`);
          } else if (jsonData.error) {
            console.log(`⚠️ ERROR RESPONSE: ${endpoint} - ${jsonData.error}`);
          } else {
            console.log(`✅ JSON OK: ${endpoint}`);
          }
          
        } catch (parseError) {
          this.results.runtimeErrors++;
          this.detailedErrors.push({
            endpoint,
            type: 'JSON_PARSE_ERROR',
            status: response.status,
            message: 'Falha ao fazer parse do JSON',
            details: responseText
          });
          console.log(`❌ JSON PARSE: ${endpoint}`);
          return false;
        }
      }

      if (response.status >= 200 && response.status < 300) {
        this.results.success++;
        console.log(`✅ SUCCESS: ${endpoint}`);
        return true;
      }

      // Outros erros
      this.results.otherErrors++;
      console.log(`⚠️ OTHER: ${endpoint} (${response.status})`);
      return false;

    } catch (error) {
      this.results.runtimeErrors++;
      this.detailedErrors.push({
        endpoint,
        type: 'NETWORK_ERROR',
        message: error.message,
        details: error.stack
      });
      console.log(`❌ NETWORK: ${endpoint} - ${error.message}`);
      return false;
    }
  }

  async runTests() {
    console.log('🔍 INICIANDO DETECÇÃO DE ERROS DE RUNTIME...\n');

    // Endpoints críticos que devem funcionar
    const criticalEndpoints = [
      { path: '/api/organizations', auth: true },
      { path: '/api/organizations/user-counts', auth: false },
      { path: '/api/users', auth: true },
      { path: '/api/equipamentos', auth: true },
      { path: '/api/tests/density-in-situ', auth: true },
      { path: '/api/tests/real-density', auth: true },
      { path: '/api/tests/max-min-density', auth: true },
      { path: '/api/notifications', auth: true }
    ];

    for (const endpoint of criticalEndpoints) {
      await this.testEndpoint(endpoint.path, 'GET', endpoint.auth);
      await new Promise(resolve => setTimeout(resolve, 100)); // Evitar rate limiting
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 RELATÓRIO DE ERROS DE RUNTIME');
    console.log('=' .repeat(50));
    
    console.log(`📈 Total de testes: ${this.results.total}`);
    console.log(`✅ Sucessos: ${this.results.success}`);
    console.log(`❌ Erros de runtime: ${this.results.runtimeErrors}`);
    console.log(`💾 Erros de banco: ${this.results.databaseErrors}`);
    console.log(`🔐 Erros de auth: ${this.results.authErrors}`);
    console.log(`⚠️ Outros erros: ${this.results.otherErrors}`);

    if (this.detailedErrors.length > 0) {
      console.log('\n🚨 ERROS DETECTADOS:');
      this.detailedErrors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.type} - ${error.endpoint}`);
        console.log(`   Status: ${error.status || 'N/A'}`);
        console.log(`   Mensagem: ${error.message}`);
        if (error.details && typeof error.details === 'string' && error.details.length < 200) {
          console.log(`   Detalhes: ${error.details}`);
        }
      });
    }

    const successRate = ((this.results.success / this.results.total) * 100).toFixed(1);
    const criticalErrors = this.results.runtimeErrors + this.results.databaseErrors;
    
    console.log(`\n🎯 TAXA DE SUCESSO: ${successRate}%`);
    
    if (criticalErrors === 0) {
      console.log('🟢 STATUS: SISTEMA ESTÁVEL');
      return 0;
    } else if (criticalErrors <= 2) {
      console.log('🟡 STATUS: PROBLEMAS MENORES DETECTADOS');
      return 1;
    } else {
      console.log('🔴 STATUS: PROBLEMAS CRÍTICOS DETECTADOS');
      return 2;
    }
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const detector = new RuntimeErrorDetector();
  detector.runTests().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(3);
  });
}

export { RuntimeErrorDetector };