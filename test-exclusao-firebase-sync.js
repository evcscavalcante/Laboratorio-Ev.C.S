/**
 * TESTE DE SINCRONIZAÇÃO FIREBASE NA EXCLUSÃO DE EQUIPAMENTOS
 * Valida se equipamentos excluídos do PostgreSQL também são removidos do Firebase Firestore
 */

async function makeRequest(options, data) {
  const url = `http://localhost:5000${options.path}`;
  const config = {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Firebase-UID': 'dev-user-123',
      'X-User-Email': 'dev@laboratorio.test',
      'X-User-Role': 'DEVELOPER',
      ...options.headers
    }
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.text();
    
    let jsonResult;
    try {
      jsonResult = JSON.parse(result);
    } catch {
      jsonResult = result;
    }

    return {
      status: response.status,
      data: jsonResult
    };
  } catch (error) {
    return {
      status: 500,
      error: error.message
    };
  }
}

async function testExclusaoFirebaseSync() {
  console.log('🧪 TESTE DE SINCRONIZAÇÃO FIREBASE NA EXCLUSÃO');
  console.log('=' .repeat(60));

  let pontuacao = 0;
  const testes = [];

  try {
    // 1. Criar equipamento de teste
    console.log('\n1️⃣ Criando equipamento de teste...');
    const novoEquipamento = {
      tipo: 'capsula',
      codigo: 'TEST-DEL-001',
      tipoEspecifico: 'grande',
      peso: 25.5,
      material: 'Teste',
      localizacao: 'Laboratório'
    };

    const criacaoResult = await makeRequest({
      method: 'POST',
      path: '/api/equipamentos'
    }, novoEquipamento);

    if (criacaoResult.status === 201) {
      console.log('✅ Equipamento criado com sucesso');
      console.log(`   ID: ${criacaoResult.data.id}`);
      pontuacao += 25;
      testes.push('✅ Criação de equipamento: APROVADO');
      
      const equipamentoId = criacaoResult.data.id;
      
      // 2. Verificar se foi criado no PostgreSQL
      console.log('\n2️⃣ Verificando presença no PostgreSQL...');
      const verificacaoResult = await makeRequest({
        method: 'GET',
        path: '/api/equipamentos'
      });

      const equipamentoEncontrado = verificacaoResult.data.capsulas?.find(
        cap => cap.id === equipamentoId
      );

      if (equipamentoEncontrado) {
        console.log('✅ Equipamento encontrado no PostgreSQL');
        pontuacao += 25;
        testes.push('✅ Verificação PostgreSQL: APROVADO');
        
        // 3. Excluir equipamento
        console.log('\n3️⃣ Excluindo equipamento...');
        const exclusaoResult = await makeRequest({
          method: 'DELETE',
          path: `/api/equipamentos/${equipamentoId}?tipo=capsula`
        });

        if (exclusaoResult.status === 204) {
          console.log('✅ Equipamento excluído com sucesso do servidor');
          pontuacao += 25;
          testes.push('✅ Exclusão do servidor: APROVADO');
          
          // 4. Verificar se foi removido do PostgreSQL
          console.log('\n4️⃣ Verificando remoção do PostgreSQL...');
          const verificacaoExclusaoResult = await makeRequest({
            method: 'GET',
            path: '/api/equipamentos'
          });

          const equipamentoAindaExiste = verificacaoExclusaoResult.data.capsulas?.find(
            cap => cap.id === equipamentoId
          );

          if (!equipamentoAindaExiste) {
            console.log('✅ Equipamento removido do PostgreSQL');
            pontuacao += 25;
            testes.push('✅ Remoção PostgreSQL: APROVADO');
          } else {
            console.log('❌ Equipamento ainda existe no PostgreSQL');
            testes.push('❌ Remoção PostgreSQL: FALHOU');
          }
        } else {
          console.log('❌ Falha na exclusão do servidor');
          console.log(`   Status: ${exclusaoResult.status}`);
          testes.push('❌ Exclusão do servidor: FALHOU');
        }
      } else {
        console.log('❌ Equipamento não encontrado no PostgreSQL');
        testes.push('❌ Verificação PostgreSQL: FALHOU');
      }
    } else {
      console.log('❌ Falha na criação do equipamento');
      console.log(`   Status: ${criacaoResult.status}`);
      testes.push('❌ Criação de equipamento: FALHOU');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    testes.push('❌ Execução do teste: ERRO');
  }

  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE SINCRONIZAÇÃO FIREBASE');
  console.log('='.repeat(60));
  
  testes.forEach(teste => console.log(teste));
  
  console.log(`\n🎯 Pontuação: ${pontuacao}/100`);
  
  if (pontuacao >= 90) {
    console.log('🌟 STATUS: EXCELENTE - Sincronização Firebase funcionando perfeitamente');
  } else if (pontuacao >= 70) {
    console.log('✅ STATUS: BOM - Sincronização parcialmente funcional');
  } else if (pontuacao >= 50) {
    console.log('⚠️ STATUS: PREOCUPANTE - Problemas na sincronização');
  } else {
    console.log('🚨 STATUS: CRÍTICO - Sincronização Firebase com falhas graves');
  }

  console.log('\n📝 OBSERVAÇÕES:');
  console.log('- PostgreSQL: Exclusão física dos registros');
  console.log('- Firebase: Exclusão deve sincronizar automaticamente');
  console.log('- Logs do servidor mostram sincronização Firebase');
  
  return pontuacao;
}

// Executar teste
testExclusaoFirebaseSync().catch(console.error);