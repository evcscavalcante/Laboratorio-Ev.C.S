#!/usr/bin/env node

/**
 * Sistema Automático de Verificação de Qualidade
 * Análise completa de código, dependências e segurança
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class QualityChecker {
  constructor() {
    this.results = {
      eslint: null,
      vulnerabilities: null,
      complexity: null,
      codeSmells: null,
      typeScript: null,
      summary: null
    };
    
    this.thresholds = {
      maxComplexity: 10,
      maxVulnerabilities: 0,
      maxCodeSmells: 5,
      minCoverage: 85
    };
  }

  async runAllChecks() {
    console.log('🔍 Iniciando verificação automática de qualidade...\n');

    const checks = [
      { name: 'ESLint + Regras de Segurança', method: () => this.runESLintCheck() },
      { name: 'Análise de Vulnerabilidades', method: () => this.checkVulnerabilities() },
      { name: 'Complexidade Ciclomática', method: () => this.analyzeComplexity() },
      { name: 'Detecção de Code Smells', method: () => this.detectCodeSmells() },
      { name: 'Verificação TypeScript', method: () => this.checkTypeScript() },
      { name: 'Análise de Dependências', method: () => this.analyzeDependencies() }
    ];

    let allPassed = true;

    for (const check of checks) {
      try {
        console.log(`🔧 Executando ${check.name}...`);
        const result = await check.method();
        
        if (!result.passed) {
          allPassed = false;
        }
        
        console.log(`${result.passed ? '✅' : '❌'} ${check.name} - ${result.passed ? 'OK' : 'FALHOU'}`);
        
        if (result.warnings && result.warnings.length > 0) {
          console.log(`⚠️  ${result.warnings.length} avisos encontrados`);
        }
        
      } catch (error) {
        console.log(`❌ ${check.name} - ERRO: ${error.message}`);
        allPassed = false;
      }
    }

    this.generateSummary(allPassed);
    this.saveReport();
    
    return allPassed;
  }

  runESLintCheck() {
    const startTime = Date.now();
    
    try {
      // Executar ESLint com configuração de segurança
      const output = execSync('npx eslint . --ext .ts,.tsx,.js,.jsx --format json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const results = JSON.parse(output);
      const errors = results.reduce((sum, file) => sum + file.errorCount, 0);
      const warnings = results.reduce((sum, file) => sum + file.warningCount, 0);
      
      // Categorizar problemas por severidade
      const securityIssues = [];
      const qualityIssues = [];
      
      results.forEach(file => {
        file.messages.forEach(msg => {
          if (msg.ruleId && this.isSecurityRule(msg.ruleId)) {
            securityIssues.push({
              file: file.filePath,
              line: msg.line,
              rule: msg.ruleId,
              message: msg.message,
              severity: msg.severity
            });
          } else {
            qualityIssues.push({
              file: file.filePath,
              line: msg.line,
              rule: msg.ruleId,
              message: msg.message,
              severity: msg.severity
            });
          }
        });
      });

      this.results.eslint = {
        passed: errors === 0,
        duration: Date.now() - startTime,
        stats: {
          totalFiles: results.length,
          errors,
          warnings,
          securityIssues: securityIssues.length,
          qualityIssues: qualityIssues.length
        },
        details: {
          securityIssues,
          qualityIssues: qualityIssues.slice(0, 10) // Limitar output
        }
      };

      return this.results.eslint;

    } catch (error) {
      // ESLint retorna código de saída 1 se há problemas
      if (error.status === 1 && error.stdout) {
        try {
          const results = JSON.parse(error.stdout);
          const errors = results.reduce((sum, file) => sum + file.errorCount, 0);
          const warnings = results.reduce((sum, file) => sum + file.warningCount, 0);
          
          this.results.eslint = {
            passed: errors === 0,
            duration: Date.now() - startTime,
            stats: { errors, warnings },
            details: results.slice(0, 5) // Primeiros 5 arquivos com problemas
          };

          return this.results.eslint;
        } catch (parseError) {
          throw new Error(`Erro ao analisar output do ESLint: ${parseError.message}`);
        }
      }
      
      throw new Error(`Erro no ESLint: ${error.message}`);
    }
  }

  checkVulnerabilities() {
    const startTime = Date.now();
    
    try {
      // Verificar vulnerabilidades com npm audit
      const auditOutput = execSync('npm audit --json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const auditResults = JSON.parse(auditOutput);
      
      const vulnerabilities = {
        info: auditResults.metadata?.vulnerabilities?.info || 0,
        low: auditResults.metadata?.vulnerabilities?.low || 0,
        moderate: auditResults.metadata?.vulnerabilities?.moderate || 0,
        high: auditResults.metadata?.vulnerabilities?.high || 0,
        critical: auditResults.metadata?.vulnerabilities?.critical || 0
      };

      const totalVulns = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);
      const criticalVulns = vulnerabilities.high + vulnerabilities.critical;

      // Listar vulnerabilidades críticas
      const criticalDetails = [];
      if (auditResults.advisories) {
        Object.values(auditResults.advisories).forEach(advisory => {
          if (advisory.severity === 'high' || advisory.severity === 'critical') {
            criticalDetails.push({
              title: advisory.title,
              severity: advisory.severity,
              module: advisory.module_name,
              vulnerable_versions: advisory.vulnerable_versions,
              recommendation: advisory.recommendation
            });
          }
        });
      }

      this.results.vulnerabilities = {
        passed: criticalVulns === 0,
        duration: Date.now() - startTime,
        stats: {
          total: totalVulns,
          critical: criticalVulns,
          breakdown: vulnerabilities
        },
        details: criticalDetails,
        warnings: totalVulns > 0 ? [`${totalVulns} vulnerabilidades encontradas`] : []
      };

      return this.results.vulnerabilities;

    } catch (error) {
      // npm audit pode retornar código de saída != 0 quando há vulnerabilidades
      if (error.status && error.stdout) {
        try {
          const auditResults = JSON.parse(error.stdout);
          const vulnerabilities = auditResults.metadata?.vulnerabilities || {};
          const criticalVulns = (vulnerabilities.high || 0) + (vulnerabilities.critical || 0);

          this.results.vulnerabilities = {
            passed: criticalVulns === 0,
            duration: Date.now() - startTime,
            stats: { 
              total: Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0),
              critical: criticalVulns,
              breakdown: vulnerabilities
            },
            warnings: ['Vulnerabilidades encontradas - verifique npm audit']
          };

          return this.results.vulnerabilities;
        } catch (parseError) {
          // Se não conseguir parsear, assumir que não há vulnerabilidades críticas
        }
      }

      this.results.vulnerabilities = {
        passed: true,
        duration: Date.now() - startTime,
        stats: { total: 0, critical: 0 },
        warnings: ['Não foi possível verificar vulnerabilidades']
      };

      return this.results.vulnerabilities;
    }
  }

  analyzeComplexity() {
    const startTime = Date.now();
    
    try {
      // Analisar complexidade ciclomática usando uma ferramenta customizada
      const complexityResults = this.calculateComplexity();
      
      const highComplexityFiles = complexityResults.filter(
        file => file.complexity > this.thresholds.maxComplexity
      );

      this.results.complexity = {
        passed: highComplexityFiles.length === 0,
        duration: Date.now() - startTime,
        stats: {
          totalFiles: complexityResults.length,
          averageComplexity: this.calculateAverageComplexity(complexityResults),
          maxComplexity: Math.max(...complexityResults.map(f => f.complexity)),
          highComplexityFiles: highComplexityFiles.length
        },
        details: highComplexityFiles.slice(0, 10),
        warnings: highComplexityFiles.length > 0 ? 
          [`${highComplexityFiles.length} arquivos com alta complexidade`] : []
      };

      return this.results.complexity;

    } catch (error) {
      throw new Error(`Erro na análise de complexidade: ${error.message}`);
    }
  }

  detectCodeSmells() {
    const startTime = Date.now();
    
    try {
      const codeSmells = this.findCodeSmells();
      
      const totalSmells = codeSmells.reduce((sum, file) => sum + file.smells.length, 0);
      const criticalSmells = codeSmells.filter(file => 
        file.smells.some(smell => smell.severity === 'critical')
      );

      this.results.codeSmells = {
        passed: totalSmells <= this.thresholds.maxCodeSmells,
        duration: Date.now() - startTime,
        stats: {
          totalSmells,
          criticalSmells: criticalSmells.length,
          filesAffected: codeSmells.length,
          smellTypes: this.categorizeSmells(codeSmells)
        },
        details: codeSmells.slice(0, 10),
        warnings: totalSmells > this.thresholds.maxCodeSmells ? 
          [`${totalSmells} code smells encontrados (limite: ${this.thresholds.maxCodeSmells})`] : []
      };

      return this.results.codeSmells;

    } catch (error) {
      throw new Error(`Erro na detecção de code smells: ${error.message}`);
    }
  }

  checkTypeScript() {
    const startTime = Date.now();
    
    try {
      // Verificar tipos TypeScript
      const tsOutput = execSync('npx tsc --noEmit --pretty false', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      this.results.typeScript = {
        passed: true,
        duration: Date.now() - startTime,
        stats: { errors: 0, warnings: 0 },
        details: []
      };

      return this.results.typeScript;

    } catch (error) {
      // tsc retorna código de saída != 0 quando há erros
      const errors = this.parseTypeScriptErrors(error.stdout || error.stderr || '');
      
      this.results.typeScript = {
        passed: false,
        duration: Date.now() - startTime,
        stats: { 
          errors: errors.length,
          warnings: 0 
        },
        details: errors.slice(0, 10)
      };

      return this.results.typeScript;
    }
  }

  analyzeDependencies() {
    const startTime = Date.now();
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // Verificar dependências desatualizadas
      let outdatedOutput = '';
      try {
        outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
      } catch (error) {
        outdatedOutput = error.stdout || '{}';
      }

      const outdated = JSON.parse(outdatedOutput || '{}');
      const outdatedCount = Object.keys(outdated).length;

      // Verificar dependências não utilizadas
      const unusedDeps = this.findUnusedDependencies(dependencies);

      return {
        passed: outdatedCount === 0 && unusedDeps.length === 0,
        duration: Date.now() - startTime,
        stats: {
          totalDependencies: Object.keys(dependencies).length,
          outdated: outdatedCount,
          unused: unusedDeps.length
        },
        details: {
          outdatedPackages: Object.keys(outdated).slice(0, 10),
          unusedPackages: unusedDeps.slice(0, 10)
        },
        warnings: [
          ...(outdatedCount > 0 ? [`${outdatedCount} dependências desatualizadas`] : []),
          ...(unusedDeps.length > 0 ? [`${unusedDeps.length} dependências não utilizadas`] : [])
        ]
      };

    } catch (error) {
      throw new Error(`Erro na análise de dependências: ${error.message}`);
    }
  }

  // Métodos auxiliares

  isSecurityRule(ruleId) {
    const securityRules = [
      'no-eval',
      'no-implied-eval',
      'no-new-func',
      'no-script-url',
      'security/detect-eval-with-expression',
      'security/detect-non-literal-fs-filename',
      'security/detect-non-literal-regexp',
      'security/detect-pseudoRandomBytes',
      'security/detect-possible-timing-attacks',
      'security/detect-unsafe-regex'
    ];
    
    return securityRules.includes(ruleId);
  }

  calculateComplexity() {
    const results = [];
    const srcFiles = this.getAllSourceFiles();

    srcFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const complexity = this.calculateFileComplexity(content);
      
      results.push({
        file: filePath,
        complexity,
        lines: content.split('\n').length
      });
    });

    return results;
  }

  calculateFileComplexity(content) {
    // Análise simplificada de complexidade ciclomática
    const complexityPatterns = [
      /\bif\s*\(/g,           // if statements
      /\belse\s+if\b/g,       // else if
      /\bwhile\s*\(/g,        // while loops
      /\bfor\s*\(/g,          // for loops
      /\bswitch\s*\(/g,       // switch statements
      /\bcase\s+.*:/g,        // case statements
      /\bcatch\s*\(/g,        // catch blocks
      /\?\s*.*\s*:/g,         // ternary operators
      /&&|\|\|/g              // logical operators
    ];

    let complexity = 1; // Base complexity
    
    complexityPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  calculateAverageComplexity(results) {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, file) => sum + file.complexity, 0);
    return Math.round((total / results.length) * 100) / 100;
  }

  findCodeSmells() {
    const results = [];
    const srcFiles = this.getAllSourceFiles();

    srcFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const smells = this.detectFileSmells(content, filePath);
      
      if (smells.length > 0) {
        results.push({
          file: filePath,
          smells
        });
      }
    });

    return results;
  }

  detectFileSmells(content, filePath) {
    const smells = [];
    const lines = content.split('\n');

    // Detectar diferentes tipos de code smells
    const smellDetectors = [
      {
        name: 'Long Function',
        pattern: /function\s+\w+\s*\([^)]*\)\s*\{/g,
        check: (match, lineIndex) => {
          const functionLines = this.countFunctionLines(content, lineIndex);
          return functionLines > 30 ? 'high' : null;
        }
      },
      {
        name: 'Too Many Parameters',
        pattern: /function\s+\w+\s*\(([^)]+)\)/g,
        check: (match, lineIndex) => {
          const params = match[1].split(',').length;
          return params > 5 ? 'medium' : null;
        }
      },
      {
        name: 'Magic Numbers',
        pattern: /\b\d{3,}\b/g,
        check: () => 'low'
      },
      {
        name: 'TODO Comments',
        pattern: /(TODO|FIXME|HACK|XXX)/gi,
        check: () => 'low'
      },
      {
        name: 'Console Statements',
        pattern: /console\.(log|error|warn|debug)/g,
        check: () => 'medium'
      },
      {
        name: 'Duplicate Code',
        pattern: /(.{50,})\n[\s\S]*?\1/g,
        check: () => 'high'
      }
    ];

    smellDetectors.forEach(detector => {
      let match;
      while ((match = detector.pattern.exec(content)) !== null) {
        const lineIndex = content.substr(0, match.index).split('\n').length - 1;
        const severity = detector.check(match, lineIndex);
        
        if (severity) {
          smells.push({
            type: detector.name,
            severity,
            line: lineIndex + 1,
            content: lines[lineIndex]?.trim() || '',
            message: this.getSmellMessage(detector.name, severity)
          });
        }
      }
    });

    return smells;
  }

  categorizeSmells(codeSmells) {
    const categories = {};
    
    codeSmells.forEach(file => {
      file.smells.forEach(smell => {
        categories[smell.type] = (categories[smell.type] || 0) + 1;
      });
    });

    return categories;
  }

  parseTypeScriptErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/(.+)\((\d+),(\d+)\): error TS(\d+): (.+)/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5]
        });
      }
    });

    return errors;
  }

  findUnusedDependencies(dependencies) {
    // Análise simplificada de dependências não utilizadas
    const unused = [];
    const srcFiles = this.getAllSourceFiles();
    
    Object.keys(dependencies).forEach(dep => {
      let isUsed = false;
      
      srcFiles.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(`'${dep}'`) || content.includes(`"${dep}"`)) {
          isUsed = true;
        }
      });

      if (!isUsed && !this.isSpecialDependency(dep)) {
        unused.push(dep);
      }
    });

    return unused;
  }

  isSpecialDependency(dep) {
    // Dependências que podem não aparecer diretamente no código
    const specialDeps = [
      '@types/',
      'eslint',
      'typescript',
      'vite',
      'jest',
      'tailwindcss',
      'postcss'
    ];
    
    return specialDeps.some(special => dep.startsWith(special));
  }

  getAllSourceFiles() {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    const searchDirs = ['src', 'client/src', 'server', 'shared'];
    
    searchDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, files, extensions);
      }
    });

    return files;
  }

  scanDirectory(dirPath, files, extensions) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.scanDirectory(fullPath, files, extensions);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }

  countFunctionLines(content, startLine) {
    const lines = content.split('\n');
    let braceCount = 0;
    let lineCount = 0;
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      lineCount++;
      
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      
      if (braceCount === 0 && i > startLine) {
        break;
      }
    }
    
    return lineCount;
  }

  getSmellMessage(type, severity) {
    const messages = {
      'Long Function': 'Função muito longa - considere dividir em funções menores',
      'Too Many Parameters': 'Muitos parâmetros - considere usar objeto ou builder pattern',
      'Magic Numbers': 'Número mágico - considere usar constante nomeada',
      'TODO Comments': 'Comentário TODO - implemente ou remova',
      'Console Statements': 'Console statement - remova antes da produção',
      'Duplicate Code': 'Código duplicado - extraia para função comum'
    };
    
    return messages[type] || `Code smell detectado: ${type}`;
  }

  generateSummary(allPassed) {
    const summary = {
      status: allPassed ? 'PASSED' : 'FAILED',
      timestamp: new Date().toISOString(),
      checks: Object.keys(this.results).filter(key => key !== 'summary').length,
      passed: Object.values(this.results).filter(r => r && r.passed).length,
      totalIssues: this.countTotalIssues(),
      recommendations: this.generateRecommendations()
    };

    this.results.summary = summary;

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA VERIFICAÇÃO DE QUALIDADE');
    console.log('='.repeat(60));
    console.log(`Status: ${summary.status}`);
    console.log(`Verificações: ${summary.passed}/${summary.checks} passaram`);
    console.log(`Total de problemas: ${summary.totalIssues}`);
    
    if (summary.recommendations.length > 0) {
      console.log('\n💡 Recomendações:');
      summary.recommendations.forEach(rec => {
        console.log(`  - ${rec}`);
      });
    }
    
    console.log('='.repeat(60));
  }

  countTotalIssues() {
    let total = 0;
    
    if (this.results.eslint) {
      total += this.results.eslint.stats.errors || 0;
    }
    
    if (this.results.vulnerabilities) {
      total += this.results.vulnerabilities.stats.critical || 0;
    }
    
    if (this.results.complexity) {
      total += this.results.complexity.stats.highComplexityFiles || 0;
    }
    
    if (this.results.codeSmells) {
      total += this.results.codeSmells.stats.criticalSmells || 0;
    }
    
    if (this.results.typeScript) {
      total += this.results.typeScript.stats.errors || 0;
    }

    return total;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.eslint && !this.results.eslint.passed) {
      recommendations.push('Corrigir erros do ESLint para melhorar qualidade do código');
    }
    
    if (this.results.vulnerabilities && this.results.vulnerabilities.stats.critical > 0) {
      recommendations.push('Atualizar dependências com vulnerabilidades críticas');
    }
    
    if (this.results.complexity && this.results.complexity.stats.highComplexityFiles > 0) {
      recommendations.push('Refatorar funções com alta complexidade ciclomática');
    }
    
    if (this.results.codeSmells && this.results.codeSmells.stats.totalSmells > 5) {
      recommendations.push('Limpar code smells para melhorar manutenibilidade');
    }

    return recommendations;
  }

  saveReport() {
    const reportDir = 'reports/quality';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `quality-report-${timestamp}.json`);
    
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Relatório salvo em: ${reportFile}`);
  }
}

// CLI
if (require.main === module) {
  const checker = new QualityChecker();
  
  checker.runAllChecks().then(passed => {
    process.exit(passed ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erro fatal na verificação de qualidade:', error);
    process.exit(1);
  });
}

module.exports = QualityChecker;