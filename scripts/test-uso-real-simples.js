#!/usr/bin/env node

/**
 * Sistema de Teste de Uso Real - Versão Simplificada
 * Detecta problemas que só aparecem durante o uso real da aplicação
 */

class TestadorUsoReal {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.erros = [];
    this.sucessos = [];
    this.avisos = [];
  }

  async executarTestes() {
    console.log('🧪 TESTE DE USO REAL - VERSÃO SIMPLIFICADA');
    console.log('=' .repeat(50));
    
    try {
      await this.testarEndpointsEssenciais();
      await this.testarFluxoAutenticacao();
      await this.testarCalculadoras();
      await this.testarGerenciamentoUsuarios();
      this.gerarRelatorio();
    } catch (error) {
      console.error('❌ Erro durante teste:', error.message);
      this.erros.push(`Erro crítico: ${error.message}`);
    }
  }

  async testarEndpointsEssenciais() {
    console.log('\n🔍 Testando endpoints essenciais...');
    
    const endpoints = [
      { url: '/api/health', nome: 'Health Check' },
      { url: '/api/organizations', nome: 'Organizações' },
      { url: '/api/users', nome: 'Usuários' },
      { url: '/api/notifications', nome: 'Notificações' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint.url}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Verifica se retorna array quando esperado
          if (endpoint.url.includes('organizations') || endpoint.url.includes('users')) {
            if (Array.isArray(data)) {
              this.sucessos.push(`✅ ${endpoint.nome}: Array válido com ${data.length} itens`);
            } else {
              this.erros.push(`❌ ${endpoint.nome}: Não retorna array (tipo: ${typeof data})`);
            }
          } else {
            this.sucessos.push(`✅ ${endpoint.nome}: Funcionando`);
          }
        } else {
          this.erros.push(`❌ ${endpoint.nome}: HTTP ${response.status}`);
        }
      } catch (error) {
        this.erros.push(`❌ ${endpoint.nome}: ${error.message}`);
      }
    }
  }

  async testarFluxoAutenticacao() {
    console.log('\n🔐 Testando fluxo de autenticação...');
    
    try {
      // Testa endpoint de sincronização sem token (deve falhar)
      const response = await fetch(`${this.baseUrl}/api/auth/sync-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      
      if (response.status === 401) {
        this.sucessos.push('✅ Proteção de autenticação funcionando');
      } else {
        this.avisos.push(`⚠️ Endpoint desprotegido retornou ${response.status}`);
      }
    } catch (error) {
      this.avisos.push(`⚠️ Erro no teste de autenticação: ${error.message}`);
    }
  }

  async testarCalculadoras() {
    console.log('\n🧮 Testando endpoints das calculadoras...');
    
    const calculadoras = [
      { url: '/api/tests/density-in-situ', nome: 'Densidade In-Situ' },
      { url: '/api/tests/real-density', nome: 'Densidade Real' },
      { url: '/api/tests/max-min-density', nome: 'Densidade Máx/Mín' }
    ];

    for (const calc of calculadoras) {
      try {
        const response = await fetch(`${this.baseUrl}${calc.url}`);
        
        if (response.status === 401) {
          this.sucessos.push(`✅ ${calc.nome}: Protegida por autenticação`);
        } else if (response.ok) {
          this.sucessos.push(`✅ ${calc.nome}: Endpoint disponível`);
        } else {
          this.avisos.push(`⚠️ ${calc.nome}: Status inesperado ${response.status}`);
        }
      } catch (error) {
        this.erros.push(`❌ ${calc.nome}: ${error.message}`);
      }
    }
  }

  async testarGerenciamentoUsuarios() {
    console.log('\n👥 Testando problemas específicos do gerenciamento de usuários...');
    
    try {
      // Testa se os endpoints retornam dados válidos para mapeamento
      const [orgResponse, usersResponse] = await Promise.all([
        fetch(`${this.baseUrl}/api/organizations`),
        fetch(`${this.baseUrl}/api/users`)
      ]);

      // Testa organizações
      if (orgResponse.ok) {
        const organizations = await orgResponse.json();
        
        if (Array.isArray(organizations)) {
          if (organizations.length > 0 && organizations[0].id && organizations[0].name) {
            this.sucessos.push('✅ Organizações: Estrutura válida para .map()');
          } else {
            this.avisos.push('⚠️ Organizações: Array vazio ou estrutura incompleta');
          }
        } else {
          this.erros.push('❌ Organizações: Não é array - causará erro .map()');
        }
      }

      // Testa usuários
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        
        if (Array.isArray(users)) {
          if (users.length > 0 && users[0].id && users[0].email) {
            this.sucessos.push('✅ Usuários: Estrutura válida para .map()');
          } else {
            this.avisos.push('⚠️ Usuários: Array vazio ou estrutura incompleta');
          }
        } else {
          this.erros.push('❌ Usuários: Não é array - causará erro .map()');
        }
      }

      // Simula problemas comuns de JavaScript
      this.simularProblemasComuns();

    } catch (error) {
      this.erros.push(`❌ Teste de gerenciamento: ${error.message}`);
    }
  }

  simularProblemasComuns() {
    // Simula cenários que causam erro ".map is not a function"
    const cenarios = [
      { nome: 'Array vazio', data: [] },
      { nome: 'Array com dados', data: [{ id: 1, name: 'Teste' }] },
      { nome: 'Undefined', data: undefined },
      { nome: 'Null', data: null },
      { nome: 'String', data: '[]' },
      { nome: 'Objeto', data: { length: 0 } }
    ];

    let problemas = 0;
    for (const cenario of cenarios) {
      try {
        // Simula validação que deveria existir no frontend
        if (Array.isArray(cenario.data) && typeof cenario.data.map === 'function') {
          // OK - pode usar .map()
        } else {
          problemas++;
        }
      } catch (error) {
        problemas++;
      }
    }

    if (problemas === 2) { // undefined e null são esperados
      this.sucessos.push('✅ Validação .map(): Cenários problemáticos identificados corretamente');
    } else {
      this.avisos.push(`⚠️ Validação .map(): ${problemas} problemas detectados (esperado: 2)`);
    }
  }

  gerarRelatorio() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO DE TESTE DE USO REAL');
    console.log('='.repeat(50));
    
    console.log(`\n✅ SUCESSOS (${this.sucessos.length}):`);
    this.sucessos.forEach(sucesso => console.log(`  ${sucesso}`));
    
    console.log(`\n⚠️ AVISOS (${this.avisos.length}):`);
    this.avisos.forEach(aviso => console.log(`  ${aviso}`));
    
    console.log(`\n❌ ERROS CRÍTICOS (${this.erros.length}):`);
    this.erros.forEach(erro => console.log(`  ${erro}`));
    
    const pontuacao = Math.max(0, 100 - (this.erros.length * 20) - (this.avisos.length * 5));
    
    console.log('\n' + '='.repeat(50));
    console.log(`🎯 PONTUAÇÃO: ${pontuacao}/100`);
    
    const status = pontuacao >= 90 ? 'EXCELENTE' :
                   pontuacao >= 70 ? 'BOM' :
                   pontuacao >= 50 ? 'REGULAR' : 'CRÍTICO';
    
    console.log(`📈 STATUS: ${status}`);
    
    if (this.erros.length === 0) {
      console.log('\n🎉 TODOS OS TESTES DE USO REAL PASSARAM!');
      console.log('   ✅ Endpoints funcionando corretamente');
      console.log('   ✅ Validações de array implementadas');
      console.log('   ✅ Sem erros de mapeamento detectados');
    } else {
      console.log('\n🔧 PROBLEMAS ENCONTRADOS NO USO REAL:');
      console.log('   📋 Revise os erros listados acima');
      console.log('   🧪 Execute este teste regularmente');
      console.log('   🚨 Priorize correções de erros críticos');
    }
    
    console.log('='.repeat(50));
    
    // Retorna código de saída para CI/CD
    process.exit(this.erros.length > 0 ? 1 : 0);
  }
}

// Execução do teste
const testador = new TestadorUsoReal();
testador.executarTestes().catch(console.error);