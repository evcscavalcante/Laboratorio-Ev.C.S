/**
 * Teste Real da Sincronização Firebase
 * Simula criação de equipamento para validar se aparece no Firestore
 */

import fetch from 'node-fetch';

async function testFirebaseReal() {
  console.log('🔥 TESTE REAL DA SINCRONIZAÇÃO FIREBASE');
  console.log('='.repeat(50));

  try {
    // 1. Simular criação de equipamento
    console.log('\n🔧 TESTANDO CRIAÇÃO DE EQUIPAMENTO...');
    
    const novoEquipamento = {
      codigo: `TEST-${Date.now()}`,
      tipo: 'capsula',
      tipoEspecifico: 'pequena',
      descricao: 'Cápsula de teste Firebase',
      peso: 12.5,
      volume: null,
      material: 'Alumínio',
      fabricante: 'Teste Lab',
      localizacao: 'Bancada A1',
      status: 'ativo',
      observacoes: 'Equipamento criado para teste Firebase'
    };

    console.log('📦 Dados do equipamento:', JSON.stringify(novoEquipamento, null, 2));

    // 2. Fazer requisição para endpoint protegido (sem autenticação para testar)
    console.log('\n🌐 FAZENDO REQUISIÇÃO PARA SERVIDOR...');
    
    const response = await fetch('http://localhost:5000/api/equipamentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoEquipamento)
    });

    console.log(`📡 Status da resposta: ${response.status}`);
    
    if (response.status === 401) {
      console.log('🔐 Endpoint protegido (esperado em produção)');
      console.log('💡 Para testar Firebase real, você precisa:');
      console.log('   1. Fazer login no sistema');
      console.log('   2. Criar um equipamento pela interface');
      console.log('   3. Verificar no Console Firebase se apareceu');
    } else if (response.ok) {
      const result = await response.json();
      console.log('✅ Equipamento criado com sucesso:', result);
      console.log('🔥 Agora verifique o Firebase Console para ver se sincronizou');
    } else {
      console.log('❌ Erro na criação:', response.status);
      const error = await response.text();
      console.log('Detalhes:', error);
    }

    // 3. Instruções para teste manual
    console.log('\n📋 INSTRUÇÕES PARA TESTE REAL:');
    console.log('-'.repeat(40));
    console.log('1. Abra o sistema no navegador');
    console.log('2. Faça login com suas credenciais');
    console.log('3. Vá para "Equipamentos"');
    console.log('4. Clique em "Novo Equipamento"');
    console.log('5. Preencha os dados e salve');
    console.log('6. Verifique a mensagem de confirmação');
    console.log('7. Abra o Firebase Console');
    console.log('8. Vá para Firestore Database');
    console.log('9. Procure a collection "laboratory_data"');
    console.log('10. Confirme se o equipamento apareceu lá');

    console.log('\n🌐 LINKS ÚTEIS:');
    console.log('-'.repeat(40));
    console.log('• Sistema: http://localhost:5000');
    console.log('• Firebase Console: https://console.firebase.google.com');
    console.log('• Firestore Database: https://console.firebase.google.com/project/laboratorio-evcs/firestore');

    console.log('\n🔍 VERIFICANDO CONFIGURAÇÃO FIREBASE...');
    
    // Verificar se as variáveis de ambiente estão configuradas
    const hasApiKey = process.env.VITE_FIREBASE_API_KEY ? true : false;
    const hasProjectId = process.env.VITE_FIREBASE_PROJECT_ID ? true : false;
    const hasAppId = process.env.VITE_FIREBASE_APP_ID ? true : false;

    console.log(`📋 Variáveis Firebase configuradas:`);
    console.log(`   • API Key: ${hasApiKey ? '✅ Configurada' : '❌ Faltando'}`);
    console.log(`   • Project ID: ${hasProjectId ? '✅ Configurada' : '❌ Faltando'}`);
    console.log(`   • App ID: ${hasAppId ? '✅ Configurada' : '❌ Faltando'}`);

    if (!hasApiKey || !hasProjectId || !hasAppId) {
      console.log('\n⚠️ ATENÇÃO: Variáveis Firebase não configuradas completamente');
      console.log('   Isso pode explicar por que a sincronização não está funcionando');
      console.log('   Configure as variáveis no arquivo .env');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }

  console.log('\n✅ Teste concluído');
}

// Executar teste
testFirebaseReal()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });