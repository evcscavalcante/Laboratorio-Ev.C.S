/**
 * Ferramenta de Verificação de Duplicidade
 * Detecta componentes, funções e implementações similares antes de criar novos
 */

import fs from 'fs';
import path from 'path';

class DuplicateChecker {
  constructor() {
    this.results = {
      components: [],
      functions: [],
      files: [],
      patterns: []
    };
  }

  // Verifica duplicidade de componentes React
  checkComponentDuplicates(componentName) {
    console.log(`🔍 Verificando duplicidade para componente: ${componentName}`);
    
    const searchPatterns = [
      `${componentName}.tsx`,
      `${componentName}.jsx`,
      `${componentName.toLowerCase()}.tsx`,
      `${componentName.toLowerCase()}.jsx`,
      componentName,
      componentName.toLowerCase()
    ];

    const foundFiles = [];
    this.scanDirectory('.', foundFiles, searchPatterns);

    return {
      exists: foundFiles.length > 0,
      files: foundFiles,
      recommendation: this.generateRecommendation(componentName, foundFiles)
    };
  }

  // Verifica duplicidade de funções específicas
  checkFunctionDuplicates(functionName) {
    console.log(`🔍 Verificando duplicidade para função: ${functionName}`);
    
    const foundImplementations = [];
    this.scanForFunction(functionName, '.', foundImplementations);

    return {
      exists: foundImplementations.length > 0,
      implementations: foundImplementations,
      recommendation: foundImplementations.length > 0 
        ? `❌ Função '${functionName}' já existe em ${foundImplementations.length} arquivo(s)`
        : `✅ Função '${functionName}' não encontrada - pode ser criada`
    };
  }

  // Verifica padrões similares
  checkPatternDuplicates(pattern, description) {
    console.log(`🔍 Verificando padrão: ${description}`);
    
    const foundPatterns = [];
    this.scanForPattern(pattern, '.', foundPatterns);

    return {
      exists: foundPatterns.length > 0,
      matches: foundPatterns,
      description: description,
      recommendation: foundPatterns.length > 0
        ? `⚠️ Padrão similar encontrado em ${foundPatterns.length} arquivo(s)`
        : `✅ Padrão único - pode ser implementado`
    };
  }

  // Verificação específica para cabeçalhos de ensaios
  checkTestHeaderDuplicates() {
    console.log(`🧪 Verificando implementações de cabeçalho de ensaios...`);
    
    const headerPatterns = [
      'test-header',
      'TestHeader',
      'header',
      'cabeçalho',
      'cabecalho',
      'ensaio.*header',
      'header.*ensaio',
      'teste.*cabecalho'
    ];

    const results = {
      components: [],
      functions: [],
      patterns: []
    };

    // Verificar componentes
    headerPatterns.forEach(pattern => {
      const componentCheck = this.checkComponentDuplicates(pattern);
      if (componentCheck.exists) {
        results.components.push({
          pattern: pattern,
          files: componentCheck.files
        });
      }
    });

    // Verificar padrões em código
    const codePatterns = [
      /header.*ensaio/gi,
      /ensaio.*header/gi,
      /cabeçalho/gi,
      /TestHeader/g,
      /test.*header/gi
    ];

    codePatterns.forEach(pattern => {
      const patternCheck = this.checkPatternDuplicates(pattern, `Padrão: ${pattern}`);
      if (patternCheck.exists) {
        results.patterns.push(patternCheck);
      }
    });

    return {
      hasExistingImplementation: results.components.length > 0 || results.patterns.length > 0,
      details: results,
      recommendation: this.generateHeaderRecommendation(results)
    };
  }

  // Escanear diretório por arquivos
  scanDirectory(dirPath, foundFiles, patterns, basePath = '') {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (this.shouldSkipEntry(entry.name)) continue;

        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
          this.scanDirectory(fullPath, foundFiles, patterns, relativePath);
        } else if (entry.isFile()) {
          // Verificar se o nome do arquivo corresponde aos padrões
          const matches = patterns.some(pattern => {
            if (typeof pattern === 'string') {
              return entry.name.toLowerCase().includes(pattern.toLowerCase()) ||
                     relativePath.toLowerCase().includes(pattern.toLowerCase());
            }
            return pattern.test(entry.name) || pattern.test(relativePath);
          });

          if (matches) {
            foundFiles.push({
              file: relativePath,
              fullPath: fullPath,
              type: this.getFileType(entry.name),
              size: this.getFileSize(fullPath)
            });
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao escanear ${dirPath}:`, error.message);
    }
  }

  // Escanear por função específica no código
  scanForFunction(functionName, dirPath, foundImplementations, basePath = '') {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (this.shouldSkipEntry(entry.name)) continue;

        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
          this.scanForFunction(functionName, fullPath, foundImplementations, relativePath);
        } else if (this.isCodeFile(entry.name)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const patterns = [
              new RegExp(`function\\s+${functionName}\\s*\\(`, 'g'),
              new RegExp(`const\\s+${functionName}\\s*=`, 'g'),
              new RegExp(`export\\s+.*${functionName}`, 'g'),
              new RegExp(`${functionName}\\s*:\\s*`, 'g')
            ];

            let hasFunction = false;
            const matches = [];

            patterns.forEach(pattern => {
              const match = pattern.exec(content);
              if (match) {
                hasFunction = true;
                matches.push({
                  pattern: pattern.source,
                  match: match[0],
                  index: match.index
                });
              }
            });

            if (hasFunction) {
              foundImplementations.push({
                file: relativePath,
                matches: matches,
                lines: this.getLineNumbers(content, matches)
              });
            }
          } catch (error) {
            // Ignorar erros de leitura de arquivo
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao escanear funções em ${dirPath}:`, error.message);
    }
  }

  // Escanear por padrão no código
  scanForPattern(pattern, dirPath, foundPatterns, basePath = '') {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (this.shouldSkipEntry(entry.name)) continue;

        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
          this.scanForPattern(pattern, fullPath, foundPatterns, relativePath);
        } else if (this.isCodeFile(entry.name)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = content.match(pattern);

            if (matches && matches.length > 0) {
              foundPatterns.push({
                file: relativePath,
                matches: matches.slice(0, 5), // Limitar a 5 matches por arquivo
                count: matches.length
              });
            }
          } catch (error) {
            // Ignorar erros de leitura
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao escanear padrões em ${dirPath}:`, error.message);
    }
  }

  // Utilitários
  shouldSkipEntry(name) {
    const skipPatterns = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      '.env',
      '.log',
      'package-lock.json'
    ];
    return skipPatterns.some(pattern => name.includes(pattern));
  }

  isCodeFile(filename) {
    const codeExtensions = ['.tsx', '.jsx', '.ts', '.js', '.vue', '.svelte'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  getFileType(filename) {
    const ext = path.extname(filename);
    switch (ext) {
      case '.tsx':
      case '.jsx': return 'React Component';
      case '.ts': return 'TypeScript';
      case '.js': return 'JavaScript';
      default: return 'Other';
    }
  }

  getFileSize(filepath) {
    try {
      const stats = fs.statSync(filepath);
      return `${(stats.size / 1024).toFixed(1)}KB`;
    } catch {
      return 'Unknown';
    }
  }

  getLineNumbers(content, matches) {
    return matches.map(match => {
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      return lineNumber;
    });
  }

  generateRecommendation(componentName, foundFiles) {
    if (foundFiles.length === 0) {
      return `✅ Componente '${componentName}' não existe - pode ser criado`;
    }

    return `❌ Componente '${componentName}' já existe em:\n${foundFiles.map(f => `  - ${f.file} (${f.type}, ${f.size})`).join('\n')}`;
  }

  generateHeaderRecommendation(results) {
    if (results.components.length === 0 && results.patterns.length === 0) {
      return `✅ RECOMENDAÇÃO: Nenhum cabeçalho de ensaio encontrado - pode criar TestHeader`;
    }

    let recommendation = `⚠️ ATENÇÃO: Implementações similares encontradas:\n`;
    
    if (results.components.length > 0) {
      recommendation += `\nComponentes similares:\n`;
      results.components.forEach(comp => {
        recommendation += `  - Padrão '${comp.pattern}': ${comp.files.length} arquivo(s)\n`;
        comp.files.forEach(file => {
          recommendation += `    * ${file.file}\n`;
        });
      });
    }

    if (results.patterns.length > 0) {
      recommendation += `\nPadrões no código:\n`;
      results.patterns.forEach(pattern => {
        recommendation += `  - ${pattern.description}: ${pattern.matches.length} match(es)\n`;
      });
    }

    recommendation += `\n🚨 RECOMENDAÇÃO: Verificar arquivos existentes antes de criar novo componente`;
    return recommendation;
  }

  // Executar verificação completa
  runCheck(type, target, description = '') {
    console.log(`\n🔍 === VERIFICAÇÃO DE DUPLICIDADE ===`);
    console.log(`Tipo: ${type}`);
    console.log(`Alvo: ${target}`);
    if (description) console.log(`Descrição: ${description}`);
    console.log(`=======================================\n`);

    let result;

    switch (type) {
      case 'component':
        result = this.checkComponentDuplicates(target);
        break;
      case 'function':
        result = this.checkFunctionDuplicates(target);
        break;
      case 'pattern':
        result = this.checkPatternDuplicates(new RegExp(target, 'gi'), description);
        break;
      case 'test-header':
        result = this.checkTestHeaderDuplicates();
        break;
      default:
        console.error(`❌ Tipo de verificação não suportado: ${type}`);
        return false;
    }

    // Exibir resultados
    console.log(`\n📊 RESULTADOS:`);
    console.log(result.recommendation);

    if (result.details) {
      console.log(`\n📋 DETALHES:`);
      console.log(JSON.stringify(result.details, null, 2));
    }

    console.log(`\n=======================================`);
    
    return result;
  }
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Uso: node check-duplicates.js <tipo> <alvo> [descrição]

Tipos disponíveis:
  component     - Verificar componente React
  function      - Verificar função específica  
  pattern       - Verificar padrão regex
  test-header   - Verificar cabeçalhos de ensaios

Exemplos:
  node check-duplicates.js component TestHeader
  node check-duplicates.js function calculateDensity
  node check-duplicates.js pattern "header.*ensaio" "Padrões de cabeçalho"
  node check-duplicates.js test-header
`);
    process.exit(1);
  }

  const checker = new DuplicateChecker();
  const result = checker.runCheck(args[0], args[1], args[2] || '');
  
  // Exit code para integração com scripts
  process.exit(result.exists || result.hasExistingImplementation ? 1 : 0);
}

export default DuplicateChecker;