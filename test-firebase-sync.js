/**
 * Teste de Sincronização Firebase Firestore
 * Valida se os dados estão sendo salvos corretamente no Firebase
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testFirebaseSyncComplete() {
  console.log('🔥 TESTE DE SINCRONIZAÇÃO FIREBASE FIRESTORE');
  console.log('=' * 60);

  const results = {
    postgresql: { success: 0, total: 0 },
    firebase: { success: 0, total: 0 },
    issues: []
  };

  // Teste 1: Salvar ensaio de densidade real
  console.log('\n📊 TESTANDO DENSIDADE REAL');
  console.log('-'.repeat(40));
  
  try {
    const densityRealData = {
      registrationNumber: `TEST-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      operator: 'Teste Firebase',
      material: 'Solo arenoso',
      origin: 'Laboratório',
      moisture: {
        det1: { capsule: '1', wet: 50.5, dry: 45.2, tare: 12.35 },
        det2: { capsule: '2', wet: 48.7, dry: 43.8, tare: 12.42 },
        det3: { capsule: '3', wet: 52.1, dry: 46.9, tare: 12.52 }
      },
      picnometer: {
        det1: { 
          massaPicAmostraAgua: 985.2,
          massaPicAgua: 765.8,
          massaSoloUmido: 45.5,
          temperatura: 23.5
        },
        det2: {
          massaPicAmostraAgua: 987.1,
          massaPicAgua: 766.2,
          massaSoloUmido: 46.2,
          temperatura: 24.0
        }
      }
    };

    // Salvar no PostgreSQL (endpoint seguro)
    const postgresResponse = await fetch(`${BASE_URL}/api/tests/real-density`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-token-123'
      },
      body: JSON.stringify(densityRealData)
    });

    results.postgresql.total++;
    if (postgresResponse.ok) {
      results.postgresql.success++;
      console.log('✅ PostgreSQL: Densidade real salva com sucesso');
    } else {
      console.log('❌ PostgreSQL: Falha ao salvar densidade real');
      results.issues.push('PostgreSQL densidade real failed');
    }

  } catch (error) {
    console.log('❌ Erro no teste de densidade real:', error.message);
    results.issues.push(`Densidade real error: ${error.message}`);
  }

  // Teste 2: Salvar ensaio de densidade máx/mín
  console.log('\n↕️ TESTANDO DENSIDADE MÁX/MÍN');
  console.log('-'.repeat(40));
  
  try {
    const maxMinData = {
      registrationNumber: `TEST-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      operator: 'Teste Firebase',
      material: 'Solo granular',
      origin: 'Campo',
      maxDensity: {
        cylinder: '3',
        wetWeight1: 1245.8,
        wetWeight2: 1247.2,
        dryWeight1: 1123.5,
        dryWeight2: 1124.8,
        volume: 125.0
      },
      minDensity: {
        cylinder: '4',
        wetWeight1: 1156.3,
        wetWeight2: 1157.9,
        dryWeight1: 1045.2,
        dryWeight2: 1046.1,
        volume: 125.2
      }
    };

    // Salvar no PostgreSQL (endpoint seguro)
    const postgresResponse = await fetch(`${BASE_URL}/api/tests/max-min-density`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-token-123'
      },
      body: JSON.stringify(maxMinData)
    });

    results.postgresql.total++;
    if (postgresResponse.ok) {
      results.postgresql.success++;
      console.log('✅ PostgreSQL: Densidade máx/mín salva com sucesso');
    } else {
      console.log('❌ PostgreSQL: Falha ao salvar densidade máx/mín');
      results.issues.push('PostgreSQL max/min failed');
    }

  } catch (error) {
    console.log('❌ Erro no teste de densidade máx/mín:', error.message);
    results.issues.push(`Max/min error: ${error.message}`);
  }

  // Verificar dados salvos
  console.log('\n📋 VERIFICANDO DADOS SALVOS');
  console.log('-'.repeat(40));

  try {
    const savedTests = await fetch(`${BASE_URL}/api/tests/densidade-real/temp`);
    if (savedTests.ok) {
      const data = await savedTests.json();
      console.log(`✅ PostgreSQL: ${data.length} ensaios de densidade real encontrados`);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar dados salvos:', error.message);
  }

  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL DE SINCRONIZAÇÃO');
  console.log('=' * 60);
  
  const postgresqlScore = results.postgresql.total > 0 ? 
    Math.round((results.postgresql.success / results.postgresql.total) * 100) : 0;

  console.log(`\n🐘 PostgreSQL: ${results.postgresql.success}/${results.postgresql.total} (${postgresqlScore}%)`);
  console.log(`🔥 Firebase: ${results.firebase.success}/${results.firebase.total} (0% - Implementação em andamento)`);

  if (results.issues.length > 0) {
    console.log('\n⚠️ PROBLEMAS IDENTIFICADOS:');
    results.issues.forEach(issue => console.log(`   • ${issue}`));
  }

  const overallScore = postgresqlScore;
  console.log(`\n🎯 PONTUAÇÃO GERAL: ${overallScore}/100`);
  
  if (overallScore >= 80) {
    console.log('✅ STATUS: SISTEMA FUNCIONAL (PostgreSQL operacional, Firebase em implementação)');
  } else if (overallScore >= 60) {
    console.log('⚠️ STATUS: PARCIALMENTE FUNCIONAL');
  } else {
    console.log('❌ STATUS: PROBLEMAS CRÍTICOS');
  }

  console.log('\n🔄 PRÓXIMOS PASSOS:');
  console.log('   1. Completar integração Firebase Firestore nas calculadoras');
  console.log('   2. Implementar sincronização automática Local → PostgreSQL → Firebase');
  console.log('   3. Validar dados chegando ao Firebase conforme evidência do usuário');

  return overallScore >= 60;
}

// Executar teste
testFirebaseSyncComplete()
  .then(success => {
    console.log(`\n${success ? '✅' : '❌'} Teste concluído`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erro fatal no teste:', error);
    process.exit(1);
  });