/**
 * VALIDAÇÃO COMPLETA DE ENDPOINTS
 * Sistema integrado de verificação de segurança para todos os endpoints
 */

import TestadorEndpointsCompleto from './test-todos-endpoints-completo.js';
import MonitorNovosEndpoints from './monitor-novos-endpoints.js';

class ValidacaoCompletaEndpoints {
  constructor() {
    this.testador = new TestadorEndpointsCompleto();
    this.monitor = new MonitorNovosEndpoints();
  }

  async executarValidacaoCompleta() {
    console.log('\n🛡️  VALIDAÇÃO COMPLETA DE SEGURANÇA DE ENDPOINTS');
    console.log('===============================================');
    
    const startTime = Date.now();
    let allTestsPassed = true;

    // Fase 1: Detectar novos endpoints
    console.log('\n📡 FASE 1: Detectando novos endpoints...');
    const newEndpoints = this.monitor.findNewEndpoints();
    
    if (newEndpoints.length > 0) {
      console.log(`🆕 ${newEndpoints.length} novos endpoints detectados`);
      const newEndpointsResult = await this.monitor.monitorar();
      if (!newEndpointsResult) {
        allTestsPassed = false;
        console.log('❌ Novos endpoints falharam na validação');
      }
    } else {
      console.log('✅ Nenhum novo endpoint detectado');
    }

    // Fase 2: Teste abrangente de todos os endpoints
    console.log('\n🔍 FASE 2: Teste abrangente de segurança...');
    const testResult = await this.executarTestesAbrangentes();
    if (!testResult) {
      allTestsPassed = false;
      console.log('❌ Teste abrangente falhou');
    }

    // Fase 3: Relatório final
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n📋 RELATÓRIO FINAL DA VALIDAÇÃO');
    console.log('==============================');
    console.log(`⏱️  Duração total: ${duration}s`);
    
    if (allTestsPassed) {
      console.log('✅ SISTEMA 100% SEGURO - APROVADO PARA PRODUÇÃO');
      console.log('   Todos os endpoints passaram na validação de segurança');
      return true;
    } else {
      console.log('❌ PROBLEMAS DE SEGURANÇA DETECTADOS');
      console.log('   Sistema NÃO está pronto para produção');
      return false;
    }
  }

  async executarTestesAbrangentes() {
    return new Promise((resolve) => {
      const originalExit = process.exit;
      const originalLog = console.log;
      let testOutput = '';
      
      // Capturar saída dos testes
      console.log = (...args) => {
        testOutput += args.join(' ') + '\n';
        originalLog(...args);
      };

      process.exit = (code) => {
        // Restaurar funções originais
        process.exit = originalExit;
        console.log = originalLog;
        
        resolve(code === 0);
      };

      // Executar testes
      this.testador.executarTestes()
        .then(result => {
          process.exit = originalExit;
          console.log = originalLog;
          resolve(result);
        })
        .catch(error => {
          process.exit = originalExit;
          console.log = originalLog;
          console.error('Erro nos testes:', error);
          resolve(false);
        });
    });
  }

  // Modo de monitoramento contínuo
  async monitoramentoContinuo(intervalMinutos = 5) {
    console.log(`🔄 Iniciando monitoramento contínuo (intervalo: ${intervalMinutos} minutos)`);
    
    setInterval(async () => {
      console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Executando verificação automática...`);
      
      const newEndpoints = this.monitor.findNewEndpoints();
      if (newEndpoints.length > 0) {
        console.log(`🚨 ALERTA: ${newEndpoints.length} novos endpoints detectados!`);
        await this.monitor.monitorar();
      } else {
        console.log('✅ Nenhuma alteração detectada');
      }
    }, intervalMinutos * 60 * 1000);
  }

  // Validação rápida (apenas novos endpoints)
  async validacaoRapida() {
    console.log('\n⚡ VALIDAÇÃO RÁPIDA DE ENDPOINTS');
    console.log('==============================');
    
    const newEndpoints = this.monitor.findNewEndpoints();
    
    if (newEndpoints.length === 0) {
      console.log('✅ Nenhum novo endpoint - sistema já validado');
      return true;
    }

    console.log(`🔍 Validando ${newEndpoints.length} novos endpoints...`);
    return await this.monitor.monitorar();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const validador = new ValidacaoCompletaEndpoints();
  const mode = process.argv[2] || 'complete';

  switch (mode) {
    case 'quick':
      validador.validacaoRapida()
        .then(result => process.exit(result ? 0 : 1))
        .catch(error => {
          console.error('❌ Erro na validação rápida:', error);
          process.exit(1);
        });
      break;

    case 'monitor':
      const interval = parseInt(process.argv[3]) || 5;
      validador.monitoramentoContinuo(interval)
        .catch(error => {
          console.error('❌ Erro no monitoramento:', error);
          process.exit(1);
        });
      break;

    case 'complete':
    default:
      validador.executarValidacaoCompleta()
        .then(result => process.exit(result ? 0 : 1))
        .catch(error => {
          console.error('❌ Erro na validação completa:', error);
          process.exit(1);
        });
      break;
  }
}

export default ValidacaoCompletaEndpoints;