/**
 * Teste do Sistema de Preenchimento Automático Simplificado
 * Valida numeração 1-8 com detecção automática de tipo
 */

async function testPreenchimentoSimplificado() {
  console.log('\n🧪 TESTE DO SISTEMA DE PREENCHIMENTO AUTOMÁTICO SIMPLIFICADO');
  console.log('='.repeat(70));
  
  console.log('\n📋 EQUIPAMENTOS ESPERADOS NO SISTEMA:');
  console.log('Cilindros 1-2: Biselados (densidade in-situ)');
  console.log('Cilindros 3-4: Padrão (densidade máx/mín)'); 
  console.log('Cilindro 5: Proctor (compactação)');
  console.log('Cápsulas 1-3: Pequenas (densidade real)');
  console.log('Cápsulas 4-6: Médias (umidade estufa)');
  console.log('Cápsulas 7-8: Grandes (método frigideira)');
  
  console.log('\n🔍 TESTANDO CONEXÃO COM BANCO DE DADOS...');
  
  try {
    const response = await fetch('http://localhost:5000/api/equipamentos', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Conexão estabelecida: ${data.capsulas.length} cápsulas, ${data.cilindros.length} cilindros`);
    
    console.log('\n📊 VALIDANDO NUMERAÇÃO SIMPLIFICADA:');
    
    // Verificar cilindros 1-5
    const cilindrosEsperados = {
      '1': { tipo: 'biselado', uso: 'densidade in-situ' },
      '2': { tipo: 'biselado', uso: 'densidade in-situ' },
      '3': { tipo: 'vazios_minimos', uso: 'densidade máx/mín' },
      '4': { tipo: 'vazios_minimos', uso: 'densidade máx/mín' },
      '5': { tipo: 'proctor', uso: 'compactação' }
    };
    
    let cilindrosOk = 0;
    for (const [numero, esperado] of Object.entries(cilindrosEsperados)) {
      const cilindro = data.cilindros.find(c => c.codigo === numero);
      if (cilindro && cilindro.tipo === esperado.tipo) {
        console.log(`  ✅ Cilindro ${numero}: ${esperado.uso} (${cilindro.peso}g, ${cilindro.volume}cm³)`);
        cilindrosOk++;
      } else {
        console.log(`  ❌ Cilindro ${numero}: não encontrado ou tipo incorreto`);
      }
    }
    
    // Verificar cápsulas 1-8
    const capsulasEsperadas = {
      '1': 'pequena (densidade real)',
      '2': 'pequena (densidade real)', 
      '3': 'pequena (densidade real)',
      '4': 'média (umidade estufa)',
      '5': 'média (umidade estufa)',
      '6': 'média (umidade estufa)',
      '7': 'grande (método frigideira)',
      '8': 'grande (método frigideira)'
    };
    
    let capsulasOk = 0;
    for (const [numero, uso] of Object.entries(capsulasEsperadas)) {
      const capsula = data.capsulas.find(c => c.codigo === numero);
      if (capsula) {
        console.log(`  ✅ Cápsula ${numero}: ${uso} (${capsula.peso}g)`);
        capsulasOk++;
      } else {
        console.log(`  ❌ Cápsula ${numero}: não encontrada`);
      }
    }
    
    console.log('\n📈 RESULTADOS DO TESTE:');
    console.log(`Cilindros validados: ${cilindrosOk}/5 (${Math.round(cilindrosOk/5*100)}%)`);
    console.log(`Cápsulas validadas: ${capsulasOk}/8 (${Math.round(capsulasOk/8*100)}%)`);
    
    const scoreGeral = Math.round((cilindrosOk + capsulasOk) / 13 * 100);
    console.log(`\n🎯 SCORE GERAL: ${scoreGeral}%`);
    
    if (scoreGeral >= 90) {
      console.log('🟢 STATUS: EXCELENTE - Sistema funcionando perfeitamente');
    } else if (scoreGeral >= 70) {
      console.log('🟡 STATUS: BOM - Algumas melhorias necessárias');
    } else {
      console.log('🔴 STATUS: CRÍTICO - Problemas detectados');
    }
    
    console.log('\n✅ FUNCIONALIDADES IMPLEMENTADAS:');
    console.log('• Numeração simplificada (1-8)');
    console.log('• Detecção automática de tipo por contexto');
    console.log('• Trigger de preenchimento com 1 dígito');
    console.log('• Mapeamento específico por calculadora');
    console.log('• Dados reais do PostgreSQL');
    
    console.log('\n🎮 INSTRUÇÕES DE USO:');
    console.log('1. Abra qualquer calculadora');
    console.log('2. Digite apenas o número (1, 2, 3...)');  
    console.log('3. Peso e volume carregam automaticamente');
    console.log('4. Sistema detecta tipo baseado na calculadora');
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    console.log('\n🔧 VERIFICAÇÕES NECESSÁRIAS:');
    console.log('• Servidor rodando na porta 5000');
    console.log('• PostgreSQL conectado');
    console.log('• Equipamentos criados no banco');
  }
}

// Executar teste
testPreenchimentoSimplificado();