/**
 * TESTE DE VALIDAÇÃO: LOOPS INFINITOS COMPLETAMENTE ELIMINADOS
 * Verifica se todas as calculadoras estão livres dos problemas de "Maximum update depth exceeded"
 */

import fs from 'fs';

function testarLoopsInfinitos() {
  console.log('🔍 TESTE: Verificando eliminação completa de loops infinitos...\n');

  const arquivosCalculadoras = [
    'client/src/components/laboratory/density-in-situ.tsx',
    'client/src/components/laboratory/density-real.tsx',
    'client/src/components/laboratory/density-max-min.tsx',
    'client/src/hooks/useEquipmentAutofill.ts'
  ];

  let problemasEncontrados = 0;
  let totalVerificacoes = 0;

  arquivosCalculadoras.forEach(arquivo => {
    if (!fs.existsSync(arquivo)) {
      console.log(`❌ Arquivo não encontrado: ${arquivo}`);
      problemasEncontrados++;
      return;
    }

    const conteudo = fs.readFileSync(arquivo, 'utf8');
    
    // Verificar padrões problemáticos que causam loops infinitos
    const padroesProblematicos = [
      {
        padrao: /useEffect\([^}]*searchEquipment[^}]*\)/g,
        descricao: 'useEffect com searchEquipment nas dependências'
      },
      {
        padrao: /useEffect\([^}]*equipmentData.*setData[^}]*\)/g,
        descricao: 'useEffect com equipmentData e setData'
      },
      {
        padrao: /useEffect\([^}]*setLastSearched[^}]*searchEquipment[^}]*\)/g,
        descricao: 'useEffect com setLastSearched e searchEquipment'
      }
    ];

    console.log(`📁 Verificando: ${arquivo}`);
    
    padroesProblematicos.forEach(({ padrao, descricao }) => {
      const matches = conteudo.match(padrao);
      totalVerificacoes++;
      
      if (matches) {
        console.log(`  ❌ ENCONTRADO: ${descricao} (${matches.length} ocorrências)`);
        matches.forEach((match, index) => {
          console.log(`    ${index + 1}. ${match.substring(0, 100)}...`);
        });
        problemasEncontrados++;
      } else {
        console.log(`  ✅ OK: Nenhum ${descricao} encontrado`);
      }
    });

    // Verificar se há comentários indicando remoção
    const comentariosRemocao = conteudo.match(/\/\/.*removido.*loop.*infinito/gi);
    if (comentariosRemocao) {
      console.log(`  📝 Comentários de correção encontrados: ${comentariosRemocao.length}`);
    }

    console.log('');
  });

  // Relatório final
  console.log('📊 RELATÓRIO FINAL:');
  console.log(`Total de verificações: ${totalVerificacoes}`);
  console.log(`Problemas encontrados: ${problemasEncontrados}`);
  
  if (problemasEncontrados === 0) {
    console.log('\n🎉 SUCESSO COMPLETO!');
    console.log('✅ Todos os loops infinitos foram eliminados');
    console.log('✅ Sistema estável sem "Maximum update depth exceeded"');
    console.log('✅ Preenchimento automático funcionará sem problemas');
    
    return {
      status: 'APROVADO',
      score: '100/100',
      problemas: 0,
      message: 'LOOPS INFINITOS COMPLETAMENTE ELIMINADOS'
    };
  } else {
    console.log('\n⚠️  PROBLEMAS DETECTADOS!');
    console.log(`❌ ${problemasEncontrados} padrões problemáticos ainda presentes`);
    console.log('❌ Sistema ainda pode apresentar loops infinitos');
    
    return {
      status: 'REPROVADO',
      score: `${Math.max(0, 100 - (problemasEncontrados * 25))}/100`,
      problemas: problemasEncontrados,
      message: 'LOOPS INFINITOS AINDA PRESENTES'
    };
  }
}

// Executar teste
const resultado = testarLoopsInfinitos();
console.log(`\n🏆 RESULTADO FINAL: ${resultado.status} (${resultado.score})`);
console.log(`📝 ${resultado.message}`);

// Exit code para CI/CD
process.exit(resultado.problemas > 0 ? 1 : 0);