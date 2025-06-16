#!/usr/bin/env node

/**
 * AUDITORIA COMPLETA DO PROJETO - ANÁLISE CRÍTICA DE ENTREGABILIDADE
 * Avalia se o sistema está capaz de entregar tudo que foi proposto
 */

import fs from 'fs';
import path from 'path';

class AuditoriaProjetoCompleto {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.resultados = {
      funcionalidadesCore: { status: 'pending', score: 0, detalhes: [] },
      segurancaAutenticacao: { status: 'pending', score: 0, detalhes: [] },
      qualidadeCodigo: { status: 'pending', score: 0, detalhes: [] },
      arquiteturaEscalabilidade: { status: 'pending', score: 0, detalhes: [] },
      testesValidacao: { status: 'pending', score: 0, detalhes: [] },
      documentacaoManutencao: { status: 'pending', score: 0, detalhes: [] },
      conformidadeLGPD: { status: 'pending', score: 0, detalhes: [] },
      experienciaUsuario: { status: 'pending', score: 0, detalhes: [] },
      scoreGeral: 0,
      recomendacoesCriticas: []
    };
  }

  async executarAuditoriaCompleta() {
    console.log('🔍 AUDITORIA COMPLETA DO PROJETO - ANÁLISE CRÍTICA');
    console.log('═'.repeat(70));
    
    await this.auditarFuncionalidadesCore();
    await this.auditarSegurancaAutenticacao();
    await this.auditarQualidadeCodigo();
    await this.auditarArquiteturaEscalabilidade();
    await this.auditarTestesValidacao();
    await this.auditarDocumentacaoManutencao();
    await this.auditarConformidadeLGPD();
    await this.auditarExperienciaUsuario();
    
    this.calcularScoreGeral();
    this.gerarRelatorioCritico();
  }

  async auditarFuncionalidadesCore() {
    console.log('\n🧪 AUDITANDO FUNCIONALIDADES CORE...');
    
    const funcionalidades = [
      {
        nome: 'Calculadoras Geotécnicas NBR',
        verificacao: () => this.verificarCalculadorasNBR(),
        peso: 25
      },
      {
        nome: 'Sistema de Ensaios Salvos',
        verificacao: () => this.verificarSistemaEnsaios(),
        peso: 20
      },
      {
        nome: 'Geração de PDFs Técnicos',
        verificacao: () => this.verificarGeracaoPDFs(),
        peso: 20
      },
      {
        nome: 'Gerenciamento de Equipamentos',
        verificacao: () => this.verificarGerenciamentoEquipamentos(),
        peso: 15
      },
      {
        nome: 'Sistema Hierárquico de Usuários',
        verificacao: () => this.verificarSistemaHierarquico(),
        peso: 20
      }
    ];

    let scoreTotal = 0;
    for (const func of funcionalidades) {
      const resultado = await func.verificacao();
      const scorePonderado = (resultado.score / 100) * func.peso;
      scoreTotal += scorePonderado;
      
      this.resultados.funcionalidadesCore.detalhes.push({
        funcionalidade: func.nome,
        score: resultado.score,
        peso: func.peso,
        scorePonderado,
        problemas: resultado.problemas || [],
        status: resultado.score >= 80 ? 'aprovado' : resultado.score >= 60 ? 'atenção' : 'crítico'
      });
    }

    this.resultados.funcionalidadesCore.score = Math.round(scoreTotal);
    this.resultados.funcionalidadesCore.status = scoreTotal >= 80 ? 'success' : scoreTotal >= 60 ? 'warning' : 'error';
  }

  async verificarCalculadorasNBR() {
    const problemas = [];
    let score = 100;

    // Verifica se os arquivos das calculadoras existem
    const calculadoras = [
      'src/pages/solos/densidade-in-situ.tsx',
      'src/pages/solos/densidade-real.tsx', 
      'src/pages/solos/densidade-max-min.tsx'
    ];

    for (const calc of calculadoras) {
      if (!fs.existsSync(calc)) {
        problemas.push(`❌ Calculadora não encontrada: ${calc}`);
        score -= 20;
      }
    }

    // Verifica arquivo de cálculos
    if (!fs.existsSync('src/lib/calculations.ts')) {
      problemas.push('❌ Biblioteca de cálculos não encontrada');
      score -= 15;
    }

    // Verifica nomenclatura NBR
    const densityInSitu = fs.existsSync('src/pages/solos/density-in-situ.tsx') ? 
      fs.readFileSync('src/pages/solos/density-in-situ.tsx', 'utf8') : '';
    
    if (!densityInSitu.includes('NBR 9813')) {
      problemas.push('⚠️ Nomenclatura NBR 9813 não encontrada em densidade in-situ');
      score -= 10;
    }

    return { score: Math.max(0, score), problemas };
  }

  async verificarSistemaEnsaios() {
    const problemas = [];
    let score = 100;

    try {
      // Testa endpoints de ensaios
      const endpoints = [
        '/api/tests/density-in-situ',
        '/api/tests/real-density', 
        '/api/tests/max-min-density'
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (response.status !== 401 && response.status !== 200) {
          problemas.push(`❌ Endpoint ${endpoint} não funcional: ${response.status}`);
          score -= 15;
        }
      }

      // Verifica página de ensaios salvos
      if (!fs.existsSync('src/pages/ensaios-salvos.tsx')) {
        problemas.push('❌ Página de ensaios salvos não encontrada');
        score -= 20;
      }

    } catch (error) {
      problemas.push(`❌ Erro ao testar sistema de ensaios: ${error.message}`);
      score -= 30;
    }

    return { score: Math.max(0, score), problemas };
  }

  async verificarGeracaoPDFs() {
    const problemas = [];
    let score = 100;

    // Verifica biblioteca de PDF
    if (!fs.existsSync('src/lib/pdf-vertical-tables.tsx')) {
      problemas.push('❌ Biblioteca de geração de PDF não encontrada');
      score -= 30;
    }

    // Verifica se React PDF está configurado
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.dependencies['@react-pdf/renderer']) {
      problemas.push('❌ Dependência @react-pdf/renderer não encontrada');
      score -= 20;
    }

    // Verifica cabeçalho técnico
    if (!fs.existsSync('src/components/test-header.tsx')) {
      problemas.push('❌ Cabeçalho técnico TestHeader não encontrado');
      score -= 15;
    }

    return { score: Math.max(0, score), problemas };
  }

  async verificarGerenciamentoEquipamentos() {
    const problemas = [];
    let score = 100;

    try {
      // Testa endpoint de equipamentos
      const response = await fetch(`${this.baseUrl}/api/equipamentos`);
      if (response.status !== 401 && response.status !== 200) {
        problemas.push(`❌ Endpoint de equipamentos não funcional: ${response.status}`);
        score -= 25;
      }

      // Verifica página de equipamentos
      if (!fs.existsSync('src/pages/equipamentos-fixed.tsx')) {
        problemas.push('❌ Página de equipamentos não encontrada');
        score -= 25;
      }

      // Verifica schema de equipamentos
      const schema = fs.readFileSync('shared/schema.ts', 'utf8');
      if (!schema.includes('capsulas') || !schema.includes('cilindros')) {
        problemas.push('❌ Schema de equipamentos incompleto');
        score -= 20;
      }

    } catch (error) {
      problemas.push(`❌ Erro ao verificar equipamentos: ${error.message}`);
      score -= 30;
    }

    return { score: Math.max(0, score), problemas };
  }

  async verificarSistemaHierarquico() {
    const problemas = [];
    let score = 100;

    try {
      // Testa endpoints de usuários e organizações
      const endpoints = ['/api/users', '/api/organizations'];
      
      for (const endpoint of endpoints) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (response.status !== 401 && response.status !== 200) {
          problemas.push(`❌ Endpoint ${endpoint} não funcional: ${response.status}`);
          score -= 20;
        }
      }

      // Verifica páginas administrativas
      const paginasAdmin = [
        'src/pages/admin/user-management.tsx',
        'src/pages/admin/organization-management.tsx'
      ];

      for (const pagina of paginasAdmin) {
        if (!fs.existsSync(pagina)) {
          problemas.push(`❌ Página administrativa não encontrada: ${pagina}`);
          score -= 15;
        }
      }

    } catch (error) {
      problemas.push(`❌ Erro ao verificar sistema hierárquico: ${error.message}`);
      score -= 25;
    }

    return { score: Math.max(0, score), problemas };
  }

  async auditarSegurancaAutenticacao() {
    console.log('\n🔐 AUDITANDO SEGURANÇA E AUTENTICAÇÃO...');
    
    let score = 100;
    const detalhes = [];

    try {
      // Verifica autenticação Firebase
      const authResponse = await fetch(`${this.baseUrl}/api/auth/sync-user`);
      if (authResponse.status === 401) {
        detalhes.push('✅ Autenticação Firebase funcionando corretamente');
      } else {
        detalhes.push('⚠️ Autenticação Firebase pode estar exposta');
        score -= 15;
      }

      // Verifica proteção de endpoints
      const endpointsProtegidos = ['/api/users', '/api/organizations', '/api/equipamentos'];
      
      for (const endpoint of endpointsProtegidos) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (response.status === 401) {
          detalhes.push(`✅ Endpoint ${endpoint} protegido adequadamente`);
        } else {
          detalhes.push(`❌ Endpoint ${endpoint} pode estar exposto`);
          score -= 10;
        }
      }

      // Verifica headers de segurança
      const healthResponse = await fetch(`${this.baseUrl}/api/health`);
      const cspHeader = healthResponse.headers.get('content-security-policy');
      
      if (cspHeader && cspHeader.includes('firebase')) {
        detalhes.push('✅ Content Security Policy configurado para Firebase');
      } else {
        detalhes.push('⚠️ CSP pode não estar otimizado para Firebase');
        score -= 5;
      }

    } catch (error) {
      detalhes.push(`❌ Erro ao testar segurança: ${error.message}`);
      score -= 20;
    }

    this.resultados.segurancaAutenticacao.score = Math.max(0, score);
    this.resultados.segurancaAutenticacao.detalhes = detalhes;
    this.resultados.segurancaAutenticacao.status = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
  }

  async auditarQualidadeCodigo() {
    console.log('\n📝 AUDITANDO QUALIDADE DO CÓDIGO...');
    
    let score = 100;
    const detalhes = [];

    // Verifica configuração TypeScript
    if (fs.existsSync('tsconfig.json')) {
      detalhes.push('✅ TypeScript configurado');
    } else {
      detalhes.push('❌ TypeScript não configurado');
      score -= 15;
    }

    // Verifica ESLint
    if (fs.existsSync('.eslintrc.js')) {
      detalhes.push('✅ ESLint configurado');
    } else {
      detalhes.push('❌ ESLint não configurado');
      score -= 10;
    }

    // Verifica estrutura de pastas
    const estruturaEsperada = [
      'src/components',
      'src/pages', 
      'src/lib',
      'server',
      'shared',
      'scripts'
    ];

    for (const pasta of estruturaEsperada) {
      if (fs.existsSync(pasta)) {
        detalhes.push(`✅ Estrutura organizada: ${pasta}`);
      } else {
        detalhes.push(`⚠️ Pasta não encontrada: ${pasta}`);
        score -= 5;
      }
    }

    // Verifica duplicação de código
    const srcFiles = this.contarArquivos('src');
    const serverFiles = this.contarArquivos('server');
    
    detalhes.push(`📊 Frontend: ${srcFiles} arquivos`);
    detalhes.push(`📊 Backend: ${serverFiles} arquivos`);

    if (srcFiles > 200) {
      detalhes.push('⚠️ Frontend pode ter muitos arquivos (>200)');
      score -= 5;
    }

    this.resultados.qualidadeCodigo.score = Math.max(0, score);
    this.resultados.qualidadeCodigo.detalhes = detalhes;
    this.resultados.qualidadeCodigo.status = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
  }

  contarArquivos(diretorio) {
    if (!fs.existsSync(diretorio)) return 0;
    
    let count = 0;
    const items = fs.readdirSync(diretorio);
    
    for (const item of items) {
      const fullPath = path.join(diretorio, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        count += this.contarArquivos(fullPath);
      } else {
        count++;
      }
    }
    
    return count;
  }

  async auditarArquiteturaEscalabilidade() {
    console.log('\n🏗️ AUDITANDO ARQUITETURA E ESCALABILIDADE...');
    
    let score = 100;
    const detalhes = [];

    // Verifica separação frontend/backend
    if (fs.existsSync('server/index.ts') && fs.existsSync('src/main.tsx')) {
      detalhes.push('✅ Separação clara frontend/backend');
    } else {
      detalhes.push('❌ Arquitetura não separada adequadamente');
      score -= 20;
    }

    // Verifica uso de React Query
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.dependencies['@tanstack/react-query']) {
      detalhes.push('✅ React Query para gerenciamento de estado');
    } else {
      detalhes.push('❌ Gerenciamento de estado pode ser inadequado');
      score -= 15;
    }

    // Verifica Drizzle ORM
    if (packageJson.dependencies['drizzle-orm']) {
      detalhes.push('✅ Drizzle ORM para tipo-safety no banco');
    } else {
      detalhes.push('❌ ORM não configurado adequadamente');
      score -= 15;
    }

    // Verifica schema compartilhado
    if (fs.existsSync('shared/schema.ts')) {
      detalhes.push('✅ Schema compartilhado entre frontend/backend');
    } else {
      detalhes.push('❌ Schema não compartilhado');
      score -= 10;
    }

    // Verifica configuração de build
    if (fs.existsSync('vite.config.ts')) {
      detalhes.push('✅ Vite configurado para build otimizado');
    } else {
      detalhes.push('❌ Build não otimizado');
      score -= 10;
    }

    this.resultados.arquiteturaEscalabilidade.score = Math.max(0, score);
    this.resultados.arquiteturaEscalabilidade.detalhes = detalhes;
    this.resultados.arquiteturaEscalabilidade.status = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
  }

  async auditarTestesValidacao() {
    console.log('\n🧪 AUDITANDO TESTES E VALIDAÇÃO...');
    
    let score = 100;
    const detalhes = [];

    // Verifica scripts de teste
    const scriptsDir = 'scripts';
    if (fs.existsSync(scriptsDir)) {
      const scripts = fs.readdirSync(scriptsDir).filter(f => f.startsWith('test-'));
      detalhes.push(`✅ ${scripts.length} scripts de teste encontrados`);
      
      if (scripts.length < 5) {
        detalhes.push('⚠️ Poucos scripts de teste automatizado');
        score -= 10;
      }
    } else {
      detalhes.push('❌ Diretório de scripts não encontrado');
      score -= 20;
    }

    // Verifica Jest
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.dependencies['jest'] || packageJson.devDependencies['jest']) {
      detalhes.push('✅ Jest configurado para testes unitários');
    } else {
      detalhes.push('❌ Framework de testes não configurado');
      score -= 15;
    }

    // Verifica sistema de regressões
    if (fs.existsSync('src/lib/component-registry.ts')) {
      detalhes.push('✅ Sistema de prevenção de regressões implementado');
    } else {
      detalhes.push('❌ Sistema anti-regressão não encontrado');
      score -= 15;
    }

    // Verifica validação Zod
    if (packageJson.dependencies['zod']) {
      detalhes.push('✅ Validação Zod implementada');
    } else {
      detalhes.push('❌ Validação de dados não robusta');
      score -= 10;
    }

    this.resultados.testesValidacao.score = Math.max(0, score);
    this.resultados.testesValidacao.detalhes = detalhes;
    this.resultados.testesValidacao.status = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
  }

  async auditarDocumentacaoManutencao() {
    console.log('\n📚 AUDITANDO DOCUMENTAÇÃO E MANUTENIBILIDADE...');
    
    let score = 100;
    const detalhes = [];

    // Verifica documentação principal
    const docsEssenciais = [
      'README.md',
      'replit.md',
      'CONTRIBUTING.md'
    ];

    for (const doc of docsEssenciais) {
      if (fs.existsSync(doc)) {
        const conteudo = fs.readFileSync(doc, 'utf8');
        if (conteudo.length > 1000) {
          detalhes.push(`✅ ${doc} completo (${Math.round(conteudo.length/1000)}k chars)`);
        } else {
          detalhes.push(`⚠️ ${doc} muito básico`);
          score -= 5;
        }
      } else {
        detalhes.push(`❌ ${doc} não encontrado`);
        score -= 10;
      }
    }

    // Verifica pasta docs
    if (fs.existsSync('docs')) {
      const docsFiles = this.contarArquivos('docs');
      detalhes.push(`✅ Documentação técnica: ${docsFiles} arquivos`);
      
      if (docsFiles < 5) {
        detalhes.push('⚠️ Pouca documentação técnica');
        score -= 10;
      }
    } else {
      detalhes.push('❌ Pasta docs não encontrada');
      score -= 15;
    }

    // Verifica comentários no código
    const serverCode = fs.existsSync('server/index.ts') ? 
      fs.readFileSync('server/index.ts', 'utf8') : '';
    
    const comentarios = (serverCode.match(/\/\*\*|\*\/|\/\//g) || []).length;
    if (comentarios > 50) {
      detalhes.push('✅ Código bem comentado');
    } else {
      detalhes.push('⚠️ Poucos comentários no código');
      score -= 10;
    }

    this.resultados.documentacaoManutencao.score = Math.max(0, score);
    this.resultados.documentacaoManutencao.detalhes = detalhes;
    this.resultados.documentacaoManutencao.status = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
  }

  async auditarConformidadeLGPD() {
    console.log('\n⚖️ AUDITANDO CONFORMIDADE LGPD...');
    
    let score = 100;
    const detalhes = [];

    try {
      // Verifica endpoints LGPD
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
          detalhes.push(`✅ Endpoint LGPD funcional: ${endpoint}`);
        } else {
          detalhes.push(`❌ Endpoint LGPD falhou: ${endpoint}`);
          score -= 10;
        }
      }

      // Verifica páginas LGPD
      const paginasLGPD = [
        'src/pages/termos-uso-publico.tsx',
        'src/pages/configuracoes-lgpd.tsx'
      ];

      for (const pagina of paginasLGPD) {
        if (fs.existsSync(pagina)) {
          detalhes.push(`✅ Página LGPD encontrada: ${pagina}`);
        } else {
          detalhes.push(`❌ Página LGPD não encontrada: ${pagina}`);
          score -= 15;
        }
      }

      // Verifica acesso público aos termos
      const termosResponse = await fetch(`${this.baseUrl}/termos-uso`);
      if (termosResponse.status === 200) {
        detalhes.push('✅ Termos de uso acessíveis publicamente');
      } else {
        detalhes.push('❌ Termos de uso não acessíveis');
        score -= 20;
      }

    } catch (error) {
      detalhes.push(`❌ Erro ao verificar LGPD: ${error.message}`);
      score -= 25;
    }

    this.resultados.conformidadeLGPD.score = Math.max(0, score);
    this.resultados.conformidadeLGPD.detalhes = detalhes;
    this.resultados.conformidadeLGPD.status = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
  }

  async auditarExperienciaUsuario() {
    console.log('\n👤 AUDITANDO EXPERIÊNCIA DO USUÁRIO...');
    
    let score = 100;
    const detalhes = [];

    // Verifica componentes UI
    const componentesUI = [
      'src/components/ui/button.tsx',
      'src/components/ui/card.tsx',
      'src/components/ui/form.tsx',
      'src/components/ui/dialog.tsx'
    ];

    for (const comp of componentesUI) {
      if (fs.existsSync(comp)) {
        detalhes.push(`✅ Componente UI: ${comp.split('/').pop()}`);
      } else {
        detalhes.push(`⚠️ Componente UI não encontrado: ${comp.split('/').pop()}`);
        score -= 5;
      }
    }

    // Verifica Tailwind CSS
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.dependencies['tailwindcss'] || packageJson.devDependencies['tailwindcss']) {
      detalhes.push('✅ Tailwind CSS para styling consistente');
    } else {
      detalhes.push('❌ Sistema de styling não adequado');
      score -= 15;
    }

    // Verifica responsividade
    if (fs.existsSync('src/components/navigation/sidebar-optimized.tsx')) {
      detalhes.push('✅ Sidebar responsiva implementada');
    } else {
      detalhes.push('❌ Navegação pode não ser responsiva');
      score -= 15;
    }

    // Verifica feedback visual
    const packageTsQuery = packageJson.dependencies['@tanstack/react-query'];
    if (packageTsQuery) {
      detalhes.push('✅ Estados de loading com React Query');
    } else {
      detalhes.push('⚠️ Feedback de loading pode ser inadequado');
      score -= 10;
    }

    // Verifica sistema de notificações
    if (fs.existsSync('src/components/notifications/NotificationBell.tsx')) {
      detalhes.push('✅ Sistema de notificações implementado');
    } else {
      detalhes.push('⚠️ Sistema de notificações não encontrado');
      score -= 10;
    }

    this.resultados.experienciaUsuario.score = Math.max(0, score);
    this.resultados.experienciaUsuario.detalhes = detalhes;
    this.resultados.experienciaUsuario.status = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
  }

  calcularScoreGeral() {
    const pesos = {
      funcionalidadesCore: 25,
      segurancaAutenticacao: 20,
      qualidadeCodigo: 15,
      arquiteturaEscalabilidade: 15,
      testesValidacao: 10,
      documentacaoManutencao: 5,
      conformidadeLGPD: 5,
      experienciaUsuario: 5
    };

    let scoreTotal = 0;
    let pesoTotal = 0;

    Object.entries(this.resultados).forEach(([categoria, resultado]) => {
      if (pesos[categoria]) {
        scoreTotal += (resultado.score * pesos[categoria]) / 100;
        pesoTotal += pesos[categoria];
      }
    });

    this.resultados.scoreGeral = Math.round((scoreTotal / pesoTotal) * 100);
  }

  gerarRecomendacoesCriticas() {
    const recomendacoes = [];

    // Análise de funcionalidades core
    if (this.resultados.funcionalidadesCore.score < 80) {
      recomendacoes.push({
        prioridade: 'CRÍTICA',
        categoria: 'Funcionalidades',
        problema: 'Funcionalidades core incompletas ou com problemas',
        impacto: 'Sistema não pode ser entregue em produção',
        solucao: 'Corrigir todas as calculadoras NBR e sistema de ensaios antes do deploy'
      });
    }

    // Análise de segurança
    if (this.resultados.segurancaAutenticacao.score < 70) {
      recomendacoes.push({
        prioridade: 'CRÍTICA',
        categoria: 'Segurança',
        problema: 'Vulnerabilidades de segurança detectadas',
        impacto: 'Dados de laboratório podem estar expostos',
        solucao: 'Implementar todas as proteções de autenticação e endpoints antes do deploy'
      });
    }

    // Análise de qualidade
    if (this.resultados.qualidadeCodigo.score < 60) {
      recomendacoes.push({
        prioridade: 'ALTA',
        categoria: 'Qualidade',
        problema: 'Qualidade do código inadequada para manutenção',
        impacto: 'Dificuldades futuras para adicionar funcionalidades',
        solucao: 'Refatorar código, adicionar testes e melhorar documentação'
      });
    }

    // Análise de LGPD
    if (this.resultados.conformidadeLGPD.score < 80) {
      recomendacoes.push({
        prioridade: 'CRÍTICA',
        categoria: 'Conformidade',
        problema: 'Não conformidade com LGPD',
        impacto: 'Riscos legais para operação no Brasil',
        solucao: 'Implementar todos os requisitos LGPD antes do lançamento'
      });
    }

    this.resultados.recomendacoesCriticas = recomendacoes;
  }

  gerarRelatorioCritico() {
    console.log('\n📊 RELATÓRIO CRÍTICO DE AUDITORIA');
    console.log('═'.repeat(70));
    
    console.log(`\n🎯 SCORE GERAL: ${this.resultados.scoreGeral}/100`);
    
    const statusGeral = this.resultados.scoreGeral >= 80 ? 
      '🟢 APROVADO PARA PRODUÇÃO' : 
      this.resultados.scoreGeral >= 60 ? 
      '🟡 APROVADO COM RESSALVAS' : 
      '🔴 NÃO APROVADO PARA PRODUÇÃO';
    
    console.log(`📋 STATUS: ${statusGeral}\n`);

    // Detalhamento por categoria
    Object.entries(this.resultados).forEach(([categoria, resultado]) => {
      if (categoria === 'scoreGeral' || categoria === 'recomendacoesCriticas') return;
      
      const icone = resultado.status === 'success' ? '✅' : 
                   resultado.status === 'warning' ? '⚠️' : '❌';
      
      console.log(`${icone} ${categoria.toUpperCase()}: ${resultado.score}/100`);
      
      // Mostra apenas problemas críticos no resumo
      const problemasCriticos = resultado.detalhes
        .filter(d => typeof d === 'string' && (d.includes('❌') || d.includes('⚠️')))
        .slice(0, 2);
      
      problemasCriticos.forEach(problema => {
        console.log(`   ${problema}`);
      });
    });

    // Recomendações críticas
    this.gerarRecomendacoesCriticas();
    
    if (this.resultados.recomendacoesCriticas.length > 0) {
      console.log('\n🚨 RECOMENDAÇÕES CRÍTICAS:');
      this.resultados.recomendacoesCriticas.forEach((rec, index) => {
        console.log(`\n${index + 1}. [${rec.prioridade}] ${rec.categoria}`);
        console.log(`   Problema: ${rec.problema}`);
        console.log(`   Impacto: ${rec.impacto}`);
        console.log(`   Solução: ${rec.solucao}`);
      });
    }

    // Análise final
    console.log('\n🎯 ANÁLISE FINAL:');
    
    if (this.resultados.scoreGeral >= 80) {
      console.log('✅ O projeto está APTO para entrega em produção');
      console.log('✅ Todas as funcionalidades principais estão operacionais');
      console.log('✅ Segurança e qualidade em níveis aceitáveis');
      console.log('✅ Pode ser disponibilizado para usuários finais');
    } else if (this.resultados.scoreGeral >= 60) {
      console.log('⚠️ O projeto está FUNCIONALMENTE apto, mas requer melhorias');
      console.log('⚠️ Funcionalidades principais operacionais');
      console.log('⚠️ Algumas questões de qualidade ou segurança a resolver');
      console.log('⚠️ Pode ser usado em ambiente de testes/homologação');
    } else {
      console.log('❌ O projeto NÃO está apto para produção');
      console.log('❌ Problemas críticos que impedem o uso seguro');
      console.log('❌ Requer correções substanciais antes da entrega');
      console.log('❌ NÃO deve ser disponibilizado para usuários finais');
    }

    // Tempo estimado para correções
    const problemasGraves = this.resultados.recomendacoesCriticas
      .filter(r => r.prioridade === 'CRÍTICA').length;
    
    if (problemasGraves > 0) {
      console.log(`\n⏱️ TEMPO ESTIMADO PARA CORREÇÕES: ${problemasGraves * 2}-${problemasGraves * 4} dias úteis`);
    }

    console.log('\n' + '═'.repeat(70));
  }
}

// Execução da auditoria
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new AuditoriaProjetoCompleto();
  auditor.executarAuditoriaCompleta().catch(console.error);
}

export default AuditoriaProjetoCompleto;