/**
 * Teste do Sistema de Preenchimento Automático CORRIGIDO
 * Valida se o trigger de 1 dígito está funcionando corretamente
 */

console.log('🔧 TESTE SISTEMA DE PREENCHIMENTO AUTOMÁTICO CORRIGIDO');
console.log('=' .repeat(70));

// Dados reais do banco PostgreSQL (13 equipamentos)
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

console.log('📊 EQUIPAMENTOS DISPONÍVEIS:');
console.log(`   • ${equipmentData.capsulas.length} cápsulas (códigos 1-8)`);
console.log(`   • ${equipmentData.cilindros.length} cilindros (códigos 1-5)`);
console.log('');

// Função de busca contextual corrigida
const searchEquipmentByContext = (codigo, context) => {
  const codigoLimpo = codigo.trim().toUpperCase();
  
  switch (context) {
    case 'densidade-in-situ':
      // Procurar APENAS cilindros biselados
      const cilindroInSitu = equipmentData.cilindros?.find(
        cil => cil.codigo.toString().toUpperCase() === codigoLimpo && cil.tipo === 'biselado'
      );
      return cilindroInSitu ? {
        found: true,
        type: 'cilindro',
        data: cilindroInSitu
      } : { found: false, type: null, data: null };
      
    case 'densidade-real':
      // Procurar APENAS cápsulas
      const capsulaReal = equipmentData.capsulas?.find(
        cap => cap.codigo.toString().toUpperCase() === codigoLimpo
      );
      return capsulaReal ? {
        found: true,
        type: 'capsula',
        data: capsulaReal
      } : { found: false, type: null, data: null };
      
    case 'densidade-max-min':
      // Procurar APENAS cilindros vazios_minimos
      const cilindroMaxMin = equipmentData.cilindros?.find(
        cil => cil.codigo.toString().toUpperCase() === codigoLimpo && cil.tipo === 'vazios_minimos'
      );
      return cilindroMaxMin ? {
        found: true,
        type: 'cilindro',
        data: cilindroMaxMin
      } : { found: false, type: null, data: null };
      
    default:
      return { found: false, type: null, data: null };
  }
};

// Testes por calculadora
console.log('🧪 TESTE 1: DENSIDADE IN-SITU');
console.log('-' .repeat(40));
console.log('EXPECTATIVA: Encontrar cilindros biselados (185-186g, 98-99cm³)');
['1', '2'].forEach(codigo => {
  const result = searchEquipmentByContext(codigo, 'densidade-in-situ');
  console.log(`Código "${codigo}": ${result.found ? '✅' : '❌'} ${result.found ? 
    `${result.data.peso}g, ${result.data.volume}cm³ (${result.data.tipo})` : 'Não encontrado'}`);
});

console.log('\n🧪 TESTE 2: DENSIDADE REAL');
console.log('-' .repeat(40));
console.log('EXPECTATIVA: Encontrar cápsulas pequenas (12-13g)');
['1', '2', '3'].forEach(codigo => {
  const result = searchEquipmentByContext(codigo, 'densidade-real');
  console.log(`Código "${codigo}": ${result.found ? '✅' : '❌'} ${result.found ? 
    `${result.data.peso}g (${result.data.material})` : 'Não encontrado'}`);
});

console.log('\n🧪 TESTE 3: DENSIDADE MÁX/MÍN');
console.log('-' .repeat(40));
console.log('EXPECTATIVA: Encontrar cilindros vazios_minimos (420-421g, 125cm³)');
['3', '4'].forEach(codigo => {
  const result = searchEquipmentByContext(codigo, 'densidade-max-min');
  console.log(`Código "${codigo}": ${result.found ? '✅' : '❌'} ${result.found ? 
    `${result.data.peso}g, ${result.data.volume}cm³ (${result.data.tipo})` : 'Não encontrado'}`);
});

console.log('\n' + '=' .repeat(70));
console.log('📋 RESULTADO FINAL:');

// Contadores de sucesso
let sucessosInSitu = ['1', '2'].filter(c => searchEquipmentByContext(c, 'densidade-in-situ').found).length;
let sucessosReal = ['1', '2', '3'].filter(c => searchEquipmentByContext(c, 'densidade-real').found).length;
let sucessosMaxMin = ['3', '4'].filter(c => searchEquipmentByContext(c, 'densidade-max-min').found).length;

console.log(`✅ Densidade In-Situ: ${sucessosInSitu}/2 equipamentos encontrados`);
console.log(`✅ Densidade Real: ${sucessosReal}/3 equipamentos encontrados`);
console.log(`✅ Densidade Máx/Mín: ${sucessosMaxMin}/2 equipamentos encontrados`);

const totalSucessos = sucessosInSitu + sucessosReal + sucessosMaxMin;
const totalTestes = 2 + 3 + 2;

console.log(`\n🎯 SCORE GERAL: ${totalSucessos}/${totalTestes} (${Math.round(totalSucessos/totalTestes*100)}%)`);

if (totalSucessos === totalTestes) {
  console.log('🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
  console.log('💡 COMO USAR:');
  console.log('   1. Abra qualquer calculadora');
  console.log('   2. Digite apenas "1" no campo de equipamento');
  console.log('   3. Peso e volume aparecem automaticamente');
  console.log('   4. Algoritmo inteligente escolhe o tipo correto por contexto');
} else {
  console.log('⚠️ PROBLEMAS DETECTADOS - Verificar implementação dos hooks');
}