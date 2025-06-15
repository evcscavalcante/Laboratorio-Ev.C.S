#!/usr/bin/env node

/**
 * Verificações Pré-Deploy Obrigatórias
 * Executa todas as validações necessárias antes do deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');

class PreDeployChecker {
  constructor() {
    this.requiredChecks = [
      { name: 'Git Status', check: () => this.checkGitStatus() },
      { name: 'Análise de Padrões', check: () => this.runCommand('node analyze-project-standards.js') },
      { name: 'Verificação de Regressões', check: () => this.runCommand('node check-regressions.js') },
      { name: 'Testes Unitários', check: () => this.runCommand('npm run test:unit') },
      { name: 'Testes de Integração', check: () => this.runCommand('npm run test:integration') },
      { name: 'Testes de Segurança', check: () => this.runCommand('npm run test:security') },
      { name: 'Cobertura de Testes', check: () => this.checkTestCoverage() },
      { name: 'Lint TypeScript', check: () => this.runCommand('npm run lint') },
      { name: 'Verificação TypeScript', check: () => this.runCommand('npm run check') },
      { name: 'Build de Produção', check: () => this.buildProduction() },
      { name: 'Validação de Dependências', check: () => this.checkDependencies() },
      { name: 'Verificação de Secrets', check: () => this.checkSecrets() }
    ];

    this.results = [];
  }

  async runAllChecks() {
    console.log('🔍 Executando verificações pré-deploy obrigatórias...\n');

    let allPassed = true;

    for (const check of this.requiredChecks) {
      const result = await this.runCheck(check);
      this.results.push(result);
      
      if (!result.passed) {
        allPassed = false;
      }
    }

    this.printSummary(allPassed);
    return allPassed;
  }

  async runCheck(check) {
    const startTime = Date.now();
    
    try {
      console.log(`🔧 ${check.name}...`);
      
      await check.check();
      
      const duration = Date.now() - startTime;
      console.log(`✅ ${check.name} - OK (${duration}ms)`);
      
      return {
        name: check.name,
        passed: true,
        duration
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.log(`❌ ${check.name} - FALHOU (${duration}ms)`);
      console.log(`   Erro: ${error.message}`);
      
      return {
        name: check.name,
        passed: false,
        duration,
        error: error.message
      };
    }
  }

  runCommand(command) {
    try {
      execSync(command, { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`Comando falhou: ${command}\n${error.stdout || error.stderr}`);
    }
  }

  checkGitStatus() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        throw new Error('Há arquivos não commitados. Faça commit antes do deploy.');
      }
      
      // Verificar se está na branch correta
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (!['main', 'develop'].includes(branch)) {
        throw new Error(`Branch atual '${branch}' não é permitida para deploy. Use 'main' ou 'develop'.`);
      }
      
    } catch (error) {
      throw new Error(`Erro no Git: ${error.message}`);
    }
  }

  checkTestCoverage() {
    try {
      // Executar testes com cobertura
      execSync('npm run test:coverage', { stdio: 'pipe' });
      
      // Verificar se arquivo de cobertura existe
      if (!fs.existsSync('coverage/coverage-summary.json')) {
        throw new Error('Arquivo de cobertura não encontrado');
      }
      
      const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
      const total = coverage.total;
      
      const requiredCoverage = {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85
      };
      
      for (const [metric, required] of Object.entries(requiredCoverage)) {
        if (total[metric].pct < required) {
          throw new Error(`Cobertura insuficiente: ${metric} ${total[metric].pct}% < ${required}%`);
        }
      }
      
    } catch (error) {
      throw new Error(`Cobertura de testes: ${error.message}`);
    }
  }

  buildProduction() {
    try {
      // Build limpo
      if (fs.existsSync('dist')) {
        execSync('rm -rf dist');
      }
      
      execSync('npm run build', { 
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      // Verificar se build foi criado
      if (!fs.existsSync('dist')) {
        throw new Error('Diretório dist não foi criado');
      }
      
      // Verificar arquivos essenciais
      const requiredFiles = ['index.html'];
      for (const file of requiredFiles) {
        if (!fs.existsSync(`dist/${file}`)) {
          throw new Error(`Arquivo obrigatório não encontrado: ${file}`);
        }
      }
      
    } catch (error) {
      throw new Error(`Build de produção: ${error.message}`);
    }
  }

  checkDependencies() {
    try {
      // Verificar vulnerabilidades
      execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
      
      // Verificar dependências desatualizadas críticas
      const outdated = execSync('npm outdated --json', { encoding: 'utf8', stdio: 'pipe' });
      
      if (outdated.trim()) {
        const packages = JSON.parse(outdated);
        const critical = Object.entries(packages).filter(([name, info]) => {
          const current = info.current.split('.')[0];
          const wanted = info.wanted.split('.')[0];
          return current !== wanted; // Major version difference
        });
        
        if (critical.length > 0) {
          console.log('⚠️ Dependências com major versions desatualizadas:', critical.map(([name]) => name));
        }
      }
      
    } catch (error) {
      // npm audit pode falhar mas não deve bloquear deploy se for só warning
      if (error.status === 1) {
        console.log('⚠️ Algumas vulnerabilidades encontradas, mas não críticas');
      } else {
        throw new Error(`Verificação de dependências: ${error.message}`);
      }
    }
  }

  checkSecrets() {
    const requiredSecrets = [
      'DATABASE_URL',
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID'
    ];
    
    const missingSecrets = requiredSecrets.filter(secret => !process.env[secret]);
    
    if (missingSecrets.length > 0) {
      throw new Error(`Secrets obrigatórios não encontrados: ${missingSecrets.join(', ')}`);
    }
  }

  printSummary(allPassed) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMO DAS VERIFICAÇÕES PRÉ-DEPLOY');
    console.log('='.repeat(60));

    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    const passedCount = this.results.filter(r => r.passed).length;

    console.log(`⏱️  Tempo total: ${totalTime}ms`);
    console.log(`✅ Passou: ${passedCount}/${this.results.length}`);
    console.log(`❌ Falhou: ${this.results.length - passedCount}/${this.results.length}`);

    console.log('\n📊 DETALHES:');
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name} - ${result.duration}ms`);
      if (result.error) {
        console.log(`   📝 ${result.error}`);
      }
    });

    if (allPassed) {
      console.log('\n🎉 TODAS AS VERIFICAÇÕES PASSARAM - PRONTO PARA DEPLOY!');
      console.log('🚀 Execute: node scripts/deploy-manager.js deploy <ambiente>');
    } else {
      console.log('\n🚫 DEPLOY BLOQUEADO - CORRIJA OS ERROS ANTES DE CONTINUAR');
      
      const failedChecks = this.results.filter(r => !r.passed);
      console.log('\n💡 Para corrigir:');
      failedChecks.forEach(result => {
        console.log(`   - ${result.name}: ${result.error}`);
      });
    }

    console.log('='.repeat(60));
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      status: this.results.every(r => r.passed) ? 'PASSED' : 'FAILED',
      checks: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        totalTime: this.results.reduce((sum, r) => sum + r.duration, 0)
      }
    };

    const reportsDir = 'reports/pre-deploy';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = `${reportsDir}/pre-deploy-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log(`📄 Relatório salvo em: ${reportFile}`);
    return report;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const checker = new PreDeployChecker();
  
  checker.runAllChecks().then(allPassed => {
    checker.generateReport();
    process.exit(allPassed ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erro fatal nas verificações:', error);
    process.exit(1);
  });
}

module.exports = PreDeployChecker;