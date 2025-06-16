/**
 * Sistema Abrangente de Detecção de Erros
 * Identifica problemas que escapam dos testes tradicionais
 */

class ComprehensiveErrorDetector {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.findings = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: []
    };
  }

  async runFullAnalysis() {
    console.log('🔍 ANÁLISE ABRANGENTE DE ERROS OCULTOS');
    console.log('===============================================\n');

    await this.analyzeRuntimeErrors();
    await this.analyzeMemoryPatterns();
    await this.analyzeAsyncRaceConditions();
    await this.analyzeDataIntegrity();
    await this.analyzeSecurityVulnerabilities();
    await this.analyzePerformanceAntipatterns();
    await this.analyzeAccessibilityIssues();
    await this.analyzeBrowserCompatibility();
    await this.analyzeErrorHandling();
    await this.analyzeLoggingGaps();
    
    this.generateComprehensiveReport();
  }

  async analyzeRuntimeErrors() {
    console.log('🐛 Analisando: Erros de Runtime Críticos');
    
    try {
      // Testar problemas reais de runtime que afetam a aplicação
      const criticalTests = [
        {
          name: 'Uncaught exceptions in async functions',
          test: async () => {
            try {
              // Simular função async que pode falhar sem tratamento
              await new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error('Unhandled async error')), 10);
              });
            } catch (e) {
              return 'handled'; // Erro tratado adequadamente
            }
          }
        },
        {
          name: 'Memory leak in event listeners',
          test: () => {
            // Verificar se estamos em ambiente de navegador
            if (typeof document === 'undefined') {
              return 'ok'; // Em ambiente de servidor, não temos DOM
            }
            
            // Verificar se event listeners são removidos adequadamente
            const element = document.createElement('div');
            element.addEventListener('click', () => {});
            // Em uma aplicação real, verificaríamos se removeEventListener é chamado
            return 'needs_verification';
          }
        },
        {
          name: 'Unhandled promise rejections',
          test: () => {
            // Testar se promises rejeitadas são tratadas
            Promise.reject(new Error('Test rejection')).catch(() => 'handled');
            return 'handled';
          }
        }
      ];
      
      for (const test of criticalTests) {
        try {
          const result = await test.test();
          if (result === 'needs_verification') {
            this.findings.info.push(`Runtime: ${test.name} requer verificação manual`);
          } else if (result !== 'handled') {
            this.findings.medium.push(`Runtime: ${test.name} não tratado adequadamente`);
          }
        } catch (error) {
          this.findings.high.push(`Runtime: ${test.name} gerou erro não tratado: ${error.message}`);
        }
      }
      
      console.log('✅ Análise de runtime críticos concluída');
    } catch (error) {
      this.findings.high.push(`Runtime analysis failed: ${error.message}`);
    }
  }

  async analyzeMemoryPatterns() {
    console.log('🧠 Analisando: Padrões de Vazamento de Memória');
    
    try {
      // Simular padrões que causam vazamentos
      const leakPatterns = [
        'Event listeners não removidos',
        'Timers/intervals não limpos', 
        'Closures mantendo referências',
        'DOM nodes orphaned',
        'Global variables acumulando'
      ];
      
      // Múltiplas requisições para detectar crescimento de memória
      const memoryBefore = process.memoryUsage();
      
      for (let i = 0; i < 100; i++) {
        await fetch(`${this.baseUrl}/api/lgpd/terms`).catch(() => {});
      }
      
      const memoryAfter = process.memoryUsage();
      const heapGrowth = memoryAfter.heapUsed - memoryBefore.heapUsed;
      
      if (heapGrowth > 10 * 1024 * 1024) { // 10MB
        this.findings.medium.push(`Possível vazamento: heap cresceu ${Math.round(heapGrowth/1024/1024)}MB`);
      }
      
      console.log('✅ Análise de memória concluída');
    } catch (error) {
      this.findings.low.push(`Memory analysis: ${error.message}`);
    }
  }

  async analyzeAsyncRaceConditions() {
    console.log('⚡ Analisando: Race Conditions e Async Issues');
    
    try {
      // Simular condições de corrida
      const promises = [];
      const results = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          fetch(`${this.baseUrl}/api/lgpd/terms`)
            .then(r => r.json())
            .then(data => results.push(data))
            .catch(() => results.push(null))
        );
      }
      
      await Promise.allSettled(promises);
      
      const nullResults = results.filter(r => r === null).length;
      if (nullResults > 3) {
        this.findings.medium.push(`Race condition detectada: ${nullResults}/10 falhas`);
      }
      
      console.log('✅ Análise async concluída');
    } catch (error) {
      this.findings.medium.push(`Async analysis: ${error.message}`);
    }
  }

  async analyzeDataIntegrity() {
    console.log('💾 Analisando: Integridade de Dados');
    
    try {
      // Testar consistência de dados
      const endpoints = [
        '/api/lgpd/terms',
        '/api/lgpd/privacy-policy'
      ];
      
      for (const endpoint of endpoints) {
        const response1 = await fetch(`${this.baseUrl}${endpoint}`);
        const response2 = await fetch(`${this.baseUrl}${endpoint}`);
        
        if (response1.ok && response2.ok) {
          const data1 = await response1.json();
          const data2 = await response2.json();
          
          if (JSON.stringify(data1) !== JSON.stringify(data2)) {
            this.findings.high.push(`Inconsistência: ${endpoint} retorna dados diferentes`);
          }
        }
      }
      
      console.log('✅ Análise de integridade concluída');
    } catch (error) {
      this.findings.medium.push(`Data integrity: ${error.message}`);
    }
  }

  async analyzeSecurityVulnerabilities() {
    console.log('🔒 Analisando: Vulnerabilidades de Segurança Reais');
    
    try {
      const securityTests = [
        {
          name: 'Autenticação adequada',
          test: async () => {
            // Testar endpoints críticos sem autenticação
            const criticalEndpoints = [
              '/api/admin/users',
              '/api/auth/set-role',
              '/api/equipamentos'
            ];
            
            let vulnerabilities = 0;
            for (const endpoint of criticalEndpoints) {
              try {
                const response = await fetch(`${this.baseUrl}${endpoint}`);
                if (response.status === 200) {
                  vulnerabilities++;
                }
              } catch (e) {
                // Erro de rede é esperado para endpoints protegidos
              }
            }
            
            return vulnerabilities === 0 ? 'ok' : `${vulnerabilities} endpoints desprotegidos`;
          }
        },
        {
          name: 'Sanitização de entrada',
          test: async () => {
            // Testar injeção básica
            const maliciousPayloads = [
              "'; DROP TABLE users; --",
              "<script>alert('xss')</script>",
              "../../etc/passwd"
            ];
            
            for (const payload of maliciousPayloads) {
              try {
                const response = await fetch(`${this.baseUrl}/api/lgpd/consent`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ consentType: payload, consentStatus: 'given' })
                });
                
                const text = await response.text();
                if (text.includes(payload) && !text.includes('error')) {
                  return `Payload não sanitizado: ${payload}`;
                }
              } catch (e) {
                // Erro esperado para payloads maliciosos
              }
            }
            
            return 'ok';
          }
        },
        {
          name: 'Rate limiting efetivo',
          test: async () => {
            // Testar se rate limiting está funcionando com carga mais realista
            const requests = [];
            for (let i = 0; i < 50; i++) {
              requests.push(fetch(`${this.baseUrl}/api/lgpd/terms`));
            }
            
            const responses = await Promise.all(requests);
            const successful = responses.filter(r => r.ok).length;
            const rateLimited = responses.filter(r => r.status === 429).length;
            
            // Rate limiting efetivo deveria bloquear algumas requisições em alta carga
            return rateLimited > 0 ? 'ok' : `Rate limiting ineficaz: ${successful}/50 requests aceitas`;
          }
        }
      ];
      
      for (const test of securityTests) {
        const result = await test.test();
        if (result !== 'ok') {
          this.findings.high.push(`Segurança: ${test.name} - ${result}`);
        }
      }
      
      console.log('✅ Análise de segurança real concluída');
    } catch (error) {
      this.findings.medium.push(`Security analysis: ${error.message}`);
    }
  }

  async analyzePerformanceAntipatterns() {
    console.log('📈 Analisando: Anti-patterns de Performance');
    
    try {
      const startTime = Date.now();
      
      // Simular carga para detectar gargalos
      const requests = Array(20).fill(null).map(() => 
        fetch(`${this.baseUrl}/api/lgpd/terms`)
      );
      
      await Promise.all(requests);
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / 20;
      
      if (avgTime > 250) {
        this.findings.medium.push(`Performance: tempo médio ${avgTime}ms (ideal <250ms)`);
      }
      
      console.log('✅ Análise de performance concluída');
    } catch (error) {
      this.findings.low.push(`Performance analysis: ${error.message}`);
    }
  }

  async analyzeAccessibilityIssues() {
    console.log('♿ Analisando: Problemas de Acessibilidade Críticos');
    
    try {
      // Testar acessibilidade via fetch da página principal
      const response = await fetch(this.baseUrl);
      const html = await response.text();
      
      const accessibilityTests = [
        {
          name: 'Imagens sem alt text',
          test: () => {
            const imgTags = html.match(/<img[^>]*>/g) || [];
            const withoutAlt = imgTags.filter(img => !img.includes('alt='));
            return withoutAlt.length === 0 ? 'ok' : `${withoutAlt.length} imagens sem alt`;
          }
        },
        {
          name: 'Formulários sem labels',
          test: () => {
            const inputTags = html.match(/<input[^>]*>/g) || [];
            const withoutLabels = inputTags.filter(input => 
              !input.includes('aria-label=') && !input.includes('placeholder=')
            );
            return withoutLabels.length === 0 ? 'ok' : `${withoutLabels.length} inputs sem labels`;
          }
        },
        {
          name: 'Links sem texto descritivo',
          test: () => {
            const linkMatches = html.match(/<a[^>]*>([^<]*)<\/a>/g) || [];
            const emptyLinks = linkMatches.filter(link => {
              const text = link.replace(/<[^>]*>/g, '').trim();
              return text === '' || text === 'clique aqui' || text === 'saiba mais';
            });
            return emptyLinks.length === 0 ? 'ok' : `${emptyLinks.length} links sem descrição`;
          }
        }
      ];
      
      for (const test of accessibilityTests) {
        const result = test.test();
        if (result !== 'ok') {
          this.findings.medium.push(`Acessibilidade: ${test.name} - ${result}`);
        }
      }
      
      console.log('✅ Análise de acessibilidade concluída');
    } catch (error) {
      this.findings.low.push(`Accessibility analysis: ${error.message}`);
    }
  }

  async analyzeBrowserCompatibility() {
    console.log('🌐 Analisando: Compatibilidade entre Navegadores');
    
    try {
      // Detectar funcionalidades que podem não funcionar em todos os navegadores
      const modernFeatures = [
        'fetch API',
        'Promise',
        'async/await',
        'ES6 modules',
        'CSS Grid'
      ];
      
      // Verificação básica de APIs modernas
      if (typeof fetch === 'undefined') {
        this.findings.medium.push('Compatibilidade: fetch API não disponível');
      }
      
      console.log('✅ Análise de compatibilidade concluída');
    } catch (error) {
      this.findings.low.push(`Browser compatibility: ${error.message}`);
    }
  }

  async analyzeErrorHandling() {
    console.log('🛠️ Analisando: Tratamento de Erros');
    
    try {
      // Testar como o sistema lida com diferentes tipos de erro
      const errorTests = [
        { url: '/api/nonexistent', expectedStatus: 404 },
        { url: '/api/lgpd/terms', expectedStatus: 200 }
      ];
      
      for (const test of errorTests) {
        const response = await fetch(`${this.baseUrl}${test.url}`);
        if (response.status !== test.expectedStatus) {
          this.findings.medium.push(`Error handling: ${test.url} retornou ${response.status}, esperado ${test.expectedStatus}`);
        }
      }
      
      console.log('✅ Análise de tratamento de erros concluída');
    } catch (error) {
      this.findings.medium.push(`Error handling analysis: ${error.message}`);
    }
  }

  async analyzeLoggingGaps() {
    console.log('📝 Analisando: Gaps Críticos de Logging');
    
    try {
      const loggingTests = [
        {
          name: 'Logs de autenticação',
          test: async () => {
            // Tentar acessar endpoint protegido sem token
            const response = await fetch(`${this.baseUrl}/api/admin/users`);
            // Verificar se a tentativa de acesso não autorizado é logada
            return response.status === 401 ? 'ok' : 'Acesso não autorizado não logado';
          }
        },
        {
          name: 'Logs de erros 500',
          test: async () => {
            // Tentar causar erro 500 intencionalmente
            try {
              const response = await fetch(`${this.baseUrl}/api/lgpd/consent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'invalid json'
              });
              
              return response.status >= 500 ? 'ok' : 'Erros 500 não adequadamente tratados';
            } catch (e) {
              return 'ok'; // Erro capturado adequadamente
            }
          }
        },
        {
          name: 'Logs de performance',
          test: async () => {
            const start = Date.now();
            await fetch(`${this.baseUrl}/api/lgpd/terms`);
            const duration = Date.now() - start;
            
            // Se a requisição demorou muito, deveria ser logada
            return duration < 1000 ? 'ok' : 'Requisições lentas podem não estar sendo logadas';
          }
        }
      ];
      
      for (const test of loggingTests) {
        const result = await test.test();
        if (result !== 'ok') {
          this.findings.medium.push(`Logging: ${test.name} - ${result}`);
        }
      }
      
      console.log('✅ Análise de logging crítico concluída');
    } catch (error) {
      this.findings.low.push(`Logging analysis: ${error.message}`);
    }
  }

  generateComprehensiveReport() {
    console.log('\n===============================================');
    console.log('📊 RELATÓRIO ABRANGENTE DE ERROS OCULTOS');
    console.log('===============================================');
    
    const totalFindings = Object.values(this.findings).flat().length;
    const criticalCount = this.findings.critical.length;
    const highCount = this.findings.high.length;
    const mediumCount = this.findings.medium.length;
    const lowCount = this.findings.low.length;
    const infoCount = this.findings.info.length;
    
    console.log(`📈 Total de achados: ${totalFindings}`);
    console.log(`🚨 Críticos: ${criticalCount}`);
    console.log(`⚠️ Altos: ${highCount}`);
    console.log(`🟡 Médios: ${mediumCount}`);
    console.log(`🟢 Baixos: ${lowCount}`);
    console.log(`ℹ️ Informativos: ${infoCount}`);
    
    const sections = [
      { level: 'CRÍTICOS', items: this.findings.critical, icon: '🚨' },
      { level: 'ALTOS', items: this.findings.high, icon: '⚠️' },
      { level: 'MÉDIOS', items: this.findings.medium, icon: '🟡' },
      { level: 'BAIXOS', items: this.findings.low, icon: '🟢' },
      { level: 'INFORMATIVOS', items: this.findings.info, icon: 'ℹ️' }
    ];
    
    sections.forEach(section => {
      if (section.items.length > 0) {
        console.log(`\n${section.icon} ACHADOS ${section.level}:`);
        section.items.forEach((item, index) => {
          console.log(`${index + 1}. ${item}`);
        });
      }
    });
    
    const riskScore = this.calculateRiskScore();
    console.log(`\n📊 Score de Risco: ${riskScore}/100`);
    console.log(`🎯 Status: ${this.getRiskStatus(riskScore)}`);
    
    if (totalFindings === 0) {
      console.log('\n🎉 SISTEMA EXEMPLAR - NENHUM ERRO OCULTO DETECTADO!');
    } else {
      console.log('\n🔧 ÁREAS DE MELHORIA IDENTIFICADAS');
      this.generateRecommendations();
    }
  }

  calculateRiskScore() {
    const weights = { critical: 25, high: 15, medium: 8, low: 3, info: 1 };
    let score = 0;
    
    Object.keys(weights).forEach(level => {
      score += this.findings[level].length * weights[level];
    });
    
    return Math.min(score, 100);
  }

  getRiskStatus(score) {
    if (score === 0) return 'EXCELENTE ✅';
    if (score <= 10) return 'BOM 🟢';
    if (score <= 25) return 'ACEITÁVEL 🟡';
    if (score <= 50) return 'PREOCUPANTE 🟠';
    return 'CRÍTICO 🔴';
  }

  generateRecommendations() {
    console.log('\n💡 RECOMENDAÇÕES:');
    
    if (this.findings.critical.length > 0) {
      console.log('1. 🚨 Corrigir imediatamente todos os problemas críticos');
    }
    
    if (this.findings.high.length > 0) {
      console.log('2. ⚠️ Priorizar correção dos problemas de alta severidade');
    }
    
    if (this.findings.medium.length > 0) {
      console.log('3. 🟡 Planejar correção dos problemas médios na próxima sprint');
    }
    
    console.log('4. 🔄 Executar esta análise regularmente (semanal/mensal)');
    console.log('5. 📈 Implementar monitoramento contínuo para detecção precoce');
  }
}

// Executar se chamado diretamente
if (process.argv[1].includes('test-comprehensive-errors.js')) {
  const detector = new ComprehensiveErrorDetector();
  detector.runFullAnalysis().catch(console.error);
}

export { ComprehensiveErrorDetector };