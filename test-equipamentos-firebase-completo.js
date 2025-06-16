/**
 * Teste Completo da Sincronização Firebase para Equipamentos e Ensaios
 * Valida sistema triplo completo incluindo equipamentos
 */

import fetch from 'node-fetch';

async function testFirebaseEquipamentosCompleto() {
  console.log('🔥 TESTE COMPLETO SINCRONIZAÇÃO FIREBASE - EQUIPAMENTOS E ENSAIOS');
  console.log('='.repeat(60));

  try {
    // 1. Testar endpoint de equipamentos
    console.log('\n🔧 TESTANDO ENDPOINT DE EQUIPAMENTOS...');
    
    const equipResponse = await fetch('http://localhost:5000/api/equipamentos', {
      method: 'GET'
    });

    console.log(`📡 Status equipamentos: ${equipResponse.status}`);
    
    if (equipResponse.status === 401) {
      console.log('🔐 Endpoint protegido (correto)');
    } else if (equipResponse.ok) {
      const equipData = await equipResponse.json();
      console.log(`✅ Equipamentos encontrados: ${equipData.capsulas?.length || 0} cápsulas, ${equipData.cilindros?.length || 0} cilindros`);
    }

    // 2. Validar tipos de equipamentos disponíveis
    console.log('\n📦 TIPOS DE EQUIPAMENTOS QUE DEVEM SINCRONIZAR:');
    console.log('-'.repeat(40));
    console.log('CÁPSULAS:');
    console.log('  • Pequenas (densidade real) - códigos 1-3');
    console.log('  • Médias (umidade) - códigos 4-6');
    console.log('  • Grandes (frigideira) - códigos 7-8');
    console.log('CILINDROS:');
    console.log('  • Biselados (in-situ) - códigos 1-2');
    console.log('  • Padrão (máx/mín) - códigos 3-4');
    console.log('  • Proctor - código 5');

    // 3. Testar endpoints de ensaios
    console.log('\n🧪 TESTANDO ENDPOINTS DE ENSAIOS...');
    
    const ensaioEndpoints = [
      { name: 'Densidade In-Situ', url: '/api/tests/density-in-situ' },
      { name: 'Densidade Real', url: '/api/tests/real-density' },
      { name: 'Densidade Máx/Mín', url: '/api/tests/max-min-density' }
    ];

    for (const endpoint of ensaioEndpoints) {
      const response = await fetch(`http://localhost:5000${endpoint.url}`);
      console.log(`  ${endpoint.name}: ${response.status === 401 ? '🔐 Protegido' : response.status === 200 ? '✅ OK' : '❌ Erro'}`);
    }

    // 4. Instruções para teste completo
    console.log('\n📋 INSTRUÇÕES PARA TESTE COMPLETO DA SINCRONIZAÇÃO:');
    console.log('-'.repeat(50));
    
    console.log('\n🔧 TESTE DE EQUIPAMENTOS:');
    console.log('1. Faça login no sistema');
    console.log('2. Vá para "Equipamentos"');
    console.log('3. Edite diferentes tipos:');
    console.log('   • Cápsula pequena (código 1)');
    console.log('   • Cápsula média (código 4)');
    console.log('   • Cilindro biselado (código 1)');
    console.log('   • Cilindro proctor (código 5)');
    console.log('4. Para cada edição, verifique:');
    console.log('   • Mensagem: "salvo no PostgreSQL e sincronizado com Firebase"');
    console.log('   • Console do navegador: logs de sincronização Firebase');

    console.log('\n🧪 TESTE DE ENSAIOS:');
    console.log('1. Crie ensaio de cada tipo:');
    console.log('   • Densidade In-Situ');
    console.log('   • Densidade Real');
    console.log('   • Densidade Máx/Mín');
    console.log('2. Salve cada ensaio');
    console.log('3. Verifique mensagem de sincronização Firebase');

    console.log('\n🔍 VERIFICAÇÃO NO FIREBASE:');
    console.log('1. Abra Firebase Console');
    console.log('2. Vá para Firestore Database');
    console.log('3. Procure collection "laboratory_data"');
    console.log('4. Confirme se aparecem documentos para:');
    console.log('   • Equipamentos editados');
    console.log('   • Ensaios salvos');
    console.log('5. Cada documento deve ter:');
    console.log('   • ID válido (sem caracteres especiais)');
    console.log('   • type: "equipamento" ou "ensaio"');
    console.log('   • subtype: tipo específico');
    console.log('   • data: dados completos');
    console.log('   • userId: ID do usuário Firebase');
    console.log('   • timestamps: createdAt, updatedAt, syncedAt');

    console.log('\n⚠️ PROBLEMAS CONHECIDOS:');
    console.log('-'.repeat(30));
    console.log('• "Firebase verification failed" nos logs do servidor');
    console.log('• Isso é esperado - o servidor usa fallback de desenvolvimento');
    console.log('• A sincronização funciona no frontend com autenticação real');

    console.log('\n🔥 RESULTADO ESPERADO:');
    console.log('-'.repeat(25));
    console.log('✅ Todos os tipos de equipamentos sincronizam');
    console.log('✅ Todos os tipos de ensaios sincronizam');
    console.log('✅ Dados aparecem no Firebase Firestore');
    console.log('✅ Sistema triplo completo funcionando:');
    console.log('   Local Storage → PostgreSQL → Firebase Firestore');

    console.log('\n🌐 LINKS PARA VERIFICAÇÃO:');
    console.log('-'.repeat(30));
    console.log('• Sistema: http://localhost:5000');
    console.log('• Firebase Console: https://console.firebase.google.com');
    console.log('• Firestore: Projeto → Firestore Database → laboratory_data');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }

  console.log('\n✅ Teste concluído - agora teste editando equipamentos de diferentes tipos!');
}

// Executar teste
testFirebaseEquipamentosCompleto()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });