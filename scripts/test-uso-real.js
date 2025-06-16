#!/usr/bin/env node

/**
 * Teste de Uso Real da Aplicação
 * Simula interações reais do usuário para detectar problemas que os testes automatizados não capturam
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';

class TestadorUsoReal {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.page = null;
    this.errosEncontrados = [];
    this.avisos = [];
    this.sucessos = [];
  }

  async iniciarTeste() {
    console.log('🧪 TESTE DE USO REAL DA APLICAÇÃO');
    console.log('=' .repeat(50));
    
    try {
      await this.configurarBrowser();
      await this.testarFluxoCompleto();
      await this.gerarRelatorio();
    } catch (error) {
      console.error('❌ Erro durante teste:', error.message);
      this.errosEncontrados.push(`Erro crítico: ${error.message}`);
    } finally {
      await this.fecharBrowser();
    }
  }

  async configurarBrowser() {
    console.log('🚀 Iniciando navegador para teste real...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Captura erros JavaScript
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.errosEncontrados.push(`Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        this.avisos.push(`Console Warning: ${msg.text()}`);
      }
    });

    // Captura erros de rede
    this.page.on('response', response => {
      if (response.status() >= 400) {
        this.errosEncontrados.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });

    // Captura erros de página
    this.page.on('pageerror', error => {
      this.errosEncontrados.push(`Page Error: ${error.message}`);
    });
  }

  async testarFluxoCompleto() {
    console.log('\n📱 Testando fluxo completo de uso...');
    
    // 1. Carregamento inicial
    await this.testarCarregamentoInicial();
    
    // 2. Navegação pela sidebar
    await this.testarNavegacaoSidebar();
    
    // 3. Acesso às calculadoras
    await this.testarCalculadoras();
    
    // 4. Gerenciamento de usuários (se acessível)
    await this.testarGerenciamentoUsuarios();
    
    // 5. Sistema de notificações
    await this.testarNotificacoes();
    
    // 6. Teste de responsividade
    await this.testarResponsividade();
  }

  async testarCarregamentoInicial() {
    console.log('\n🏠 Testando carregamento inicial...');
    
    try {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 10000 });
      
      // Aguarda elemento principal carregar
      await this.page.waitForSelector('body', { timeout: 5000 });
      
      // Verifica se há erros críticos na página
      const errosCriticos = await this.page.evaluate(() => {
        const erros = [];
        
        // Verifica se React renderizou
        if (!document.querySelector('[data-reactroot], #root > *')) {
          erros.push('React não renderizou corretamente');
        }
        
        // Verifica se há elementos com erro
        const elementosErro = document.querySelectorAll('[data-error], .error, .error-boundary');
        if (elementosErro.length > 0) {
          erros.push(`${elementosErro.length} elementos com erro detectados`);
        }
        
        return erros;
      });
      
      if (errosCriticos.length === 0) {
        this.sucessos.push('✅ Carregamento inicial bem-sucedido');
      } else {
        this.errosEncontrados.push(...errosCriticos);
      }
      
    } catch (error) {
      this.errosEncontrados.push(`Falha no carregamento inicial: ${error.message}`);
    }
  }

  async testarNavegacaoSidebar() {
    console.log('\n📋 Testando navegação da sidebar...');
    
    try {
      // Aguarda sidebar carregar
      await this.page.waitForSelector('nav, .sidebar, [role="navigation"]', { timeout: 5000 });
      
      // Encontra links de navegação
      const links = await this.page.$$eval('a[href]', links => 
        links.filter(link => link.href && !link.href.includes('http')).map(link => ({
          href: link.getAttribute('href'),
          text: link.textContent.trim()
        }))
      );
      
      let linksTestados = 0;
      for (const link of links.slice(0, 5)) { // Testa apenas os primeiros 5 links
        try {
          await this.page.click(`a[href="${link.href}"]`);
          await this.page.waitForTimeout(1000); // Aguarda navegação
          linksTestados++;
        } catch (error) {
          this.errosEncontrados.push(`Erro ao clicar em "${link.text}": ${error.message}`);
        }
      }
      
      if (linksTestados > 0) {
        this.sucessos.push(`✅ ${linksTestados} links de navegação funcionando`);
      }
      
    } catch (error) {
      this.errosEncontrados.push(`Erro na navegação da sidebar: ${error.message}`);
    }
  }

  async testarCalculadoras() {
    console.log('\n🧮 Testando calculadoras...');
    
    const calculadoras = [
      { nome: 'Densidade In-Situ', seletor: 'button, a', texto: 'densidade.*in.*situ|in.*situ' },
      { nome: 'Densidade Real', seletor: 'button, a', texto: 'densidade.*real|real.*densidade' },
      { nome: 'Densidade Máx/Mín', seletor: 'button, a', texto: 'máx.*mín|densidade.*máximo' }
    ];
    
    for (const calc of calculadoras) {
      try {
        // Procura botão/link da calculadora
        const elementos = await this.page.$$eval(calc.seletor, (elements, regex) => {
          const pattern = new RegExp(regex, 'i');
          return elements.filter(el => pattern.test(el.textContent));
        }, calc.texto);
        
        if (elementos.length > 0) {
          // Tenta clicar no primeiro elemento encontrado
          const elemento = await this.page.$(`${calc.seletor}:has-text("${calc.nome}")`);
          if (elemento) {
            await elemento.click();
            await this.page.waitForTimeout(2000);
            
            // Verifica se a calculadora carregou
            const calculadoraCarregada = await this.page.evaluate(() => {
              return document.querySelector('input[type="number"], .calculator, .ensaio') !== null;
            });
            
            if (calculadoraCarregada) {
              this.sucessos.push(`✅ Calculadora ${calc.nome} carregou corretamente`);
            } else {
              this.avisos.push(`⚠️ Calculadora ${calc.nome} pode não ter carregado completamente`);
            }
          }
        } else {
          this.avisos.push(`⚠️ Botão da calculadora ${calc.nome} não encontrado`);
        }
        
      } catch (error) {
        this.errosEncontrados.push(`Erro ao testar calculadora ${calc.nome}: ${error.message}`);
      }
    }
  }

  async testarGerenciamentoUsuarios() {
    console.log('\n👥 Testando gerenciamento de usuários...');
    
    try {
      // Procura seção de usuários
      const linkUsuarios = await this.page.$('a[href*="user"], a[href*="usuario"], button:has-text("usuário")');
      
      if (linkUsuarios) {
        await linkUsuarios.click();
        await this.page.waitForTimeout(2000);
        
        // Verifica se a página de usuários carregou sem o erro "users.map is not a function"
        const erroMapeamento = await this.page.evaluate(() => {
          const erros = [];
          
          // Procura por indicadores de erro de mapeamento
          if (window.console && window.console.error) {
            // Captura seria feita pelos listeners, mas vamos verificar DOM
          }
          
          // Verifica se há tabela de usuários ou indicador de carregamento
          const tabelaUsuarios = document.querySelector('table, .user-list, .users-table');
          const indicadorCarregamento = document.querySelector('.loading, .spinner, [data-loading]');
          const mensagemVazia = document.querySelector('.empty, .no-users, .no-data');
          
          if (!tabelaUsuarios && !indicadorCarregamento && !mensagemVazia) {
            erros.push('Interface de usuários pode não ter renderizado corretamente');
          }
          
          return erros;
        });
        
        if (erroMapeamento.length === 0) {
          this.sucessos.push('✅ Gerenciamento de usuários carregou sem erros');
        } else {
          this.errosEncontrados.push(...erroMapeamento);
        }
        
      } else {
        this.avisos.push('⚠️ Link para gerenciamento de usuários não encontrado');
      }
      
    } catch (error) {
      this.errosEncontrados.push(`Erro ao testar gerenciamento de usuários: ${error.message}`);
    }
  }

  async testarNotificacoes() {
    console.log('\n🔔 Testando sistema de notificações...');
    
    try {
      // Procura sino de notificações
      const sinoNotificacoes = await this.page.$('button[aria-label*="notif"], .notification-bell, .bell-icon');
      
      if (sinoNotificacoes) {
        await sinoNotificacoes.click();
        await this.page.waitForTimeout(1000);
        
        // Verifica se dropdown de notificações abriu
        const dropdownAberto = await this.page.evaluate(() => {
          return document.querySelector('.dropdown-content, .notifications-dropdown, [role="menu"]') !== null;
        });
        
        if (dropdownAberto) {
          this.sucessos.push('✅ Sistema de notificações funcionando');
        } else {
          this.avisos.push('⚠️ Dropdown de notificações pode não ter aberto');
        }
        
      } else {
        this.avisos.push('⚠️ Sino de notificações não encontrado');
      }
      
    } catch (error) {
      this.errosEncontrados.push(`Erro ao testar notificações: ${error.message}`);
    }
  }

  async testarResponsividade() {
    console.log('\n📱 Testando responsividade...');
    
    const viewports = [
      { width: 375, height: 667, nome: 'Mobile' },
      { width: 768, height: 1024, nome: 'Tablet' },
      { width: 1920, height: 1080, nome: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      try {
        await this.page.setViewport(viewport);
        await this.page.waitForTimeout(1000);
        
        // Verifica se há elementos quebrados
        const elementosQuebrados = await this.page.evaluate(() => {
          const erros = [];
          
          // Verifica overflow horizontal
          if (document.body.scrollWidth > window.innerWidth) {
            erros.push('Overflow horizontal detectado');
          }
          
          // Verifica elementos cortados
          const elementosVisiveis = document.querySelectorAll('*:not(script):not(style)');
          let elementosCortados = 0;
          
          elementosVisiveis.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth && rect.left < window.innerWidth) {
              elementosCortados++;
            }
          });
          
          if (elementosCortados > 5) { // Tolerância para elementos pequenos
            erros.push(`${elementosCortados} elementos podem estar cortados`);
          }
          
          return erros;
        });
        
        if (elementosQuebrados.length === 0) {
          this.sucessos.push(`✅ Layout responsivo funcionando em ${viewport.nome}`);
        } else {
          this.avisos.push(`⚠️ Problemas de layout em ${viewport.nome}: ${elementosQuebrados.join(', ')}`);
        }
        
      } catch (error) {
        this.errosEncontrados.push(`Erro ao testar ${viewport.nome}: ${error.message}`);
      }
    }
  }

  async gerarRelatorio() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO DE TESTE DE USO REAL');
    console.log('='.repeat(50));
    
    console.log(`\n✅ SUCESSOS (${this.sucessos.length}):`);
    this.sucessos.forEach(sucesso => console.log(`  ${sucesso}`));
    
    console.log(`\n⚠️ AVISOS (${this.avisos.length}):`);
    this.avisos.forEach(aviso => console.log(`  ${aviso}`));
    
    console.log(`\n❌ ERROS ENCONTRADOS (${this.errosEncontrados.length}):`);
    this.errosEncontrados.forEach(erro => console.log(`  ${erro}`));
    
    const pontuacao = Math.max(0, 100 - (this.errosEncontrados.length * 15) - (this.avisos.length * 5));
    
    console.log('\n' + '='.repeat(50));
    console.log(`🎯 PONTUAÇÃO: ${pontuacao}/100`);
    
    const status = pontuacao >= 80 ? 'EXCELENTE' :
                   pontuacao >= 60 ? 'BOM' :
                   pontuacao >= 40 ? 'REGULAR' : 'CRÍTICO';
    
    console.log(`📈 STATUS: ${status}`);
    
    if (this.errosEncontrados.length > 0) {
      console.log('\n🔧 AÇÕES RECOMENDADAS:');
      console.log('  • Revisar os erros listados acima');
      console.log('  • Testar manualmente os fluxos problemáticos');
      console.log('  • Corrigir problemas de JavaScript e renderização');
    } else {
      console.log('\n🎉 APLICAÇÃO FUNCIONANDO CORRETAMENTE NO USO REAL!');
    }
    
    console.log('='.repeat(50));
    
    // Salva relatório detalhado
    const relatorioDetalhado = {
      timestamp: new Date().toISOString(),
      pontuacao,
      status,
      sucessos: this.sucessos,
      avisos: this.avisos,
      erros: this.errosEncontrados
    };
    
    await fs.writeFile(
      'reports/teste-uso-real.json',
      JSON.stringify(relatorioDetalhado, null, 2)
    ).catch(() => {}); // Ignora erro se pasta não existir
  }

  async fecharBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Execução do teste
const testador = new TestadorUsoReal();
testador.iniciarTeste().catch(console.error);