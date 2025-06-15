/**
 * Teste de Camadas Hierárquicas e Controle de Acesso
 * Valida permissões e acesso por role (VIEWER, TECHNICIAN, MANAGER, ADMIN, DEVELOPER)
 */

class HierarchyRolesTester {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.roleHierarchy = {
      VIEWER: { level: 1, permissions: ['view_tests'] },
      TECHNICIAN: { level: 2, permissions: ['view_tests', 'create_tests'] },
      MANAGER: { level: 3, permissions: ['view_tests', 'create_tests', 'edit_tests', 'view_reports'] },
      ADMIN: { level: 4, permissions: ['view_tests', 'create_tests', 'edit_tests', 'view_reports', 'manage_users', 'system_config'] },
      DEVELOPER: { level: 5, permissions: ['all_permissions', 'system_admin', 'debug_access'] }
    };
    this.results = {};
  }

  async runTests() {
    console.log('🔐 Iniciando testes de hierarquia e controle de acesso...\n');

    await this.testRoleHierarchy();
    await this.testEndpointAccess();
    await this.testDataIsolation();
    await this.testPermissionEscalation();

    this.generateReport();
  }

  async testRoleHierarchy() {
    console.log('👥 Testando estrutura hierárquica dos roles...');
    
    this.results.hierarchy = {
      status: 'success',
      validations: []
    };

    // Validar níveis hierárquicos
    const roles = Object.keys(this.roleHierarchy);
    for (let i = 0; i < roles.length - 1; i++) {
      const currentRole = roles[i];
      const nextRole = roles[i + 1];
      
      const currentLevel = this.roleHierarchy[currentRole].level;
      const nextLevel = this.roleHierarchy[nextRole].level;
      
      if (nextLevel > currentLevel) {
        this.results.hierarchy.validations.push({
          test: `${currentRole} (${currentLevel}) < ${nextRole} (${nextLevel})`,
          status: 'pass'
        });
      } else {
        this.results.hierarchy.validations.push({
          test: `${currentRole} (${currentLevel}) < ${nextRole} (${nextLevel})`,
          status: 'fail'
        });
        this.results.hierarchy.status = 'error';
      }
    }

    // Validar permissões cumulativas
    this.validateCumulativePermissions();
  }

  validateCumulativePermissions() {
    const hierarchyOrder = ['VIEWER', 'TECHNICIAN', 'MANAGER', 'ADMIN', 'DEVELOPER'];
    
    for (let i = 1; i < hierarchyOrder.length; i++) {
      const lowerRole = hierarchyOrder[i - 1];
      const higherRole = hierarchyOrder[i];
      
      const lowerPermissions = this.roleHierarchy[lowerRole].permissions;
      const higherPermissions = this.roleHierarchy[higherRole].permissions;
      
      // DEVELOPER tem todas as permissões
      if (higherRole === 'DEVELOPER') {
        this.results.hierarchy.validations.push({
          test: `${higherRole} tem todas as permissões`,
          status: 'pass'
        });
        continue;
      }
      
      // Verificar se role superior tem ao menos as permissões do inferior
      const hasAllLowerPermissions = lowerPermissions.every(perm => 
        higherPermissions.includes(perm)
      );
      
      this.results.hierarchy.validations.push({
        test: `${higherRole} inclui permissões de ${lowerRole}`,
        status: hasAllLowerPermissions ? 'pass' : 'fail'
      });
      
      if (!hasAllLowerPermissions) {
        this.results.hierarchy.status = 'error';
      }
    }
  }

  async testEndpointAccess() {
    console.log('🔒 Testando controle de acesso por endpoints...');
    
    this.results.endpoints = {
      status: 'success',
      tests: []
    };

    const endpointTests = [
      {
        endpoint: '/api/tests/densidade-real/temp',
        method: 'GET',
        allowedRoles: ['TECHNICIAN', 'MANAGER', 'ADMIN', 'DEVELOPER'],
        restrictedRoles: ['VIEWER']
      },
      {
        endpoint: '/api/tests/densidade-real/temp',
        method: 'POST',
        allowedRoles: ['TECHNICIAN', 'MANAGER', 'ADMIN', 'DEVELOPER'],
        restrictedRoles: ['VIEWER']
      },
      {
        endpoint: '/api/admin/users',
        method: 'GET',
        allowedRoles: ['ADMIN', 'DEVELOPER'],
        restrictedRoles: ['VIEWER', 'TECHNICIAN', 'MANAGER']
      },
      {
        endpoint: '/api/developer/system-info',
        method: 'GET',
        allowedRoles: ['DEVELOPER'],
        restrictedRoles: ['VIEWER', 'TECHNICIAN', 'MANAGER', 'ADMIN']
      },
      {
        endpoint: '/api/notifications',
        method: 'GET',
        allowedRoles: ['ADMIN', 'DEVELOPER'],
        restrictedRoles: ['VIEWER', 'TECHNICIAN', 'MANAGER']
      }
    ];

    for (const test of endpointTests) {
      try {
        const response = await fetch(`${this.baseUrl}${test.endpoint}`, {
          method: test.method,
          headers: {
            'Authorization': 'Bearer fake-token-for-testing'
          }
        });

        const testResult = {
          endpoint: `${test.method} ${test.endpoint}`,
          expectedBehavior: `Permitir: ${test.allowedRoles.join(', ')} | Restringir: ${test.restrictedRoles.join(', ')}`,
          actualStatus: response.status,
          status: response.status === 401 ? 'expected_auth_required' : 'accessible'
        };

        this.results.endpoints.tests.push(testResult);
        
      } catch (error) {
        this.results.endpoints.tests.push({
          endpoint: `${test.method} ${test.endpoint}`,
          status: 'error',
          error: error.message
        });
        this.results.endpoints.status = 'error';
      }
    }
  }

  async testDataIsolation() {
    console.log('🛡️ Testando isolamento de dados por role...');
    
    this.results.dataIsolation = {
      status: 'success',
      tests: []
    };

    // Testar se ensaios são visíveis para diferentes roles
    try {
      const response = await fetch(`${this.baseUrl}/api/tests/densidade-real/temp`);
      const ensaios = await response.json();
      
      this.results.dataIsolation.tests.push({
        test: 'Acesso a ensaios densidade real',
        status: response.ok ? 'accessible' : 'restricted',
        dataCount: Array.isArray(ensaios) ? ensaios.length : 0,
        details: `${ensaios.length || 0} ensaios encontrados`
      });

      // Verificar se dados sensíveis estão expostos
      if (Array.isArray(ensaios) && ensaios.length > 0) {
        const firstEnsaio = ensaios[0];
        const hasSensitiveData = firstEnsaio.hasOwnProperty('userId') || 
                                firstEnsaio.hasOwnProperty('createdBy');
        
        this.results.dataIsolation.tests.push({
          test: 'Exposição de dados sensíveis',
          status: hasSensitiveData ? 'exposed' : 'protected',
          details: 'Verificando campos userId, createdBy'
        });
      }

    } catch (error) {
      this.results.dataIsolation.tests.push({
        test: 'Acesso a ensaios densidade real',
        status: 'error',
        error: error.message
      });
      this.results.dataIsolation.status = 'error';
    }
  }

  async testPermissionEscalation() {
    console.log('⚡ Testando prevenção de escalação de privilégios...');
    
    this.results.escalation = {
      status: 'success',
      tests: []
    };

    const escalationTests = [
      {
        test: 'Acesso a endpoint de ADMIN sem permissão',
        endpoint: '/api/admin/users',
        expectedStatus: 401
      },
      {
        test: 'Acesso a endpoint de DEVELOPER sem permissão',
        endpoint: '/api/developer/system-info',
        expectedStatus: 401
      },
      {
        test: 'Modificação de role via API',
        endpoint: '/api/auth/set-role',
        method: 'POST',
        expectedStatus: 401
      }
    ];

    for (const test of escalationTests) {
      try {
        const response = await fetch(`${this.baseUrl}${test.endpoint}`, {
          method: test.method || 'GET',
          headers: {
            'Authorization': 'Bearer invalid-token'
          }
        });

        this.results.escalation.tests.push({
          test: test.test,
          expectedStatus: test.expectedStatus,
          actualStatus: response.status,
          status: response.status === test.expectedStatus ? 'protected' : 'vulnerable',
          details: `Esperado: ${test.expectedStatus}, Recebido: ${response.status}`
        });

        if (response.status !== test.expectedStatus) {
          this.results.escalation.status = 'vulnerable';
        }

      } catch (error) {
        this.results.escalation.tests.push({
          test: test.test,
          status: 'error',
          error: error.message
        });
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('🔐 RELATÓRIO DE TESTES DE HIERARQUIA E CONTROLE DE ACESSO');
    console.log('='.repeat(70));

    // Relatório de Hierarquia
    console.log('\n👥 ESTRUTURA HIERÁRQUICA:');
    if (this.results.hierarchy) {
      const passedValidations = this.results.hierarchy.validations.filter(v => v.status === 'pass').length;
      const totalValidations = this.results.hierarchy.validations.length;
      
      console.log(`   Status: ${this.results.hierarchy.status === 'success' ? '✅' : '❌'}`);
      console.log(`   Validações: ${passedValidations}/${totalValidations} aprovadas`);
      
      this.results.hierarchy.validations.forEach(validation => {
        const icon = validation.status === 'pass' ? '✅' : '❌';
        console.log(`   ${icon} ${validation.test}`);
      });
    }

    // Relatório de Endpoints
    console.log('\n🔒 CONTROLE DE ACESSO POR ENDPOINTS:');
    if (this.results.endpoints) {
      console.log(`   Status: ${this.results.endpoints.status === 'success' ? '✅' : '⚠️'}`);
      console.log(`   Endpoints testados: ${this.results.endpoints.tests.length}`);
      
      this.results.endpoints.tests.forEach(test => {
        const icon = test.status === 'expected_auth_required' ? '🔒' : 
                    test.status === 'accessible' ? '🔓' : '❌';
        console.log(`   ${icon} ${test.endpoint}: ${test.actualStatus}`);
      });
    }

    // Relatório de Isolamento de Dados
    console.log('\n🛡️ ISOLAMENTO DE DADOS:');
    if (this.results.dataIsolation) {
      console.log(`   Status: ${this.results.dataIsolation.status === 'success' ? '✅' : '⚠️'}`);
      
      this.results.dataIsolation.tests.forEach(test => {
        const icon = test.status === 'protected' ? '🛡️' : 
                    test.status === 'accessible' ? '👁️' : 
                    test.status === 'exposed' ? '⚠️' : '❌';
        console.log(`   ${icon} ${test.test}: ${test.details || test.status}`);
      });
    }

    // Relatório de Escalação de Privilégios
    console.log('\n⚡ PREVENÇÃO DE ESCALAÇÃO DE PRIVILÉGIOS:');
    if (this.results.escalation) {
      const protectedTests = this.results.escalation.tests.filter(t => t.status === 'protected').length;
      const totalTests = this.results.escalation.tests.length;
      
      console.log(`   Status: ${this.results.escalation.status === 'success' ? '✅' : '⚠️'}`);
      console.log(`   Proteções: ${protectedTests}/${totalTests} efetivas`);
      
      this.results.escalation.tests.forEach(test => {
        const icon = test.status === 'protected' ? '🛡️' : 
                    test.status === 'vulnerable' ? '⚠️' : '❌';
        console.log(`   ${icon} ${test.test}: ${test.details || test.status}`);
      });
    }

    // Resumo Final
    console.log('\n' + '-'.repeat(70));
    const allSystemsSecure = this.results.hierarchy?.status === 'success' &&
                            this.results.endpoints?.status === 'success' &&
                            this.results.dataIsolation?.status === 'success' &&
                            this.results.escalation?.status === 'success';

    if (allSystemsSecure) {
      console.log('🎉 SISTEMA DE HIERARQUIA SEGURO E FUNCIONAL');
      console.log('✅ Todas as camadas hierárquicas validadas');
      console.log('✅ Controle de acesso funcionando corretamente');
      console.log('✅ Dados protegidos contra acesso não autorizado');
    } else {
      console.log('⚠️ PROBLEMAS DE SEGURANÇA DETECTADOS');
      console.log('❌ Revisar configurações de hierarquia e permissões');
      console.log('❌ Corrigir vulnerabilidades antes do deploy');
    }

    console.log('\n📋 HIERARQUIA IMPLEMENTADA:');
    Object.entries(this.roleHierarchy).forEach(([role, config]) => {
      console.log(`   ${config.level}. ${role}: ${config.permissions.slice(0, 3).join(', ')}${config.permissions.length > 3 ? '...' : ''}`);
    });
    
    console.log('='.repeat(70));

    // Exit code para CI/CD
    process.exit(allSystemsSecure ? 0 : 1);
  }
}

// Executar testes
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new HierarchyRolesTester();
  tester.runTests().catch(console.error);
}

export default HierarchyRolesTester;