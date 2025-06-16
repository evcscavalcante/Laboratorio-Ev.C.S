/**
 * Teste de Erros Reais do Sistema
 * Identifica problemas genuínos sem dependências externas
 */

class RealErrorDetector {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.errors = [];
    this.warnings = [];
    this.criticalIssues = [];
  }

  async runRealErrorAnalysis() {
    console.log('🔍 ANÁLISE DE ERROS REAIS DO SISTEMA');
    console.log('===============================================\n');

    await this.testAuthenticationErrors();
    await this.testAPIEndpointErrors();
    await this.testDataValidationErrors();
    await this.testSecurityVulnerabilities();
    await this.testPerformanceIssues();
    
    this.generateRealErrorReport();
  }

  async testAuthenticationErrors() {
    console.log('🔐 Testando: Erros de Autenticação');
    
    try {
      // Testar endpoints protegidos sem token
      const protectedEndpoints = [
        '/api/notifications',
        '/api/equipamentos',
        '/api/tests/density-in-situ',
        '/api/admin/users'
      ];
      
      for (const endpoint of protectedEndpoints) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        
        if (response.status !== 401) {
          this.criticalIssues.push(`CRÍTICO: Endpoint ${endpoint} não exige autenticação (status: ${response.status})`);
        }
      }
      
      console.log('✅ Teste de autenticação concluído');
    } catch (error) {
      this.errors.push(`Erro no teste de autenticação: ${error.message}`);
    }
  }

  async testAPIEndpointErrors() {
    console.log('🌐 Testando: Erros de Endpoints API');
    
    try {
      // Testar endpoints que devem retornar 404
      const invalidEndpoints = [
        '/api/nonexistent',
        '/api/invalid/route',
        '/api/missing'
      ];
      
      for (const endpoint of invalidEndpoints) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        
        if (response.status !== 404) {
          this.errors.push(`Endpoint inválido ${endpoint} retornou ${response.status} (esperado 404)`);
        }
      }
      
      // Testar se endpoints públicos funcionam
      const publicEndpoints = [
        '/api/lgpd/terms',
        '/api/lgpd/privacy-policy'
      ];
      
      for (const endpoint of publicEndpoints) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        
        if (!response.ok) {
          this.errors.push(`Endpoint público ${endpoint} falhou: ${response.status}`);
        }
      }
      
      console.log('✅ Teste de endpoints concluído');
    } catch (error) {
      this.errors.push(`Erro no teste de endpoints: ${error.message}`);
    }
  }

  async testDataValidationErrors() {
    console.log('📝 Testando: Erros de Validação de Dados');
    
    try {
      // Testar envio de dados inválidos
      const invalidPayloads = [
        { endpoint: '/api/lgpd/consent', data: null },
        { endpoint: '/api/lgpd/consent', data: {} },
        { endpoint: '/api/lgpd/consent', data: { invalid: 'data' } }
      ];
      
      for (const test of invalidPayloads) {
        try {
          const response = await fetch(`${this.baseUrl}${test.endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(test.data)
          });
          
          // Verificar se a validação está funcionando
          if (response.ok && test.data === null) {
            this.warnings.push(`Endpoint ${test.endpoint} aceita dados null`);
          }
        } catch (error) {
          // Erro de rede é normal para dados inválidos
        }
      }
      
      console.log('✅ Teste de validação concluído');
    } catch (error) {
      this.errors.push(`Erro no teste de validação: ${error.message}`);
    }
  }

  async testSecurityVulnerabilities() {
    console.log('🔒 Testando: Vulnerabilidades de Segurança Reais');
    
    try {
      // Testar headers de segurança
      const response = await fetch(this.baseUrl);
      const headers = response.headers;
      
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options'
      ];
      
      securityHeaders.forEach(header => {
        if (!headers.get(header)) {
          this.warnings.push(`Header de segurança ausente: ${header}`);
        }
      });
      
      // Testar se informações sensíveis estão expostas
      const errorResponse = await fetch(`${this.baseUrl}/api/trigger-error-test`);
      const errorText = await errorResponse.text();
      
      if (errorText.includes('Error:') || errorText.includes('at ')) {
        this.criticalIssues.push('CRÍTICO: Stack traces expostos em respostas de erro');
      }
      
      console.log('✅ Teste de segurança concluído');
    } catch (error) {
      this.errors.push(`Erro no teste de segurança: ${error.message}`);
    }
  }

  async testPerformanceIssues() {
    console.log('⚡ Testando: Problemas de Performance');
    
    try {
      const startTime = Date.now();
      
      // Fazer múltiplas requisições para detectar problemas
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(fetch(`${this.baseUrl}/api/lgpd/terms`));
      }
      
      await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 5;
      
      if (avgTime > 500) {
        this.warnings.push(`Performance baixa: tempo médio ${avgTime}ms (ideal <500ms)`);
      }
      
      console.log('✅ Teste de performance concluído');
    } catch (error) {
      this.errors.push(`Erro no teste de performance: ${error.message}`);
    }
  }

  generateRealErrorReport() {
    console.log('\n===============================================');
    console.log('📊 RELATÓRIO DE ERROS REAIS DO SISTEMA');
    console.log('===============================================');
    
    const totalIssues = this.criticalIssues.length + this.errors.length + this.warnings.length;
    
    console.log(`\n📈 Total de problemas encontrados: ${totalIssues}`);
    console.log(`🚨 Críticos: ${this.criticalIssues.length}`);
    console.log(`❌ Erros: ${this.errors.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    
    if (this.criticalIssues.length > 0) {
      console.log('\n🚨 PROBLEMAS CRÍTICOS:');
      this.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERROS DETECTADOS:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    // Determinar status geral
    let status = 'EXCELENTE';
    if (this.criticalIssues.length > 0) {
      status = 'CRÍTICO';
    } else if (this.errors.length > 0) {
      status = 'PROBLEMÁTICO';
    } else if (this.warnings.length > 0) {
      status = 'ATENÇÃO';
    }
    
    console.log(`\n🎯 STATUS GERAL: ${status}`);
    
    if (totalIssues === 0) {
      console.log('\n🎉 SISTEMA SEM ERROS REAIS DETECTADOS!');
      console.log('Sistema funcionando corretamente.');
    } else {
      console.log('\n🔧 RECOMENDAÇÕES:');
      
      if (this.criticalIssues.length > 0) {
        console.log('1. Corrigir imediatamente os problemas críticos de segurança');
      }
      
      if (this.errors.length > 0) {
        console.log('2. Resolver os erros funcionais identificados');
      }
      
      if (this.warnings.length > 0) {
        console.log('3. Considerar melhorias para os warnings identificados');
      }
    }
    
    console.log('\n===============================================');
  }
}

// Executar teste se chamado diretamente
if (process.argv[1].includes('test-real-errors.js')) {
  const detector = new RealErrorDetector();
  detector.runRealErrorAnalysis().catch(console.error);
}

export { RealErrorDetector };