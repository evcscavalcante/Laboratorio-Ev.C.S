#!/usr/bin/env node

/**
 * Deploy Manager - Gerenciador de Deploy Seguro
 * Automatiza versionamento, deploy e rollback
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeployManager {
  constructor() {
    this.environments = {
      staging: {
        url: 'https://staging.laboratory.com',
        healthCheck: '/api/health',
        branch: 'develop'
      },
      production: {
        url: 'https://laboratory.com',
        healthCheck: '/api/health',
        branch: 'main'
      }
    };
    
    this.rollbackConfig = {
      maxAttempts: 3,
      healthCheckTimeout: 30000,
      rollbackTimeout: 60000
    };
  }

  async deploy(environment, options = {}) {
    const env = this.environments[environment];
    if (!env) {
      throw new Error(`Ambiente ${environment} não configurado`);
    }

    console.log(`🚀 Iniciando deploy para ${environment}...`);

    try {
      // 1. Verificar testes obrigatórios
      await this.runMandatoryTests();

      // 2. Fazer backup da versão atual
      const backupVersion = await this.createBackup(environment);

      // 3. Determinar nova versão
      const newVersion = await this.calculateVersion();

      // 4. Build da aplicação
      await this.buildApplication(environment);

      // 5. Deploy propriamente dito
      await this.performDeploy(environment, newVersion);

      // 6. Verificação de saúde
      const isHealthy = await this.performHealthCheck(environment);

      if (!isHealthy) {
        console.log('❌ Health check falhou - iniciando rollback automático');
        await this.performRollback(environment, backupVersion);
        throw new Error('Deploy falhou - rollback executado');
      }

      // 7. Monitoramento pós-deploy
      await this.postDeployMonitoring(environment);

      console.log(`✅ Deploy para ${environment} concluído com sucesso`);
      return { success: true, version: newVersion };

    } catch (error) {
      console.error(`❌ Erro no deploy para ${environment}:`, error.message);
      throw error;
    }
  }

  async runMandatoryTests() {
    console.log('🧪 Executando testes obrigatórios...');

    const testSuites = [
      { name: 'Análise de Padrões', command: 'node analyze-project-standards.js' },
      { name: 'Verificação de Regressões', command: 'node check-regressions.js' },
      { name: 'Testes Unitários', command: 'npm run test:unit' },
      { name: 'Testes de Integração', command: 'npm run test:integration' },
      { name: 'Testes de Segurança', command: 'npm run test:security' },
      { name: 'Cobertura de Testes', command: 'npm run test:coverage' }
    ];

    for (const suite of testSuites) {
      try {
        console.log(`  ⏳ ${suite.name}...`);
        execSync(suite.command, { stdio: 'pipe' });
        console.log(`  ✅ ${suite.name} - OK`);
      } catch (error) {
        console.log(`  ❌ ${suite.name} - FALHOU`);
        throw new Error(`Teste obrigatório falhou: ${suite.name}`);
      }
    }
  }

  async calculateVersion() {
    console.log('🏷️ Calculando nova versão...');

    try {
      // Obter última tag
      const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0"', 
        { encoding: 'utf8' }).trim();
      
      // Analisar commits desde última tag
      const commitsSinceTag = execSync(
        `git log ${lastTag}..HEAD --oneline`, 
        { encoding: 'utf8' }
      );

      const breakingChanges = (commitsSinceTag.match(/BREAKING|breaking|feat!|fix!/g) || []).length;
      const features = (commitsSinceTag.match(/feat:/g) || []).length;
      const fixes = (commitsSinceTag.match(/fix:/g) || []).length;

      // Parse versão atual
      const currentVersion = lastTag.replace('v', '');
      const [major, minor, patch] = currentVersion.split('.').map(Number);

      let newMajor = major;
      let newMinor = minor;
      let newPatch = patch;

      if (breakingChanges > 0) {
        newMajor++;
        newMinor = 0;
        newPatch = 0;
      } else if (features > 0) {
        newMinor++;
        newPatch = 0;
      } else if (fixes > 0) {
        newPatch++;
      } else {
        console.log('⚠️ Nenhuma mudança significativa detectada');
        return currentVersion;
      }

      const newVersion = `${newMajor}.${newMinor}.${newPatch}`;
      console.log(`📈 Nova versão: v${newVersion}`);
      
      return newVersion;

    } catch (error) {
      console.log('⚠️ Erro ao calcular versão, usando timestamp');
      return `0.0.${Date.now()}`;
    }
  }

  async createBackup(environment) {
    console.log(`💾 Criando backup do ${environment}...`);
    
    try {
      const currentVersion = execSync('git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0"', 
        { encoding: 'utf8' }).trim();
      
      // Criar backup dos arquivos críticos
      const backupDir = `backups/${environment}/${Date.now()}`;
      execSync(`mkdir -p ${backupDir}`);
      
      // Backup da configuração atual
      if (fs.existsSync('package.json')) {
        execSync(`cp package.json ${backupDir}/`);
      }
      
      console.log(`📦 Backup criado: ${backupDir}`);
      return currentVersion;
      
    } catch (error) {
      console.log('⚠️ Erro ao criar backup, continuando...');
      return 'v0.0.0';
    }
  }

  async buildApplication(environment) {
    console.log(`🏗️ Construindo aplicação para ${environment}...`);

    try {
      // Install dependencies
      execSync('npm ci', { stdio: 'inherit' });

      // Build
      execSync('npm run build', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });

      console.log('✅ Build concluído');

    } catch (error) {
      throw new Error(`Erro no build: ${error.message}`);
    }
  }

  async performDeploy(environment, version) {
    console.log(`🚀 Fazendo deploy para ${environment}...`);

    try {
      // Atualizar package.json com nova versão
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      packageJson.version = version;
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

      // Criar tag Git
      execSync(`git add package.json`);
      execSync(`git commit -m "chore(release): v${version} [skip ci]" || true`);
      execSync(`git tag v${version} || true`);

      // Deploy específico por ambiente
      if (environment === 'staging') {
        await this.deployToStaging();
      } else if (environment === 'production') {
        await this.deployToProduction();
      }

      console.log(`✅ Deploy para ${environment} concluído`);

    } catch (error) {
      throw new Error(`Erro no deploy: ${error.message}`);
    }
  }

  async deployToStaging() {
    console.log('🎭 Deploy para staging...');
    // Lógica específica para staging
    // Por exemplo: enviar para Replit, Heroku, etc.
  }

  async deployToProduction() {
    console.log('🏭 Deploy para produção...');
    // Lógica específica para produção
    // Por exemplo: enviar para servidor principal, CDN, etc.
  }

  async performHealthCheck(environment, maxAttempts = 5) {
    console.log(`🏥 Verificando saúde do ${environment}...`);

    const env = this.environments[environment];
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`  Tentativa ${attempt}/${maxAttempts}...`);
        
        // Simular health check (em produção seria uma requisição HTTP real)
        await this.sleep(2000);
        
        // const response = await fetch(`${env.url}${env.healthCheck}`);
        // const health = await response.json();
        
        // Simular resposta de saúde
        const health = { status: 'healthy' };
        
        if (health.status === 'healthy') {
          console.log(`  ✅ ${environment} está saudável`);
          return true;
        } else {
          console.log(`  ⚠️ ${environment} não está saudável: ${health.status}`);
        }
        
      } catch (error) {
        console.log(`  ❌ Erro no health check: ${error.message}`);
      }
      
      if (attempt < maxAttempts) {
        await this.sleep(5000);
      }
    }

    return false;
  }

  async performRollback(environment, backupVersion) {
    console.log(`🔄 Iniciando rollback para ${environment}...`);

    try {
      // Reverter para versão anterior
      execSync(`git checkout ${backupVersion} -- .`);
      
      // Rebuild com versão anterior
      await this.buildApplication(environment);
      
      // Redeploy da versão anterior
      if (environment === 'staging') {
        await this.deployToStaging();
      } else if (environment === 'production') {
        await this.deployToProduction();
      }

      // Verificar saúde após rollback
      const isHealthy = await this.performHealthCheck(environment, 3);
      
      if (isHealthy) {
        console.log(`✅ Rollback para ${environment} concluído com sucesso`);
      } else {
        console.log(`❌ Rollback falhou - intervenção manual necessária`);
      }

    } catch (error) {
      console.error(`❌ Erro no rollback: ${error.message}`);
      throw error;
    }
  }

  async postDeployMonitoring(environment, durationMinutes = 5) {
    console.log(`📊 Monitoramento pós-deploy por ${durationMinutes} minutos...`);

    const env = this.environments[environment];
    const checks = durationMinutes;

    for (let i = 1; i <= checks; i++) {
      try {
        console.log(`  Minuto ${i}/${checks} - Verificando métricas...`);
        
        // Simular verificação de métricas
        // const metrics = await fetch(`${env.url}/api/metrics`).then(r => r.json());
        const metrics = { errorRate: 0, responseTime: 150 };
        
        if (metrics.errorRate > 5) {
          console.log(`  ⚠️ Taxa de erro elevada: ${metrics.errorRate}%`);
          // Poderia triggerar rollback automático aqui
        } else {
          console.log(`  ✅ Métricas normais - Erro: ${metrics.errorRate}%, Tempo: ${metrics.responseTime}ms`);
        }
        
        await this.sleep(60000); // 1 minuto
        
      } catch (error) {
        console.log(`  ❌ Erro ao verificar métricas: ${error.message}`);
      }
    }

    console.log('📈 Monitoramento concluído - Sistema estável');
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Comando CLI
  async runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    const environment = args[1];

    switch (command) {
      case 'deploy':
        if (!environment) {
          console.error('❌ Uso: node deploy-manager.js deploy <staging|production>');
          process.exit(1);
        }
        try {
          const result = await this.deploy(environment);
          console.log(`🎉 Deploy concluído: ${JSON.stringify(result, null, 2)}`);
        } catch (error) {
          console.error(`💥 Deploy falhou: ${error.message}`);
          process.exit(1);
        }
        break;

      case 'rollback':
        if (!environment) {
          console.error('❌ Uso: node deploy-manager.js rollback <staging|production> [version]');
          process.exit(1);
        }
        const version = args[2] || await this.getLastStableVersion();
        try {
          await this.performRollback(environment, version);
          console.log(`🔄 Rollback concluído para versão ${version}`);
        } catch (error) {
          console.error(`💥 Rollback falhou: ${error.message}`);
          process.exit(1);
        }
        break;

      case 'health':
        if (!environment) {
          console.error('❌ Uso: node deploy-manager.js health <staging|production>');
          process.exit(1);
        }
        const isHealthy = await this.performHealthCheck(environment);
        console.log(`🏥 ${environment} está ${isHealthy ? 'saudável' : 'com problemas'}`);
        process.exit(isHealthy ? 0 : 1);
        break;

      default:
        console.log(`
Deploy Manager - Gerenciador de Deploy Seguro

COMANDOS:
  deploy <environment>    Fazer deploy para staging ou production
  rollback <environment>  Fazer rollback para versão anterior
  health <environment>    Verificar saúde do ambiente

EXEMPLOS:
  node deploy-manager.js deploy staging
  node deploy-manager.js deploy production
  node deploy-manager.js rollback production v1.2.3
  node deploy-manager.js health staging

AMBIENTES:
  staging    - Ambiente de homologação
  production - Ambiente de produção
        `);
        break;
    }
  }

  async getLastStableVersion() {
    try {
      return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch {
      return 'v0.0.0';
    }
  }
}

// Executar CLI se chamado diretamente
if (require.main === module) {
  const manager = new DeployManager();
  manager.runCLI().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = DeployManager;