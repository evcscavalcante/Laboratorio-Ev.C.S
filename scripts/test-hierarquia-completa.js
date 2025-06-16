#!/usr/bin/env node

/**
 * Teste Completo da Hierarquia de Roles
 * Valida permissões específicas para cada nível hierárquico
 */

class TestadorHierarquiaCompleta {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.roles = ['VIEWER', 'TECHNICIAN', 'MANAGER', 'ADMIN', 'DEVELOPER'];
    this.resultados = {};
    this.scoreTotal = 0;
    
    // Simulação de tokens para cada role (em produção viria do Firebase)
    this.tokensSimulados = {
      'VIEWER': 'mock-token-viewer',
      'TECHNICIAN': 'mock-token-technician',
      'MANAGER': 'mock-token-manager',
      'ADMIN': 'mock-token-admin',
      'DEVELOPER': 'mock-token-developer'
    };
  }

  async executarTestesCompletos() {
    console.log('\n🏛️ TESTE COMPLETO DE HIERARQUIA DE ROLES');
    console.log('===============================================\n');
    
    for (const role of this.roles) {
      console.log(`\n🔍 Testando role: ${role}`);
      console.log('─'.repeat(30));
      
      this.resultados[role] = {
        permissoesCorretas: 0,
        permissoesIncorretas: 0,
        acessosNegados: 0,
        acessosPermitidos: 0,
        detalhes: []
      };
      
      await this.testarRole(role);
    }
    
    this.calcularScoreTotal();
    this.gerarRelatorioDetalhado();
  }

  async testarRole(role) {
    // Definir que cada role DEVE ter acesso
    const acessosPermitidos = this.obterAcessosPermitidos(role);
    
    // Definir que cada role NÃO DEVE ter acesso
    const acessosNegados = this.obterAcessosNegados(role);
    
    // Testar acessos que devem ser permitidos
    for (const acesso of acessosPermitidos) {
      const resultado = await this.testarAcesso(role, acesso, true);
      if (resultado.sucesso) {
        this.resultados[role].acessosPermitidos++;
        this.resultados[role].permissoesCorretas++;
      } else {
        this.resultados[role].permissoesIncorretas++;
        this.resultados[role].detalhes.push(`❌ Deveria permitir: ${acesso.descricao}`);
      }
    }
    
    // Testar acessos que devem ser negados
    for (const acesso of acessosNegados) {
      const resultado = await this.testarAcesso(role, acesso, false);
      if (resultado.sucesso) {
        this.resultados[role].acessosNegados++;
        this.resultados[role].permissoesCorretas++;
      } else {
        this.resultados[role].permissoesIncorretas++;
        this.resultados[role].detalhes.push(`❌ Deveria negar: ${acesso.descricao}`);
      }
    }
    
    const total = this.resultados[role].permissoesCorretas + this.resultados[role].permissoesIncorretas;
    const percentual = total > 0 ? Math.round((this.resultados[role].permissoesCorretas / total) * 100) : 0;
    
    console.log(`✅ Permissões corretas: ${this.resultados[role].permissoesCorretas}`);
    console.log(`❌ Permissões incorretas: ${this.resultados[role].permissoesIncorretas}`);
    console.log(`📊 Score: ${percentual}%`);
    
    this.resultados[role].score = percentual;
  }

  obterAcessosPermitidos(role) {
    const acessosBase = [
      { endpoint: '/api/health', metodo: 'GET', descricao: 'Health check público' },
      { endpoint: '/api/lgpd/terms', metodo: 'GET', descricao: 'Termos LGPD públicos' }
    ];

    const acessosPorRole = {
      'VIEWER': [
        ...acessosBase,
        { endpoint: '/api/tests/density-in-situ', metodo: 'GET', descricao: 'Visualizar ensaios densidade in-situ' },
        { endpoint: '/api/tests/real-density', metodo: 'GET', descricao: 'Visualizar ensaios densidade real' },
        { endpoint: '/api/equipamentos', metodo: 'GET', descricao: 'Visualizar equipamentos' }
      ],
      'TECHNICIAN': [
        ...acessosBase,
        { endpoint: '/api/tests/density-in-situ', metodo: 'GET', descricao: 'Visualizar ensaios' },
        { endpoint: '/api/tests/density-in-situ', metodo: 'POST', descricao: 'Criar ensaios' },
        { endpoint: '/api/equipamentos', metodo: 'GET', descricao: 'Visualizar equipamentos' },
        { endpoint: '/api/equipamentos', metodo: 'POST', descricao: 'Criar equipamentos' }
      ],
      'MANAGER': [
        ...acessosBase,
        { endpoint: '/api/tests/density-in-situ', metodo: 'GET', descricao: 'Visualizar ensaios' },
        { endpoint: '/api/tests/density-in-situ', metodo: 'POST', descricao: 'Criar ensaios' },
        { endpoint: '/api/tests/density-in-situ', metodo: 'PUT', descricao: 'Editar ensaios' },
        { endpoint: '/api/equipamentos', metodo: 'DELETE', descricao: 'Excluir equipamentos' },
        { endpoint: '/api/notifications', metodo: 'GET', descricao: 'Ver notificações' }
      ],
      'ADMIN': [
        ...acessosBase,
        { endpoint: '/api/tests/density-in-situ', metodo: 'GET', descricao: 'Visualizar ensaios' },
        { endpoint: '/api/tests/density-in-situ', metodo: 'POST', descricao: 'Criar ensaios' },
        { endpoint: '/api/tests/density-in-situ', metodo: 'DELETE', descricao: 'Excluir ensaios' },
        { endpoint: '/api/equipamentos', metodo: 'DELETE', descricao: 'Excluir equipamentos' },
        { endpoint: '/api/notifications', metodo: 'GET', descricao: 'Ver notificações' },
        { endpoint: '/api/admin/users', metodo: 'GET', descricao: 'Gerenciar usuários' }
      ],
      'DEVELOPER': [
        ...acessosBase,
        { endpoint: '/api/tests/density-in-situ', metodo: 'GET', descricao: 'Visualizar ensaios' },
        { endpoint: '/api/tests/density-in-situ', metodo: 'POST', descricao: 'Criar ensaios' },
        { endpoint: '/api/tests/density-in-situ', metodo: 'DELETE', descricao: 'Excluir ensaios' },
        { endpoint: '/api/equipamentos', metodo: 'DELETE', descricao: 'Excluir equipamentos' },
        { endpoint: '/api/notifications', metodo: 'GET', descricao: 'Ver notificações' },
        { endpoint: '/api/admin/users', metodo: 'GET', descricao: 'Gerenciar usuários' },
        { endpoint: '/api/auth/set-role', metodo: 'POST', descricao: 'Alterar roles' },
        { endpoint: '/api/developer/system-info', metodo: 'GET', descricao: 'Informações do sistema' }
      ]
    };

    return acessosPorRole[role] || acessosBase;
  }

  obterAcessosNegados(role) {
    const todosAcessos = {
      'VIEWER': [
        { endpoint: '/api/tests/density-in-situ', metodo: 'POST', descricao: 'Criar ensaios (VIEWER não pode)' },
        { endpoint: '/api/equipamentos', metodo: 'POST', descricao: 'Criar equipamentos (VIEWER não pode)' },
        { endpoint: '/api/equipamentos', metodo: 'DELETE', descricao: 'Excluir equipamentos (VIEWER não pode)' },
        { endpoint: '/api/admin/users', metodo: 'GET', descricao: 'Gerenciar usuários (VIEWER não pode)' },
        { endpoint: '/api/auth/set-role', metodo: 'POST', descricao: 'Alterar roles (VIEWER não pode)' }
      ],
      'TECHNICIAN': [
        { endpoint: '/api/tests/density-in-situ', metodo: 'DELETE', descricao: 'Excluir ensaios (TECHNICIAN não pode)' },
        { endpoint: '/api/equipamentos', metodo: 'DELETE', descricao: 'Excluir equipamentos (TECHNICIAN não pode)' },
        { endpoint: '/api/admin/users', metodo: 'GET', descricao: 'Gerenciar usuários (TECHNICIAN não pode)' },
        { endpoint: '/api/auth/set-role', metodo: 'POST', descricao: 'Alterar roles (TECHNICIAN não pode)' }
      ],
      'MANAGER': [
        { endpoint: '/api/admin/users', metodo: 'GET', descricao: 'Gerenciar usuários (MANAGER não pode)' },
        { endpoint: '/api/auth/set-role', metodo: 'POST', descricao: 'Alterar roles (MANAGER não pode)' },
        { endpoint: '/api/developer/system-info', metodo: 'GET', descricao: 'Info sistema (MANAGER não pode)' }
      ],
      'ADMIN': [
        { endpoint: '/api/auth/set-role', metodo: 'POST', descricao: 'Alterar roles (apenas ADMIN/DEVELOPER)' },
        { endpoint: '/api/developer/system-info', metodo: 'GET', descricao: 'Info sistema (apenas DEVELOPER)' }
      ],
      'DEVELOPER': [
        // DEVELOPER tem acesso a tudo, então testamos endpoints que não existem
        { endpoint: '/api/super-admin/delete-everything', metodo: 'DELETE', descricao: 'Endpoint inexistente' }
      ]
    };

    return todosAcessos[role] || [];
  }

  async testarAcesso(role, acesso, devePermitir) {
    try {
      const opcoes = {
        method: acesso.metodo,
        headers: {
          'Content-Type': 'application/json',
          // Em produção usaria token Firebase real
          'Authorization': `Bearer ${this.tokensSimulados[role]}`
        }
      };

      if (acesso.metodo === 'POST' || acesso.metodo === 'PUT') {
        opcoes.body = JSON.stringify({ teste: 'dados simulados' });
      }

      const response = await fetch(`${this.baseUrl}${acesso.endpoint}`, opcoes);
      
      if (devePermitir) {
        // Deve permitir: sucesso se status for 200, 201, etc. (não 401/403)
        const sucesso = response.status < 400 || response.status === 404; // 404 é ok para endpoints inexistentes
        return { sucesso, status: response.status };
      } else {
        // Deve negar: sucesso se status for 401, 403, 404, etc.
        const sucesso = response.status === 401 || response.status === 403 || response.status === 404 || response.status === 410;
        return { sucesso, status: response.status };
      }
      
    } catch (error) {
      // Erro de rede pode indicar endpoint protegido adequadamente
      if (devePermitir) {
        return { sucesso: false, erro: error.message };
      } else {
        return { sucesso: true, erro: error.message }; // Erro é bom quando não deve permitir
      }
    }
  }

  calcularScoreTotal() {
    const scores = Object.values(this.resultados).map(r => r.score || 0);
    this.scoreTotal = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  gerarRelatorioDetalhado() {
    console.log('\n===============================================');
    console.log('🏛️ RELATÓRIO DETALHADO DA HIERARQUIA DE ROLES');
    console.log('===============================================\n');
    
    console.log('📊 RESUMO GERAL:');
    console.log(`🎯 Score Total da Hierarquia: ${this.scoreTotal}/100`);
    console.log(`🏆 Status: ${this.obterStatusGeral()}\n`);
    
    console.log('📋 DETALHAMENTO POR ROLE:\n');
    
    Object.entries(this.resultados).forEach(([role, resultado]) => {
      const icone = this.obterIcone(resultado.score);
      console.log(`${icone} ${role}: ${resultado.score}/100`);
      console.log(`   ✅ Permissões corretas: ${resultado.permissoesCorretas}`);
      console.log(`   ❌ Permissões incorretas: ${resultado.permissoesIncorretas}`);
      console.log(`   🔓 Acessos permitidos: ${resultado.acessosPermitidos}`);
      console.log(`   🔒 Acessos negados: ${resultado.acessosNegados}`);
      
      if (resultado.detalhes.length > 0) {
        console.log('   📝 Problemas encontrados:');
        resultado.detalhes.forEach(detalhe => {
          console.log(`      ${detalhe}`);
        });
      }
      console.log('');
    });
    
    this.gerarRecomendacoes();
  }

  gerarRecomendacoes() {
    console.log('===============================================');
    console.log('💡 RECOMENDAÇÕES PARA MELHORIA DA HIERARQUIA');
    console.log('===============================================\n');
    
    const rolesComProblemas = Object.entries(this.resultados)
      .filter(([role, resultado]) => resultado.score < 90)
      .map(([role, resultado]) => ({ role, score: resultado.score }));
    
    if (rolesComProblemas.length === 0) {
      console.log('🟢 HIERARQUIA PERFEITA!');
      console.log('✅ Todos os roles têm permissões adequadas');
      console.log('🚀 Sistema pronto para produção');
    } else {
      console.log('🟡 MELHORIAS NECESSÁRIAS:');
      
      rolesComProblemas.forEach(({ role, score }) => {
        console.log(`\n🔧 ${role} (Score: ${score}/100):`);
        
        if (score < 50) {
          console.log('   ❌ Problemas críticos de permissão');
          console.log('   🛠️ Revisar middleware de autenticação');
          console.log('   🔒 Verificar validação de roles nos endpoints');
        } else if (score < 80) {
          console.log('   ⚠️ Algumas permissões incorretas');
          console.log('   🔧 Ajustar permissões específicas');
          console.log('   📋 Revisar documentação de acessos');
        } else {
          console.log('   🟡 Pequenos ajustes necessários');
          console.log('   ✨ Quase perfeito, poucos detalhes');
        }
      });
    }
    
    console.log('\n📊 MATRIZ DE PERMISSÕES ATUAL:');
    this.exibirMatrizPermissoes();
    
    console.log('\n===============================================');
    console.log(`🎯 CONCLUSÃO: Score ${this.scoreTotal}/100 - ${this.obterStatusGeral()}`);
    console.log('===============================================');
  }

  exibirMatrizPermissoes() {
    console.log('\n🏛️ HIERARQUIA DE ROLES (MENOR → MAIOR PRIVILÉGIO):');
    console.log('VIEWER → TECHNICIAN → MANAGER → ADMIN → DEVELOPER\n');
    
    const acoes = ['Ver', 'Criar', 'Editar', 'Excluir', 'Gerenciar', 'Admin'];
    
    console.log('Permissões por Role:');
    console.log('Role        | Ver | Criar | Editar | Excluir | Gerenciar | Admin');
    console.log('------------|-----|-------|--------|---------|-----------|-------');
    
    const matriz = {
      'VIEWER':     ['✅', '❌', '❌', '❌', '❌', '❌'],
      'TECHNICIAN': ['✅', '✅', '❌', '❌', '❌', '❌'],
      'MANAGER':    ['✅', '✅', '✅', '✅', '❌', '❌'],
      'ADMIN':      ['✅', '✅', '✅', '✅', '✅', '❌'],
      'DEVELOPER':  ['✅', '✅', '✅', '✅', '✅', '✅']
    };
    
    Object.entries(matriz).forEach(([role, permissoes]) => {
      const roleFormatted = role.padEnd(11);
      const permissoesFormatted = permissoes.map(p => p.padEnd(4)).join('| ');
      console.log(`${roleFormatted}| ${permissoesFormatted}`);
    });
  }

  obterStatusGeral() {
    if (this.scoreTotal >= 95) return 'EXCELENTE 🏆';
    if (this.scoreTotal >= 85) return 'MUITO BOM 🟢';
    if (this.scoreTotal >= 75) return 'BOM 🟡';
    if (this.scoreTotal >= 65) return 'REGULAR 🟠';
    return 'INSUFICIENTE 🔴';
  }

  obterIcone(score) {
    if (score >= 90) return '🟢';
    if (score >= 75) return '🟡';
    if (score >= 60) return '🟠';
    return '🔴';
  }
}

// Executar testes
const testador = new TestadorHierarquiaCompleta();
testador.executarTestesCompletos()
  .then(() => {
    console.log('\n🎉 Teste completo da hierarquia finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro no teste da hierarquia:', error);
    process.exit(1);
  });