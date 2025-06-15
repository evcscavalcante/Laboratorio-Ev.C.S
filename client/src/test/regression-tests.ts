/**
 * Regression Test Suite - Previne retrocessos em funcionalidades
 * Executa automaticamente ao adicionar novas features
 */

import { ComponentIntegrityValidator, COMPONENT_REGISTRY } from '@/lib/component-registry';

export interface TestResult {
  component: string;
  feature: string;
  status: 'pass' | 'fail' | 'warning';
  message?: string;
}

export class RegressionTestSuite {
  private results: TestResult[] = [];

  // Testa funcionalidades críticas da sidebar
  testSidebarFeatures(): TestResult[] {
    const sidebarFeatures = [
      'Dashboard',
      'Analytics', 
      'Ensaios (3 tipos)',
      'Equipamentos',
      'Verificação de Balança',
      'Relatórios',
      'Manual do Usuário'
    ];

    const missing = ComponentIntegrityValidator.checkFeatureRegression('sidebar', sidebarFeatures);
    
    return sidebarFeatures.map(feature => ({
      component: 'sidebar',
      feature,
      status: missing.includes(feature) ? 'fail' : 'pass',
      message: missing.includes(feature) ? 'Feature removida ou modificada' : undefined
    }));
  }

  // Testa navegação e breadcrumbs
  testNavigationFeatures(): TestResult[] {
    const navigationFeatures = [
      'Navegação automática baseada na URL',
      'Suporte a ícones',
      'Rotas de ensaios',
      'Rotas administrativas',
      'Rotas de ajuda/manuais'
    ];

    const missing = ComponentIntegrityValidator.checkFeatureRegression('breadcrumb', navigationFeatures);
    
    return navigationFeatures.map(feature => ({
      component: 'breadcrumb',
      feature,
      status: missing.includes(feature) ? 'fail' : 'pass',
      message: missing.includes(feature) ? 'Rota ou navegação quebrada' : undefined
    }));
  }

  // Testa sistema de autenticação
  testAuthFeatures(): TestResult[] {
    const authFeatures = [
      'Autenticação Firebase',
      'Sincronização com PostgreSQL',
      'Gerenciamento de roles',
      'Token JWT validation',
      'User profile management'
    ];

    const missing = ComponentIntegrityValidator.checkFeatureRegression('auth-system', authFeatures);
    
    return authFeatures.map(feature => ({
      component: 'auth-system',
      feature,
      status: missing.includes(feature) ? 'fail' : 'pass',
      message: missing.includes(feature) ? 'Sistema de auth comprometido' : undefined
    }));
  }

  // Testa dashboard simplificado
  testDashboardFeatures(): TestResult[] {
    const dashboardFeatures = [
      'Estatísticas (4 cards)',
      'Ações rápidas (3 ensaios)',
      'Resumo de performance',
      'Design system consistente'
    ];

    const missing = ComponentIntegrityValidator.checkFeatureRegression('dashboard', dashboardFeatures);
    
    return dashboardFeatures.map(feature => ({
      component: 'dashboard',
      feature,
      status: missing.includes(feature) ? 'fail' : 'pass',
      message: missing.includes(feature) ? 'Dashboard feature perdida' : undefined
    }));
  }

  // Executa todos os testes
  runAllTests(): TestResult[] {
    this.results = [
      ...this.testSidebarFeatures(),
      ...this.testNavigationFeatures(),
      ...this.testAuthFeatures(),
      ...this.testDashboardFeatures()
    ];

    return this.results;
  }

  // Gera relatório de resultados
  generateReport(): string {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;

    let report = `\n=== RELATÓRIO DE REGRESSÃO ===\n`;
    report += `✓ Passou: ${passed}\n`;
    report += `✗ Falhou: ${failed}\n`;
    report += `⚠ Avisos: ${warnings}\n\n`;

    if (failed > 0) {
      report += `FALHAS DETECTADAS:\n`;
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => {
          report += `- ${r.component}: ${r.feature} - ${r.message}\n`;
        });
    }

    return report;
  }

  // Verifica se há regressões críticas
  hasCriticalRegressions(): boolean {
    return this.results.some(r => r.status === 'fail');
  }
}

// Função utilitária para execução rápida
export function checkForRegressions(): boolean {
  const suite = new RegressionTestSuite();
  const results = suite.runAllTests();
  const report = suite.generateReport();
  
  console.log(report);
  
  if (suite.hasCriticalRegressions()) {
    console.error('🚨 REGRESSÕES CRÍTICAS DETECTADAS!');
    return false;
  }
  
  console.log('✅ Nenhuma regressão detectada');
  return true;
}