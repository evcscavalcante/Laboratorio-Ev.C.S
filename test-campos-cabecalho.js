/**
 * Teste Completo dos Campos Editáveis dos Cabeçalhos
 * Verifica se todos os campos dos cabeçalhos são realmente editáveis
 */

const fs = require('fs');

function testHeaderFields() {
  console.log('🧪 TESTE: Campos Editáveis dos Cabeçalhos');
  console.log('=====================================\n');

  const files = [
    'client/src/components/laboratory/density-in-situ.tsx',
    'client/src/components/laboratory/density-real.tsx', 
    'client/src/components/laboratory/density-max-min.tsx'
  ];

  const requiredCallbacks = [
    'onOperadorChange',
    'onResponsavelCalculoChange', 
    'onVerificadorChange',
    'onDataChange',
    'onHoraChange',
    'onMaterialChange',
    'onOrigemChange',
    'onRegistroChange',
    'onNorteChange',
    'onEsteChange',
    'onCotaChange',
    'onQuadranteChange',
    'onCamadaChange',
    'onFvsChange'
  ];

  let totalProblems = 0;
  let results = {};

  files.forEach((file, index) => {
    const testName = ['Densidade In-Situ', 'Densidade Real', 'Densidade Máx/Mín'][index];
    console.log(`${index + 1}️⃣ Verificando ${testName}...`);
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      const missingCallbacks = [];
      const incorrectMappings = [];
      
      // Verificar se todos os callbacks estão presentes
      requiredCallbacks.forEach(callback => {
        if (!content.includes(callback)) {
          missingCallbacks.push(callback);
        }
      });

      // Verificar mapeamentos específicos problemáticos
      const mappingChecks = [
        { callback: 'onCotaChange', shouldMap: 'elevation', field: 'cota' },
        { callback: 'onHoraChange', shouldMap: 'time', field: 'hora' },
        { callback: 'onRegistroChange', shouldMap: 'registrationNumber', field: 'registro' }
      ];

      mappingChecks.forEach(check => {
        const callbackRegex = new RegExp(`${check.callback}.*?updateData\\("([^"]+)"`, 'g');
        const matches = content.match(callbackRegex);
        if (matches) {
          matches.forEach(match => {
            if (!match.includes(check.shouldMap)) {
              incorrectMappings.push({
                callback: check.callback,
                found: match,
                expected: check.shouldMap
              });
            }
          });
        }
      });

      // Verificar se campos do cabeçalho estão mapeados corretamente
      const headerValueChecks = [
        { prop: 'cota=', shouldReference: 'elevation' },
        { prop: 'hora=', shouldReference: 'time' }
      ];

      headerValueChecks.forEach(check => {
        if (content.includes(check.prop) && !content.includes(`${check.prop}{data.${check.shouldReference}}`)) {
          incorrectMappings.push({
            type: 'header_value',
            prop: check.prop,
            expected: `data.${check.shouldReference}`
          });
        }
      });

      const problems = missingCallbacks.length + incorrectMappings.length;
      totalProblems += problems;

      if (problems === 0) {
        console.log('✅ Todos os campos editáveis funcionando');
      } else {
        console.log(`❌ ${problems} problemas encontrados:`);
        missingCallbacks.forEach(cb => console.log(`   • Callback ausente: ${cb}`));
        incorrectMappings.forEach(mapping => {
          if (mapping.type === 'header_value') {
            console.log(`   • Valor do cabeçalho: ${mapping.prop} deve referenciar ${mapping.expected}`);
          } else {
            console.log(`   • Mapeamento incorreto: ${mapping.callback} deve mapear para "${mapping.expected}"`);
          }
        });
      }

      results[testName] = {
        problems,
        missingCallbacks,
        incorrectMappings
      };

    } catch (error) {
      console.log(`❌ Erro ao ler arquivo: ${error.message}`);
      totalProblems++;
    }

    console.log('');
  });

  console.log('📊 RELATÓRIO FINAL');
  console.log('==================');
  
  if (totalProblems === 0) {
    console.log('🎯 Pontuação: 100/100');
    console.log('🟢 STATUS: EXCELENTE - Todos os campos editáveis funcionando');
  } else {
    const score = Math.max(0, 100 - (totalProblems * 10));
    console.log(`🎯 Pontuação: ${score}/100`);
    console.log(`🔴 STATUS: ${totalProblems} problemas críticos encontrados`);
    
    console.log('\n🔧 CORREÇÕES NECESSÁRIAS:');
    Object.entries(results).forEach(([test, result]) => {
      if (result.problems > 0) {
        console.log(`\n${test}:`);
        result.incorrectMappings.forEach(mapping => {
          if (mapping.callback) {
            console.log(`   • Corrigir: ${mapping.callback} deve usar updateData("${mapping.expected}", value)`);
          }
        });
      }
    });
  }
}

testHeaderFields();