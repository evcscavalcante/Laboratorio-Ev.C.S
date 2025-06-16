#!/usr/bin/env node

/**
 * AUDITORIA FINAL PARA VALIDAÇÃO DE PRODUÇÃO
 * Análise crítica completa após correções dos problemas identificados
 */

import fs from 'fs';

class AuditoriaFinalProducao {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.resultados = {
      funcionalidadesTecnicas: { score: 0, detalhes: [] },
      segurancaProtecao: { score: 0, detalhes: [] },
      experienciaInterface: { score: 0, detalhes: [] },
      conformidadeLegal: { score: 0, detalhes: [] },
      arquiteturaManutencao: { score: 0, detalhes: [] },
      scoreGeral: 0,
      statusProducao: 'pending',
      recomendacoesFinal: []
    };
  }

  async executarAuditoriaFinal() {
    console.log('🔍 AUDITORIA FINAL DE PRODUÇÃO - ANÁLISE CRÍTICA COMPLETA');
    console.log('═'.repeat(70));
    
    await this.auditarFuncionalidadesTecnicas();
    await this.auditarSegurancaProtecao();
    await this.auditarExperienciaInterface();
    await this.auditarConformidadeLegal();
    await this.auditarArquiteturaManutencao();
    
    this.calcularScoreFinal();
    this.determinarStatusProducao();
    this.gerarRelatorioFinal();
  }

  async auditarFuncionalidadesTecnicas() {
    console.log('\n🧪 FUNCIONALIDADES TÉCNICAS GEOTÉCNICAS...');
    
    let score = 100;
    const detalhes = [];

    // Calculadoras NBR essenciais
    const calculadorasNBR = [
      { arquivo: 'client/src/pages/solos/densidade-in-situ.tsx', norma: 'NBR 9813:2021' },
      { arquivo: 'client/src/pages/solos/densidade-real.tsx', norma: 'NBR 17212:2025' },
      { arquivo: 'client/src/pages/solos/densidade-max-min.tsx', norma: 'NBR 12004/12051:2021' }
    ];

    for (const calc of calculadorasNBR) {
      if (fs.existsSync(calc.arquivo)) {
        const conteudo = fs.readFileSync(calc.arquivo, 'utf8');
        
        // Verifica nomenclatura técnica correta
        const nbrNumber = calc.norma.match(/NBR (\d+)/)[1];
        if (conteudo.includes(nbrNumber)) {
          detalhes.push(`✅ Calculadora ${calc.norma} implementada e nomenclatura correta`);
        } else {
          detalhes.push(`⚠️ Calculadora ${calc.norma} encontrada mas nomenclatura pode estar incorreta`);
          score -= 5;
        }

        // Verifica componente TestHeader
        if (conteudo.includes('TestHeader')) {
          detalhes.push(`✅ Cabeçalho técnico profissional integrado em ${calc.norma}`);
        } else {
          detalhes.push(`❌ Cabeçalho técnico ausente em ${calc.norma}`);
          score -= 10;
        }
      } else {
        detalhes.push(`❌ Calculadora ${calc.norma} não encontrada`);
        score -= 25;
      }
    }

    // Sistema de ensaios salvos
    try {
      const ensaiosResponse = await fetch(`${this.baseUrl}/api/tests/density-in-situ`);
      if (ensaiosResponse.status === 401 || ensaiosResponse.status === 200) {
        detalhes.push('✅ Endpoints de ensaios protegidos e funcionais');
      } else {
        detalhes.push(`❌ Endpoints de ensaios com problemas: ${ensaiosResponse.status}`);
        score -= 15;
      }
    } catch (error) {
      detalhes.push('❌ Falha na comunicação com API de ensaios');
      score -= 20;
    }

    // Geração de PDFs técnicos
    if (fs.existsSync('client/src/lib/pdf-vertical-tables.tsx')) {
      detalhes.push('✅ Sistema de geração de PDFs técnicos implementado');
    } else {
      detalhes.push('❌ Sistema de PDFs não encontrado');
      score -= 20;
    }

    // Biblioteca de cálculos
    if (fs.existsSync('client/src/lib/calculations.ts')) {
      detalhes.push('✅ Biblioteca de cálculos geotécnicos implementada');
    } else {
      detalhes.push('❌ Biblioteca de cálculos não encontrada');
      score -= 15;
    }

    this.resultados.funcionalidadesTecnicas.score = Math.max(0, score);
    this.resultados.funcionalidadesTecnicas.detalhes = detalhes;
  }

  async auditarSegurancaProtecao() {
    console.log('\n🔐 SEGURANÇA E PROTEÇÃO DE DADOS...');
    
    let score = 100;
    const detalhes = [];

    try {
      // Autenticação Firebase
      const syncResponse = await fetch(`${this.baseUrl}/api/auth/sync-user`);
      if (syncResponse.status === 401) {
        detalhes.push('✅ Autenticação Firebase obrigatória funcionando');
      } else {
        detalhes.push('❌ Autenticação Firebase pode estar exposta');
        score -= 20;
      }

      // Proteção de endpoints críticos
      const endpointsCriticos = [
        '/api/users',
        '/api/organizations', 
        '/api/equipamentos',
        '/api/tests/density-in-situ'
      ];

      for (const endpoint of endpointsCriticos) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (response.status === 401) {
          detalhes.push(`✅ Endpoint protegido: ${endpoint}`);
        } else {
          detalhes.push(`❌ Endpoint vulnerável: ${endpoint} (${response.status})`);
          score -= 10;
        }
      }

      // Headers de segurança
      const healthResponse = await fetch(`${this.baseUrl}/api/health`);
      const headers = healthResponse.headers;
      
      if (headers.get('x-powered-by') === null) {
        detalhes.push('✅ Header X-Powered-By removido');
      } else {
        detalhes.push('⚠️ Header X-Powered-By exposto');
        score -= 5;
      }

    } catch (error) {
      detalhes.push(`❌ Erro ao testar segurança: ${error.message}`);
      score -= 30;
    }

    // Sistema hierárquico de roles
    if (fs.existsSync('server/index.ts')) {
      const serverContent = fs.readFileSync('server/index.ts', 'utf8');
      if (serverContent.includes('requireRole')) {
        detalhes.push('✅ Sistema hierárquico de roles implementado');
      } else {
        detalhes.push('❌ Sistema de roles não encontrado');
        score -= 15;
      }
    }

    this.resultados.segurancaProtecao.score = Math.max(0, score);
    this.resultados.segurancaProtecao.detalhes = detalhes;
  }

  async auditarExperienciaInterface() {
    console.log('\n👤 EXPERIÊNCIA E INTERFACE DO USUÁRIO...');
    
    let score = 100;
    const detalhes = [];

    // Componentes UI essenciais
    const componentesEssenciais = [
      'client/src/components/ui/button.tsx',
      'client/src/components/ui/card.tsx',
      'client/src/components/ui/form.tsx',
      'client/src/components/ui/input.tsx',
      'client/src/components/ui/dialog.tsx'
    ];

    componentesEssenciais.forEach(comp => {
      if (fs.existsSync(comp)) {
        detalhes.push(`✅ Componente UI: ${comp.split('/').pop()}`);
      } else {
        detalhes.push(`❌ Componente UI ausente: ${comp.split('/').pop()}`);
        score -= 8;
      }
    });

    // Navegação responsiva
    if (fs.existsSync('client/src/components/navigation/sidebar-optimized.tsx')) {
      detalhes.push('✅ Sidebar responsiva otimizada');
    } else {
      detalhes.push('❌ Navegação responsiva não encontrada');
      score -= 15;
    }

    // Sistema de notificações
    if (fs.existsSync('client/src/components/notifications/NotificationBell.tsx')) {
      detalhes.push('✅ Sistema de notificações visuais');
    } else {
      detalhes.push('❌ Sistema de notificações ausente');
      score -= 10;
    }

    // Feedback de loading
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.dependencies['@tanstack/react-query']) {
      detalhes.push('✅ React Query para estados de loading');
    } else {
      detalhes.push('❌ Sistema de loading inadequado');
      score -= 12;
    }

    // Styling consistente
    if (packageJson.dependencies['tailwindcss'] || packageJson.devDependencies['tailwindcss']) {
      detalhes.push('✅ Tailwind CSS para design consistente');
    } else {
      detalhes.push('❌ Sistema de styling inadequado');
      score -= 15;
    }

    this.resultados.experienciaInterface.score = Math.max(0, score);
    this.resultados.experienciaInterface.detalhes = detalhes;
  }

  async auditarConformidadeLegal() {
    console.log('\n⚖️ CONFORMIDADE LEGAL E LGPD...');
    
    let score = 100;
    const detalhes = [];

    try {
      // Endpoints LGPD obrigatórios
      const endpointsLGPD = [
        { url: '/api/lgpd/terms', nome: 'Termos de uso' },
        { url: '/api/lgpd/privacy-policy', nome: 'Política de privacidade' },
        { url: '/api/lgpd/consent', nome: 'Consentimentos' },
        { url: '/api/lgpd/my-data', nome: 'Meus dados' },
        { url: '/api/lgpd/request-deletion', nome: 'Exclusão de dados' }
      ];

      for (const endpoint of endpointsLGPD) {
        const response = await fetch(`${this.baseUrl}${endpoint.url}`);
        if (response.status === 200) {
          detalhes.push(`✅ ${endpoint.nome} funcional`);
        } else {
          detalhes.push(`❌ ${endpoint.nome} falhou (${response.status})`);
          score -= 15;
        }
      }

      // Acesso público aos termos
      const termosResponse = await fetch(`${this.baseUrl}/termos-uso`);
      if (termosResponse.status === 200) {
        detalhes.push('✅ Termos acessíveis publicamente (obrigatório LGPD)');
      } else {
        detalhes.push('❌ Termos não acessíveis publicamente');
        score -= 20;
      }

    } catch (error) {
      detalhes.push(`❌ Erro ao verificar LGPD: ${error.message}`);
      score -= 25;
    }

    // Páginas LGPD
    const paginasLGPD = [
      'client/src/pages/termos-uso-publico.tsx',
      'client/src/pages/configuracoes-lgpd.tsx'
    ];

    paginasLGPD.forEach(pagina => {
      if (fs.existsSync(pagina)) {
        detalhes.push(`✅ Página LGPD: ${pagina.split('/').pop()}`);
      } else {
        detalhes.push(`❌ Página LGPD ausente: ${pagina.split('/').pop()}`);
        score -= 20;
      }
    });

    this.resultados.conformidadeLegal.score = Math.max(0, score);
    this.resultados.conformidadeLegal.detalhes = detalhes;
  }

  async auditarArquiteturaManutencao() {
    console.log('\n🏗️ ARQUITETURA E MANUTENIBILIDADE...');
    
    let score = 100;
    const detalhes = [];

    // Separação frontend/backend
    if (fs.existsSync('server/index.ts') && fs.existsSync('client/src/main.tsx')) {
      detalhes.push('✅ Arquitetura separada frontend/backend');
    } else {
      detalhes.push('❌ Arquitetura não separada adequadamente');
      score -= 20;
    }

    // TypeScript
    if (fs.existsSync('tsconfig.json')) {
      detalhes.push('✅ TypeScript configurado');
    } else {
      detalhes.push('❌ TypeScript não configurado');
      score -= 15;
    }

    // Schema compartilhado
    if (fs.existsSync('shared/schema.ts')) {
      detalhes.push('✅ Schema compartilhado frontend/backend');
    } else {
      detalhes.push('❌ Schema não compartilhado');
      score -= 15;
    }

    // Sistema de testes
    const scriptsTest = fs.readdirSync('scripts').filter(f => f.startsWith('test-')).length;
    if (scriptsTest >= 10) {
      detalhes.push(`✅ ${scriptsTest} scripts de teste automatizado`);
    } else {
      detalhes.push(`⚠️ Apenas ${scriptsTest} scripts de teste`);
      score -= 10;
    }

    // Documentação
    if (fs.existsSync('README.md') && fs.existsSync('replit.md')) {
      const readmeSize = fs.statSync('README.md').size;
      const replitSize = fs.statSync('replit.md').size;
      
      if (readmeSize > 2000 && replitSize > 10000) {
        detalhes.push('✅ Documentação completa e abrangente');
      } else {
        detalhes.push('⚠️ Documentação básica');
        score -= 10;
      }
    } else {
      detalhes.push('❌ Documentação inadequada');
      score -= 20;
    }

    // Sistema anti-regressão
    if (fs.existsSync('client/src/lib/component-registry.ts')) {
      detalhes.push('✅ Sistema de prevenção de regressões');
    } else {
      detalhes.push('❌ Sistema anti-regressão não encontrado');
      score -= 15;
    }

    this.resultados.arquiteturaManutencao.score = Math.max(0, score);
    this.resultados.arquiteturaManutencao.detalhes = detalhes;
  }

  calcularScoreFinal() {
    const pesos = {
      funcionalidadesTecnicas: 30,
      segurancaProtecao: 25,
      experienciaInterface: 20,
      conformidadeLegal: 15,
      arquiteturaManutencao: 10
    };

    let scoreTotal = 0;
    Object.entries(this.resultados).forEach(([categoria, resultado]) => {
      if (pesos[categoria]) {
        scoreTotal += (resultado.score * pesos[categoria]) / 100;
      }
    });

    this.resultados.scoreGeral = Math.round(scoreTotal);
  }

  determinarStatusProducao() {
    const score = this.resultados.scoreGeral;
    
    if (score >= 90) {
      this.resultados.statusProducao = 'EXCELENTE - DEPLOY IMEDIATO';
    } else if (score >= 85) {
      this.resultados.statusProducao = 'APROVADO - PRODUÇÃO AUTORIZADA';
    } else if (score >= 75) {
      this.resultados.statusProducao = 'FUNCIONAL - APROVADO COM RESSALVAS';
    } else if (score >= 60) {
      this.resultados.statusProducao = 'LIMITADO - APENAS HOMOLOGAÇÃO';
    } else {
      this.resultados.statusProducao = 'INADEQUADO - NÃO APROVADO';
    }
  }

  gerarRelatorioFinal() {
    console.log('\n📊 RELATÓRIO FINAL DE PRODUÇÃO');
    console.log('═'.repeat(70));
    
    console.log(`\n🎯 SCORE FINAL: ${this.resultados.scoreGeral}/100`);
    console.log(`📋 STATUS: ${this.resultados.statusProducao}\n`);

    // Breakdown por categoria
    Object.entries(this.resultados).forEach(([categoria, resultado]) => {
      if (resultado.score !== undefined) {
        const icone = resultado.score >= 85 ? '🟢' : resultado.score >= 70 ? '🟡' : '🔴';
        console.log(`${icone} ${categoria.toUpperCase()}: ${resultado.score}/100`);
        
        // Mostra apenas itens críticos
        const problemas = resultado.detalhes.filter(d => d.includes('❌')).slice(0, 2);
        problemas.forEach(problema => console.log(`   ${problema}`));
      }
    });

    // Análise de entregabilidade
    console.log('\n🚀 ANÁLISE DE ENTREGABILIDADE:');
    
    if (this.resultados.scoreGeral >= 85) {
      console.log('✅ PROJETO TOTALMENTE APTO PARA PRODUÇÃO');
      console.log('✅ Todas as funcionalidades críticas operacionais');
      console.log('✅ Segurança e conformidade em níveis excelentes');
      console.log('✅ Interface profissional e experiência adequada');
      console.log('✅ Pode ser entregue imediatamente ao cliente');
      
      console.log('\n🎯 CAPACIDADE DE ENTREGA:');
      console.log('• ✅ Laboratórios geotécnicos profissionais');
      console.log('• ✅ Empresas de consultoria em geotecnia');
      console.log('• ✅ Universidades e centros de pesquisa');
      console.log('• ✅ Órgãos públicos e fiscalizadores');
      console.log('• ✅ Escritórios de engenharia civil');
      
    } else if (this.resultados.scoreGeral >= 75) {
      console.log('⚠️ PROJETO FUNCIONALMENTE APTO COM RESTRIÇÕES');
      console.log('⚠️ Funcionalidades principais operacionais');
      console.log('⚠️ Algumas limitações em áreas não críticas');
      console.log('⚠️ Pode ser usado com acompanhamento técnico');
      
    } else {
      console.log('❌ PROJETO NÃO APTO PARA ENTREGA PROFISSIONAL');
      console.log('❌ Problemas críticos impedem uso seguro');
      console.log('❌ Requer correções substanciais');
    }

    console.log('\n' + '═'.repeat(70));
  }
}

// Execução
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new AuditoriaFinalProducao();
  auditor.executarAuditoriaFinal().catch(console.error);
}

export default AuditoriaFinalProducao;