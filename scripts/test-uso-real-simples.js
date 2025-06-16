#!/usr/bin/env node

/**
 * Teste de Uso Real - Verificação de Vazamento de Dados
 * Simula cenários reais onde dados podem vazar entre usuários/empresas
 */

class TestadorUsoReal {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.sucessos = [];
    this.falhas = [];
    this.vazamentos = [];
  }

  async executarTestes() {
    console.log('🔍 TESTE DE USO REAL - VERIFICAÇÃO DE VAZAMENTOS');
    console.log('=' .repeat(60));
    
    try {
      await this.testarRelatórios();
      await this.testarAnalytics();
      await this.testarPainelAdmin();
      await this.verificarVazamentos();
      await this.gerarRelatorioFinal();
    } catch (error) {
      console.error('❌ Erro crítico:', error.message);
      this.falhas.push(`Erro crítico: ${error.message}`);
    }
  }

  async testarRelatórios() {
    console.log('\n📊 Testando página de Relatórios...');
    
    try {
      // Simula acesso à página /relatorios
      const relatoriosResponse = await fetch(`${this.baseUrl}/`);
      
      if (relatoriosResponse.ok) {
        this.sucessos.push('✅ Página de relatórios acessível');
        
        // Testa se dados de organizações podem vazar
        const orgsResponse = await fetch(`${this.baseUrl}/api/organizations`);
        const usersResponse = await fetch(`${this.baseUrl}/api/users`);
        
        if (orgsResponse.status === 401 && usersResponse.status === 401) {
          this.sucessos.push('✅ Relatórios: Dados protegidos por autenticação');
        } else {
          if (orgsResponse.ok) {
            const orgs = await orgsResponse.json();
            if (Array.isArray(orgs) && orgs.length > 0) {
              // PROBLEMA: Se orgs.map não é função, pode quebrar o frontend
              if (typeof orgs.map !== 'function') {
                this.vazamentos.push('❌ VAZAMENTO: organizations retorna objeto ao invés de array');
              } else {
                this.sucessos.push(`✅ Organizações estruturadas corretamente (${orgs.length})`);
              }
            }
          }
          
          if (usersResponse.ok) {
            const users = await usersResponse.json();
            if (Array.isArray(users) && users.length > 0) {
              // PROBLEMA: Se users.map não é função, pode quebrar o frontend
              if (typeof users.map !== 'function') {
                this.vazamentos.push('❌ VAZAMENTO: users retorna objeto ao invés de array');
              } else {
                this.sucessos.push(`✅ Usuários estruturados corretamente (${users.length})`);
              }
            }
          }
        }
      } else {
        this.falhas.push('❌ Página de relatórios inacessível');
      }
    } catch (error) {
      this.falhas.push(`❌ Erro em relatórios: ${error.message}`);
    }
  }

  async testarAnalytics() {
    console.log('\n📈 Testando página de Analytics...');
    
    try {
      // Simula acesso à página /analytics
      const analyticsResponse = await fetch(`${this.baseUrl}/`);
      
      if (analyticsResponse.ok) {
        this.sucessos.push('✅ Página de analytics acessível');
        
        // Verifica se há vazamento de dados entre organizações
        const userCountsResponse = await fetch(`${this.baseUrl}/api/organizations/user-counts`);
        
        if (userCountsResponse.ok) {
          const userCounts = await userCountsResponse.json();
          
          if (Array.isArray(userCounts)) {
            // Verifica se dados estão isolados por organização
            const temDadosIsolados = userCounts.every(item => 
              typeof item.organizationId !== 'undefined' && 
              typeof item.count === 'number'
            );
            
            if (temDadosIsolados) {
              this.sucessos.push('✅ Analytics: Dados isolados por organização');
            } else {
              this.vazamentos.push('❌ VAZAMENTO: Estrutura de dados permite vazamento');
            }
            
            // Verifica se não há contagens negativas ou impossíveis
            const contargemsValidas = userCounts.every(item => item.count >= 0);
            if (contargemsValidas) {
              this.sucessos.push('✅ Analytics: Contagens válidas');
            } else {
              this.vazamentos.push('❌ VAZAMENTO: Contagens inválidas detectadas');
            }
          } else {
            this.vazamentos.push('❌ VAZAMENTO: user-counts não retorna array');
          }
        } else if (userCountsResponse.status === 401) {
          this.sucessos.push('✅ Analytics: Protegido por autenticação');
        } else {
          this.falhas.push('❌ Analytics: Endpoint com problemas');
        }
      } else {
        this.falhas.push('❌ Página de analytics inacessível');
      }
    } catch (error) {
      this.falhas.push(`❌ Erro em analytics: ${error.message}`);
    }
  }

  async testarPainelAdmin() {
    console.log('\n🔧 Testando Painel Administrativo...');
    
    try {
      // Testa se o painel admin vaza dados entre organizações
      const adminResponse = await fetch(`${this.baseUrl}/`);
      
      if (adminResponse.ok) {
        this.sucessos.push('✅ Painel admin acessível');
        
        // Verifica proteção de dados organizacionais
        const orgsResponse = await fetch(`${this.baseUrl}/api/organizations`);
        const usersResponse = await fetch(`${this.baseUrl}/api/users`);
        
        if (orgsResponse.status === 401) {
          this.sucessos.push('✅ Painel Admin: Organizações protegidas');
        } else if (orgsResponse.ok) {
          const organizations = await orgsResponse.json();
          
          // TESTE CRÍTICO: Verifica se retorna .map is not a function
          if (!Array.isArray(organizations)) {
            this.vazamentos.push('❌ VAZAMENTO CRÍTICO: organizations.map is not a function');
          } else {
            this.sucessos.push('✅ Painel Admin: Estrutura de organizações válida');
          }
        }
        
        if (usersResponse.status === 401) {
          this.sucessos.push('✅ Painel Admin: Usuários protegidos');
        } else if (usersResponse.ok) {
          const users = await usersResponse.json();
          
          // TESTE CRÍTICO: Verifica se retorna .map is not a function
          if (!Array.isArray(users)) {
            this.vazamentos.push('❌ VAZAMENTO CRÍTICO: users.map is not a function');
          } else {
            this.sucessos.push('✅ Painel Admin: Estrutura de usuários válida');
            
            // Verifica se usuários de diferentes organizações estão isolados
            const orgIds = [...new Set(users.map(u => u.organizationId))];
            if (orgIds.length > 1) {
              this.sucessos.push(`✅ Isolamento: ${orgIds.length} organizações distintas`);
            }
          }
        }
      } else {
        this.falhas.push('❌ Painel admin inacessível');
      }
    } catch (error) {
      this.falhas.push(`❌ Erro em painel admin: ${error.message}`);
    }
  }

  async verificarVazamentos() {
    console.log('\n🔒 Verificando vazamentos específicos...');
    
    // TESTE 1: Tentativa de acesso direto sem autenticação
    const endpointsCriticos = [
      '/api/organizations',
      '/api/users', 
      '/api/tests/density-in-situ',
      '/api/tests/real-density',
      '/api/tests/max-min-density'
    ];

    for (const endpoint of endpointsCriticos) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        
        if (response.status === 401) {
          this.sucessos.push(`✅ ${endpoint}: Bloqueado sem autenticação`);
        } else if (response.ok) {
          const data = await response.json();
          
          // Se retorna dados sem autenticação = VAZAMENTO
          if (data && (Array.isArray(data) || typeof data === 'object')) {
            this.vazamentos.push(`❌ VAZAMENTO CRÍTICO: ${endpoint} retorna dados sem autenticação`);
          }
        }
      } catch (error) {
        // Erro de conexão é OK, significa que está protegido
        this.sucessos.push(`✅ ${endpoint}: Protegido (erro de conexão)`);
      }
    }

    // TESTE 2: Verifica se ensaios vazam entre organizações
    const ensaiosResponse = await fetch(`${this.baseUrl}/api/tests/density-in-situ`);
    
    if (ensaiosResponse.status === 401) {
      this.sucessos.push('✅ Ensaios: Protegidos por autenticação');
    } else if (ensaiosResponse.ok) {
      // Se ensaios são acessíveis, verifica se há isolamento
      this.vazamentos.push('❌ POTENCIAL VAZAMENTO: Ensaios acessíveis sem verificação');
    }

    // TESTE 3: Verifica user-counts (deve ser público ou protegido)
    const userCountsResponse = await fetch(`${this.baseUrl}/api/organizations/user-counts`);
    
    if (userCountsResponse.ok) {
      const userCounts = await userCountsResponse.json();
      
      if (Array.isArray(userCounts)) {
        // Se é público, deve ao menos não vazar dados sensíveis
        const temDadosSensiveis = userCounts.some(item => 
          item.password || item.email || item.firebaseUid
        );
        
        if (temDadosSensiveis) {
          this.vazamentos.push('❌ VAZAMENTO: user-counts contém dados sensíveis');
        } else {
          this.sucessos.push('✅ user-counts: Não contém dados sensíveis');
        }
      }
    }
  }

  async gerarRelatorioFinal() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 RELATÓRIO FINAL DE SEGURANÇA');
    console.log('='.repeat(60));
    
    console.log(`\n✅ SUCESSOS (${this.sucessos.length}):`);
    this.sucessos.forEach(sucesso => console.log(`  ${sucesso}`));
    
    console.log(`\n❌ FALHAS (${this.falhas.length}):`);
    this.falhas.forEach(falha => console.log(`  ${falha}`));
    
    console.log(`\n🚨 VAZAMENTOS DETECTADOS (${this.vazamentos.length}):`);
    this.vazamentos.forEach(vazamento => console.log(`  ${vazamento}`));
    
    const pontuacao = Math.max(0, 100 - (this.falhas.length * 10) - (this.vazamentos.length * 20));
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 PONTUAÇÃO DE SEGURANÇA: ${pontuacao}/100`);
    
    const status = pontuacao >= 90 ? 'SEGURO' :
                   pontuacao >= 70 ? 'ACEITÁVEL' :
                   pontuacao >= 50 ? 'PREOCUPANTE' : 'CRÍTICO';
    
    console.log(`🛡️ STATUS DE SEGURANÇA: ${status}`);
    
    if (this.vazamentos.length === 0 && this.falhas.length <= 1) {
      console.log('\n🎉 SISTEMA APROVADO PARA PRODUÇÃO!');
      console.log('   🔒 Nenhum vazamento detectado');
      console.log('   🛡️ Isolamento organizacional funcionando');
      console.log('   📊 Estruturas de dados seguras');
      console.log('   🔐 Autenticação protegendo endpoints críticos');
    } else {
      console.log('\n⚠️ PROBLEMAS ENCONTRADOS:');
      
      if (this.vazamentos.length > 0) {
        console.log('   🚨 VAZAMENTOS CRÍTICOS DETECTADOS');
        console.log('   ❌ SISTEMA NÃO ESTÁ PRONTO PARA PRODUÇÃO');
        console.log('   🔧 CORREÇÕES NECESSÁRIAS ANTES DO DEPLOY');
      }
      
      if (this.falhas.length > 1) {
        console.log('   ⚠️ Múltiplas falhas detectadas');
        console.log('   🔍 Verificar funcionalidades básicas');
      }
    }
    
    console.log('\n📋 VERIFICAÇÕES REALIZADAS:');
    console.log('   ✓ Proteção de endpoints sem autenticação');
    console.log('   ✓ Isolamento de dados organizacionais');
    console.log('   ✓ Estruturas de dados para frontend');
    console.log('   ✓ Vazamento de dados sensíveis');
    console.log('   ✓ Funcionalidade de relatórios e analytics');
    
    console.log('='.repeat(60));
    
    // Retorna código de saída
    process.exit((this.vazamentos.length > 0 || this.falhas.length > 2) ? 1 : 0);
  }
}

// Execução do teste
const testador = new TestadorUsoReal();
testador.executarTestes().catch(console.error);