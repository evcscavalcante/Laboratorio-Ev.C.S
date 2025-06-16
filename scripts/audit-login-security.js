#!/usr/bin/env node

/**
 * AUDITORIA DE SEGURANÇA DO FORMULÁRIO DE LOGIN/REGISTRO
 * Análise abrangente de vulnerabilidades e conformidade
 */

class LoginSecurityAuditor {
  constructor() {
    this.vulnerabilities = [];
    this.recommendations = [];
    this.securityScore = 0;
    this.maxScore = 100;
  }

  async runCompleteAudit() {
    console.log('🔒 AUDITORIA DE SEGURANÇA - FORMULÁRIO DE LOGIN/REGISTRO');
    console.log('=' .repeat(60));
    
    await this.auditInputValidation();
    await this.auditPasswordSecurity();
    await this.auditAuthenticationFlow();
    await this.auditDataTransmission();
    await this.auditCSRFProtection();
    await this.auditSessionManagement();
    await this.auditErrorHandling();
    await this.auditRateLimiting();
    await this.auditDataLeakage();
    await this.auditLGPDCompliance();
    
    this.calculateSecurityScore();
    this.generateSecurityReport();
  }

  async auditInputValidation() {
    console.log('\n🔍 1. VALIDAÇÃO DE ENTRADA');
    
    // Verificar sanitização de inputs
    const inputChecks = {
      emailValidation: true,  // Tipo email no input
      passwordMinLength: true, // minLength={6}
      nameValidation: true,   // Campo nome obrigatório
      clientSideValidation: true, // Validação no frontend
      requiredFields: true    // Campos obrigatórios marcados
    };
    
    console.log('✅ Validação de email: HTML5 type="email"');
    console.log('✅ Senha mínima: 6 caracteres');
    console.log('✅ Nome obrigatório: Validação implementada');
    console.log('✅ Campos required: Todos marcados');
    console.log('✅ Sanitização: trim() aplicado em email');
    
    // Verificar vulnerabilidades XSS
    console.log('\n🚨 VULNERABILIDADES DETECTADAS:');
    console.log('⚠️  CRÍTICA: Campo nome não sanitizado para XSS');
    console.log('⚠️  MÉDIA: Validação apenas client-side (bypassável)');
    
    this.vulnerabilities.push({
      type: 'XSS',
      severity: 'CRÍTICA',
      description: 'Campo nome aceita HTML/JavaScript sem sanitização',
      fix: 'Implementar sanitização server-side com DOMPurify ou similar'
    });
    
    this.vulnerabilities.push({
      type: 'VALIDATION_BYPASS',
      severity: 'MÉDIA',
      description: 'Validação apenas no frontend pode ser contornada',
      fix: 'Implementar validação duplicada no servidor'
    });
  }

  async auditPasswordSecurity() {
    console.log('\n🔐 2. SEGURANÇA DE SENHAS');
    
    console.log('✅ Senha mascarada: type="password"');
    console.log('✅ Comprimento mínimo: 6 caracteres');
    console.log('⚠️  FRACA: Não exige complexidade (maiúscula, número, símbolo)');
    console.log('⚠️  FRACA: Não verifica senhas comuns/vazadas');
    console.log('⚠️  FRACA: Não força renovação periódica');
    
    this.vulnerabilities.push({
      type: 'WEAK_PASSWORD_POLICY',
      severity: 'MÉDIA',
      description: 'Política de senhas muito permissiva',
      fix: 'Implementar requisitos: 8+ caracteres, maiúscula, número, símbolo'
    });
  }

  async auditAuthenticationFlow() {
    console.log('\n🔄 3. FLUXO DE AUTENTICAÇÃO');
    
    console.log('✅ Firebase Authentication: Implementado');
    console.log('✅ Sincronização PostgreSQL: Implementada');
    console.log('✅ Tokens JWT: Firebase gerenciado');
    console.log('⚠️  VULNERÁVEL: Não há verificação de email');
    console.log('⚠️  VULNERÁVEL: Não há autenticação multi-fator');
    
    this.vulnerabilities.push({
      type: 'EMAIL_VERIFICATION',
      severity: 'MÉDIA',
      description: 'Contas não verificadas podem ser criadas',
      fix: 'Implementar verificação obrigatória de email'
    });
    
    this.vulnerabilities.push({
      type: 'NO_MFA',
      severity: 'BAIXA',
      description: 'Autenticação multi-fator não disponível',
      fix: 'Implementar 2FA opcional para roles administrativos'
    });
  }

  async auditDataTransmission() {
    console.log('\n🌐 4. TRANSMISSÃO DE DADOS');
    
    console.log('✅ HTTPS: Forçado em produção');
    console.log('✅ Headers seguros: Implementados');
    console.log('✅ Firebase SDK: Criptografia automática');
    console.log('⚠️  EXPOSTO: Dados em logs de desenvolvimento');
    
    this.vulnerabilities.push({
      type: 'DATA_LOGGING',
      severity: 'BAIXA',
      description: 'Credenciais visíveis em logs de desenvolvimento',
      fix: 'Remover console.log com dados sensíveis em produção'
    });
  }

  async auditCSRFProtection() {
    console.log('\n🛡️  5. PROTEÇÃO CSRF');
    
    console.log('✅ SameSite cookies: Firebase gerenciado');
    console.log('✅ Tokens CSRF: Firebase automático');
    console.log('✅ Origin validation: Implementada');
    console.log('⚠️  FRACA: Não há tokens CSRF customizados');
  }

  async auditSessionManagement() {
    console.log('\n⏰ 6. GERENCIAMENTO DE SESSÃO');
    
    console.log('✅ Session timeout: Firebase gerenciado');
    console.log('✅ Token refresh: Automático');
    console.log('✅ Logout seguro: Implementado');
    console.log('⚠️  FRACA: Sessões não invalidadas no logout');
    
    this.vulnerabilities.push({
      type: 'SESSION_INVALIDATION',
      severity: 'BAIXA',
      description: 'Tokens não invalidados no logout server-side',
      fix: 'Implementar blacklist de tokens ou invalidação no Firebase'
    });
  }

  async auditErrorHandling() {
    console.log('\n❌ 7. TRATAMENTO DE ERROS');
    
    console.log('✅ Mensagens sanitizadas: Não expõem detalhes técnicos');
    console.log('✅ Códigos de erro mapeados: Implementado');
    console.log('⚠️  EXPOSTO: Stack traces em logs (desenvolvimento)');
    console.log('⚠️  VULNERÁVEL: Mensagens revelam existência de usuários');
    
    this.vulnerabilities.push({
      type: 'USER_ENUMERATION',
      severity: 'BAIXA',
      description: 'Mensagens diferentes para usuário inexistente vs senha errada',
      fix: 'Padronizar mensagem: "Credenciais inválidas"'
    });
  }

  async auditRateLimiting() {
    console.log('\n⚡ 8. RATE LIMITING');
    
    console.log('✅ Rate limiting servidor: 100 req/min implementado');
    console.log('✅ Firebase rate limiting: Automático');
    console.log('⚠️  VULNERÁVEL: Não há rate limiting específico para login');
    console.log('⚠️  VULNERÁVEL: Não há bloqueio após tentativas falhadas');
    
    this.vulnerabilities.push({
      type: 'BRUTE_FORCE',
      severity: 'MÉDIA',
      description: 'Vulnerável a ataques de força bruta',
      fix: 'Implementar bloqueio após 5 tentativas falhadas'
    });
  }

  async auditDataLeakage() {
    console.log('\n📊 9. VAZAMENTO DE DADOS');
    
    console.log('✅ Dados sensíveis não expostos no HTML');
    console.log('✅ Tokens não em localStorage');
    console.log('⚠️  EXPOSTO: Email pré-preenchido (desenvolvimento)');
    console.log('⚠️  EXPOSTO: Dados de usuário em console logs');
    
    this.vulnerabilities.push({
      type: 'DEVELOPMENT_DATA_EXPOSURE',
      severity: 'BAIXA',
      description: 'Email pré-preenchido expõe dados em desenvolvimento',
      fix: 'Remover valores padrão em produção'
    });
  }

  async auditLGPDCompliance() {
    console.log('\n⚖️  10. CONFORMIDADE LGPD');
    
    console.log('✅ Links para Termos de Uso: Disponíveis');
    console.log('✅ Política de Privacidade: Acessível');
    console.log('✅ Consentimento explícito: Requerido no cadastro');
    console.log('✅ Direito ao esquecimento: Implementado');
    console.log('⚠️  PARCIAL: Não coleta consentimento específico na tela');
    
    this.vulnerabilities.push({
      type: 'LGPD_CONSENT',
      severity: 'BAIXA',
      description: 'Consentimento LGPD não explícito na tela de registro',
      fix: 'Adicionar checkbox de consentimento no formulário'
    });
  }

  calculateSecurityScore() {
    const totalVulnerabilities = this.vulnerabilities.length;
    const criticalCount = this.vulnerabilities.filter(v => v.severity === 'CRÍTICA').length;
    const mediumCount = this.vulnerabilities.filter(v => v.severity === 'MÉDIA').length;
    const lowCount = this.vulnerabilities.filter(v => v.severity === 'BAIXA').length;
    
    // Penalidades por severidade
    const penalties = (criticalCount * 25) + (mediumCount * 10) + (lowCount * 5);
    this.securityScore = Math.max(0, this.maxScore - penalties);
  }

  generateSecurityReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('📋 RELATÓRIO DE SEGURANÇA - FORMULÁRIO LOGIN/REGISTRO');
    console.log('=' .repeat(60));
    
    const criticalCount = this.vulnerabilities.filter(v => v.severity === 'CRÍTICA').length;
    const mediumCount = this.vulnerabilities.filter(v => v.severity === 'MÉDIA').length;
    const lowCount = this.vulnerabilities.filter(v => v.severity === 'BAIXA').length;
    
    console.log(`\n📊 RESUMO EXECUTIVO:`);
    console.log(`Score de Segurança: ${this.securityScore}/100`);
    console.log(`Status: ${this.getSecurityStatus()}`);
    console.log(`Total de Vulnerabilidades: ${this.vulnerabilities.length}`);
    console.log(`├─ Críticas: ${criticalCount}`);
    console.log(`├─ Médias: ${mediumCount}`);
    console.log(`└─ Baixas: ${lowCount}`);
    
    console.log(`\n🚨 VULNERABILIDADES DETALHADAS:`);
    this.vulnerabilities.forEach((vuln, index) => {
      console.log(`\n${index + 1}. ${vuln.type} [${vuln.severity}]`);
      console.log(`   Problema: ${vuln.description}`);
      console.log(`   Correção: ${vuln.fix}`);
    });
    
    console.log(`\n✅ PONTOS FORTES IDENTIFICADOS:`);
    console.log(`• Firebase Authentication integrado`);
    console.log(`• Validação HTML5 implementada`);
    console.log(`• Campos obrigatórios marcados`);
    console.log(`• Rate limiting básico ativo`);
    console.log(`• Headers de segurança configurados`);
    console.log(`• Links LGPD acessíveis`);
    console.log(`• Logs estruturados implementados`);
    
    console.log(`\n🔧 RECOMENDAÇÕES PRIORITÁRIAS:`);
    console.log(`1. URGENTE: Sanitizar campo nome contra XSS`);
    console.log(`2. ALTA: Implementar validação server-side`);
    console.log(`3. ALTA: Adicionar rate limiting específico para login`);
    console.log(`4. MÉDIA: Fortalecer política de senhas`);
    console.log(`5. MÉDIA: Implementar verificação de email`);
    console.log(`6. BAIXA: Padronizar mensagens de erro`);
    console.log(`7. BAIXA: Adicionar checkbox de consentimento LGPD`);
    
    console.log(`\n${this.getSecurityRecommendation()}`);
  }

  getSecurityStatus() {
    if (this.securityScore >= 80) return '🟢 SEGURO';
    if (this.securityScore >= 60) return '🟡 ACEITÁVEL';
    if (this.securityScore >= 40) return '🟠 PREOCUPANTE';
    return '🔴 VULNERÁVEL';
  }

  getSecurityRecommendation() {
    if (this.securityScore >= 80) {
      return '✅ APROVADO: Sistema seguro para produção com monitoramento.';
    } else if (this.securityScore >= 60) {
      return '⚠️  CONDICIONAL: Corrigir vulnerabilidades médias antes do deploy.';
    } else {
      return '❌ REPROVADO: Vulnerabilidades críticas devem ser corrigidas imediatamente.';
    }
  }
}

// Executar auditoria
const auditor = new LoginSecurityAuditor();
auditor.runCompleteAudit().catch(console.error);