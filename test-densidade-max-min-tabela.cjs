/**
 * TESTE ESPECÍFICO: TABELA DE UMIDADE DA DENSIDADE MÁX/MÍN
 * Verifica se todas as linhas da tabela estão sendo renderizadas corretamente
 */

const fs = require('fs');

function testarTabelaUmidade() {
  console.log('🔍 TESTE: TABELA DE UMIDADE - DENSIDADE MÁX/MÍN');
  console.log('=' .repeat(60));

  const arquivo = 'client/src/components/laboratory/density-max-min.tsx';
  
  if (!fs.existsSync(arquivo)) {
    console.log('❌ Arquivo não encontrado');
    return;
  }

  const conteudo = fs.readFileSync(arquivo, 'utf8');
  
  // Verificar estrutura da tabela de umidade
  const linhasTabela = [
    'Cápsula',
    'Úmido + Tara (g)',
    'Seco + Tara (g)', 
    'Tara (g)',
    'Umidade (%)',
    'Umidade Média (%)'
  ];

  console.log('\n📊 VERIFICANDO LINHAS DA TABELA DE UMIDADE:');
  
  let problemas = [];
  let sucessos = 0;
  
  linhasTabela.forEach((linha, index) => {
    if (conteudo.includes(linha)) {
      console.log(`✅ ${index + 1}. ${linha}: ENCONTRADA`);
      sucessos++;
    } else {
      console.log(`❌ ${index + 1}. ${linha}: AUSENTE`);
      problemas.push(`Linha ausente: ${linha}`);
    }
  });

  // Verificar se há TableRow suficientes
  const tableRowMatches = conteudo.match(/<TableRow>/g);
  const tableRowCount = tableRowMatches ? tableRowMatches.length : 0;
  
  console.log(`\n📋 ESTRUTURA DA TABELA:`);
  console.log(`• TableRow encontrados: ${tableRowCount}`);
  console.log(`• Linhas esperadas: ${linhasTabela.length} + cabeçalho = ${linhasTabela.length + 1}`);

  // Verificar se há problemas de CSS que possam ocultar linhas
  const cssProblems = [
    'display: none',
    'visibility: hidden',
    'height: 0',
    'overflow: hidden'
  ];

  console.log(`\n🎨 VERIFICANDO PROBLEMAS DE CSS:`);
  cssProblems.forEach(problema => {
    if (conteudo.includes(problema)) {
      console.log(`⚠️ CSS problemático encontrado: ${problema}`);
      problemas.push(`CSS problemático: ${problema}`);
    } else {
      console.log(`✅ CSS OK: ${problema} não encontrado`);
    }
  });

  const pontuacao = Math.round((sucessos / linhasTabela.length) * 100);
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMO DO TESTE');
  console.log('=' .repeat(60));
  console.log(`✅ Linhas encontradas: ${sucessos}/${linhasTabela.length}`);
  console.log(`❌ Problemas: ${problemas.length}`);
  console.log(`📈 Pontuação: ${pontuacao}/100`);

  if (problemas.length === 0) {
    console.log('\n🎉 STATUS: TABELA COMPLETA');
    console.log('✅ Todas as linhas da tabela estão presentes no código');
    console.log('✅ Nenhum CSS problemático detectado');
    console.log('💡 Problema pode ser de renderização ou scroll na interface');
  } else {
    console.log('\n⚠️ STATUS: PROBLEMAS DETECTADOS');
    problemas.forEach((problema, index) => {
      console.log(`${index + 1}. ${problema}`);
    });
  }

  return {
    pontuacao,
    sucessos,
    total: linhasTabela.length,
    problemas: problemas.length,
    status: problemas.length === 0 ? 'COMPLETA' : 'PROBLEMAS'
  };
}

// Executar teste
if (require.main === module) {
  const resultado = testarTabelaUmidade();
  process.exit(resultado.problemas === 0 ? 0 : 1);
}

module.exports = { testarTabelaUmidade };