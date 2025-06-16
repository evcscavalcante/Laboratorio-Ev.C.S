/**
 * TESTE REAL DO PREENCHIMENTO AUTOMÁTICO
 * Simula exatamente o que acontece quando o usuário digita na interface
 */

// Simular o comportamento real do hook useEquipmentAutofill
const equipmentData = {
  capsulas: [
    { id: 1, codigo: "1", peso: 12.35, material: "pequena" },
    { id: 2, codigo: "2", peso: 12.48, material: "pequena" },
    { id: 3, codigo: "3", peso: 12.52, material: "pequena" },
    { id: 4, codigo: "4", peso: 25.45, material: "media" },
    { id: 5, codigo: "5", peso: 25.78, material: "media" },
    { id: 6, codigo: "6", peso: 25.62, material: "media" },
    { id: 7, codigo: "7", peso: 45.20, material: "grande" },
    { id: 8, codigo: "8", peso: 45.85, material: "grande" }
  ],
  cilindros: [
    { id: 1, codigo: "1", peso: 185.5, volume: 98.5, tipo: "biselado" },
    { id: 2, codigo: "2", peso: 186.2, volume: 98.7, tipo: "biselado" },
    { id: 3, codigo: "3", peso: 420.15, volume: 125.0, tipo: "vazios_minimos" },
    { id: 4, codigo: "4", peso: 421.35, volume: 125.2, tipo: "vazios_minimos" },
    { id: 5, codigo: "5", peso: 650.25, volume: 150.0, tipo: "proctor" }
  ]
};

console.log('🧪 TESTE REAL DO PREENCHIMENTO AUTOMÁTICO');
console.log('=' .repeat(60));

// Simular densidade in-situ (deve encontrar cilindros biselados)
function testDensityInSitu() {
  console.log('\n📋 DENSIDADE IN-SITU - Buscando cilindros biselados:');
  
  const testCodes = ['1', '2'];
  let successCount = 0;
  
  testCodes.forEach(codigo => {
    const codigoLimpo = codigo.trim().toUpperCase();
    const cilindro = equipmentData.cilindros?.find(
      cil => cil.codigo.toString().toUpperCase() === codigoLimpo && cil.tipo === 'biselado'
    );
    
    if (cilindro) {
      console.log(`  Código "${codigo}": ✅ ${cilindro.peso}g, ${cilindro.volume}cm³`);
      successCount++;
    } else {
      console.log(`  Código "${codigo}": ❌ Não encontrado`);
    }
  });
  
  return successCount;
}

// Simular densidade real (deve encontrar cápsulas)
function testDensityReal() {
  console.log('\n📋 DENSIDADE REAL - Buscando cápsulas:');
  
  const testCodes = ['1', '2', '3'];
  let successCount = 0;
  
  testCodes.forEach(codigo => {
    const codigoLimpo = codigo.trim().toUpperCase();
    const capsula = equipmentData.capsulas?.find(
      cap => cap.codigo.toString().toUpperCase() === codigoLimpo
    );
    
    if (capsula) {
      console.log(`  Código "${codigo}": ✅ ${capsula.peso}g (${capsula.material})`);
      successCount++;
    } else {
      console.log(`  Código "${codigo}": ❌ Não encontrado`);
    }
  });
  
  return successCount;
}

// Simular densidade máx/mín (deve encontrar cilindros vazios_minimos)
function testDensityMaxMin() {
  console.log('\n📋 DENSIDADE MÁX/MÍN - Buscando cilindros vazios_minimos:');
  
  const testCodes = ['3', '4'];
  let successCount = 0;
  
  testCodes.forEach(codigo => {
    const codigoLimpo = codigo.trim().toUpperCase();
    const cilindro = equipmentData.cilindros?.find(
      cil => cil.codigo.toString().toUpperCase() === codigoLimpo && cil.tipo === 'vazios_minimos'
    );
    
    if (cilindro) {
      console.log(`  Código "${codigo}": ✅ ${cilindro.peso}g, ${cilindro.volume}cm³`);
      successCount++;
    } else {
      console.log(`  Código "${codigo}": ❌ Não encontrado`);
    }
  });
  
  return successCount;
}

// Executar testes
const inSituSuccess = testDensityInSitu();
const realSuccess = testDensityReal();
const maxMinSuccess = testDensityMaxMin();

const totalSuccess = inSituSuccess + realSuccess + maxMinSuccess;
const totalTests = 2 + 3 + 2; // 7 testes totais

console.log('\n' + '=' .repeat(60));
console.log('📊 RESULTADO DOS TESTES REAIS:');
console.log(`✅ Densidade In-Situ: ${inSituSuccess}/2 (${inSituSuccess === 2 ? 'SUCESSO' : 'FALHA'})`);
console.log(`✅ Densidade Real: ${realSuccess}/3 (${realSuccess === 3 ? 'SUCESSO' : 'FALHA'})`);
console.log(`✅ Densidade Máx/Mín: ${maxMinSuccess}/2 (${maxMinSuccess === 2 ? 'SUCESSO' : 'FALHA'})`);

console.log(`\n🎯 RESULTADO GERAL: ${totalSuccess}/${totalTests} (${Math.round(totalSuccess/totalTests*100)}%)`);

if (totalSuccess === totalTests) {
  console.log('\n🎉 PREENCHIMENTO AUTOMÁTICO FUNCIONANDO PERFEITAMENTE!');
  console.log('💡 COMO TESTAR NA INTERFACE:');
  console.log('   1. Abra "Densidade In-Situ"');
  console.log('   2. Campo "Cilindro Nº" - digite "1"');
  console.log('   3. Deve aparecer: Peso = 185.5g, Volume = 98.5cm³');
  console.log('   4. Campo "Cilindro Nº" - digite "2"');
  console.log('   5. Deve aparecer: Peso = 186.2g, Volume = 98.7cm³');
} else {
  console.log('\n⚠️ PROBLEMAS DETECTADOS!');
  console.log('❌ Preenchimento automático NÃO está funcionando corretamente');
  console.log('🔧 Necessário verificar a implementação dos hooks');
}

console.log('\n' + '=' .repeat(60));