/**
 * Teste Específico de Detecção de CSP
 * Valida se o sistema consegue detectar problemas de Content Security Policy
 */

import { execSync } from 'child_process';

class CSPTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
  }

  async runTests() {
    console.log('🛡️ === TESTE DE DETECÇÃO CSP ===\n');

    const tests = [
      this.testCSPHeaders,
      this.testFirebaseDomains,
      this.testCSPViolation,
      this.testServerCSPOverride
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
      console.log('🎉 Sistema de detecção CSP está FUNCIONANDO');
    } else {
      console.log('⚠️ Sistema de detecção CSP precisa de CORREÇÕES');
    }

    return passedTests === totalTests;
  }

  testCSPHeaders() {
    console.log('   Testando headers CSP do servidor...');
    
    try {
      const output = execSync(`curl -s -I ${this.baseUrl}/ | grep -i content-security-policy`, { encoding: 'utf8' });
      const hasCsp = output.includes('Content-Security-Policy');
      
      if (!hasCsp) {
        console.log('     ❌ Servidor não define CSP');
        return false;
      }
      
      console.log('     ✓ CSP detectado no servidor');
      return true;
      
    } catch (error) {
      console.log('     ❌ Erro ao verificar headers CSP');
      return false;
    }
  }

  testFirebaseDomains() {
    console.log('   Testando domínios Firebase no CSP...');
    
    try {
      const output = execSync(`curl -s -I ${this.baseUrl}/ | grep -i content-security-policy`, { encoding: 'utf8' });
      
      const requiredDomains = [
        'identitytoolkit.googleapis.com',
        'securetoken.googleapis.com',
        'firebase.googleapis.com'
      ];
      
      const missingDomains = requiredDomains.filter(domain => !output.includes(domain));
      
      if (missingDomains.length > 0) {
        console.log(`     ❌ Domínios Firebase faltando: ${missingDomains.join(', ')}`);
        return false;
      }
      
      console.log('     ✓ Todos os domínios Firebase presentes');
      return true;
      
    } catch (error) {
      console.log('     ❌ Erro ao verificar domínios Firebase');
      return false;
    }
  }

  testCSPViolation() {
    console.log('   Simulando violação de CSP...');
    
    try {
      // Simular uma requisição que deveria ser bloqueada
      const output = execSync(`curl -s -I ${this.baseUrl}/ | grep -i connect-src`, { encoding: 'utf8' });
      
      if (output.includes("connect-src 'self';") && !output.includes('googleapis.com')) {
        console.log('     ✓ Detectaria violação - CSP muito restritivo');
        return false; // Este teste DEVE falhar para mostrar que detectamos o problema
      }
      
      console.log('     ✓ CSP permite conexões necessárias');
      return true;
      
    } catch (error) {
      console.log('     ❌ Erro ao simular violação CSP');
      return false;
    }
  }

  testServerCSPOverride() {
    console.log('   Verificando se servidor sobrescreve HTML CSP...');
    
    try {
      // Verificar se o CSP vem do servidor (header) vs HTML (meta tag)
      const htmlContent = execSync(`curl -s ${this.baseUrl}/`, { encoding: 'utf8' });
      const serverHeaders = execSync(`curl -s -I ${this.baseUrl}/`, { encoding: 'utf8' });
      
      const htmlHasCSP = htmlContent.includes('Content-Security-Policy');
      const serverHasCSP = serverHeaders.includes('Content-Security-Policy');
      
      if (htmlHasCSP && serverHasCSP) {
        console.log('     ⚠️ CSP definido tanto no HTML quanto no servidor (servidor prevalece)');
        return true; // Isso está correto, mas é importante detectar
      }
      
      if (serverHasCSP && !htmlHasCSP) {
        console.log('     ✓ CSP definido apenas no servidor');
        return true;
      }
      
      if (!serverHasCSP && htmlHasCSP) {
        console.log('     ✓ CSP definido apenas no HTML');
        return true;
      }
      
      console.log('     ❌ Nenhum CSP encontrado');
      return false;
      
    } catch (error) {
      console.log('     ❌ Erro ao verificar override CSP');
      return false;
    }
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new CSPTester();
  tester.runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

export default CSPTester;