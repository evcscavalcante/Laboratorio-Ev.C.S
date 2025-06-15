#!/usr/bin/env node

/**
 * Analisador de Complexidade Ciclomática Avançado
 * Análise detalhada de complexidade e sugestões de refatoração
 */

const fs = require('fs');
const path = require('path');

class ComplexityAnalyzer {
  constructor() {
    this.thresholds = {
      low: 5,
      medium: 10,
      high: 15,
      critical: 20
    };
    
    this.patterns = {
      // Estruturas condicionais
      if: /\bif\s*\(/g,
      elseIf: /\belse\s+if\b/g,
      switch: /\bswitch\s*\(/g,
      case: /\bcase\s+.*?:/g,
      
      // Loops
      for: /\bfor\s*\(/g,
      while: /\bwhile\s*\(/g,
      doWhile: /\bdo\s*\{[\s\S]*?\}\s*while\s*\(/g,
      
      // Operadores lógicos
      and: /&&/g,
      or: /\|\|/g,
      ternary: /\?\s*.*?\s*:/g,
      
      // Exception handling
      try: /\btry\s*\{/g,
      catch: /\bcatch\s*\(/g,
      finally: /\bfinally\s*\{/g,
      
      // Funções e métodos
      function: /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\(|(?:async\s+)?\w+\s*\([^)]*\)\s*(?:=>|{))/g,
      arrowFunction: /(?:const\s+\w+\s*=\s*)?(?:\([^)]*\)\s*=>|\w+\s*=>/g,
      method: /\w+\s*\([^)]*\)\s*\{/g
    };
  }

  analyzeProject() {
    console.log('🔍 Analisando complexidade ciclomática do projeto...\n');
    
    const files = this.getAllSourceFiles();
    const results = [];
    
    files.forEach(filePath => {
      const analysis = this.analyzeFile(filePath);
      if (analysis) {
        results.push(analysis);
      }
    });
    
    return this.generateReport(results);
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const functions = this.extractFunctions(content);
      
      if (functions.length === 0) {
        return null;
      }

      const fileAnalysis = {
        file: filePath,
        totalComplexity: 0,
        averageComplexity: 0,
        maxComplexity: 0,
        functionCount: functions.length,
        functions: functions.map(func => this.analyzeFunctionComplexity(func, content))
      };

      fileAnalysis.totalComplexity = fileAnalysis.functions.reduce((sum, f) => sum + f.complexity, 0);
      fileAnalysis.averageComplexity = Math.round((fileAnalysis.totalComplexity / fileAnalysis.functionCount) * 100) / 100;
      fileAnalysis.maxComplexity = Math.max(...fileAnalysis.functions.map(f => f.complexity));

      return fileAnalysis;

    } catch (error) {
      console.warn(`⚠️ Erro ao analisar ${filePath}: ${error.message}`);
      return null;
    }
  }

  extractFunctions(content) {
    const functions = [];
    const lines = content.split('\n');
    
    // Padrões para detectar funções
    const functionPatterns = [
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g,
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function/g,
      /(\w+)\s*\([^)]*\)\s*\{/g, // Métodos em classes/objetos
      /(?:get|set)\s+(\w+)\s*\([^)]*\)/g // Getters e setters
    ];

    functionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1];
        const startIndex = match.index;
        const startLine = content.substring(0, startIndex).split('\n').length;
        
        // Encontrar o final da função
        const endLine = this.findFunctionEnd(content, startIndex);
        
        if (endLine > startLine) {
          functions.push({
            name,
            startLine,
            endLine,
            startIndex,
            content: lines.slice(startLine - 1, endLine).join('\n')
          });
        }
      }
    });

    // Remover duplicatas e ordenar por posição
    return functions
      .filter((func, index, arr) => 
        arr.findIndex(f => f.name === func.name && f.startLine === func.startLine) === index
      )
      .sort((a, b) => a.startLine - b.startLine);
  }

  findFunctionEnd(content, startIndex) {
    const lines = content.split('\n');
    const startLine = content.substring(0, startIndex).split('\n').length - 1;
    
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      
      // Contar chaves para encontrar o fim da função
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') {
          braceCount++;
          inFunction = true;
        } else if (line[j] === '}') {
          braceCount--;
          if (inFunction && braceCount === 0) {
            return i + 1;
          }
        }
      }
    }
    
    return startLine + 10; // Fallback
  }

  analyzeFunctionComplexity(func, fullContent) {
    let complexity = 1; // Base complexity
    const content = func.content;
    
    // Analisar cada padrão
    Object.entries(this.patterns).forEach(([name, pattern]) => {
      const matches = content.match(pattern);
      if (matches) {
        switch (name) {
          case 'if':
          case 'elseIf':
          case 'case':
          case 'for':
          case 'while':
          case 'doWhile':
          case 'catch':
            complexity += matches.length;
            break;
          case 'and':
          case 'or':
            complexity += matches.length;
            break;
          case 'ternary':
            complexity += matches.length;
            break;
          default:
            // Outros padrões não aumentam complexidade diretamente
            break;
        }
      }
    });

    // Análise adicional de nested structures
    const nestingPenalty = this.calculateNestingPenalty(content);
    complexity += nestingPenalty;

    return {
      name: func.name,
      startLine: func.startLine,
      endLine: func.endLine,
      lines: func.endLine - func.startLine + 1,
      complexity,
      severity: this.getComplexitySeverity(complexity),
      suggestions: this.generateSuggestions(complexity, func.content),
      metrics: this.calculateDetailedMetrics(func.content)
    };
  }

  calculateNestingPenalty(content) {
    const lines = content.split('\n');
    let maxNesting = 0;
    let currentNesting = 0;
    
    lines.forEach(line => {
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      
      currentNesting += openBraces - closeBraces;
      maxNesting = Math.max(maxNesting, currentNesting);
    });

    // Penalidade por deep nesting
    return Math.max(0, maxNesting - 3);
  }

  getComplexitySeverity(complexity) {
    if (complexity >= this.thresholds.critical) return 'critical';
    if (complexity >= this.thresholds.high) return 'high';
    if (complexity >= this.thresholds.medium) return 'medium';
    if (complexity >= this.thresholds.low) return 'low';
    return 'acceptable';
  }

  generateSuggestions(complexity, content) {
    const suggestions = [];

    if (complexity >= this.thresholds.critical) {
      suggestions.push('Refatoração urgente necessária - dividir em funções menores');
      suggestions.push('Considerar aplicar Strategy Pattern ou Command Pattern');
    } else if (complexity >= this.thresholds.high) {
      suggestions.push('Dividir função em subfunções menores');
      suggestions.push('Extrair condicionais complexas para funções separadas');
    } else if (complexity >= this.thresholds.medium) {
      suggestions.push('Considerar simplificar a lógica condicional');
      suggestions.push('Verificar se há oportunidades de early return');
    }

    // Sugestões específicas baseadas no conteúdo
    if (content.includes('switch') && content.match(/case/g)?.length > 5) {
      suggestions.push('Considerar substituir switch por object lookup ou polimorfismo');
    }

    if ((content.match(/if/g) || []).length > 3) {
      suggestions.push('Muitas condições - considerar Guard Clauses ou Validation Chain');
    }

    if (content.includes('try') && content.includes('catch')) {
      suggestions.push('Verificar se exception handling pode ser simplificado');
    }

    return suggestions;
  }

  calculateDetailedMetrics(content) {
    const lines = content.split('\n');
    
    return {
      totalLines: lines.length,
      codeLines: lines.filter(line => line.trim() && !line.trim().startsWith('//')).length,
      commentLines: lines.filter(line => line.trim().startsWith('//')).length,
      blankLines: lines.filter(line => !line.trim()).length,
      conditions: (content.match(/\bif\b/g) || []).length,
      loops: (content.match(/\b(for|while|do)\b/g) || []).length,
      returns: (content.match(/\breturn\b/g) || []).length,
      parameters: this.countParameters(content),
      localVariables: this.countLocalVariables(content)
    };
  }

  countParameters(content) {
    const funcMatch = content.match(/\([^)]*\)/);
    if (!funcMatch) return 0;
    
    const params = funcMatch[0].slice(1, -1).trim();
    if (!params) return 0;
    
    return params.split(',').length;
  }

  countLocalVariables(content) {
    const varMatches = content.match(/\b(let|const|var)\s+\w+/g) || [];
    return varMatches.length;
  }

  generateReport(results) {
    const totalFiles = results.length;
    const totalFunctions = results.reduce((sum, file) => sum + file.functionCount, 0);
    const totalComplexity = results.reduce((sum, file) => sum + file.totalComplexity, 0);
    const averageComplexity = totalFunctions > 0 ? Math.round((totalComplexity / totalFunctions) * 100) / 100 : 0;

    // Categorizar funções por severidade
    const functionsBySeverity = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      acceptable: []
    };

    results.forEach(file => {
      file.functions.forEach(func => {
        functionsBySeverity[func.severity].push({
          ...func,
          file: file.file
        });
      });
    });

    // Arquivos mais complexos
    const mostComplexFiles = results
      .sort((a, b) => b.maxComplexity - a.maxComplexity)
      .slice(0, 10);

    // Funções mais complexas
    const mostComplexFunctions = Object.values(functionsBySeverity)
      .flat()
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 20);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles,
        totalFunctions,
        totalComplexity,
        averageComplexity,
        highComplexityFunctions: functionsBySeverity.high.length + functionsBySeverity.critical.length,
        passed: functionsBySeverity.critical.length === 0
      },
      distribution: {
        critical: functionsBySeverity.critical.length,
        high: functionsBySeverity.high.length,
        medium: functionsBySeverity.medium.length,
        low: functionsBySeverity.low.length,
        acceptable: functionsBySeverity.acceptable.length
      },
      mostComplexFiles,
      mostComplexFunctions,
      recommendations: this.generateProjectRecommendations(functionsBySeverity),
      details: results
    };

    this.printReport(report);
    this.saveReport(report);

    return report;
  }

  generateProjectRecommendations(functionsBySeverity) {
    const recommendations = [];

    if (functionsBySeverity.critical.length > 0) {
      recommendations.push(`🚨 ${functionsBySeverity.critical.length} função(ões) com complexidade crítica - refatoração urgente`);
    }

    if (functionsBySeverity.high.length > 5) {
      recommendations.push(`⚠️ ${functionsBySeverity.high.length} funções com alta complexidade - planejar refatoração`);
    }

    if (functionsBySeverity.medium.length > 20) {
      recommendations.push(`📊 ${functionsBySeverity.medium.length} funções com complexidade média - monitorar crescimento`);
    }

    const totalProblematic = functionsBySeverity.critical.length + functionsBySeverity.high.length;
    if (totalProblematic === 0) {
      recommendations.push('✅ Excelente! Nenhuma função com complexidade problemática detectada');
    }

    return recommendations;
  }

  printReport(report) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RELATÓRIO DE COMPLEXIDADE CICLOMÁTICA');
    console.log('='.repeat(70));
    console.log(`📁 Arquivos analisados: ${report.summary.totalFiles}`);
    console.log(`🔧 Funções analisadas: ${report.summary.totalFunctions}`);
    console.log(`📈 Complexidade média: ${report.summary.averageComplexity}`);
    console.log(`⚠️ Funções problemáticas: ${report.summary.highComplexityFunctions}`);
    console.log(`✅ Status: ${report.summary.passed ? 'PASSOU' : 'FALHOU'}`);

    console.log('\n📊 Distribuição por Severidade:');
    console.log(`  🔴 Crítica: ${report.distribution.critical}`);
    console.log(`  🟠 Alta: ${report.distribution.high}`);
    console.log(`  🟡 Média: ${report.distribution.medium}`);
    console.log(`  🟢 Baixa: ${report.distribution.low}`);
    console.log(`  ✅ Aceitável: ${report.distribution.acceptable}`);

    if (report.mostComplexFunctions.length > 0) {
      console.log('\n🔥 Top 10 Funções Mais Complexas:');
      report.mostComplexFunctions.slice(0, 10).forEach((func, index) => {
        console.log(`  ${index + 1}. ${func.name} (${path.basename(func.file)}) - Complexidade: ${func.complexity}`);
      });
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recomendações:');
      report.recommendations.forEach(rec => {
        console.log(`  ${rec}`);
      });
    }

    console.log('='.repeat(70));
  }

  saveReport(report) {
    const reportDir = 'reports/complexity';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `complexity-report-${timestamp}.json`);
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Relatório detalhado salvo em: ${reportFile}`);
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
}

// CLI
if (require.main === module) {
  const analyzer = new ComplexityAnalyzer();
  
  const report = analyzer.analyzeProject();
  
  // Exit code baseado no resultado
  process.exit(report.summary.passed ? 0 : 1);
}

module.exports = ComplexityAnalyzer;