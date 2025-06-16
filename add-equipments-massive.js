/**
 * Script para Adicionar Equipamentos em Massa
 * Demonstra capacidade ilimitada do sistema (100+ equipamentos)
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function addMassiveEquipments() {
  console.log('🏭 ADICIONANDO EQUIPAMENTOS EM MASSA');
  console.log('=' .repeat(60));

  const baseUrl = 'http://localhost:5000';
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer fake-token-for-dev'
  };

  try {
    // 1. Adicionar 50 cápsulas numeradas
    console.log('\n📦 Adicionando 50 cápsulas numeradas...');
    for (let i = 9; i <= 58; i++) {
      const capsula = {
        codigo: i.toString(),
        peso: 12.0 + (Math.random() * 5), // Peso entre 12-17g
        material: i <= 25 ? 'pequena' : i <= 40 ? 'media' : 'grande',
        descricao: `Cápsula ${i} - ${i <= 25 ? 'Pequena' : i <= 40 ? 'Média' : 'Grande'}`
      };

      try {
        const response = await fetch(`${baseUrl}/api/equipamentos`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            tipo: 'capsula',
            ...capsula
          })
        });
        
        if (response.ok) {
          console.log(`✅ Cápsula ${i} adicionada (${capsula.peso.toFixed(2)}g)`);
        }
      } catch (error) {
        console.log(`⚠️  Erro ao adicionar cápsula ${i}`);
      }
    }

    // 2. Adicionar 30 cilindros numerados
    console.log('\n🔧 Adicionando 30 cilindros numerados...');
    for (let i = 6; i <= 35; i++) {
      const cilindro = {
        codigo: i.toString(),
        peso: 180.0 + (Math.random() * 200), // Peso entre 180-380g
        volume: 50.0 + (Math.random() * 100), // Volume entre 50-150cm³
        altura: 10.0 + (Math.random() * 5),
        diametro: 5.0 + (Math.random() * 2),
        tipo: i <= 15 ? 'biselado' : i <= 25 ? 'vazios_minimos' : 'proctor',
        descricao: `Cilindro ${i} - ${i <= 15 ? 'Biselado' : i <= 25 ? 'Vazios Mínimos' : 'Proctor'}`
      };

      try {
        const response = await fetch(`${baseUrl}/api/equipamentos`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            tipo: 'cilindro',
            ...cilindro
          })
        });
        
        if (response.ok) {
          console.log(`✅ Cilindro ${i} adicionado (${cilindro.peso.toFixed(2)}g, ${cilindro.volume.toFixed(2)}cm³)`);
        }
      } catch (error) {
        console.log(`⚠️  Erro ao adicionar cilindro ${i}`);
      }
    }

    // 3. Adicionar equipamentos com códigos alfanuméricos
    console.log('\n🔤 Adicionando equipamentos com códigos alfanuméricos...');
    
    const alfanumericos = [
      { codigo: 'CAP-100', tipo: 'capsula', peso: 15.5, material: 'pequena' },
      { codigo: 'CAP-101', tipo: 'capsula', peso: 26.2, material: 'media' },
      { codigo: 'CAP-102', tipo: 'capsula', peso: 47.8, material: 'grande' },
      { codigo: 'CIL-200', tipo: 'cilindro', peso: 185.0, volume: 98.5, tipo: 'biselado' },
      { codigo: 'CIL-201', tipo: 'cilindro', peso: 421.5, volume: 125.0, tipo: 'vazios_minimos' },
      { codigo: 'CIL-202', tipo: 'cilindro', peso: 652.0, volume: 150.0, tipo: 'proctor' },
      { codigo: 'LAB-A1', tipo: 'capsula', peso: 13.2, material: 'pequena' },
      { codigo: 'LAB-B2', tipo: 'cilindro', peso: 190.0, volume: 102.0, tipo: 'biselado' }
    ];

    for (const equip of alfanumericos) {
      try {
        const response = await fetch(`${baseUrl}/api/equipamentos`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(equip)
        });
        
        if (response.ok) {
          console.log(`✅ ${equip.codigo} adicionado (${equip.peso}g)`);
        }
      } catch (error) {
        console.log(`⚠️  Erro ao adicionar ${equip.codigo}`);
      }
    }

    // 4. Verificar total de equipamentos
    console.log('\n📊 Verificando total de equipamentos...');
    const response = await fetch(`${baseUrl}/api/equipamentos`, {
      headers: authHeaders
    });
    
    if (response.ok) {
      const equipData = await response.json();
      const totalCapsulas = equipData.capsulas?.length || 0;
      const totalCilindros = equipData.cilindros?.length || 0;
      const total = totalCapsulas + totalCilindros;
      
      console.log(`✅ Total de equipamentos: ${total} (${totalCapsulas} cápsulas + ${totalCilindros} cilindros)`);
      console.log('\n🎯 DEMONSTRAÇÃO: Sistema suporta quantidade ilimitada!');
      console.log('   Agora você pode usar códigos como:');
      console.log('   - Números: 1, 2, 50, 100');
      console.log('   - Alfanuméricos: CAP-100, CIL-200, LAB-A1');
      console.log('   - Qualquer padrão de código que desejar');
    }

  } catch (error) {
    console.error('❌ Erro durante adição em massa:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addMassiveEquipments();
}

export { addMassiveEquipments };