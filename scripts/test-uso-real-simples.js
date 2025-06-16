#!/usr/bin/env node

/**
 * TESTE DE USO REAL - SIMULA NAVEGAÇÃO DO USUÁRIO
 * Testa endpoints como um usuário real navegaria, detectando problemas tipo "organizations.map is not a function"
 */

import fetch from 'node-fetch';

class TestadorUsoReal {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      total: 0,
      success: 0,
      runtimeErrors: 0,
      problemas: []
    };
  }

  async simularNavegacaoUsuario() {
    console.log('👤 SIMULANDO NAVEGAÇÃO REAL DO USUÁRIO...\n');

    // Cenário 1: Usuário vai para página de Gerenciamento de Organizações
    await this.testarPaginaOrganizacoes();
    
    // Cenário 2: Usuário vai para página de Usuários
    await this.testarPaginaUsuarios();
    
    // Cenário 3: Usuário vai para página de Relatórios/Analytics
    await this.testarPaginaRelatorios();
    
    // Cenário 4: Usuário vai para página de Equipamentos
    await this.testarPaginaEquipamentos();

    this.gerarRelatorioFinal();
  }

  async testarPaginaOrganizacoes() {
    console.log('🏢 TESTANDO PÁGINA DE ORGANIZAÇÕES...');
    
    const token = await this.obterTokenValido();
    
    // Testar endpoint que a página de organizações usa
    const organizationsResult = await this.testarEndpoint('/api/organizations', token, 'GET', 'array');
    
    if (organizationsResult.success) {
      console.log(`✅ Organizations: Array com ${organizationsResult.data.length} organizações`);
    } else {
      console.log(`❌ Organizations: ${organizationsResult.error}`);
    }
  }

  async testarPaginaUsuarios() {
    console.log('\n👥 TESTANDO PÁGINA DE USUÁRIOS...');
    
    const token = await this.obterTokenValido();
    
    // Testar endpoint que a página de usuários usa
    const usersResult = await this.testarEndpoint('/api/users', token, 'GET', 'array');
    
    if (usersResult.success) {
      console.log(`✅ Users: Array com ${usersResult.data.length} usuários`);
      
      // Verificar se cada usuário tem propriedades necessárias
      const primeiroUsuario = usersResult.data[0];
      if (primeiroUsuario) {
        const propriedadesEsperadas = ['id', 'email', 'role'];
        const propriedadesFaltando = propriedadesEsperadas.filter(prop => !(prop in primeiroUsuario));
        
        if (propriedadesFaltando.length > 0) {
          console.log(`⚠️ Users: Propriedades faltando: ${propriedadesFaltando.join(', ')}`);
          this.results.problemas.push({
            endpoint: '/api/users',
            problema: `Propriedades faltando: ${propriedadesFaltando.join(', ')}`,
            impacto: 'Interface pode quebrar ao tentar acessar propriedades inexistentes'
          });
        }
      }
    } else {
      console.log(`❌ Users: ${usersResult.error}`);
    }
  }

  async testarPaginaRelatorios() {
    console.log('\n📊 TESTANDO PÁGINA DE RELATÓRIOS/ANALYTICS...');
    
    const token = await this.obterTokenValido();
    
    // Endpoints que páginas de relatórios normalmente usam
    const endpointsRelatorios = [
      '/api/organizations/user-counts',
      '/api/organizations', 
      '/api/users'
    ];
    
    for (const endpoint of endpointsRelatorios) {
      const result = await this.testarEndpoint(endpoint, token, 'GET', 'array');
      
      if (result.success) {
        console.log(`✅ ${endpoint}: Dados válidos para gráficos`);
        
        // Verificar se dados são compatíveis com bibliotecas de gráficos (ex: Recharts)
        if (Array.isArray(result.data) && result.data.length > 0) {
          const item = result.data[0];
          if (typeof item === 'object' && item !== null) {
            console.log(`   📈 Estrutura compatível com Recharts: ${Object.keys(item).slice(0, 3).join(', ')}...`);
          } else {
            console.log(`   ⚠️ Estrutura pode não ser compatível com bibliotecas de gráficos`);
          }
        }
      } else {
        console.log(`❌ ${endpoint}: ${result.error}`);
      }
    }
  }

  async testarPaginaEquipamentos() {
    console.log('\n🔧 TESTANDO PÁGINA DE EQUIPAMENTOS...');
    
    const token = await this.obterTokenValido();
    
    const equipamentosResult = await this.testarEndpoint('/api/equipamentos', token, 'GET', 'array');
    
    if (equipamentosResult.success) {
      console.log(`✅ Equipamentos: Array com ${equipamentosResult.data.length} equipamentos`);
    } else {
      console.log(`❌ Equipamentos: ${equipamentosResult.error}`);
    }
  }

  async obterTokenValido() {
    // Simular obtenção de token (em desenvolvimento, usar fallback)
    return 'dev-token-123';
  }

  async testarEndpoint(endpoint, token, method = 'GET', expectedType = 'object') {
    this.results.total++;
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Real User Navigation Test'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers
      });
      
      if (response.status === 200) {
        const data = await response.json();
        
        // Verificar se tipo está correto
        if (expectedType === 'array' && !Array.isArray(data)) {
          this.results.runtimeErrors++;
          this.results.problemas.push({
            endpoint,
            problema: `Esperado array, recebido ${typeof data}`,
            impacto: 'Chamadas .map() na interface irão falhar'
          });
          
          return {
            success: false,
            error: `Tipo incorreto: esperado array, recebido ${typeof data}`,
            data: null
          };
        }
        
        this.results.success++;
        return {
          success: true,
          data,
          error: null
        };
        
      } else if (response.status === 500) {
        this.results.runtimeErrors++;
        const errorText = await response.text();
        
        this.results.problemas.push({
          endpoint,
          problema: 'Erro 500 - falha interna do servidor',
          impacto: 'Página não carrega ou mostra erro para usuário',
          detalhes: errorText.substring(0, 200)
        });
        
        return {
          success: false,
          error: `Erro 500: ${errorText.substring(0, 100)}`,
          data: null
        };
        
      } else {
        return {
          success: false,
          error: `Status ${response.status}`,
          data: null
        };
      }
      
    } catch (error) {
      this.results.runtimeErrors++;
      this.results.problemas.push({
        endpoint,
        problema: `Erro de rede/parsing: ${error.message}`,
        impacto: 'Aplicação pode travar ou mostrar dados corrompidos'
      });
      
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  gerarRelatorioFinal() {
    console.log('\n📋 RELATÓRIO DE USO REAL');
    console.log('=' .repeat(50));
    
    console.log(`📊 Endpoints testados: ${this.results.total}`);
    console.log(`✅ Funcionando: ${this.results.success}`);
    console.log(`❌ Com problemas: ${this.results.runtimeErrors}`);
    
    const successRate = ((this.results.success / this.results.total) * 100).toFixed(1);
    console.log(`📈 Taxa de sucesso: ${successRate}%`);
    
    if (this.results.problemas.length > 0) {
      console.log('\n🚨 PROBLEMAS DETECTADOS:');
      this.results.problemas.forEach((problema, index) => {
        console.log(`\n${index + 1}. ${problema.endpoint}`);
        console.log(`   Problema: ${problema.problema}`);
        console.log(`   Impacto: ${problema.impacto}`);
        if (problema.detalhes) {
          console.log(`   Detalhes: ${problema.detalhes}`);
        }
      });
      
      console.log('\n💡 RECOMENDAÇÕES:');
      console.log('   - Corrigir endpoints que retornam tipo incorreto');
      console.log('   - Verificar se componentes React fazem .map() em arrays válidos');
      console.log('   - Adicionar validação de tipo antes de operações de array');
      
    } else {
      console.log('\n🎉 NENHUM PROBLEMA DETECTADO - SISTEMA ESTÁVEL PARA USO REAL');
    }
    
    return this.results.runtimeErrors === 0 ? 0 : 1;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const testador = new TestadorUsoReal();
  testador.simularNavegacaoUsuario().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(2);
  });
}

export { TestadorUsoReal };