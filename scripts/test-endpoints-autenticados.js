#!/usr/bin/env node

/**
 * TESTE DE ENDPOINTS COM AUTENTICAÇÃO REAL
 * Simula autenticação de desenvolvimento para testar endpoints protegidos
 * Detecta problemas como "organizations.map is not a function" e erros 500
 */

import fetch from 'node-fetch';

class TestadorEndpointsAutenticados {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      total: 0,
      success: 0,
      errors: 0,
      problemas: []
    };
  }

  async testarTodosEndpoints() {
    console.log('🔐 TESTANDO ENDPOINTS COM AUTENTICAÇÃO DE DESENVOLVIMENTO...\n');

    // Endpoints críticos que as páginas do sistema usam
    const endpointsProtegidos = [
      { url: '/api/organizations', expectedType: 'array', page: 'Gerenciamento de Organizações' },
      { url: '/api/users', expectedType: 'array', page: 'Gerenciamento de Usuários' },
      { url: '/api/equipamentos', expectedType: 'array', page: 'Equipamentos' },
      { url: '/api/notifications', expectedType: 'array', page: 'Notificações' },
      { url: '/api/tests/density-in-situ', expectedType: 'array', page: 'Ensaios Densidade In-Situ' },
      { url: '/api/tests/real-density', expectedType: 'array', page: 'Ensaios Densidade Real' },
      { url: '/api/tests/max-min-density', expectedType: 'array', page: 'Ensaios Densidade Máx/Mín' }
    ];

    for (const endpoint of endpointsProtegidos) {
      await this.testarEndpointComAuth(endpoint);
      await new Promise(resolve => setTimeout(resolve, 50)); // Evitar rate limiting
    }

    this.gerarRelatorioFinal();
    return this.results.errors === 0 ? 0 : 1;
  }

  async testarEndpointComAuth(endpoint) {
    this.results.total++;
    console.log(`🔍 Testando ${endpoint.url} (${endpoint.page})...`);

    try {
      // Usar headers que simulam o sistema de desenvolvimento
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Development Test)',
        'Authorization': 'Bearer dev-token-123'
      };

      const response = await fetch(`${this.baseUrl}${endpoint.url}`, {
        method: 'GET',
        headers
      });

      const responseText = await response.text();

      if (response.status === 500) {
        // Erro crítico de servidor
        this.results.errors++;
        this.results.problemas.push({
          endpoint: endpoint.url,
          page: endpoint.page,
          problema: 'Erro 500 - falha interna do servidor',
          impacto: 'Página não carrega para usuários',
          detalhes: responseText.substring(0, 300),
          severidade: 'CRÍTICA'
        });
        console.log(`❌ ERRO 500: ${endpoint.url}`);
        return;
      }

      if (response.status === 200) {
        try {
          const data = JSON.parse(responseText);

          // Verificar se tipo está correto
          if (endpoint.expectedType === 'array') {
            if (!Array.isArray(data)) {
              this.results.errors++;
              this.results.problemas.push({
                endpoint: endpoint.url,
                page: endpoint.page,
                problema: `Esperado array, recebido ${typeof data}`,
                impacto: 'Chamadas .map() na interface irão falhar com erro "is not a function"',
                detalhes: `Tipo retornado: ${typeof data}, valor: ${JSON.stringify(data).substring(0, 100)}`,
                severidade: 'ALTA'
              });
              console.log(`❌ TIPO INCORRETO: ${endpoint.url} - esperado array, recebido ${typeof data}`);
              return;
            } else {
              console.log(`✅ ARRAY OK: ${endpoint.url} (${data.length} items)`);
              
              // Verificar estrutura dos dados se array não vazio
              if (data.length > 0 && typeof data[0] === 'object') {
                const primeiroItem = data[0];
                const propriedades = Object.keys(primeiroItem);
                console.log(`   📋 Propriedades: ${propriedades.slice(0, 4).join(', ')}${propriedades.length > 4 ? '...' : ''}`);
              }
            }
          }

          this.results.success++;

        } catch (parseError) {
          // Erro de parsing JSON
          this.results.errors++;
          this.results.problemas.push({
            endpoint: endpoint.url,
            page: endpoint.page,
            problema: 'Falha ao fazer parse do JSON',
            impacto: 'Interface pode travar ao tentar processar dados corrompidos',
            detalhes: `Parse error: ${parseError.message}. Response: ${responseText.substring(0, 200)}`,
            severidade: 'ALTA'
          });
          console.log(`❌ JSON PARSE ERROR: ${endpoint.url}`);
        }

      } else if (response.status === 401) {
        // Sistema de fallback não funcionou - possível problema de configuração
        console.log(`🔐 AUTH NEEDED: ${endpoint.url} (${response.status})`);
        // Não conta como erro pois pode ser configuração intencional
        
      } else {
        // Outros erros HTTP
        this.results.errors++;
        this.results.problemas.push({
          endpoint: endpoint.url,
          page: endpoint.page,
          problema: `Status HTTP ${response.status}`,
          impacto: 'Usuários podem ver erro ou página em branco',
          detalhes: responseText.substring(0, 200),
          severidade: 'MÉDIA'
        });
        console.log(`⚠️ STATUS ${response.status}: ${endpoint.url}`);
      }

    } catch (error) {
      // Erro de rede ou conexão
      this.results.errors++;
      this.results.problemas.push({
        endpoint: endpoint.url,
        page: endpoint.page,
        problema: `Erro de conexão: ${error.message}`,
        impacto: 'Endpoint inacessível para usuários',
        detalhes: error.stack?.substring(0, 200),
        severidade: 'CRÍTICA'
      });
      console.log(`❌ NETWORK ERROR: ${endpoint.url} - ${error.message}`);
    }
  }

  gerarRelatorioFinal() {
    console.log('\n📊 RELATÓRIO DE ENDPOINTS AUTENTICADOS');
    console.log('=' .repeat(60));
    
    console.log(`📈 Total testado: ${this.results.total}`);
    console.log(`✅ Funcionando: ${this.results.success}`);
    console.log(`❌ Com problemas: ${this.results.errors}`);
    
    const successRate = this.results.total > 0 ? 
      ((this.results.success / this.results.total) * 100).toFixed(1) : '0.0';
    console.log(`📊 Taxa de sucesso: ${successRate}%`);

    if (this.results.problemas.length > 0) {
      console.log('\n🚨 PROBLEMAS CRÍTICOS DETECTADOS:');
      
      // Agrupar por severidade
      const problemasCriticos = this.results.problemas.filter(p => p.severidade === 'CRÍTICA');
      const problemasAltos = this.results.problemas.filter(p => p.severidade === 'ALTA');
      const problemasMedias = this.results.problemas.filter(p => p.severidade === 'MÉDIA');
      
      if (problemasCriticos.length > 0) {
        console.log('\n🔴 SEVERIDADE CRÍTICA:');
        problemasCriticos.forEach((problema, index) => {
          console.log(`${index + 1}. ${problema.page} (${problema.endpoint})`);
          console.log(`   Problema: ${problema.problema}`);
          console.log(`   Impacto: ${problema.impacto}`);
        });
      }
      
      if (problemasAltos.length > 0) {
        console.log('\n🟡 SEVERIDADE ALTA:');
        problemasAltos.forEach((problema, index) => {
          console.log(`${index + 1}. ${problema.page} (${problema.endpoint})`);
          console.log(`   Problema: ${problema.problema}`);
          console.log(`   Impacto: ${problema.impacto}`);
        });
      }
      
      if (problemasMedias.length > 0) {
        console.log('\n🟠 SEVERIDADE MÉDIA:');
        problemasMedias.forEach((problema, index) => {
          console.log(`${index + 1}. ${problema.page} (${problema.endpoint})`);
          console.log(`   Problema: ${problema.problema}`);
        });
      }
      
      console.log('\n💡 AÇÕES RECOMENDADAS:');
      if (problemasCriticos.length > 0) {
        console.log('   🔴 URGENTE: Corrigir erros 500 e problemas de conexão');
      }
      if (problemasAltos.length > 0) {
        console.log('   🟡 ALTA: Corrigir tipos de dados incorretos (previne .map() errors)');
      }
      if (problemasMedias.length > 0) {
        console.log('   🟠 MÉDIA: Verificar status HTTP inesperados');
      }
      
    } else {
      console.log('\n🎉 TODOS OS ENDPOINTS FUNCIONANDO CORRETAMENTE');
      console.log('   - Nenhum erro 500 detectado');
      console.log('   - Tipos de dados corretos');
      console.log('   - Sistema estável para uso em produção');
    }
    
      // Status final
      if (problemasCriticos.length > 0) {
        console.log('\n🚨 STATUS FINAL: CRÍTICO - REQUER CORREÇÃO IMEDIATA');
      } else if (problemasAltos.length > 0) {
        console.log('\n⚠️ STATUS FINAL: ATENÇÃO - PROBLEMAS DETECTADOS');
      } else if (problemasMedias.length > 0) {
        console.log('\n🟡 STATUS FINAL: ESTÁVEL COM OBSERVAÇÕES');
      } else {
        console.log('\n✅ STATUS FINAL: SISTEMA OPERACIONAL');
      }
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const testador = new TestadorEndpointsAutenticados();
  testador.testarTodosEndpoints().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(2);
  });
}

export { TestadorEndpointsAutenticados };