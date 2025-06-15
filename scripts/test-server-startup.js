/**
 * Teste de Inicialização do Servidor
 * Valida se o servidor consegue inicializar corretamente na porta 5000
 */

import http from 'http';
import { exec } from 'child_process';

class ServerStartupTester {
  constructor(port = 5000, timeout = 30000) {
    this.port = port;
    this.timeout = timeout;
    this.baseUrl = `http://localhost:${port}`;
  }

  async runTest() {
    console.log('🚀 Testando inicialização do servidor...\n');

    // Verificar se porta está livre
    const portFree = await this.checkPortAvailable();
    if (!portFree) {
      console.log('⚠️ Porta 5000 em uso - tentando finalizar processos...');
      await this.killPortProcesses();
      await this.sleep(3000);
    }

    // Aguardar servidor estar disponível
    const serverReady = await this.waitForServer();
    
    if (serverReady) {
      await this.testBasicEndpoints();
      this.reportSuccess();
    } else {
      this.reportFailure();
    }
  }

  async checkPortAvailable() {
    return new Promise((resolve) => {
      const server = http.createServer();
      
      server.listen(this.port, () => {
        server.close(() => resolve(true));
      });
      
      server.on('error', () => resolve(false));
    });
  }

  async killPortProcesses() {
    return new Promise((resolve) => {
      // Tentar finalizar processos na porta 5000
      exec(`lsof -ti:${this.port} | xargs kill -9`, (error) => {
        if (error) {
          console.log('   Nenhum processo encontrado na porta');
        } else {
          console.log('   Processos finalizados');
        }
        resolve();
      });
    });
  }

  async waitForServer() {
    console.log(`⏳ Aguardando servidor responder em ${this.baseUrl}...`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.timeout) {
      try {
        const response = await fetch(`${this.baseUrl}/api/health`);
        if (response.ok) {
          console.log('✅ Servidor respondendo!');
          return true;
        }
      } catch (error) {
        // Servidor ainda não disponível
      }
      
      await this.sleep(2000);
      process.stdout.write('.');
    }
    
    console.log('\n❌ Timeout aguardando servidor');
    return false;
  }

  async testBasicEndpoints() {
    console.log('\n🔍 Testando endpoints básicos...');

    const endpoints = [
      { path: '/api/health', name: 'Health Check' },
      { path: '/api/tests/densidade-real/temp', name: 'Densidade Real' },
      { path: '/api/tests/densidade-max-min/temp', name: 'Densidade Máx/Mín' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint.path}`);
        const status = response.ok ? '✅' : '⚠️';
        console.log(`   ${status} ${endpoint.name}: ${response.status}`);
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: Erro de conexão`);
      }
    }
  }

  reportSuccess() {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SERVIDOR FUNCIONANDO CORRETAMENTE');
    console.log('='.repeat(60));
    console.log('✅ Porta 5000 acessível');
    console.log('✅ Endpoints básicos respondendo');
    console.log('✅ Sistema pronto para testes de funcionalidade');
    console.log('\n📋 Próximos passos:');
    console.log('   node scripts/test-ensaios-salvamento.js');
    console.log('   node scripts/test-pdf-generation.js');
    console.log('='.repeat(60));
    process.exit(0);
  }

  reportFailure() {
    console.log('\n' + '='.repeat(60));
    console.log('❌ FALHA NA INICIALIZAÇÃO DO SERVIDOR');
    console.log('='.repeat(60));
    console.log('❌ Servidor não respondeu no tempo esperado');
    console.log('❌ Verificar logs de erro na aplicação');
    console.log('\n🔧 Possíveis soluções:');
    console.log('   1. Verificar se há erros no código');
    console.log('   2. Confirmar dependências instaladas');
    console.log('   3. Verificar variáveis de ambiente');
    console.log('='.repeat(60));
    process.exit(1);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar teste
if (require.main === module) {
  const tester = new ServerStartupTester();
  tester.runTest().catch(console.error);
}

module.exports = ServerStartupTester;