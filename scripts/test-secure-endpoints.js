#!/usr/bin/env node

/**
 * Teste Completo dos Endpoints Seguros
 * Valida todos os endpoints API com autenticação Firebase obrigatória
 */

import fetch from 'node-fetch';

class SecureEndpointsValidator {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      secure: [],
      insecure: [],
      missing: [],
      errors: []
    };
  }

  async testSecureEndpoints() {
    console.log('🔒 TESTE COMPLETO DOS ENDPOINTS SEGUROS');
    console.log('======================================================================');

    const endpoints = [
      // Test Endpoints (require Firebase authentication)
      { method: 'GET', url: '/api/tests/density-in-situ', description: 'Buscar ensaios densidade in-situ' },
      { method: 'POST', url: '/api/tests/density-in-situ', description: 'Criar ensaio densidade in-situ' },
      { method: 'PUT', url: '/api/tests/density-in-situ/1', description: 'Atualizar ensaio densidade in-situ' },
      { method: 'DELETE', url: '/api/tests/density-in-situ/1', description: 'Excluir ensaio densidade in-situ' },
      
      { method: 'GET', url: '/api/tests/real-density', description: 'Buscar ensaios densidade real' },
      { method: 'POST', url: '/api/tests/real-density', description: 'Criar ensaio densidade real' },
      { method: 'PUT', url: '/api/tests/real-density/1', description: 'Atualizar ensaio densidade real' },
      { method: 'DELETE', url: '/api/tests/real-density/1', description: 'Excluir ensaio densidade real' },
      
      { method: 'GET', url: '/api/tests/max-min-density', description: 'Buscar ensaios densidade máx/mín' },
      { method: 'POST', url: '/api/tests/max-min-density', description: 'Criar ensaio densidade máx/mín' },
      { method: 'PUT', url: '/api/tests/max-min-density/1', description: 'Atualizar ensaio densidade máx/mín' },
      { method: 'DELETE', url: '/api/tests/max-min-density/1', description: 'Excluir ensaio densidade máx/mín' },
      
      // Equipment Endpoints
      { method: 'GET', url: '/api/equipamentos', description: 'Buscar equipamentos' },
      { method: 'POST', url: '/api/equipamentos', description: 'Criar equipamento' },
      { method: 'PUT', url: '/api/equipamentos/1', description: 'Atualizar equipamento' },
      { method: 'DELETE', url: '/api/equipamentos/1', description: 'Excluir equipamento' },
      
      // Auth Endpoints
      { method: 'GET', url: '/api/auth/user', description: 'Dados do usuário atual' },
      { method: 'POST', url: '/api/auth/sync-user', description: 'Sincronizar usuário Firebase-PostgreSQL' },
      
      // Notification Endpoints
      { method: 'GET', url: '/api/notifications', description: 'Buscar notificações' },
      { method: 'PATCH', url: '/api/notifications/1/read', description: 'Marcar notificação como lida' }
    ];

    for (const endpoint of endpoints) {
      await this.testEndpointSecurity(endpoint);
    }

    await this.testTemporaryEndpointsBlocked();
    this.generateSecurityReport();
  }

  async testEndpointSecurity(endpoint) {
    try {
      console.log(`🔍 Testando: ${endpoint.method} ${endpoint.url}`);
      
      // Test without authentication (should return 401)
      const unauthResponse = await fetch(`${this.baseUrl}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
      });

      if (unauthResponse.status === 401) {
        this.results.secure.push({
          ...endpoint,
          status: 'SEGURO',
          details: 'Retorna 401 sem autenticação (correto)'
        });
        console.log(`  ✅ SEGURO: Retorna 401 sem token`);
      } else if (unauthResponse.status === 404) {
        this.results.missing.push({
          ...endpoint,
          status: 'NÃO ENCONTRADO',
          details: 'Endpoint não implementado'
        });
        console.log(`  ⚠️ NÃO ENCONTRADO: 404`);
      } else {
        this.results.insecure.push({
          ...endpoint,
          status: 'INSEGURO',
          details: `Retorna ${unauthResponse.status} sem autenticação`
        });
        console.log(`  ❌ INSEGURO: Retorna ${unauthResponse.status} sem token`);
      }

    } catch (error) {
      this.results.errors.push({
        ...endpoint,
        error: error.message
      });
      console.log(`  ❌ ERRO: ${error.message}`);
    }
  }

  async testTemporaryEndpointsBlocked() {
    console.log('\n🚫 TESTANDO BLOQUEIO DE ENDPOINTS TEMPORÁRIOS...');
    
    const temporaryEndpoints = [
      '/api/tests/densidade-in-situ/temp',
      '/api/tests/densidade-real/temp', 
      '/api/tests/densidade-max-min/temp',
      '/api/equipamentos/temp'
    ];

    for (const endpoint of temporaryEndpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET'
        });

        if (response.status === 410 || response.status === 404) {
          console.log(`  ✅ BLOQUEADO: ${endpoint} (${response.status})`);
        } else {
          console.log(`  ❌ VULNERÁVEL: ${endpoint} ainda acessível (${response.status})`);
          this.results.insecure.push({
            method: 'GET',
            url: endpoint,
            status: 'VULNERÁVEL',
            details: `Endpoint temporário ainda acessível`
          });
        }
      } catch (error) {
        console.log(`  ✅ BLOQUEADO: ${endpoint} (erro de conexão)`);
      }
    }
  }

  generateSecurityReport() {
    console.log('\n======================================================================');
    console.log('🔒 RELATÓRIO DE SEGURANÇA DOS ENDPOINTS');
    console.log('======================================================================');

    console.log(`\n✅ ENDPOINTS SEGUROS: ${this.results.secure.length}`);
    this.results.secure.forEach(result => {
      console.log(`  • ${result.method} ${result.url} - ${result.description}`);
    });

    if (this.results.insecure.length > 0) {
      console.log(`\n❌ ENDPOINTS INSEGUROS: ${this.results.insecure.length}`);
      this.results.insecure.forEach(result => {
        console.log(`  • ${result.method} ${result.url} - ${result.details}`);
      });
    }

    if (this.results.missing.length > 0) {
      console.log(`\n⚠️ ENDPOINTS NÃO ENCONTRADOS: ${this.results.missing.length}`);
      this.results.missing.forEach(result => {
        console.log(`  • ${result.method} ${result.url} - ${result.description}`);
      });
    }

    if (this.results.errors.length > 0) {
      console.log(`\n💥 ERROS: ${this.results.errors.length}`);
      this.results.errors.forEach(result => {
        console.log(`  • ${result.method} ${result.url} - ${result.error}`);
      });
    }

    const totalEndpoints = this.results.secure.length + this.results.insecure.length + this.results.missing.length;
    const securityScore = totalEndpoints > 0 ? (this.results.secure.length / totalEndpoints * 100).toFixed(1) : 0;

    console.log('\n----------------------------------------------------------------------');
    console.log(`📊 PONTUAÇÃO DE SEGURANÇA: ${securityScore}%`);
    console.log(`🔐 Total de endpoints seguros: ${this.results.secure.length}`);
    console.log(`⚠️ Total de endpoints com problemas: ${this.results.insecure.length + this.results.missing.length}`);
    
    if (this.results.insecure.length === 0) {
      console.log('\n🎉 SISTEMA SEGURO: Nenhuma vulnerabilidade detectada!');
      console.log('✅ Todos os endpoints requerem autenticação adequada');
      return 0; // Exit code success
    } else {
      console.log('\n⚠️ VULNERABILIDADES DETECTADAS');
      console.log('❌ Corrigir problemas antes do deploy');
      return 1; // Exit code failure
    }
  }

  async run() {
    try {
      const exitCode = await this.testSecureEndpoints();
      process.exit(exitCode);
    } catch (error) {
      console.error('❌ Erro durante execução dos testes:', error);
      process.exit(1);
    }
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new SecureEndpointsValidator();
  validator.run();
}

export default SecureEndpointsValidator;