#!/usr/bin/env node

/**
 * Teste Completo da Implementação LGPD
 * Valida todos os endpoints e funcionalidades de conformidade
 */

const SERVER_URL = 'http://localhost:5000';

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    return {
      status: response.status,
      ok: response.ok,
      data: response.headers.get('content-type')?.includes('application/json') 
        ? await response.json() 
        : await response.text()
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Testes dos endpoints LGPD
const tests = [
  {
    name: 'GET /api/lgpd/terms - Termos de Uso',
    test: async () => {
      const result = await makeRequest(`${SERVER_URL}/api/lgpd/terms`);
      return {
        success: result.ok && result.data?.version === "1.0",
        details: result.ok ? 'Termos retornados com versão correta' : `Erro: ${result.status}`,
        data: result.data
      };
    }
  },
  {
    name: 'GET /api/lgpd/privacy-policy - Política de Privacidade',
    test: async () => {
      const result = await makeRequest(`${SERVER_URL}/api/lgpd/privacy-policy`);
      return {
        success: result.ok && result.data?.content?.title?.includes('PRIVACIDADE'),
        details: result.ok ? 'Política de privacidade retornada' : `Erro: ${result.status}`,
        data: result.data
      };
    }
  },
  {
    name: 'POST /api/lgpd/consent - Registrar Consentimento',
    test: async () => {
      const result = await makeRequest(`${SERVER_URL}/api/lgpd/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType: 'terms',
          consentStatus: 'given'
        })
      });
      return {
        success: result.ok && result.data?.success === true,
        details: result.ok ? 'Consentimento registrado com sucesso' : `Erro: ${result.status}`,
        data: result.data
      };
    }
  },
  {
    name: 'GET /api/lgpd/my-data - Dados do Usuário',
    test: async () => {
      const result = await makeRequest(`${SERVER_URL}/api/lgpd/my-data`);
      return {
        success: result.ok && result.data?.personalData && result.data?.lgpdCompliance,
        details: result.ok ? 'Dados do usuário retornados' : `Erro: ${result.status}`,
        data: result.data
      };
    }
  },
  {
    name: 'POST /api/lgpd/request-deletion - Solicitação de Exclusão',
    test: async () => {
      const result = await makeRequest(`${SERVER_URL}/api/lgpd/request-deletion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return {
        success: result.ok && result.data?.success === true,
        details: result.ok ? 'Solicitação de exclusão registrada' : `Erro: ${result.status}`,
        data: result.data
      };
    }
  }
];

// Executar todos os testes
async function runTests() {
  console.log('🔍 TESTE COMPLETO DA IMPLEMENTAÇÃO LGPD');
  console.log('===============================================\n');

  let totalTests = tests.length;
  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    console.log(`⏳ Testando: ${test.name}`);
    
    try {
      const result = await test.test();
      
      if (result.success) {
        console.log(`✅ PASSOU: ${result.details}`);
        passedTests++;
      } else {
        console.log(`❌ FALHOU: ${result.details}`);
        failedTests++;
      }
      
      // Exibir dados de resposta se disponível
      if (result.data && typeof result.data === 'object') {
        console.log(`   📋 Dados retornados: ${JSON.stringify(result.data, null, 2).substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`❌ ERRO: ${error.message}`);
      failedTests++;
    }
    
    console.log(''); // Linha em branco para separação
  }

  // Resumo final
  console.log('===============================================');
  console.log('📊 RESUMO DOS TESTES LGPD');
  console.log('===============================================');
  console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes reprovados: ${failedTests}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 IMPLEMENTAÇÃO LGPD COMPLETA E FUNCIONAL!');
    console.log('📋 Todos os endpoints estão respondendo corretamente');
    console.log('🔒 Sistema em conformidade com LGPD implementado');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('\n⚠️  IMPLEMENTAÇÃO LGPD FUNCIONAL COM PEQUENOS PROBLEMAS');
    console.log('🔧 Alguns endpoints precisam de ajustes menores');
  } else {
    console.log('\n🚨 IMPLEMENTAÇÃO LGPD PRECISA DE CORREÇÕES');
    console.log('🔧 Múltiplos endpoints falharam, necessária revisão');
  }

  // Instruções de acesso
  console.log('\n📋 PÁGINAS LGPD DISPONÍVEIS:');
  console.log('• Termos de Uso: http://localhost:5000/termos-uso');
  console.log('• Configurações LGPD: http://localhost:5000/configuracoes-lgpd');
  console.log('• Links disponíveis na sidebar > Ajuda');

  return passedTests === totalTests ? 0 : 1;
}

// Verificar se o servidor está rodando
async function checkServer() {
  console.log('🔍 Verificando se o servidor está rodando...');
  const result = await makeRequest(`${SERVER_URL}/api/health`);
  
  if (!result.ok) {
    console.log('❌ Servidor não está respondendo em http://localhost:5000');
    console.log('🔧 Execute: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Servidor está rodando\n');
}

// Executar o script
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await checkServer();
      const exitCode = await runTests();
      process.exit(exitCode);
    } catch (error) {
      console.error('💥 Erro fatal:', error.message);
      process.exit(1);
    }
  })();
}

export { runTests, tests };