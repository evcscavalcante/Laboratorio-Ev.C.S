#!/usr/bin/env node

/**
 * Ferramenta de Análise Automática de Padrões do Projeto
 * Executa verificações antes de implementações para manter consistência
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectStandardsAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.standards = this.loadStandards();
    this.analysisReport = {
      architecture: {},
      patterns: {},
      compliance: {},
      recommendations: []
    };
  }

  loadStandards() {
    try {
      const standardsPath = path.join(this.projectRoot, 'docs/development/project-standards.md');
      return fs.readFileSync(standardsPath, 'utf8');
    } catch (error) {
      console.warn('⚠️ Padrões do projeto não encontrados');
      return '';
    }
  }

  analyzeArchitecture() {
    console.log('🔍 Analisando arquitetura do projeto...');
    
    const architecture = {
      frontend: this.checkFrontendStructure(),
      backend: this.checkBackendStructure(),
      database: this.checkDatabaseStructure(),
      authentication: this.checkAuthStructure()
    };

    this.analysisReport.architecture = architecture;
    return architecture;
  }

  checkFrontendStructure() {
    const clientPath = path.join(this.projectRoot, 'client/src');
    const structure = {
      hasComponents: fs.existsSync(path.join(clientPath, 'components')),
      hasPages: fs.existsSync(path.join(clientPath, 'pages')),
      hasLib: fs.existsSync(path.join(clientPath, 'lib')),
      hasHooks: fs.existsSync(path.join(clientPath, 'hooks')),
      hasTests: fs.existsSync(path.join(clientPath, 'test'))
    };

    // Verificar componentes críticos
    const criticalComponents = [
      'components/navigation/sidebar.tsx',
      'components/navigation/breadcrumb.tsx',
      'pages/dashboard.tsx',
      'lib/firebase.ts'
    ];

    structure.criticalComponents = criticalComponents.map(comp => ({
      path: comp,
      exists: fs.existsSync(path.join(clientPath, comp))
    }));

    return structure;
  }

  checkBackendStructure() {
    const serverPath = path.join(this.projectRoot, 'server');
    return {
      hasAuth: fs.existsSync(path.join(serverPath, 'auth-firebase-hybrid.ts')),
      hasStorage: fs.existsSync(path.join(serverPath, 'storage-corrected.ts')),
      hasRoutes: fs.existsSync(path.join(serverPath, 'routes.ts')),
      hasIndex: fs.existsSync(path.join(serverPath, 'index.ts'))
    };
  }

  checkDatabaseStructure() {
    const sharedPath = path.join(this.projectRoot, 'shared');
    return {
      hasSchema: fs.existsSync(path.join(sharedPath, 'schema.ts')),
      hasDrizzleConfig: fs.existsSync(path.join(this.projectRoot, 'drizzle.config.ts'))
    };
  }

  checkAuthStructure() {
    return {
      hasFirebaseConfig: fs.existsSync(path.join(this.projectRoot, 'client/src/lib/firebase.ts')),
      hasAuthHook: fs.existsSync(path.join(this.projectRoot, 'client/src/hooks/useAuth.tsx'))
    };
  }

  analyzeNamingPatterns() {
    console.log('📝 Analisando padrões de nomenclatura...');
    
    const patterns = {
      technicalNomenclature: this.checkTechnicalNaming(),
      fileNaming: this.checkFileNaming(),
      componentNaming: this.checkComponentNaming()
    };

    this.analysisReport.patterns = patterns;
    return patterns;
  }

  checkTechnicalNaming() {
    const nbrPatterns = [
      'NBR 9813:2021',
      'NBR 17212:2025', 
      'NBR 12004:2021',
      'NBR 12051:2021'
    ];

    // Verificar se nomenclaturas NBR são usadas consistentemente
    const densityFiles = [
      'client/src/components/laboratory/density-in-situ.tsx',
      'client/src/components/laboratory/density-real.tsx',
      'client/src/components/laboratory/density-max-min.tsx'
    ];

    return densityFiles.map(file => {
      const exists = fs.existsSync(path.join(this.projectRoot, file));
      if (exists) {
        const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
        const hasNBRReferences = nbrPatterns.some(nbr => content.includes(nbr));
        return { file, exists, hasNBRReferences };
      }
      return { file, exists: false, hasNBRReferences: false };
    });
  }

  checkFileNaming() {
    // Verificar consistência kebab-case para arquivos
    const checkPaths = ['client/src/pages', 'client/src/components'];
    const issues = [];

    checkPaths.forEach(dirPath => {
      const fullPath = path.join(this.projectRoot, dirPath);
      if (fs.existsSync(fullPath)) {
        this.checkDirectoryNaming(fullPath, issues);
      }
    });

    return { issues };
  }

  checkDirectoryNaming(dir, issues, basePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      const relativePath = path.join(basePath, item);

      if (stat.isDirectory()) {
        this.checkDirectoryNaming(itemPath, issues, relativePath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        // Verificar se segue kebab-case ou PascalCase apropriado
        const hasConsistentNaming = this.isValidFileName(item);
        if (!hasConsistentNaming) {
          issues.push(`Nomenclatura inconsistente: ${relativePath}`);
        }
      }
    });
  }

  isValidFileName(filename) {
    const nameWithoutExt = filename.replace(/\.(tsx?|jsx?)$/, '');
    
    // Permitir PascalCase para componentes ou kebab-case para utilitários
    const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(nameWithoutExt);
    const isKebabCase = /^[a-z][a-z0-9-]*$/.test(nameWithoutExt);
    
    return isPascalCase || isKebabCase;
  }

  checkComponentNaming() {
    // Verificar se componentes seguem PascalCase
    const componentsPath = path.join(this.projectRoot, 'client/src/components');
    const issues = [];

    if (fs.existsSync(componentsPath)) {
      this.checkComponentFiles(componentsPath, issues);
    }

    return { issues };
  }

  checkComponentFiles(dir, issues, basePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        this.checkComponentFiles(itemPath, issues, path.join(basePath, item));
      } else if (item.endsWith('.tsx')) {
        const content = fs.readFileSync(itemPath, 'utf8');
        const exportMatch = content.match(/export\s+default\s+function\s+(\w+)/);
        
        if (exportMatch) {
          const componentName = exportMatch[1];
          const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(componentName);
          
          if (!isPascalCase) {
            issues.push(`Componente não segue PascalCase: ${path.join(basePath, item)} -> ${componentName}`);
          }
        }
      }
    });
  }

  checkCompliance() {
    console.log('✅ Verificando conformidade com padrões...');
    
    const compliance = {
      typescript: this.checkTypeScriptUsage(),
      validation: this.checkValidationPatterns(),
      authentication: this.checkAuthCompliance(),
      database: this.checkDatabaseCompliance()
    };

    this.analysisReport.compliance = compliance;
    return compliance;
  }

  checkTypeScriptUsage() {
    // Verificar se .js files existem onde deveriam ser .ts
    const jsFiles = this.findJSFiles();
    return {
      hasJSFiles: jsFiles.length > 0,
      jsFiles: jsFiles,
      recommendation: jsFiles.length > 0 ? 'Converter arquivos .js para .ts' : 'OK'
    };
  }

  findJSFiles() {
    const jsFiles = [];
    const excludeDirs = ['node_modules', 'dist', '.git'];
    
    this.scanForJSFiles(this.projectRoot, jsFiles, excludeDirs);
    return jsFiles;
  }

  scanForJSFiles(dir, jsFiles, excludeDirs, basePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        if (excludeDirs.includes(item)) return;
        
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          this.scanForJSFiles(itemPath, jsFiles, excludeDirs, path.join(basePath, item));
        } else if (item.endsWith('.js') && !item.includes('.config.')) {
          jsFiles.push(path.join(basePath, item));
        }
      });
    } catch (error) {
      // Ignora erros de permissão
    }
  }

  checkValidationPatterns() {
    // Verificar se Zod é usado para validação
    const zodUsage = this.findZodUsage();
    return {
      usesZod: zodUsage.length > 0,
      zodFiles: zodUsage,
      recommendation: zodUsage.length === 0 ? 'Implementar validação com Zod' : 'OK'
    };
  }

  findZodUsage() {
    const zodFiles = [];
    const searchDirs = ['client/src', 'server', 'shared'];
    
    searchDirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        this.scanForZodUsage(fullPath, zodFiles);
      }
    });
    
    return zodFiles;
  }

  scanForZodUsage(dir, zodFiles, basePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          this.scanForZodUsage(itemPath, zodFiles, path.join(basePath, item));
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          const content = fs.readFileSync(itemPath, 'utf8');
          if (content.includes('from "zod"') || content.includes('import { z }')) {
            zodFiles.push(path.join(basePath, item));
          }
        }
      });
    } catch (error) {
      // Ignora erros
    }
  }

  checkAuthCompliance() {
    // Verificar se autenticação híbrida está implementada
    const authFiles = [
      'server/auth-firebase-hybrid.ts',
      'client/src/lib/firebase.ts',
      'client/src/hooks/useAuth.tsx'
    ];

    const authStatus = authFiles.map(file => ({
      file,
      exists: fs.existsSync(path.join(this.projectRoot, file))
    }));

    const allAuthFilesExist = authStatus.every(status => status.exists);

    return {
      isCompliant: allAuthFilesExist,
      authFiles: authStatus,
      recommendation: allAuthFilesExist ? 'OK' : 'Implementar arquivos de autenticação faltantes'
    };
  }

  checkDatabaseCompliance() {
    // Verificar se Drizzle ORM está configurado
    const dbFiles = [
      'shared/schema.ts',
      'server/db.ts',
      'drizzle.config.ts'
    ];

    const dbStatus = dbFiles.map(file => ({
      file,
      exists: fs.existsSync(path.join(this.projectRoot, file))
    }));

    const allDbFilesExist = dbStatus.every(status => status.exists);

    return {
      isCompliant: allDbFilesExist,
      dbFiles: dbStatus,
      recommendation: allDbFilesExist ? 'OK' : 'Configurar arquivos de banco de dados faltantes'
    };
  }

  generateRecommendations() {
    console.log('💡 Gerando recomendações...');
    
    const recommendations = [];

    // Baseado na análise de arquitetura
    const arch = this.analysisReport.architecture;
    if (arch.frontend && !arch.frontend.hasTests) {
      recommendations.push('Implementar testes automatizados no frontend');
    }

    // Baseado na análise de padrões
    const patterns = this.analysisReport.patterns;
    if (patterns.fileNaming?.issues.length > 0) {
      recommendations.push(`Corrigir nomenclatura de arquivos: ${patterns.fileNaming.issues.length} problemas encontrados`);
    }

    // Baseado na análise de conformidade
    const compliance = this.analysisReport.compliance;
    if (compliance.typescript?.hasJSFiles) {
      recommendations.push('Converter arquivos JavaScript para TypeScript');
    }

    this.analysisReport.recommendations = recommendations;
    return recommendations;
  }

  generateReport() {
    console.log('\n=== ANÁLISE DE PADRÕES DO PROJETO ===\n');

    // Arquitetura
    console.log('📁 ARQUITETURA:');
    const arch = this.analysisReport.architecture;
    if (arch.frontend) {
      console.log(`  Frontend: ${this.getStatusIcon(arch.frontend.hasComponents && arch.frontend.hasPages)}`);
      console.log(`    - Componentes: ${this.getStatusIcon(arch.frontend.hasComponents)}`);
      console.log(`    - Páginas: ${this.getStatusIcon(arch.frontend.hasPages)}`);
      console.log(`    - Testes: ${this.getStatusIcon(arch.frontend.hasTests)}`);
    }
    
    if (arch.backend) {
      console.log(`  Backend: ${this.getStatusIcon(arch.backend.hasAuth && arch.backend.hasStorage)}`);
      console.log(`    - Autenticação: ${this.getStatusIcon(arch.backend.hasAuth)}`);
      console.log(`    - Storage: ${this.getStatusIcon(arch.backend.hasStorage)}`);
    }

    // Padrões
    console.log('\n📝 PADRÕES:');
    const patterns = this.analysisReport.patterns;
    if (patterns.fileNaming) {
      console.log(`  Nomenclatura: ${this.getStatusIcon(patterns.fileNaming.issues.length === 0)}`);
      if (patterns.fileNaming.issues.length > 0) {
        patterns.fileNaming.issues.forEach(issue => {
          console.log(`    ⚠️ ${issue}`);
        });
      }
    }

    // Conformidade
    console.log('\n✅ CONFORMIDADE:');
    const compliance = this.analysisReport.compliance;
    if (compliance.typescript) {
      console.log(`  TypeScript: ${this.getStatusIcon(!compliance.typescript.hasJSFiles)}`);
    }
    if (compliance.authentication) {
      console.log(`  Autenticação: ${this.getStatusIcon(compliance.authentication.isCompliant)}`);
    }
    if (compliance.database) {
      console.log(`  Database: ${this.getStatusIcon(compliance.database.isCompliant)}`);
    }

    // Recomendações
    if (this.analysisReport.recommendations.length > 0) {
      console.log('\n💡 RECOMENDAÇÕES:');
      this.analysisReport.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(50));
  }

  getStatusIcon(isOk) {
    return isOk ? '✅' : '❌';
  }

  run() {
    console.log('🔍 Iniciando análise de padrões do projeto...\n');
    
    this.analyzeArchitecture();
    this.analyzeNamingPatterns();
    this.checkCompliance();
    this.generateRecommendations();
    this.generateReport();

    return this.analysisReport;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new ProjectStandardsAnalyzer();
  const report = analyzer.run();
  
  // Exit code baseado no status
  const hasIssues = report.recommendations.length > 0;
  process.exit(hasIssues ? 1 : 0);
}

export default ProjectStandardsAnalyzer;