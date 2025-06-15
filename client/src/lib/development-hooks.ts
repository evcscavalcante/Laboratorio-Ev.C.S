/**
 * Development Hooks - Sistema automático de prevenção de regressões
 * Executa verificações sempre que componentes são modificados
 */

import { checkForRegressions } from '@/test/regression-tests';
import { ComponentIntegrityValidator } from '@/lib/component-registry';

export class DevelopmentHooks {
  private static initialized = false;
  private static watchedComponents = new Set<string>();

  // Inicializa o sistema de hooks
  static init() {
    if (this.initialized) return;
    
    console.log('🔧 Inicializando hooks de desenvolvimento...');
    
    // Validação inicial de todos os componentes
    const isValid = ComponentIntegrityValidator.validateAllComponents();
    if (!isValid) {
      console.warn('⚠️ Alguns componentes falharam na validação inicial');
    }

    // Hook de hot reload do Vite
    if (import.meta.hot) {
      import.meta.hot.on('vite:beforeUpdate', this.onBeforeUpdate.bind(this));
      import.meta.hot.on('vite:afterUpdate', this.onAfterUpdate.bind(this));
    }

    this.initialized = true;
    console.log('✅ Hooks de desenvolvimento ativados');
  }

  // Executa antes de atualizações do Vite
  static onBeforeUpdate(payload: any) {
    const updatedFiles = payload.updates?.map((u: any) => u.path) || [];
    
    // Detecta se componentes críticos foram modificados
    const criticalFiles = [
      'sidebar',
      'breadcrumb', 
      'dashboard',
      'auth',
      'main-layout'
    ];

    const modifiedCritical = updatedFiles.some((file: string) => 
      criticalFiles.some(critical => file.includes(critical))
    );

    if (modifiedCritical) {
      console.log('🔍 Componente crítico modificado, preparando verificação...');
      this.watchedComponents.add('critical-update');
    }
  }

  // Executa após atualizações do Vite
  static onAfterUpdate() {
    if (this.watchedComponents.has('critical-update')) {
      console.log('🧪 Executando verificação de regressão...');
      
      // Executa com delay para permitir que o componente seja carregado
      setTimeout(() => {
        const hasRegressions = !checkForRegressions();
        
        if (hasRegressions) {
          console.error('🚨 ATENÇÃO: Regressões detectadas após modificação!');
          this.showRegressionAlert();
        } else {
          console.log('✅ Verificação passou - nenhuma regressão detectada');
        }
        
        this.watchedComponents.delete('critical-update');
      }, 1000);
    }
  }

  // Mostra alerta visual de regressão
  static showRegressionAlert() {
    if (typeof window !== 'undefined') {
      const alert = document.createElement('div');
      alert.id = 'regression-alert';
      alert.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #dc2626;
          color: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10000;
          max-width: 400px;
          font-family: monospace;
          font-size: 14px;
        ">
          <strong>🚨 REGRESSÃO DETECTADA</strong><br>
          Funcionalidades podem ter sido perdidas.<br>
          Verifique o console para detalhes.
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: white;
            color: #dc2626;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            margin-left: 8px;
            cursor: pointer;
          ">Fechar</button>
        </div>
      `;
      
      // Remove alertas anteriores
      const existing = document.getElementById('regression-alert');
      if (existing) existing.remove();
      
      document.body.appendChild(alert);
      
      // Remove automaticamente após 10 segundos
      setTimeout(() => {
        const alertEl = document.getElementById('regression-alert');
        if (alertEl) alertEl.remove();
      }, 10000);
    }
  }

  // Verifica funcionalidade específica
  static checkFeature(componentName: string, featureName: string): boolean {
    const features = ComponentIntegrityValidator.getComponentFeatures(componentName);
    const hasFeature = features.includes(featureName);
    
    if (!hasFeature) {
      console.warn(`⚠️ Feature '${featureName}' não encontrada em '${componentName}'`);
    }
    
    return hasFeature;
  }

  // Registra nova funcionalidade (para expansões futuras)
  static registerFeature(componentName: string, featureName: string) {
    console.log(`📝 Registrando nova feature: ${componentName}.${featureName}`);
    // Implementação futura: atualizar registry automaticamente
  }
}

// Auto-inicialização em desenvolvimento
if (import.meta.env.DEV) {
  DevelopmentHooks.init();
}

export default DevelopmentHooks;