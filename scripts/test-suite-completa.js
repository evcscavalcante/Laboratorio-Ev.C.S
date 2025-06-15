/**
 * Suíte Completa de Testes para Futuras Implementações
 * Executa todos os testes automatizados do sistema
 */

import EnsaiosSavingTester from './test-ensaios-salvamento.js';
import PDFGenerationTester from './test-pdf-generation.js';
import HierarchyRolesTester from './test-hierarquia-roles.js';
import SpecificPermissionsTester from './test-permissoes-especificas.js';

class CompletTestSuite {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      saving: null,
      pdf: null,
      hierarchy: null,
      permissions: null,
      overall: { passed: 0, total: 0 }
    };
  }

  async runAllTests() {
    console.log('🚀 INICIANDO SUÍTE COMPLETA DE TESTES');
    console.log('='.repeat(70));

    // Teste de salvamento
    console.log('\n1️⃣ EXECUTANDO TESTES DE SALVAMENTO...');
    await this.runSavingTests();

    // Aguardar um pouco entre testes
    await this.sleep(2000);

    // Teste de geração de PDF
    console.log('\n2️⃣ EXECUTANDO TESTES DE GERAÇÃO DE PDF...');
    await this.runPDFTests();

    // Aguardar um pouco entre testes
    await this.sleep(2000);

    // Teste de hierarquia de roles
    console.log('\n3️⃣ EXECUTANDO TESTES DE HIERARQUIA...');
    await this.runHierarchyTests();

    // Aguardar um pouco entre testes
    await this.sleep(2000);

    // Teste de permissões específicas
    console.log('\n4️⃣ EXECUTANDO TESTES DE PERMISSÕES...');
    await this.runPermissionsTests();

    // Relatório final
    this.generateFinalReport();
  }

  async runSavingTests() {
    try {
      const savingTester = new EnsaiosSavingTester(this.baseUrl);
      
      // Capturar resultado sem sair do processo
      const originalExit = process.exit;
      let exitCode = 0;
      process.exit = (code) => { exitCode = code; };

      // Redirecionar console.log para capturar saída
      const originalLog = console.log;
      let output = '';
      console.log = (...args) => {
        output += args.join(' ') + '\n';
        originalLog(...args);
      };

      try {
        await savingTester.runTests();
      } catch (error) {
        exitCode = 1;
      }

      // Restaurar funções originais
      process.exit = originalExit;
      console.log = originalLog;

      this.results.saving = {
        passed: exitCode === 0,
        output: output
      };

      if (exitCode === 0) {
        this.results.overall.passed++;
      }
      this.results.overall.total++;

    } catch (error) {
      console.error('❌ Erro nos testes de salvamento:', error.message);
      this.results.saving = {
        passed: false,
        output: `Erro: ${error.message}`
      };
      this.results.overall.total++;
    }
  }

  async runPDFTests() {
    try {
      const pdfTester = new PDFGenerationTester(this.baseUrl);
      
      // Capturar resultado sem sair do processo
      const originalExit = process.exit;
      let exitCode = 0;
      process.exit = (code) => { exitCode = code; };

      // Redirecionar console.log para capturar saída
      const originalLog = console.log;
      let output = '';
      console.log = (...args) => {
        output += args.join(' ') + '\n';
        originalLog(...args);
      };

      try {
        await pdfTester.runTests();
      } catch (error) {
        exitCode = 1;
      }

      // Restaurar funções originais
      process.exit = originalExit;
      console.log = originalLog;

      this.results.pdf = {
        passed: exitCode === 0,
        output: output
      };

      if (exitCode === 0) {
        this.results.overall.passed++;
      }
      this.results.overall.total++;

    } catch (error) {
      console.error('❌ Erro nos testes de PDF:', error.message);
      this.results.pdf = {
        passed: false,
        output: `Erro: ${error.message}`
      };
      this.results.overall.total++;
    }
  }

  async runHierarchyTests() {
    try {
      const hierarchyTester = new HierarchyRolesTester(this.baseUrl);
      
      // Capturar resultado sem sair do processo
      const originalExit = process.exit;
      let exitCode = 0;
      process.exit = (code) => { exitCode = code; };

      // Redirecionar console.log para capturar saída
      const originalLog = console.log;
      let output = '';
      console.log = (...args) => {
        output += args.join(' ') + '\n';
        originalLog(...args);
      };

      try {
        await hierarchyTester.runTests();
      } catch (error) {
        exitCode = 1;
      }

      // Restaurar funções originais
      process.exit = originalExit;
      console.log = originalLog;

      this.results.hierarchy = {
        passed: exitCode === 0,
        output: output
      };

      if (exitCode === 0) {
        this.results.overall.passed++;
      }
      this.results.overall.total++;

    } catch (error) {
      console.error('❌ Erro nos testes de hierarquia:', error.message);
      this.results.hierarchy = {
        passed: false,
        output: `Erro: ${error.message}`
      };
      this.results.overall.total++;
    }
  }

  async runPermissionsTests() {
    try {
      const permissionsTester = new SpecificPermissionsTester(this.baseUrl);
      
      // Capturar resultado sem sair do processo
      const originalExit = process.exit;
      let exitCode = 0;
      process.exit = (code) => { exitCode = code; };

      // Redirecionar console.log para capturar saída
      const originalLog = console.log;
      let output = '';
      console.log = (...args) => {
        output += args.join(' ') + '\n';
        originalLog(...args);
      };

      try {
        await permissionsTester.runTests();
      } catch (error) {
        exitCode = 1;
      }

      // Restaurar funções originais
      process.exit = originalExit;
      console.log = originalLog;

      this.results.permissions = {
        passed: exitCode === 0,
        output: output
      };

      if (exitCode === 0) {
        this.results.overall.passed++;
      }
      this.results.overall.total++;

    } catch (error) {
      console.error('❌ Erro nos testes de permissões:', error.message);
      this.results.permissions = {
        passed: false,
        output: `Erro: ${error.message}`
      };
      this.results.overall.total++;
    }
  }

  generateFinalReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RELATÓRIO FINAL - SUÍTE COMPLETA DE TESTES');
    console.log('='.repeat(70));

    console.log('\n🔍 RESUMO DOS TESTES:');
    console.log(`   • Salvamento de Ensaios: ${this.results.saving?.passed ? '✅ APROVADO' : '❌ FALHOU'}`);
    console.log(`   • Geração de PDFs: ${this.results.pdf?.passed ? '✅ APROVADO' : '❌ FALHOU'}`);
    console.log(`   • Hierarquia de Roles: ${this.results.hierarchy?.passed ? '✅ APROVADO' : '❌ FALHOU'}`);
    console.log(`   • Permissões Específicas: ${this.results.permissions?.passed ? '✅ APROVADO' : '❌ FALHOU'}`);

    console.log('\n📈 RESULTADO GERAL:');
    console.log(`   ${this.results.overall.passed}/${this.results.overall.total} suítes aprovadas`);

    if (this.results.overall.passed === this.results.overall.total) {
      console.log('\n🎉 TODOS OS TESTES APROVADOS!');
      console.log('✅ Sistema pronto para futuras implementações');
      console.log('✅ Funcionalidades de salvamento e PDF validadas');
      console.log('✅ Camadas hierárquicas e permissões funcionando');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM');
      console.log('❌ Corrigir problemas antes de novas implementações');
      
      if (!this.results.saving?.passed) {
        console.log('   - Problema no salvamento de ensaios');
      }
      if (!this.results.pdf?.passed) {
        console.log('   - Problema na geração de PDFs');
      }
      if (!this.results.hierarchy?.passed) {
        console.log('   - Problema na hierarquia de roles');
      }
      if (!this.results.permissions?.passed) {
        console.log('   - Problema nas permissões específicas');
      }
    }

    console.log('\n📋 COMANDOS PARA TESTES INDIVIDUAIS:');
    console.log('   node scripts/test-ensaios-salvamento.js');
    console.log('   node scripts/test-pdf-generation.js');
    console.log('   node scripts/test-hierarquia-roles.js');
    console.log('   node scripts/test-permissoes-especificas.js');
    console.log('   node scripts/test-suite-completa.js');

    console.log('\n' + '='.repeat(70));

    // Exit code para CI/CD
    const success = this.results.overall.passed === this.results.overall.total;
    process.exit(success ? 0 : 1);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar suíte completa
if (import.meta.url === `file://${process.argv[1]}`) {
  const suite = new CompletTestSuite();
  suite.runAllTests().catch(console.error);
}

export default CompletTestSuite;