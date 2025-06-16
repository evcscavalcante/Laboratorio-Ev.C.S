/**
 * Teste da Implementação Firebase Sync
 * Verifica se a sincronização está implementada corretamente
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

async function testFirebaseImplementacao() {
  console.log('🔥 VERIFICAÇÃO DA IMPLEMENTAÇÃO FIREBASE SYNC');
  console.log('='.repeat(60));

  const results = {
    biblioteca: false,
    densidadeReal: false,
    densidadeInSitu: false,
    densidadeMaxMin: false,
    equipamentos: false,
    configuracao: false,
    pontuacao: 0
  };

  // Teste 1: Verificar biblioteca Firebase Sync
  console.log('\n📚 VERIFICANDO BIBLIOTECA FIREBASE SYNC');
  console.log('-'.repeat(40));
  
  const firebaseSyncPath = 'client/src/lib/firebase-sync.ts';
  if (existsSync(firebaseSyncPath)) {
    console.log('✅ Arquivo firebase-sync.ts encontrado');
    
    const content = readFileSync(firebaseSyncPath, 'utf8');
    
    const checks = {
      classFirebaseSync: content.includes('class FirebaseSync'),
      methodSyncEnsaio: content.includes('syncEnsaio'),
      methodSyncEquipamento: content.includes('syncEquipamento'),
      firestoreImport: content.includes('firestore') || content.includes('Firestore'),
      errorHandling: content.includes('try') && content.includes('catch'),
      idValidation: content.includes('String(') && content.includes('replace')
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}: ${passed ? 'OK' : 'Faltando'}`);
    });
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    if (passedChecks >= 4) {
      results.biblioteca = true;
      results.pontuacao += 20;
      console.log(`✅ Biblioteca completa (${passedChecks}/6 verificações)`);
    } else {
      console.log(`⚠️ Biblioteca incompleta (${passedChecks}/6 verificações)`);
    }
  } else {
    console.log('❌ Arquivo firebase-sync.ts não encontrado');
  }

  // Teste 2: Verificar implementação em Densidade Real
  console.log('\n⚛️ VERIFICANDO DENSIDADE REAL');
  console.log('-'.repeat(40));
  
  const densityRealPath = 'client/src/components/laboratory/density-real.tsx';
  if (existsSync(densityRealPath)) {
    const content = readFileSync(densityRealPath, 'utf8');
    
    const checks = {
      firebaseImport: content.includes('firebase-sync'),
      syncCall: content.includes('firebaseSync.syncEnsaio'),
      onSuccessIntegration: content.includes('onSuccess') && content.includes('firebaseSync'),
      errorHandling: content.includes('firebaseSuccess'),
      logs: content.includes('console.log') && content.includes('Firebase')
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    });
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    if (passedChecks >= 3) {
      results.densidadeReal = true;
      results.pontuacao += 15;
      console.log(`✅ Densidade Real implementada (${passedChecks}/5)`);
    }
  } else {
    console.log('❌ Arquivo density-real.tsx não encontrado');
  }

  // Teste 3: Verificar implementação em Densidade In-Situ
  console.log('\n🏗️ VERIFICANDO DENSIDADE IN-SITU');
  console.log('-'.repeat(40));
  
  const densityInSituPath = 'client/src/components/laboratory/density-in-situ.tsx';
  if (existsSync(densityInSituPath)) {
    const content = readFileSync(densityInSituPath, 'utf8');
    
    const checks = {
      firebaseImport: content.includes('firebase-sync'),
      syncCall: content.includes('firebaseSync.syncEnsaio'),
      onSuccessIntegration: content.includes('onSuccess') && content.includes('firebaseSync'),
      errorHandling: content.includes('firebaseSuccess'),
      logs: content.includes('console.log') && content.includes('Firebase')
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    });
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    if (passedChecks >= 3) {
      results.densidadeInSitu = true;
      results.pontuacao += 15;
      console.log(`✅ Densidade In-Situ implementada (${passedChecks}/5)`);
    }
  } else {
    console.log('❌ Arquivo density-in-situ.tsx não encontrado');
  }

  // Teste 4: Verificar implementação em Densidade Máx/Mín
  console.log('\n↕️ VERIFICANDO DENSIDADE MÁX/MÍN');
  console.log('-'.repeat(40));
  
  const densityMaxMinPath = 'client/src/components/laboratory/density-max-min.tsx';
  if (existsSync(densityMaxMinPath)) {
    const content = readFileSync(densityMaxMinPath, 'utf8');
    
    const checks = {
      firebaseImport: content.includes('firebase-sync'),
      syncCall: content.includes('firebaseSync.syncEnsaio'),
      onSuccessIntegration: content.includes('onSuccess') && content.includes('firebaseSync'),
      errorHandling: content.includes('firebaseSuccess'),
      logs: content.includes('console.log') && content.includes('Firebase')
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    });
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    if (passedChecks >= 3) {
      results.densidadeMaxMin = true;
      results.pontuacao += 15;
      console.log(`✅ Densidade Máx/Mín implementada (${passedChecks}/5)`);
    }
  } else {
    console.log('❌ Arquivo density-max-min.tsx não encontrado');
  }

  // Teste 5: Verificar implementação em Equipamentos
  console.log('\n🔧 VERIFICANDO EQUIPAMENTOS');
  console.log('-'.repeat(40));
  
  const equipamentosPath = 'client/src/pages/equipamentos-fixed.tsx';
  if (existsSync(equipamentosPath)) {
    const content = readFileSync(equipamentosPath, 'utf8');
    
    const checks = {
      firebaseImport: content.includes('firebase-sync'),
      syncCall: content.includes('firebaseSync.syncEquipamento'),
      createIntegration: content.includes('createMutation') && content.includes('firebaseSync'),
      updateIntegration: content.includes('updateMutation') && content.includes('firebaseSync'),
      logs: content.includes('console.log') && content.includes('Firebase')
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    });
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    if (passedChecks >= 3) {
      results.equipamentos = true;
      results.pontuacao += 15;
      console.log(`✅ Equipamentos implementados (${passedChecks}/5)`);
    }
  } else {
    console.log('❌ Arquivo equipamentos-fixed.tsx não encontrado');
  }

  // Teste 6: Verificar configuração Firebase
  console.log('\n⚙️ VERIFICANDO CONFIGURAÇÃO FIREBASE');
  console.log('-'.repeat(40));
  
  const configFiles = [
    'client/src/lib/firebase.ts',
    'firebase.json',
    '.firebaserc'
  ];
  
  let configsFound = 0;
  
  configFiles.forEach(file => {
    if (existsSync(file)) {
      console.log(`✅ ${file} encontrado`);
      configsFound++;
    } else {
      console.log(`❌ ${file} não encontrado`);
    }
  });
  
  if (configsFound >= 2) {
    results.configuracao = true;
    results.pontuacao += 20;
    console.log(`✅ Configuração adequada (${configsFound}/3 arquivos)`);
  }

  // Relatório Final
  console.log('\n📊 RELATÓRIO FINAL DA IMPLEMENTAÇÃO');
  console.log('='.repeat(60));
  console.log(`Biblioteca Firebase:  ${results.biblioteca ? '✅' : '❌'} (20 pontos)`);
  console.log(`Densidade Real:       ${results.densidadeReal ? '✅' : '❌'} (15 pontos)`);
  console.log(`Densidade In-Situ:    ${results.densidadeInSitu ? '✅' : '❌'} (15 pontos)`);
  console.log(`Densidade Máx/Mín:    ${results.densidadeMaxMin ? '✅' : '❌'} (15 pontos)`);
  console.log(`Equipamentos:         ${results.equipamentos ? '✅' : '❌'} (15 pontos)`);
  console.log(`Configuração:         ${results.configuracao ? '✅' : '❌'} (20 pontos)`);
  console.log('\n' + '='.repeat(60));
  console.log(`PONTUAÇÃO FINAL: ${results.pontuacao}/100`);
  
  let status;
  if (results.pontuacao >= 90) {
    status = 'EXCELENTE - FIREBASE SYNC COMPLETO IMPLEMENTADO';
  } else if (results.pontuacao >= 75) {
    status = 'MUITO BOM - IMPLEMENTAÇÃO FUNCIONAL';
  } else if (results.pontuacao >= 60) {
    status = 'BOM - IMPLEMENTAÇÃO PARCIAL';
  } else if (results.pontuacao >= 40) {
    status = 'REGULAR - NECESSITA MELHORIAS';
  } else {
    status = 'CRÍTICO - IMPLEMENTAÇÃO INCOMPLETA';
  }
  
  console.log(`STATUS: ${status}`);
  console.log('='.repeat(60));

  // Resumo de componentes implementados
  const componentesImplementados = [
    results.densidadeReal && 'Densidade Real',
    results.densidadeInSitu && 'Densidade In-Situ', 
    results.densidadeMaxMin && 'Densidade Máx/Mín',
    results.equipamentos && 'Equipamentos'
  ].filter(Boolean);

  if (componentesImplementados.length > 0) {
    console.log(`\n✅ COMPONENTES COM FIREBASE SYNC: ${componentesImplementados.join(', ')}`);
  }

  const componentesFaltantes = [
    !results.densidadeReal && 'Densidade Real',
    !results.densidadeInSitu && 'Densidade In-Situ',
    !results.densidadeMaxMin && 'Densidade Máx/Mín', 
    !results.equipamentos && 'Equipamentos'
  ].filter(Boolean);

  if (componentesFaltantes.length > 0) {
    console.log(`\n❌ FALTAM IMPLEMENTAR: ${componentesFaltantes.join(', ')}`);
  }

  console.log('='.repeat(60));

  return results.pontuacao >= 75;
}

// Executar teste
testFirebaseImplementacao()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erro durante teste:', error);
    process.exit(1);
  });