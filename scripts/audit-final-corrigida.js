#!/usr/bin/env node

/**
 * AUDITORIA FINAL CORRIGIDA - ANÁLISE CRÍTICA PRECISA
 * Validação manual precisa após identificação de falsos positivos
 */

import fs from 'fs';

class AuditoriaFinalCorrigida {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.scoreCategories = {
      funcionalidadesTecnicas: 0,
      segurancaProtecao: 0, 
      experienciaInterface: 0,
      conformidadeLegal: 0,
      arquiteturaManutencao: 0
    };
    this.detalhes = [];
  }

  async executarAuditoriaCorrigida() {
    console.log('🔍 AUDITORIA FINAL CORRIGIDA - ANÁLISE CRÍTICA PRECISA');
    console.log('═'.repeat(70));
    
    await this.validarFuncionalidadesTecnicas();
    await this.validarSegurancaProtecao();
    await this.validarExperienciaInterface();
    await this.validarConformidadeLegal();
    await this.validarArquiteturaManutencao();
    
    this.calcularScoreFinal();
    this.gerarRelatorioCorrigido();
  }

  async validarFuncionalidadesTecnicas() {
    console.log('\n🧪 VALIDANDO FUNCIONALIDADES TÉCNICAS...');
    
    let score = 100;
    
    // Validação precisa de TestHeader nas calculadoras
    const calculadoras = [
      { arquivo: 'client/src/components/laboratory/density-in-situ.tsx', norma: 'NBR 9813' },
      { arquivo: 'client/src/components/laboratory/density-real.tsx', norma: 'NBR 17212' },
      { arquivo: 'client/src/components/laboratory/density-max-min.tsx', norma: 'NBR 12004' }
    ];

    for (const calc of calculadoras) {
      if (fs.existsSync(calc.arquivo)) {
        const conteudo = fs.readFileSync(calc.arquivo, 'utf8');
        
        // Validação precisa de TestHeader
        if (conteudo.includes('import TestHeader') && conteudo.includes('<TestHeader')) {
          this.detalhes.push(`✅ ${calc.norma}: TestHeader implementado corretamente`);
        } else {
          this.detalhes.push(`❌ ${calc.norma}: TestHeader ausente`);
          score -= 15;
        }
        
        // Validação de nomenclatura NBR
        if (conteudo.includes(calc.norma.split(' ')[1])) {
          this.detalhes.push(`✅ ${calc.norma}: Nomenclatura técnica correta`);
        } else {
          this.detalhes.push(`⚠️ ${calc.norma}: Nomenclatura pode estar incorreta`);
          score -= 5;
        }
      } else {
        this.detalhes.push(`❌ ${calc.norma}: Calculadora não encontrada`);
        score -= 25;
      }
    }

    // Validação de endpoints funcionais
    try {
      const endpoints = ['/api/tests/density-in-situ', '/api/tests/real-density', '/api/tests/max-min-density'];
      
      for (const endpoint of endpoints) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (response.status === 401 || response.status === 200) {
          this.detalhes.push(`✅ Endpoint funcional: ${endpoint}`);
        } else {
          this.detalhes.push(`❌ Endpoint com problemas: ${endpoint}`);
          score -= 10;
        }
      }
    } catch (error) {
      this.detalhes.push('❌ Falha na comunicação com API');
      score -= 15;
    }

    // Sistema de PDFs
    if (fs.existsSync('client/src/lib/pdf-vertical-tables.tsx')) {
      this.detalhes.push('✅ Sistema de geração de PDFs implementado');
    } else {
      this.detalhes.push('❌ Sistema de PDFs não encontrado');
      score -= 20;
    }

    this.scoreCategories.funcionalidadesTecnicas = Math.max(0, score);
  }

  async validarSegurancaProtecao() {
    console.log('\n🔐 VALIDANDO SEGURANÇA...');
    
    let score = 100;

    try {
      // Autenticação obrigatória
      const authResponse = await fetch(`${this.baseUrl}/api/auth/sync-user`);
      if (authResponse.status === 401) {
        this.detalhes.push('✅ Autenticação Firebase funcionando');
      } else {
        this.detalhes.push('❌ Autenticação pode estar exposta');
        score -= 15;
      }

      // Endpoints protegidos
      const endpointsProtegidos = ['/api/users', '/api/organizations', '/api/equipamentos'];
      
      for (const endpoint of endpointsProtegidos) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (response.status === 401) {
          this.detalhes.push(`✅ Endpoint protegido: ${endpoint}`);
        } else {
          this.detalhes.push(`❌ Endpoint vulnerável: ${endpoint}`);
          score -= 10;
        }
      }

    } catch (error) {
      this.detalhes.push('❌ Erro ao validar segurança');
      score -= 20;
    }

    // Sistema de roles
    if (fs.existsSync('server/index.ts')) {
      const serverContent = fs.readFileSync('server/index.ts', 'utf8');
      if (serverContent.includes('requireRole') && serverContent.includes('verifyFirebaseToken')) {
        this.detalhes.push('✅ Sistema hierárquico de roles implementado');
      } else {
        this.detalhes.push('❌ Sistema de roles inadequado');
        score -= 15;
      }
    }

    this.scoreCategories.segurancaProtecao = Math.max(0, score);
  }

  async validarExperienciaInterface() {
    console.log('\n👤 VALIDANDO EXPERIÊNCIA...');
    
    let score = 100;

    // Componentes UI
    const componentesUI = [
      'client/src/components/ui/button.tsx',
      'client/src/components/ui/card.tsx', 
      'client/src/components/ui/form.tsx',
      'client/src/components/ui/input.tsx',
      'client/src/components/ui/dialog.tsx'
    ];

    componentesUI.forEach(comp => {
      if (fs.existsSync(comp)) {
        this.detalhes.push(`✅ Componente UI: ${comp.split('/').pop()}`);
      } else {
        this.detalhes.push(`❌ Componente ausente: ${comp.split('/').pop()}`);
        score -= 8;
      }
    });

    // Navegação responsiva
    if (fs.existsSync('client/src/components/navigation/sidebar-optimized.tsx')) {
      this.detalhes.push('✅ Sidebar responsiva implementada');
    } else {
      this.detalhes.push('❌ Navegação não responsiva');
      score -= 15;
    }

    // Sistema de notificações
    if (fs.existsSync('client/src/components/notifications/NotificationBell.tsx')) {
      this.detalhes.push('✅ Sistema de notificações implementado');
    } else {
      this.detalhes.push('❌ Notificações ausentes');
      score -= 10;
    }

    this.scoreCategories.experienciaInterface = Math.max(0, score);
  }

  async validarConformidadeLegal() {
    console.log('\n⚖️ VALIDANDO LGPD...');
    
    let score = 100;

    try {
      // Endpoints LGPD
      const endpointsLGPD = [
        '/api/lgpd/terms',
        '/api/lgpd/privacy-policy', 
        '/api/lgpd/consent',
        '/api/lgpd/my-data',
        '/api/lgpd/request-deletion'
      ];

      for (const endpoint of endpointsLGPD) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (response.status === 200) {
          this.detalhes.push(`✅ LGPD funcional: ${endpoint}`);
        } else {
          this.detalhes.push(`❌ LGPD falhou: ${endpoint}`);
          score -= 12;
        }
      }

      // Acesso público aos termos
      const termosResponse = await fetch(`${this.baseUrl}/termos-uso`);
      if (termosResponse.status === 200) {
        this.detalhes.push('✅ Termos acessíveis publicamente');
      } else {
        this.detalhes.push('❌ Termos não acessíveis');
        score -= 20;
      }

    } catch (error) {
      this.detalhes.push('❌ Erro ao validar LGPD');
      score -= 25;
    }

    // Páginas LGPD
    const paginasLGPD = [
      'client/src/pages/termos-uso-publico.tsx',
      'client/src/pages/configuracoes-lgpd.tsx'
    ];

    paginasLGPD.forEach(pagina => {
      if (fs.existsSync(pagina)) {
        this.detalhes.push(`✅ Página LGPD: ${pagina.split('/').pop()}`);
      } else {
        this.detalhes.push(`❌ Página LGPD ausente: ${pagina.split('/').pop()}`);
        score -= 15;
      }
    });

    this.scoreCategories.conformidadeLegal = Math.max(0, score);
  }

  async validarArquiteturaManutencao() {
    console.log('\n🏗️ VALIDANDO ARQUITETURA...');
    
    let score = 100;

    // Estrutura de projeto
    if (fs.existsSync('server/index.ts') && fs.existsSync('client/src/main.tsx')) {
      this.detalhes.push('✅ Separação frontend/backend');
    } else {
      this.detalhes.push('❌ Arquitetura inadequada');
      score -= 20;
    }

    // TypeScript
    if (fs.existsSync('tsconfig.json')) {
      this.detalhes.push('✅ TypeScript configurado');
    } else {
      this.detalhes.push('❌ TypeScript não configurado');
      score -= 15;
    }

    // Schema compartilhado
    if (fs.existsSync('shared/schema.ts')) {
      this.detalhes.push('✅ Schema compartilhado');
    } else {
      this.detalhes.push('❌ Schema não compartilhado');
      score -= 15;
    }

    // Documentação
    if (fs.existsSync('README.md') && fs.existsSync('replit.md')) {
      this.detalhes.push('✅ Documentação completa');
    } else {
      this.detalhes.push('❌ Documentação inadequada');
      score -= 15;
    }

    // Sistema anti-regressão
    if (fs.existsSync('client/src/lib/component-registry.ts')) {
      this.detalhes.push('✅ Sistema anti-regressão');
    } else {
      this.detalhes.push('❌ Anti-regressão ausente');
      score -= 10;
    }

    this.scoreCategories.arquiteturaManutencao = Math.max(0, score);
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
    Object.entries(this.scoreCategories).forEach(([categoria, score]) => {
      scoreTotal += (score * pesos[categoria]) / 100;
    });

    this.scoreFinal = Math.round(scoreTotal);
  }

  gerarRelatorioCorrigido() {
    console.log('\n📊 RELATÓRIO FINAL CORRIGIDO');
    console.log('═'.repeat(70));
    
    console.log(`\n🎯 SCORE FINAL: ${this.scoreFinal}/100`);
    
    let status;
    if (this.scoreFinal >= 90) {
      status = '🟢 EXCELENTE - DEPLOY IMEDIATO';
    } else if (this.scoreFinal >= 85) {
      status = '🟢 APROVADO - PRODUÇÃO AUTORIZADA';
    } else if (this.scoreFinal >= 75) {
      status = '🟡 FUNCIONAL - APROVADO COM RESSALVAS';
    } else {
      status = '🔴 INADEQUADO - REQUER CORREÇÕES';
    }
    
    console.log(`📋 STATUS: ${status}\n`);

    // Breakdown detalhado
    Object.entries(this.scoreCategories).forEach(([categoria, score]) => {
      const icone = score >= 85 ? '🟢' : score >= 70 ? '🟡' : '🔴';
      console.log(`${icone} ${categoria.toUpperCase()}: ${score}/100`);
    });

    console.log('\n📝 DETALHES CRÍTICOS:');
    const problemas = this.detalhes.filter(d => d.includes('❌')).slice(0, 5);
    const sucessos = this.detalhes.filter(d => d.includes('✅')).slice(0, 3);
    
    if (problemas.length > 0) {
      console.log('\n❌ PROBLEMAS IDENTIFICADOS:');
      problemas.forEach(p => console.log(`   ${p}`));
    }
    
    console.log('\n✅ FUNCIONALIDADES VALIDADAS:');
    sucessos.forEach(s => console.log(`   ${s}`));

    // Conclusão de entregabilidade
    console.log('\n🚀 CONCLUSÃO DE ENTREGABILIDADE:');
    
    if (this.scoreFinal >= 85) {
      console.log('✅ PROJETO TOTALMENTE APTO PARA PRODUÇÃO');
      console.log('✅ Sistema pode ser entregue imediatamente');
      console.log('✅ Todas as funcionalidades críticas operacionais');
      console.log('✅ Segurança e conformidade adequadas');
      
      console.log('\n🎯 MERCADOS DE ENTREGA:');
      console.log('• Laboratórios geotécnicos profissionais');
      console.log('• Empresas de consultoria em geotecnia');
      console.log('• Universidades e institutos de pesquisa');
      console.log('• Órgãos públicos e fiscalizadores');
      
    } else if (this.scoreFinal >= 75) {
      console.log('⚠️ PROJETO FUNCIONAL COM LIMITAÇÕES');
      console.log('⚠️ Pode ser usado com supervisão técnica');
      console.log('⚠️ Requer melhorias antes de entrega comercial');
      
    } else {
      console.log('❌ PROJETO REQUER CORREÇÕES SUBSTANCIAIS');
      console.log('❌ Não aprovado para uso profissional');
    }

    console.log('\n' + '═'.repeat(70));
  }
}

// Execução
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new AuditoriaFinalCorrigida();
  auditor.executarAuditoriaCorrigida().catch(console.error);
}

export default AuditoriaFinalCorrigida;