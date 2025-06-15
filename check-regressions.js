#!/usr/bin/env node

/**
 * Script de verificação de regressões
 * Executa: npm run check-regressions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Componentes críticos e suas funcionalidades esperadas
const CRITICAL_COMPONENTS = {
  'sidebar': {
    file: 'client/src/components/navigation/sidebar-optimized.tsx',
    requiredFeatures: [
      'Dashboard',
      'Analytics',
      'Ensaios',
      'Manual do Usuário',
      'Equipamentos',
      'Relatórios'
    ]
  },
  'breadcrumb': {
    file: 'client/src/components/ui/breadcrumb.tsx',
    requiredFeatures: [
      'breadcrumbMap',
      'manual-usuario',
      'manual-admin',
      'densidade-in-situ'
    ]
  },
  'dashboard': {
    file: 'client/src/pages/dashboard-simplified.tsx',
    requiredFeatures: [
      'Statistics Cards',
      'Quick Actions',
      'stat-card',
      'Performance'
    ]
  },
  'main-layout': {
    file: 'client/src/components/layout/main-layout.tsx',
    requiredFeatures: [
      'Breadcrumb',
      'Sidebar',
      'Mobile menu',
      'localStorage'
    ]
  }
};

class RegressionChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  checkFileExists(filePath) {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      this.errors.push(`❌ Arquivo não encontrado: ${filePath}`);
      return false;
    }
    this.passed.push(`✅ Arquivo existe: ${filePath}`);
    return true;
  }

  checkFileContent(filePath, requiredFeatures) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!this.checkFileExists(filePath)) {
      return false;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const missingFeatures = [];

      requiredFeatures.forEach(feature => {
        const patterns = [
          feature,
          feature.toLowerCase(),
          feature.replace(/\s+/g, '-').toLowerCase(),
          feature.replace(/\s+/g, '').toLowerCase()
        ];

        const found = patterns.some(pattern => 
          content.includes(pattern) || 
          content.includes(pattern.charAt(0).toUpperCase() + pattern.slice(1))
        );

        if (!found) {
          missingFeatures.push(feature);
        }
      });

      if (missingFeatures.length > 0) {
        this.errors.push(`❌ ${filePath}: Features ausentes - ${missingFeatures.join(', ')}`);
        return false;
      } else {
        this.passed.push(`✅ ${filePath}: Todas as features encontradas`);
        return true;
      }
    } catch (error) {
      this.errors.push(`❌ Erro ao ler ${filePath}: ${error.message}`);
      return false;
    }
  }

  run() {
    console.log('🔍 Iniciando verificação de regressões...\n');

    Object.entries(CRITICAL_COMPONENTS).forEach(([name, config]) => {
      console.log(`Verificando ${name}...`);
      this.checkFileContent(config.file, config.requiredFeatures);
    });

    this.generateReport();
    return this.errors.length === 0;
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO DE VERIFICAÇÃO DE REGRESSÕES');
    console.log('='.repeat(50));
    
    console.log(`\n✅ Sucessos: ${this.passed.length}`);
    console.log(`⚠️ Avisos: ${this.warnings.length}`);
    console.log(`❌ Erros: ${this.errors.length}\n`);

    if (this.errors.length > 0) {
      console.log('❌ ERROS CRÍTICOS:');
      this.errors.forEach(msg => console.log(`  ${msg}`));
      console.log('\n🚨 AÇÃO NECESSÁRIA: Corrija os erros acima para prevenir regressões');
    } else {
      console.log('🎉 VERIFICAÇÃO PASSOU: Nenhuma regressão detectada!');
    }

    console.log('='.repeat(50));
  }
}

const checker = new RegressionChecker();
const success = checker.run();
process.exit(success ? 0 : 1);