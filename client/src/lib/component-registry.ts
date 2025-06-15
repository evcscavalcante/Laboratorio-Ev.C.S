/**
 * Component Registry - Sistema de versionamento de componentes
 * Previne regressões ao adicionar novas funcionalidades
 */

export interface ComponentVersion {
  version: string;
  description: string;
  features: string[];
  dependencies?: string[];
  deprecated?: boolean;
  replacedBy?: string;
}

export interface ComponentContract {
  name: string;
  currentVersion: string;
  versions: Record<string, ComponentVersion>;
  requiredProps: string[];
  optionalProps?: string[];
  exports: string[];
}

// Registry de componentes críticos do sistema
export const COMPONENT_REGISTRY: Record<string, ComponentContract> = {
  'sidebar': {
    name: 'Sidebar Navigation',
    currentVersion: '2.1.0',
    requiredProps: ['isOpen'],
    optionalProps: ['onToggle'],
    exports: ['Sidebar', 'default'],
    versions: {
      '2.1.0': {
        version: '2.1.0',
        description: 'Sidebar otimizada com manual do usuário restaurado',
        features: [
          'Dashboard',
          'Analytics', 
          'Ensaios (3 tipos)',
          'Equipamentos',
          'Verificação de Balança',
          'Relatórios',
          'Manual do Usuário',
          'Administração (condicional)',
          'Manual Admin (condicional)'
        ]
      },
      '2.0.0': {
        version: '2.0.0',
        description: 'Sidebar simplificada e otimizada',
        features: [
          'Dashboard',
          'Analytics',
          'Ensaios expandível',
          'Equipamentos',
          'Relatórios',
          'Administração'
        ]
      }
    }
  },

  'breadcrumb': {
    name: 'Breadcrumb Navigation',
    currentVersion: '1.1.0',
    requiredProps: [],
    optionalProps: ['items', 'className'],
    exports: ['Breadcrumb', 'default'],
    versions: {
      '1.1.0': {
        version: '1.1.0',
        description: 'Breadcrumb com suporte a manuais',
        features: [
          'Navegação automática baseada na URL',
          'Suporte a ícones',
          'Rotas de ensaios',
          'Rotas administrativas',
          'Rotas de ajuda/manuais'
        ]
      }
    }
  },

  'dashboard': {
    name: 'Dashboard Component',
    currentVersion: '2.0.0',
    requiredProps: [],
    exports: ['Dashboard', 'default'],
    versions: {
      '2.0.0': {
        version: '2.0.0',
        description: 'Dashboard simplificado e otimizado',
        features: [
          'Estatísticas (4 cards)',
          'Ações rápidas (3 ensaios)',
          'Resumo de performance',
          'Design system consistente'
        ]
      }
    }
  },

  'auth-system': {
    name: 'Authentication System',
    currentVersion: '1.2.0',
    requiredProps: [],
    exports: ['useAuth', 'AuthProvider'],
    versions: {
      '1.2.0': {
        version: '1.2.0',
        description: 'Sistema híbrido Firebase + PostgreSQL',
        features: [
          'Autenticação Firebase',
          'Sincronização com PostgreSQL',
          'Gerenciamento de roles',
          'Token JWT validation',
          'User profile management'
        ]
      }
    }
  }
};

// Validador de integridade dos componentes
export class ComponentIntegrityValidator {
  static validateComponent(componentName: string): boolean {
    const contract = COMPONENT_REGISTRY[componentName];
    if (!contract) {
      console.warn(`Componente '${componentName}' não encontrado no registry`);
      return false;
    }

    const currentVersion = contract.versions[contract.currentVersion];
    if (!currentVersion) {
      console.error(`Versão atual '${contract.currentVersion}' não encontrada para '${componentName}'`);
      return false;
    }

    console.log(`✓ Componente '${componentName}' v${contract.currentVersion} validado`);
    return true;
  }

  static validateAllComponents(): boolean {
    const components = Object.keys(COMPONENT_REGISTRY);
    const results = components.map(comp => this.validateComponent(comp));
    return results.every(result => result === true);
  }

  static getComponentFeatures(componentName: string): string[] {
    const contract = COMPONENT_REGISTRY[componentName];
    if (!contract) return [];
    
    const currentVersion = contract.versions[contract.currentVersion];
    return currentVersion?.features || [];
  }

  static checkFeatureRegression(componentName: string, expectedFeatures: string[]): string[] {
    const currentFeatures = this.getComponentFeatures(componentName);
    const missingFeatures = expectedFeatures.filter(
      feature => !currentFeatures.includes(feature)
    );

    if (missingFeatures.length > 0) {
      console.error(`⚠️ REGRESSÃO DETECTADA em '${componentName}':`);
      console.error(`Features perdidas: ${missingFeatures.join(', ')}`);
    }

    return missingFeatures;
  }
}

// Hook para uso em desenvolvimento
export function useComponentRegistry() {
  return {
    validate: ComponentIntegrityValidator.validateComponent,
    validateAll: ComponentIntegrityValidator.validateAllComponents,
    checkRegression: ComponentIntegrityValidator.checkFeatureRegression,
    getFeatures: ComponentIntegrityValidator.getComponentFeatures,
    registry: COMPONENT_REGISTRY
  };
}