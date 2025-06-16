/**
 * PRE-COMMIT HOOK PARA VERIFICAÇÃO DE ENDPOINTS
 * Executa automaticamente antes de commits para detectar novos endpoints
 */

import MonitorNovosEndpoints from './monitor-novos-endpoints.js';
import TestadorEndpointsCompleto from './test-todos-endpoints-completo.js';

class PreCommitEndpointCheck {
  constructor() {
    this.monitor = new MonitorNovosEndpoints();
    this.testador = new TestadorEndpointsCompleto();
  }

  async executarVerificacao() {
    console.log('\n🔐 PRE-COMMIT: Verificação de Segurança de Endpoints');
    console.log('==================================================');
    
    let hasErrors = false;

    // 1. Verificar novos endpoints
    console.log('🔍 Verificando novos endpoints...');
    const newEndpointsOk = await this.monitor.monitorar();
    
    if (!newEndpointsOk) {
      console.log('❌ Novos endpoints com problemas de segurança detectados');
      hasErrors = true;
    }

    // 2. Executar teste completo se há novos endpoints
    const newEndpoints = this.monitor.findNewEndpoints();
    if (newEndpoints.length > 0) {
      console.log('\n🧪 Executando teste completo de segurança...');
      const testResult = await this.executarTestesCompletos();
      
      if (!testResult) {
        console.log('❌ Teste completo de segurança falhou');
        hasErrors = true;
      }
    }

    // 3. Resultado final
    if (hasErrors) {
      console.log('\n🚫 COMMIT BLOQUEADO - Problemas de segurança detectados');
      console.log('   Corrija os problemas antes de fazer commit');
      return false;
    } else {
      console.log('\n✅ COMMIT APROVADO - Todos os endpoints são seguros');
      return true;
    }
  }

  async executarTestesCompletos() {
    try {
      return new Promise((resolve) => {
        const originalExit = process.exit;
        process.exit = (code) => {
          process.exit = originalExit;
          resolve(code === 0);
        };

        this.testador.executarTestes();
      });
    } catch (error) {
      console.error('Erro nos testes:', error);
      return false;
    }
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new PreCommitEndpointCheck();
  checker.executarVerificacao()
    .then(result => {
      process.exit(result ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro na verificação pre-commit:', error);
      process.exit(1);
    });
}

export default PreCommitEndpointCheck;