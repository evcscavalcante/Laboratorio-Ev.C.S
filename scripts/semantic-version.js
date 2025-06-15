#!/usr/bin/env node

/**
 * Versionamento Semântico Automático
 * Calcula próxima versão baseada nos commits e padrões convencionais
 */

const { execSync } = require('child_process');
const fs = require('fs');

class SemanticVersioning {
  constructor() {
    this.commitTypes = {
      'feat': 'minor',      // Nova funcionalidade
      'fix': 'patch',       // Correção de bug
      'perf': 'patch',      // Melhoria de performance
      'refactor': 'patch',  // Refatoração
      'revert': 'patch',    // Reversão
      'docs': 'none',       // Documentação
      'style': 'none',      // Formatação
      'test': 'none',       // Testes
      'chore': 'none',      // Manutenção
      'ci': 'none',         // CI/CD
      'build': 'none'       // Build
    };

    this.breakingPatterns = [
      /BREAKING CHANGE/i,
      /BREAKING/i,
      /feat!/,
      /fix!/,
      /perf!/
    ];
  }

  getCurrentVersion() {
    try {
      const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', { encoding: 'utf8' }).trim();
      return lastTag.replace(/^v/, '');
    } catch {
      return '0.0.0';
    }
  }

  getCommitsSinceLastTag() {
    try {
      const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', { encoding: 'utf8' }).trim();
      const commits = execSync(`git log ${lastTag}..HEAD --oneline`, { encoding: 'utf8' });
      return commits.trim().split('\n').filter(line => line.length > 0);
    } catch {
      // Se não há tags, pegar todos os commits
      const commits = execSync('git log --oneline', { encoding: 'utf8' });
      return commits.trim().split('\n').filter(line => line.length > 0);
    }
  }

  analyzeCommits(commits) {
    const analysis = {
      breaking: 0,
      features: 0,
      fixes: 0,
      others: 0,
      commitDetails: []
    };

    for (const commit of commits) {
      const detail = this.analyzeCommit(commit);
      analysis.commitDetails.push(detail);

      if (detail.isBreaking) {
        analysis.breaking++;
      } else if (detail.type === 'feat') {
        analysis.features++;
      } else if (detail.type === 'fix') {
        analysis.fixes++;
      } else {
        analysis.others++;
      }
    }

    return analysis;
  }

  analyzeCommit(commit) {
    // Parse conventional commit format: type(scope): description
    const conventionalRegex = /^([a-z]+)(\([^)]*\))?: (.+)/;
    const match = commit.match(conventionalRegex);

    let type = 'other';
    let scope = '';
    let description = commit;

    if (match) {
      type = match[1];
      scope = match[2] ? match[2].slice(1, -1) : '';
      description = match[3];
    }

    // Verificar se é breaking change
    const isBreaking = this.breakingPatterns.some(pattern => pattern.test(commit));

    return {
      original: commit,
      type,
      scope,
      description,
      isBreaking,
      versionImpact: isBreaking ? 'major' : (this.commitTypes[type] || 'none')
    };
  }

  calculateNextVersion(currentVersion, analysis) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    let newMajor = major;
    let newMinor = minor;
    let newPatch = patch;

    if (analysis.breaking > 0) {
      // Breaking changes = major bump
      newMajor++;
      newMinor = 0;
      newPatch = 0;
    } else if (analysis.features > 0) {
      // New features = minor bump
      newMinor++;
      newPatch = 0;
    } else if (analysis.fixes > 0) {
      // Bug fixes = patch bump
      newPatch++;
    } else {
      // Nenhuma mudança significativa
      return null;
    }

    return `${newMajor}.${newMinor}.${newPatch}`;
  }

  generateChangelog(analysis, version) {
    const date = new Date().toISOString().split('T')[0];
    let changelog = `## [${version}] - ${date}\n\n`;

    // Breaking changes
    const breakingCommits = analysis.commitDetails.filter(c => c.isBreaking);
    if (breakingCommits.length > 0) {
      changelog += '### ⚠️ BREAKING CHANGES\n\n';
      breakingCommits.forEach(commit => {
        changelog += `- ${commit.description}\n`;
      });
      changelog += '\n';
    }

    // Features
    const featureCommits = analysis.commitDetails.filter(c => c.type === 'feat' && !c.isBreaking);
    if (featureCommits.length > 0) {
      changelog += '### ✨ Features\n\n';
      featureCommits.forEach(commit => {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        changelog += `- ${scope}${commit.description}\n`;
      });
      changelog += '\n';
    }

    // Bug fixes
    const fixCommits = analysis.commitDetails.filter(c => c.type === 'fix');
    if (fixCommits.length > 0) {
      changelog += '### 🐛 Bug Fixes\n\n';
      fixCommits.forEach(commit => {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        changelog += `- ${scope}${commit.description}\n`;
      });
      changelog += '\n';
    }

    // Performance improvements
    const perfCommits = analysis.commitDetails.filter(c => c.type === 'perf');
    if (perfCommits.length > 0) {
      changelog += '### ⚡ Performance\n\n';
      perfCommits.forEach(commit => {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        changelog += `- ${scope}${commit.description}\n`;
      });
      changelog += '\n';
    }

    // Other improvements
    const otherCommits = analysis.commitDetails.filter(c => 
      ['refactor', 'revert'].includes(c.type)
    );
    if (otherCommits.length > 0) {
      changelog += '### 🔄 Other Changes\n\n';
      otherCommits.forEach(commit => {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        changelog += `- ${scope}${commit.description}\n`;
      });
      changelog += '\n';
    }

    return changelog;
  }

  updatePackageJson(version) {
    const packagePath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    packageJson.version = version;
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`📦 package.json atualizado para versão ${version}`);
  }

  updateChangelog(newChangelogEntry) {
    const changelogPath = 'CHANGELOG.md';
    let existingChangelog = '';
    
    if (fs.existsSync(changelogPath)) {
      existingChangelog = fs.readFileSync(changelogPath, 'utf8');
    } else {
      existingChangelog = '# Changelog\n\nTodas as mudanças notáveis neste projeto serão documentadas neste arquivo.\n\n';
    }

    // Inserir nova entrada após o cabeçalho
    const headerEnd = existingChangelog.indexOf('\n\n') + 2;
    const newChangelog = existingChangelog.slice(0, headerEnd) + 
                        newChangelogEntry + 
                        existingChangelog.slice(headerEnd);

    fs.writeFileSync(changelogPath, newChangelog);
    console.log(`📝 CHANGELOG.md atualizado`);
  }

  createGitTag(version) {
    try {
      execSync(`git add package.json CHANGELOG.md`, { stdio: 'inherit' });
      execSync(`git commit -m "chore(release): v${version} [skip ci]"`, { stdio: 'inherit' });
      execSync(`git tag v${version}`, { stdio: 'inherit' });
      console.log(`🏷️ Tag v${version} criada`);
    } catch (error) {
      console.error('❌ Erro ao criar tag:', error.message);
      throw error;
    }
  }

  run(options = {}) {
    console.log('🔍 Analisando commits para versionamento semântico...\n');

    try {
      // 1. Obter versão atual
      const currentVersion = this.getCurrentVersion();
      console.log(`📌 Versão atual: ${currentVersion}`);

      // 2. Obter commits desde última tag
      const commits = this.getCommitsSinceLastTag();
      console.log(`📝 ${commits.length} commits desde última versão`);

      if (commits.length === 0) {
        console.log('ℹ️ Nenhum commit novo encontrado');
        return { version: currentVersion, updated: false };
      }

      // 3. Analisar commits
      const analysis = this.analyzeCommits(commits);
      console.log(`🔍 Análise: ${analysis.breaking} breaking, ${analysis.features} features, ${analysis.fixes} fixes`);

      // 4. Calcular próxima versão
      const nextVersion = this.calculateNextVersion(currentVersion, analysis);
      
      if (!nextVersion) {
        console.log('ℹ️ Nenhuma mudança significativa encontrada - versão mantida');
        return { version: currentVersion, updated: false };
      }

      console.log(`🚀 Próxima versão: ${nextVersion}`);

      // 5. Gerar changelog
      const changelogEntry = this.generateChangelog(analysis, nextVersion);

      if (!options.dryRun) {
        // 6. Atualizar arquivos
        this.updatePackageJson(nextVersion);
        this.updateChangelog(changelogEntry);

        // 7. Criar tag Git
        if (options.createTag !== false) {
          this.createGitTag(nextVersion);
        }

        console.log(`✅ Versionamento concluído: v${nextVersion}`);
      } else {
        console.log('\n📋 DRY RUN - Mudanças que seriam feitas:');
        console.log(`- Versão: ${currentVersion} → ${nextVersion}`);
        console.log('- Changelog:');
        console.log(changelogEntry);
      }

      return {
        version: nextVersion,
        updated: true,
        changelog: changelogEntry,
        analysis
      };

    } catch (error) {
      console.error('❌ Erro no versionamento semântico:', error.message);
      throw error;
    }
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    createTag: !args.includes('--no-tag')
  };

  const versioning = new SemanticVersioning();
  
  try {
    const result = versioning.run(options);
    
    if (result.updated) {
      console.log(`\n🎉 Nova versão criada: v${result.version}`);
    } else {
      console.log('\n📌 Versão mantida');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Falha no versionamento:', error.message);
    process.exit(1);
  }
}

module.exports = SemanticVersioning;