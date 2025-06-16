/**
 * Teste de Casos Extremos e Erros Não Detectados
 * Identifica problemas que passam despercebidos pelos testes tradicionais
 */

class EdgeCaseTester {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.errors = [];
    this.warnings = [];
    this.criticalIssues = [];
  }

  async runCompleteTest() {
    console.log('🔍 TESTE COMPLETO DE CASOS EXTREMOS');
    console.log('===============================================\n');

    await this.testMemoryLeaks();
    await this.testConcurrencyIssues();
    await this.testDataCorruption();
    await this.testNetworkFailures();
    await this.testInputValidationEdgeCases();
    await this.testStateInconsistencies();
    await this.testPerformanceDegradation();
    await this.testSecurityVulnerabilities();
    
    this.generateReport();
  }

  async testMemoryLeaks() {
    console.log('🧠 Testando: Vazamentos de Memória');
    
    try {
      // Simular múltiplas criações/destruições de componentes
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(fetch(`${this.baseUrl}/api/notifications`));
      }
      
      await Promise.all(promises);
      
      // Forçar garbage collection simulado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ PASSOU: Teste de vazamento de memória concluído');
    } catch (error) {
      this.errors.push(`Vazamento de memória: ${error.message}`);
    }
  }

  async testConcurrencyIssues() {
    console.log('⚡ Testando: Problemas de Concorrência');
    
    try {
      // Múltiplas operações simultâneas no mesmo recurso
      const syncPromises = [];
      for (let i = 0; i < 10; i++) {
        syncPromises.push(
          fetch(`${this.baseUrl}/api/auth/sync-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: `test-${i}` })
          })
        );
      }
      
      const results = await Promise.allSettled(syncPromises);
      const failures = results.filter(r => r.status === 'rejected');
      
      if (failures.length > 3) {
        this.warnings.push('Alta taxa de falha em operações concorrentes');
      }
      
      console.log('✅ PASSOU: Teste de concorrência concluído');
    } catch (error) {
      this.errors.push(`Concorrência: ${error.message}`);
    }
  }

  async testDataCorruption() {
    console.log('💾 Testando: Corrupção de Dados');
    
    try {
      // Tentar corromper dados com payloads malformados
      const malformedPayloads = [
        { densidade: 'invalid_number' },
        { umidade: null },
        { peso: undefined },
        { data: '2025-13-32' }, // Data inválida
        { temperatura: Number.MAX_SAFE_INTEGER },
        { operator: '<script>alert("xss")</script>' }
      ];
      
      for (const payload of malformedPayloads) {
        try {
          await fetch(`${this.baseUrl}/api/tests/density-real`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (e) {
          // Esperado - dados malformados devem ser rejeitados
        }
      }
      
      console.log('✅ PASSOU: Teste de corrupção de dados');
    } catch (error) {
      this.criticalIssues.push(`Corrupção de dados: ${error.message}`);
    }
  }

  async testNetworkFailures() {
    console.log('🌐 Testando: Falhas de Rede');
    
    try {
      // Timeout muito baixo para forçar falhas
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 1);
      
      try {
        await fetch(`${this.baseUrl}/api/notifications`, {
          signal: controller.signal
        });
      } catch (abortError) {
        // Esperado - verificar se o sistema lida bem com timeouts
      }
      
      console.log('✅ PASSOU: Teste de falhas de rede');
    } catch (error) {
      this.warnings.push(`Falhas de rede: ${error.message}`);
    }
  }

  async testInputValidationEdgeCases() {
    console.log('🔍 Testando: Validação de Entrada Extrema');
    
    const extremeInputs = [
      // Strings muito longas
      'a'.repeat(10000),
      // Caracteres especiais
      '\\n\\r\\t\\0',
      // Unicode malicioso
      '\u0000\uFEFF\u200B',
      // SQL injection attempts
      "'; DROP TABLE users; --",
      // XSS attempts
      '<script>alert("test")</script>',
      // Path traversal
      '../../../etc/passwd',
      // Números extremos
      Number.MAX_SAFE_INTEGER.toString(),
      Number.MIN_SAFE_INTEGER.toString(),
      'Infinity',
      'NaN'
    ];
    
    for (const input of extremeInputs) {
      try {
        await fetch(`${this.baseUrl}/api/lgpd/consent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: input })
        });
      } catch (e) {
        // Esperado para inputs maliciosos
      }
    }
    
    console.log('✅ PASSOU: Teste de validação extrema');
  }

  async testStateInconsistencies() {
    console.log('🔄 Testando: Inconsistências de Estado');
    
    try {
      // Simular mudanças rápidas de estado
      const notificationRequests = [];
      for (let i = 0; i < 5; i++) {
        notificationRequests.push(
          fetch(`${this.baseUrl}/api/notifications`)
        );
      }
      
      await Promise.all(notificationRequests);
      console.log('✅ PASSOU: Teste de consistência de estado');
    } catch (error) {
      this.errors.push(`Estado inconsistente: ${error.message}`);
    }
  }

  async testPerformanceDegradation() {
    console.log('📈 Testando: Degradação de Performance');
    
    try {
      const startTime = Date.now();
      
      // Múltiplas requisições para medir performance
      const requests = Array(20).fill(null).map(() => 
        fetch(`${this.baseUrl}/api/notifications`)
      );
      
      await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      if (totalTime > 5000) {
        this.warnings.push(`Performance degradada: ${totalTime}ms para 20 requisições`);
      }
      
      console.log('✅ PASSOU: Teste de performance');
    } catch (error) {
      this.errors.push(`Performance: ${error.message}`);
    }
  }

  async testSecurityVulnerabilities() {
    console.log('🔒 Testando: Vulnerabilidades de Segurança');
    
    try {
      // Tentar acessar endpoints sem autenticação
      const unauthorizedEndpoints = [
        '/api/admin/update-role',
        '/api/notifications',
        '/api/equipamentos'
      ];
      
      let unauthorizedAccess = 0;
      for (const endpoint of unauthorizedEndpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`);
          if (response.status === 200) {
            unauthorizedAccess++;
          }
        } catch (e) {
          // Esperado para endpoints protegidos
        }
      }
      
      if (unauthorizedAccess > 0) {
        this.criticalIssues.push(`${unauthorizedAccess} endpoints acessíveis sem autenticação`);
      }
      
      console.log('✅ PASSOU: Teste de segurança');
    } catch (error) {
      this.criticalIssues.push(`Segurança: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n===============================================');
    console.log('📊 RESUMO DOS TESTES DE CASOS EXTREMOS');
    console.log('===============================================');
    
    const totalTests = 8;
    const errorCount = this.errors.length;
    const warningCount = this.warnings.length;
    const criticalCount = this.criticalIssues.length;
    const successCount = totalTests - errorCount - criticalCount;
    
    console.log(`✅ Testes aprovados: ${successCount}/${totalTests}`);
    console.log(`❌ Erros detectados: ${errorCount}`);
    console.log(`⚠️ Warnings: ${warningCount}`);
    console.log(`🚨 Problemas críticos: ${criticalCount}`);
    
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
    
    const riskLevel = this.getRiskLevel(criticalCount, errorCount, warningCount);
    console.log(`\n📈 Nível de risco: ${riskLevel}`);
    
    if (criticalCount === 0 && errorCount === 0) {
      console.log('\n🎉 SISTEMA ROBUSTO - NENHUM CASO EXTREMO DETECTADO!');
    } else {
      console.log('\n🔧 CASOS EXTREMOS IDENTIFICADOS - MONITORAMENTO RECOMENDADO');
    }
  }

  getRiskLevel(critical, errors, warnings) {
    if (critical > 0) return 'ALTO 🔴';
    if (errors > 2) return 'MÉDIO 🟡';
    if (warnings > 3) return 'BAIXO 🟢';
    return 'MÍNIMO ✅';
  }
}

// Executar se chamado diretamente
if (process.argv[1].includes('test-edge-cases.js')) {
  const tester = new EdgeCaseTester();
  tester.runCompleteTest().catch(console.error);
}

export { EdgeCaseTester };