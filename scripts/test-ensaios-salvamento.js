/**
 * Teste Automático de Salvamento de Ensaios
 * Valida funcionalidade de salvamento nos três tipos de ensaios
 */

class EnsaiosSavingTester {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      densidadeInSitu: { status: 'pending', message: '' },
      densidadeReal: { status: 'pending', message: '' },
      densidadeMaxMin: { status: 'pending', message: '' }
    };
  }

  async runTests() {
    console.log('🧪 Iniciando testes de salvamento de ensaios...\n');

    await this.testDensidadeInSituSaving();
    await this.testDensidadeRealSaving();
    await this.testDensidadeMaxMinSaving();

    this.generateReport();
  }

  async testDensidadeInSituSaving() {
    console.log('📊 Testando salvamento Densidade In-Situ...');
    
    try {
      const testData = {
        registrationNumber: 'TEST-IN-SITU-001',
        date: '2025-06-15',
        operador: 'Operador Teste',
        responsavelCalculo: 'Responsável Teste',
        verificador: 'Verificador Teste',
        norte: '123456',
        este: '654321',
        cota: '100.50',
        quadrante: 'NE',
        camada: 'Superficial',
        tempo: 'sol_forte',
        amostraReensaiada: false,
        balanca: 'Balança Digital 0.01g',
        estufa: 'Estufa 105°C',
        termometro: 'Termômetro Digital',
        cronometro: 'Cronômetro Digital',
        
        // Dados específicos do ensaio
        cilindroId: 'CIL-001',
        massaCilindroUmido: 2850.5,
        massaCilindroSeco: 2650.3,
        massaCilindro: 1250.0,
        volumeCilindro: 1000.0,
        
        // Umidade TOPO
        umidadeTopoCapsula1: 'CAP-T1',
        umidadeTopoUmida1: 45.2,
        umidadeTopoSeca1: 38.5,
        umidadeTopoTara1: 20.1,
        
        umidadeTopoCapsula2: 'CAP-T2',
        umidadeTopoUmida2: 44.8,
        umidadeTopoSeca2: 38.1,
        umidadeTopoTara2: 19.9,
        
        // Umidade BASE
        umidadeBaseCapsula1: 'CAP-B1',
        umidadeBaseUmida1: 43.5,
        umidadeBaseSeca1: 37.2,
        umidadeBaseTara1: 20.3,
        
        umidadeBaseCapsula2: 'CAP-B2',
        umidadeBaseUmida2: 44.1,
        umidadeBaseSeca2: 37.6,
        umidadeBaseTara2: 20.0
      };

      const response = await fetch(`${this.baseUrl}/api/tests/density-in-situ`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token-for-testing'
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        const result = await response.json();
        this.results.densidadeInSitu = {
          status: 'success',
          message: `✅ Salvamento aprovado - ID: ${result.id || 'N/A'}`
        };
      } else {
        const error = await response.text();
        this.results.densidadeInSitu = {
          status: 'error',
          message: `❌ Erro ${response.status}: ${error}`
        };
      }
    } catch (error) {
      this.results.densidadeInSitu = {
        status: 'error',
        message: `❌ Falha de conexão: ${error.message}`
      };
    }
  }

  async testDensidadeRealSaving() {
    console.log('🔬 Testando salvamento Densidade Real...');
    
    try {
      const testData = {
        operador: 'Operador Teste',
        responsavelCalculo: 'Responsável Teste',
        verificador: 'Verificador Teste',
        norte: '123456',
        este: '654321',
        cota: '100.50',
        quadrante: 'NE',
        camada: 'Superficial',
        tempo: 'sol_forte',
        amostraReensaiada: false,
        balanca: 'Balança Digital 0.01g',
        estufa: 'Estufa 105°C',
        termometro: 'Termômetro Digital',
        cronometro: 'Cronômetro Digital',
        
        // Dados específicos do ensaio
        picnometroId: 'PIC-001',
        massaPicnometro: 125.50,
        massaPicnometroSolo: 175.25,
        massaPicnometroSoloAgua: 675.80,
        massaPicnometroAgua: 625.30,
        temperatura: 23.5,
        
        // Segunda determinação
        picnometroId2: 'PIC-002',
        massaPicnometro2: 126.20,
        massaPicnometroSolo2: 176.15,
        massaPicnometroSoloAgua2: 676.45,
        massaPicnometroAgua2: 626.10,
        temperatura2: 23.8
      };

      const response = await fetch(`${this.baseUrl}/api/tests/densidade-real/temp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token-for-testing'
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        const result = await response.json();
        this.results.densidadeReal = {
          status: 'success',
          message: `✅ Salvamento aprovado - ID: ${result.id || 'N/A'}`
        };
      } else {
        const error = await response.text();
        this.results.densidadeReal = {
          status: 'error',
          message: `❌ Erro ${response.status}: ${error}`
        };
      }
    } catch (error) {
      this.results.densidadeReal = {
        status: 'error',
        message: `❌ Falha de conexão: ${error.message}`
      };
    }
  }

  async testDensidadeMaxMinSaving() {
    console.log('⚖️ Testando salvamento Densidade Máx/Mín...');
    
    try {
      const testData = {
        operador: 'Operador Teste',
        responsavelCalculo: 'Responsável Teste',
        verificador: 'Verificador Teste',
        norte: '123456',
        este: '654321',
        cota: '100.50',
        quadrante: 'NE',
        camada: 'Superficial',
        tempo: 'sol_forte',
        amostraReensaiada: false,
        balanca: 'Balança Digital 0.01g',
        estufa: 'Estufa 105°C',
        termometro: 'Termômetro Digital',
        cronometro: 'Cronômetro Digital',
        
        // Dados específicos do ensaio
        massaEspecificaReal: 2.68,
        
        // Densidade Máxima
        moldeMaxId: 'MOL-MAX-01',
        massaMoldeMax: 2150.5,
        massaMoldeSoloMax: 4350.8,
        volumeMoldeMax: 1000.0,
        
        // Segunda determinação máxima
        moldeMaxId2: 'MOL-MAX-02',
        massaMoldeMax2: 2148.2,
        massaMoldeSoloMax2: 4348.6,
        volumeMoldeMax2: 1000.0,
        
        // Densidade Mínima
        moldeMinId: 'MOL-MIN-01',
        massaMoldeMin: 1850.3,
        massaMoldeSoloMin: 3650.7,
        volumeMoldeMin: 1000.0,
        
        // Segunda determinação mínima
        moldeMinId2: 'MOL-MIN-02',
        massaMoldeMin2: 1852.1,
        massaMoldeSoloMin2: 3652.4,
        volumeMoldeMin2: 1000.0
      };

      const response = await fetch(`${this.baseUrl}/api/tests/densidade-max-min/temp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token-for-testing'
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        const result = await response.json();
        this.results.densidadeMaxMin = {
          status: 'success',
          message: `✅ Salvamento aprovado - ID: ${result.id || 'N/A'}`
        };
      } else {
        const error = await response.text();
        this.results.densidadeMaxMin = {
          status: 'error',
          message: `❌ Erro ${response.status}: ${error}`
        };
      }
    } catch (error) {
      this.results.densidadeMaxMin = {
        status: 'error',
        message: `❌ Falha de conexão: ${error.message}`
      };
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE TESTES DE SALVAMENTO DE ENSAIOS');
    console.log('='.repeat(60));

    const tests = [
      { name: 'Densidade In-Situ', result: this.results.densidadeInSitu },
      { name: 'Densidade Real', result: this.results.densidadeReal },
      { name: 'Densidade Máx/Mín', result: this.results.densidadeMaxMin }
    ];

    let successCount = 0;
    tests.forEach(test => {
      console.log(`\n${test.name}:`);
      console.log(`  ${test.result.message}`);
      if (test.result.status === 'success') successCount++;
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`RESUMO: ${successCount}/${tests.length} testes aprovados`);
    
    if (successCount === tests.length) {
      console.log('🎉 TODOS OS TESTES DE SALVAMENTO APROVADOS');
      console.log('✅ Sistema pronto para implementações futuras');
    } else {
      console.log('⚠️ ALGUNS TESTES FALHARAM');
      console.log('❌ Corrigir problemas antes de novas implementações');
    }
    
    console.log('='.repeat(60));

    // Exit code para CI/CD
    process.exit(successCount === tests.length ? 0 : 1);
  }
}

// Executar testes
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new EnsaiosSavingTester();
  tester.runTests().catch(console.error);
}

export default EnsaiosSavingTester;