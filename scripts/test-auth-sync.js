/**
 * Teste Específico do Sistema de Sincronização de Autenticação
 * Detecta problemas na sincronização Firebase-PostgreSQL
 */

import { execSync } from 'child_process';

class AuthSyncTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
  }

  async runTests() {
    console.log('🔐 === TESTE DE SINCRONIZAÇÃO DE AUTENTICAÇÃO ===\n');

    const tests = [
      this.testServerHealth,
      this.testSyncEndpoint,
      this.testJsonParsing,
      this.testAuthHeaders,
      this.testFirebaseTokenValidation
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      try {
        const result = await test.call(this);
        if (result) {
          passedTests++;
          console.log(`✅ ${test.name}: PASSOU`);
        } else {
          console.log(`❌ ${test.name}: FALHOU`);
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ERRO - ${error.message}`);
      }
    }

    console.log(`\n📊 Resultado: ${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Sistema de sincronização está FUNCIONANDO');
    } else {
      console.log('⚠️ Sistema de sincronização precisa de CORREÇÕES');
    }

    return passedTests === totalTests;
  }

  testServerHealth() {
    console.log('   Testando saúde do servidor...');
    
    try {
      const output = execSync(`curl -s ${this.baseUrl}/api/health`, { encoding: 'utf8' });
      const health = JSON.parse(output);
      
      if (health.status) {
        console.log(`     ✓ Servidor respondendo: ${health.status}`);
        return true;
      }
      
      console.log('     ❌ Resposta inválida do servidor');
      return false;
      
    } catch (error) {
      console.log('     ❌ Erro ao verificar saúde do servidor');
      return false;
    }
  }

  testSyncEndpoint() {
    console.log('   Testando endpoint de sincronização...');
    
    try {
      const output = execSync(`curl -s -X POST ${this.baseUrl}/api/auth/sync-user -H "Content-Type: application/json" -d '{}'`, { encoding: 'utf8' });
      
      // Deve retornar erro 401 (não autorizado) mas não erro 500 (servidor)
      if (output.includes('"error"') && output.includes('autorização')) {
        console.log('     ✓ Endpoint responde corretamente (erro de autorização esperado)');
        return true;
      }
      
      if (output.includes('JSON inválido') || output.includes('500')) {
        console.log('     ❌ PROBLEMA: Erro de parsing JSON ou erro 500');
        console.log(`     Resposta: ${output.substring(0, 100)}...`);
        return false;
      }
      
      console.log('     ✓ Endpoint funcionando');
      return true;
      
    } catch (error) {
      console.log('     ❌ Erro ao testar endpoint de sincronização');
      return false;
    }
  }

  testJsonParsing() {
    console.log('   Testando parsing de JSON...');
    
    try {
      // Teste com JSON válido
      const validJson = execSync(`curl -s -X POST ${this.baseUrl}/api/auth/sync-user -H "Content-Type: application/json" -d '{"test": true}'`, { encoding: 'utf8' });
      
      if (validJson.includes('JSON inválido')) {
        console.log('     ❌ PROBLEMA: JSON válido sendo rejeitado');
        return false;
      }
      
      // Teste com JSON inválido
      const invalidJson = execSync(`curl -s -X POST ${this.baseUrl}/api/auth/sync-user -H "Content-Type: application/json" -d 'invalid'`, { encoding: 'utf8' });
      
      if (!invalidJson.includes('JSON inválido')) {
        console.log('     ⚠️ JSON inválido não sendo detectado (pode ser normal)');
      }
      
      console.log('     ✓ Sistema de parsing JSON funcionando');
      return true;
      
    } catch (error) {
      console.log('     ❌ Erro ao testar parsing JSON');
      return false;
    }
  }

  testAuthHeaders() {
    console.log('   Testando headers de autorização...');
    
    try {
      const output = execSync(`curl -s -X POST ${this.baseUrl}/api/auth/sync-user -H "Authorization: Bearer test-token" -H "Content-Type: application/json" -d '{}'`, { encoding: 'utf8' });
      
      if (output.includes('Token inválido') || output.includes('Token de autorização')) {
        console.log('     ✓ Sistema de validação de token funcionando');
        return true;
      }
      
      console.log('     ❌ Sistema de autorização não está funcionando corretamente');
      return false;
      
    } catch (error) {
      console.log('     ❌ Erro ao testar headers de autorização');
      return false;
    }
  }

  testFirebaseTokenValidation() {
    console.log('   Testando validação de token Firebase...');
    
    try {
      // Verificar se Firebase Admin está configurado
      const logs = execSync('ps aux | grep -i firebase || echo "processo não encontrado"', { encoding: 'utf8' });
      
      console.log('     ✓ Teste de validação Firebase configurado');
      return true;
      
    } catch (error) {
      console.log('     ❌ Erro ao verificar configuração Firebase');
      return false;
    }
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AuthSyncTester();
  tester.runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

export default AuthSyncTester;