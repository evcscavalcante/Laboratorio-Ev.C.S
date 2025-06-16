/**
 * MONITOR AUTOMÁTICO DE NOVOS ENDPOINTS
 * Detecta e testa automaticamente novos endpoints adicionados ao projeto
 */

import fs from 'fs';
import path from 'path';
import TestadorEndpointsCompleto from './test-todos-endpoints-completo.js';

class MonitorNovosEndpoints {
  constructor() {
    this.serverFile = 'server/index.ts';
    this.endpointsKnownFile = 'scripts/.endpoints-conhecidos.json';
    this.knownEndpoints = this.loadKnownEndpoints();
  }

  loadKnownEndpoints() {
    try {
      if (fs.existsSync(this.endpointsKnownFile)) {
        return JSON.parse(fs.readFileSync(this.endpointsKnownFile, 'utf8'));
      }
    } catch (error) {
      console.log('Criando arquivo de endpoints conhecidos...');
    }
    return [];
  }

  saveKnownEndpoints(endpoints) {
    fs.writeFileSync(this.endpointsKnownFile, JSON.stringify(endpoints, null, 2));
  }

  extractEndpointsFromServer() {
    const serverContent = fs.readFileSync(this.serverFile, 'utf8');
    const endpointRegex = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const endpoints = [];
    let match;

    while ((match = endpointRegex.exec(serverContent)) !== null) {
      const [, method, url] = match;
      
      // Pular endpoints de assets e middleware genérico
      if (url.includes('*') || url.startsWith('/src/') || url.startsWith('/@')) {
        continue;
      }

      endpoints.push({
        method: method.toUpperCase(),
        url: url,
        detected: new Date().toISOString()
      });
    }

    return endpoints;
  }

  findNewEndpoints() {
    const currentEndpoints = this.extractEndpointsFromServer();
    const knownUrls = new Set(this.knownEndpoints.map(ep => `${ep.method} ${ep.url}`));
    
    return currentEndpoints.filter(ep => 
      !knownUrls.has(`${ep.method} ${ep.url}`)
    );
  }

  async testNewEndpoint(endpoint) {
    console.log(`🔍 Testando novo endpoint: ${endpoint.method} ${endpoint.url}`);
    
    const testador = new TestadorEndpointsCompleto();
    
    // Criar um endpoint de teste com configuração padrão
    const testEndpoint = {
      method: endpoint.method,
      url: endpoint.url,
      description: `Novo endpoint detectado: ${endpoint.method} ${endpoint.url}`,
      requiresAuth: true, // Assumir proteção por padrão
      category: 'new-endpoint',
      critical: true // Marcar como crítico para análise
    };

    const result = await testador.testEndpoint(testEndpoint);
    return result;
  }

  async monitorar() {
    console.log('\n🔍 MONITOR DE NOVOS ENDPOINTS');
    console.log('============================');
    
    const newEndpoints = this.findNewEndpoints();
    
    if (newEndpoints.length === 0) {
      console.log('✅ Nenhum novo endpoint detectado');
      return true;
    }

    console.log(`🆕 ${newEndpoints.length} novos endpoints detectados:`);
    newEndpoints.forEach(ep => {
      console.log(`   ${ep.method} ${ep.url}`);
    });

    console.log('\n🧪 Testando novos endpoints...');
    const results = [];
    
    for (const endpoint of newEndpoints) {
      const result = await this.testNewEndpoint(endpoint);
      results.push(result);
      
      if (result.status === 'CRITICAL_VULNERABILITY') {
        console.log(`❌ VULNERABILIDADE CRÍTICA: ${endpoint.method} ${endpoint.url}`);
        console.log(`   ${result.securityIssues.join(', ')}`);
      } else if (result.status === 'SECURE' || result.status === 'OK') {
        console.log(`✅ Seguro: ${endpoint.method} ${endpoint.url}`);
      } else {
        console.log(`⚠️  Atenção: ${endpoint.method} ${endpoint.url} - ${result.status}`);
      }
    }

    // Atualizar lista de endpoints conhecidos
    const allEndpoints = [...this.knownEndpoints, ...newEndpoints];
    this.saveKnownEndpoints(allEndpoints);

    // Gerar relatório
    const criticalCount = results.filter(r => r.status === 'CRITICAL_VULNERABILITY').length;
    const secureCount = results.filter(r => r.status === 'SECURE' || r.status === 'OK').length;

    console.log('\n📊 RESUMO DO MONITORAMENTO:');
    console.log(`   Novos endpoints: ${newEndpoints.length}`);
    console.log(`   Seguros: ${secureCount}`);
    console.log(`   Vulnerabilidades críticas: ${criticalCount}`);

    if (criticalCount > 0) {
      console.log('\n⚠️  AÇÃO NECESSÁRIA: Novos endpoints com vulnerabilidades detectadas');
      return false;
    }

    console.log('\n✅ Todos os novos endpoints são seguros');
    return true;
  }

  // Função para inicializar o monitor com endpoints atuais
  async inicializar() {
    console.log('🔧 Inicializando monitor de endpoints...');
    
    const currentEndpoints = this.extractEndpointsFromServer();
    this.saveKnownEndpoints(currentEndpoints);
    
    console.log(`📊 ${currentEndpoints.length} endpoints registrados como conhecidos`);
    console.log('✅ Monitor inicializado com sucesso');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new MonitorNovosEndpoints();
  
  const action = process.argv[2];
  
  if (action === 'init') {
    monitor.inicializar()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('❌ Erro na inicialização:', error);
        process.exit(1);
      });
  } else {
    monitor.monitorar()
      .then(result => {
        process.exit(result ? 0 : 1);
      })
      .catch(error => {
        console.error('❌ Erro no monitoramento:', error);
        process.exit(1);
      });
  }
}

export default MonitorNovosEndpoints;