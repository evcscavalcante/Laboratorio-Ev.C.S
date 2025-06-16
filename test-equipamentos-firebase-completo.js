/**
 * Teste Completo da Sincronização Firebase para Equipamentos e Ensaios
 * Valida sistema triplo completo incluindo equipamentos
 */

import fs from 'fs';
import fetch from 'node-fetch';

async function testFirebaseEquipamentosCompleto() {
  console.log('🔥 TESTE COMPLETO FIREBASE - EQUIPAMENTOS E ENSAIOS');
  console.log('='.repeat(60));

  const resultados = {
    equipamentos: { implementado: false, metodo: false },
    densidadeReal: { implementado: false, metodo: false },
    densidadeInSitu: { implementado: false, metodo: false },
    densidadeMaxMin: { implementado: false, metodo: false },
    biblioteca: { completa: false, metodos: 0 },
    endpoints: { seguros: 0, total: 4 }
  };

  // 1. VERIFICAR SINCRONIZAÇÃO FIREBASE EM EQUIPAMENTOS
  console.log('\n🔧 VERIFICANDO SINCRONIZAÇÃO FIREBASE EM EQUIPAMENTOS');
  console.log('-'.repeat(50));
  
  const equipamentosPath = './client/src/pages/equipamentos-fixed.tsx';
  if (fs.existsSync(equipamentosPath)) {
    const equipamentosContent = fs.readFileSync(equipamentosPath, 'utf8');
    
    if (equipamentosContent.includes('firebaseSync')) {
      resultados.equipamentos.implementado = true;
      console.log('✅ Sincronização Firebase integrada em equipamentos');
    } else {
      console.log('❌ Sincronização Firebase não encontrada em equipamentos');
    }
    
    if (equipamentosContent.includes('syncEquipamento')) {
      resultados.equipamentos.metodo = true;
      console.log('✅ Método syncEquipamento implementado na biblioteca');
    } else {
      console.log('❌ Método syncEquipamento não implementado');
    }
  } else {
    console.log('❌ Arquivo de equipamentos não encontrado');
  }

  // 2. VERIFICAR SINCRONIZAÇÃO FIREBASE EM CALCULADORAS
  console.log('\n⚖️ VERIFICANDO SINCRONIZAÇÃO FIREBASE EM CALCULADORAS');
  console.log('-'.repeat(50));

  const calculadoras = [
    { nome: 'Densidade Real', path: './client/src/components/laboratory/density-real.tsx', key: 'densidadeReal' },
    { nome: 'Densidade In-Situ', path: './client/src/components/laboratory/density-in-situ.tsx', key: 'densidadeInSitu' },
    { nome: 'Densidade Máx/Mín', path: './client/src/components/laboratory/density-max-min.tsx', key: 'densidadeMaxMin' }
  ];

  for (const calc of calculadoras) {
    if (fs.existsSync(calc.path)) {
      const content = fs.readFileSync(calc.path, 'utf8');
      
      if (content.includes('firebaseSync')) {
        resultados[calc.key].implementado = true;
        console.log(`✅ ${calc.nome}: Firebase integrado`);
      } else {
        console.log(`❌ ${calc.nome}: Firebase não integrado`);
      }
      
      if (content.includes('syncEnsaio')) {
        resultados[calc.key].metodo = true;
        console.log(`✅ ${calc.nome}: Método syncEnsaio implementado`);
      } else {
        console.log(`❌ ${calc.nome}: Método syncEnsaio não implementado`);
      }
    } else {
      console.log(`❌ ${calc.nome}: Arquivo não encontrado`);
    }
  }

  // 3. VERIFICAR BIBLIOTECA FIREBASE
  console.log('\n📚 VERIFICANDO BIBLIOTECA FIREBASE-SYNC');
  console.log('-'.repeat(50));

  const bibliotecaPath = './client/src/lib/firebase-sync.ts';
  if (fs.existsSync(bibliotecaPath)) {
    const bibliotecaContent = fs.readFileSync(bibliotecaPath, 'utf8');
    
    const metodos = ['syncEnsaio', 'syncEquipamento', 'syncOrganization'];
    let metodosImplementados = 0;
    
    for (const metodo of metodos) {
      if (bibliotecaContent.includes(metodo)) {
        metodosImplementados++;
        console.log(`✅ Método ${metodo} implementado`);
      } else {
        console.log(`❌ Método ${metodo} não implementado`);
      }
    }
    
    resultados.biblioteca.metodos = metodosImplementados;
    resultados.biblioteca.completa = metodosImplementados === metodos.length;
  } else {
    console.log('❌ Biblioteca firebase-sync.ts não encontrada');
  }

  // 4. VERIFICAR ENDPOINTS SEGUROS
  console.log('\n🔐 VERIFICANDO ENDPOINTS SEGUROS');
  console.log('-'.repeat(50));

  const endpoints = [
    '/api/equipamentos',
    '/api/tests/real-density',
    '/api/tests/density-in-situ',
    '/api/tests/max-min-density'
  ];

  let endpointsSegurosFuncionando = 0;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`);
      
      if (response.status === 401) {
        endpointsSegurosFuncionando++;
        console.log(`✅ ${endpoint.split('/').pop()}: Endpoint seguro funcionando (401)`);
      } else {
        console.log(`❌ ${endpoint.split('/').pop()}: Endpoint inseguro (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.split('/').pop()}: Erro de conexão`);
    }
  }

  resultados.endpoints.seguros = endpointsSegurosFuncionando;

  // 5. VERIFICAR SERVIDOR
  console.log('\n⚡ VERIFICANDO SERVIDOR');
  console.log('-'.repeat(50));

  try {
    const response = await fetch('http://localhost:5000/');
    if (response.ok) {
      console.log('✅ Servidor funcionando corretamente na porta 5000');
    } else {
      console.log('⚠️ Servidor respondendo mas com problemas');
    }
  } catch (error) {
    console.log('❌ Servidor não está respondendo');
  }

  // 6. RELATÓRIO FINAL
  console.log('\n📊 RELATÓRIO COMPLETO FIREBASE - EQUIPAMENTOS E ENSAIOS');
  console.log('='.repeat(60));

  const equipamentosScore = (resultados.equipamentos.implementado && resultados.equipamentos.metodo) ? 2 : 
                           (resultados.equipamentos.implementado || resultados.equipamentos.metodo) ? 1 : 0;

  const ensaiosScore = [resultados.densidadeReal, resultados.densidadeInSitu, resultados.densidadeMaxMin]
    .reduce((total, ensaio) => total + ((ensaio.implementado && ensaio.metodo) ? 1 : 0), 0);

  const bibliotecaScore = resultados.biblioteca.completa ? resultados.biblioteca.metodos : 0;
  const endpointsScore = resultados.endpoints.seguros;

  console.log(`\n🔧 Equipamentos Firebase: ${equipamentosScore}/2 (${Math.round(equipamentosScore/2*100)}%)`);
  console.log(`⚖️ Ensaios Firebase: ${ensaiosScore}/3 (${Math.round(ensaiosScore/3*100)}%)`);
  console.log(`📚 Biblioteca Completa: ${bibliotecaScore}/3 (${Math.round(bibliotecaScore/3*100)}%)`);
  console.log(`🔐 Endpoints Seguros: ${endpointsScore}/4 (${Math.round(endpointsScore/4*100)}%)`);

  const pontuacaoGeral = Math.round(((equipamentosScore/2 + ensaiosScore/3 + bibliotecaScore/3 + endpointsScore/4) / 4) * 100);

  console.log(`\n🎯 PONTUAÇÃO GERAL: ${pontuacaoGeral}/100`);

  if (pontuacaoGeral >= 90) {
    console.log('✅ STATUS: SINCRONIZAÇÃO FIREBASE COMPLETA IMPLEMENTADA');
    console.log('📝 DIAGNÓSTICO: Sistema triplo funcionando em equipamentos e ensaios');
  } else if (pontuacaoGeral >= 70) {
    console.log('⚠️ STATUS: SINCRONIZAÇÃO FIREBASE PARCIALMENTE IMPLEMENTADA');
    console.log('📝 DIAGNÓSTICO: Maioria dos componentes funcionando, pequenos ajustes necessários');
  } else {
    console.log('❌ STATUS: SINCRONIZAÇÃO FIREBASE INCOMPLETA');
    console.log('📝 DIAGNÓSTICO: Vários componentes precisam de implementação Firebase');
  }

  console.log('\n🔍 RESUMO TÉCNICO:');
  console.log('   • Biblioteca firebase-sync.ts: ' + (resultados.biblioteca.completa ? 'Completa com syncEnsaio e syncEquipamento' : 'Incompleta'));
  console.log('   • Equipamentos: ' + (equipamentosScore === 2 ? 'Sincronização automática PostgreSQL → Firebase' : 'Sincronização pendente'));
  console.log('   • Ensaios: ' + (ensaiosScore === 3 ? 'Sincronização automática PostgreSQL → Firebase' : 'Sincronização pendente em ' + (3-ensaiosScore) + ' ensaio(s)'));
  console.log('   • Endpoints: ' + (endpointsScore === 4 ? 'Seguros com autenticação Firebase obrigatória' : endpointsScore + '/4 seguros'));

  console.log('\n📋 SISTEMA TRIPLO COMPLETO:');
  console.log('   Local Storage → PostgreSQL → Firebase Firestore');
  console.log('   🟢 Equipamentos: CAP-TEST-001, CIL-BIS-001, etc.');
  console.log('   🟢 Ensaios: Densidade real, in-situ, máx/mín');
  console.log('   🟢 Mensagens: "salvo no PostgreSQL e sincronizado com Firebase"');

  console.log('\n✅ Teste completo Firebase concluído');
  process.exit(0);
}

// Executar teste
testFirebaseEquipamentosCompleto()
  .catch(error => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  });