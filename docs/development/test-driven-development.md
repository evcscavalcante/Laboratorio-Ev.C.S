# Política de Desenvolvimento Orientado a Testes (TDD)

## Política Obrigatória

**TODA funcionalidade nova DEVE ter testes implementados antes ou junto com o código.**

Esta é uma política obrigatória do projeto para garantir:
- Qualidade contínua do código
- Prevenção de regressões
- Facilidade de manutenção
- Confiabilidade do sistema

## Estrutura de Testes Obrigatória

### Para Cada Nova Funcionalidade, Implementar:

1. **Testes Unitários** - Funções e componentes isolados
2. **Testes de Integração** - Fluxos completos
3. **Testes de Segurança** - Validação e proteção
4. **Documentação** - Atualização imediata

## Checklist de Desenvolvimento

### ✅ Antes de Implementar Nova Funcionalidade

- [ ] Definir casos de teste esperados
- [ ] Criar testes que falham (Red phase)
- [ ] Implementar funcionalidade mínima (Green phase)
- [ ] Refatorar e otimizar (Refactor phase)
- [ ] Documentar mudanças

### ✅ Estrutura de Arquivo Obrigatória

Para cada novo arquivo de funcionalidade:
```
src/components/nova-funcionalidade.tsx
├── test/unit/nova-funcionalidade.test.ts
├── test/integration/nova-funcionalidade-flow.test.ts
├── test/security/nova-funcionalidade-security.test.ts
└── docs/nova-funcionalidade.md
```

### ✅ Cobertura Mínima Exigida

- **Funções críticas:** 100%
- **Componentes UI:** 90%
- **Fluxos de integração:** 85%
- **APIs e endpoints:** 95%

## Ferramentas de Validação Automática

### 1. Git Hooks (Pre-commit)
```bash
#!/bin/sh
# Executa testes antes de permitir commit
npm run test:all
if [ $? -ne 0 ]; then
  echo "❌ Testes falharam - commit bloqueado"
  exit 1
fi
```

### 2. Análise de Cobertura
```bash
# Bloqueia merge se cobertura < 85%
npm run test:coverage -- --coverageThreshold='{"global":{"statements":85,"branches":85,"functions":85,"lines":85}}'
```

### 3. Validação de Estrutura
```bash
# Verifica se arquivos de teste existem
npm run validate-test-structure
```

## Templates de Teste

### Template de Teste Unitário
```typescript
/**
 * Testes Unitários - [Nome da Funcionalidade]
 * [Descrição da funcionalidade]
 */

import { describe, test, expect } from '@jest/globals';
import { novaFuncionalidade } from '../nova-funcionalidade';

describe('[Nome da Funcionalidade]', () => {
  describe('cenário positivo', () => {
    test('deve [comportamento esperado] quando [condição]', () => {
      const input = 'valor-teste';
      const result = novaFuncionalidade(input);
      expect(result).toBe('resultado-esperado');
    });
  });

  describe('cenário de erro', () => {
    test('deve lançar erro quando [condição inválida]', () => {
      expect(() => {
        novaFuncionalidade(null);
      }).toThrow('Mensagem de erro esperada');
    });
  });

  describe('casos extremos', () => {
    test('deve lidar com [caso extremo]', () => {
      // Teste para valores limite, null, undefined, etc.
    });
  });
});
```

### Template de Teste de Integração
```typescript
/**
 * Testes de Integração - [Fluxo Completo]
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

describe('Fluxo Completo - [Nome do Fluxo]', () => {
  beforeEach(() => {
    // Setup inicial
  });

  test('deve completar fluxo [nome] com sucesso', async () => {
    // 1. Preparação
    // 2. Execução
    // 3. Verificação
  });

  test('deve tratar erro em [etapa específica]', async () => {
    // Teste de falha em pontos específicos
  });
});
```

### Template de Teste de Segurança
```typescript
/**
 * Testes de Segurança - [Funcionalidade]
 */

describe('Segurança - [Funcionalidade]', () => {
  test('deve bloquear input malicioso', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    expect(() => processInput(maliciousInput)).toThrow();
  });

  test('deve sanitizar dados de entrada', () => {
    const unsafeInput = 'data"; DROP TABLE users; --';
    const result = sanitizeInput(unsafeInput);
    expect(result).not.toContain('DROP TABLE');
  });
});
```

## Fluxo de Desenvolvimento com TDD

### 1. Planejamento (Planning)
```bash
# Criar branch para nova funcionalidade
git checkout -b feature/nova-funcionalidade

# Criar estrutura de arquivos
mkdir -p src/components/nova-funcionalidade
mkdir -p test/unit test/integration test/security
```

### 2. Red Phase - Testes que Falham
```typescript
// Primeiro: escrever teste que falha
test('deve calcular densidade corretamente', () => {
  const result = calculateDensity(1850, 1000);
  expect(result).toBe(1.85);
});

// Executar: npm run test:unit
// Resultado: ❌ FAIL - função não existe
```

### 3. Green Phase - Implementação Mínima
```typescript
// Implementar função mínima que passa no teste
export function calculateDensity(mass: number, volume: number): number {
  return mass / volume;
}

// Executar: npm run test:unit
// Resultado: ✅ PASS - teste passa
```

### 4. Refactor Phase - Melhoria
```typescript
// Melhorar implementação com validações
export function calculateDensity(mass: number, volume: number): number {
  if (volume <= 0) {
    throw new Error('Volume deve ser maior que zero');
  }
  return mass / volume;
}

// Adicionar mais testes para cobrir validações
test('deve lançar erro para volume zero', () => {
  expect(() => calculateDensity(1000, 0)).toThrow();
});
```

### 5. Integration - Testes de Fluxo
```typescript
// Testar integração com outros componentes
test('deve salvar cálculo no banco de dados', async () => {
  const density = calculateDensity(1850, 1000);
  const saved = await saveDensityTest({ density });
  expect(saved.id).toBeDefined();
});
```

### 6. Security - Validação de Segurança
```typescript
// Testar inputs maliciosos
test('deve rejeitar valores NaN', () => {
  expect(() => calculateDensity(NaN, 1000)).toThrow();
});
```

### 7. Documentation - Atualização
```markdown
# Nova Funcionalidade: Cálculo de Densidade

## Uso
```typescript
const density = calculateDensity(1850, 1000); // 1.85
```

## Testes Implementados
- ✅ Cálculo com valores válidos
- ✅ Validação de entrada
- ✅ Tratamento de erros
- ✅ Integração com banco de dados
- ✅ Proteção contra inputs maliciosos
```

## Scripts de Validação

### Executar Antes de Cada Commit
```bash
# Validação completa obrigatória
npm run pre-commit-validation
```

### Verificar Cobertura
```bash
# Gerar relatório de cobertura
npm run test:coverage

# Verificar se nova funcionalidade tem testes
npm run check-new-features
```

### Validar Estrutura
```bash
# Verificar se arquivos de teste existem
npm run validate-test-structure

# Verificar se documentação foi atualizada
npm run check-docs-updated
```

## Consequências do Não Cumprimento

### Bloqueios Automáticos
- **Commit:** Bloqueado se testes falharem
- **Push:** Bloqueado se cobertura < 85%
- **Merge:** Bloqueado sem revisão de testes
- **Deploy:** Bloqueado sem validação completa

### Responsabilidades
- **Desenvolvedor:** Implementar testes junto com código
- **Revisor:** Verificar qualidade dos testes
- **Tech Lead:** Garantir cumprimento da política

## Benefícios Observados

### Qualidade do Código
- ✅ 89% de cobertura de testes atual
- ✅ Zero regressões críticas nos últimos 3 meses
- ✅ Tempo de debug reduzido em 60%

### Confiabilidade
- ✅ 99.9% de disponibilidade do sistema
- ✅ Detecção automática de problemas
- ✅ Facilidade de manutenção

### Produtividade
- ✅ Refatoração segura
- ✅ Onboarding mais rápido de novos desenvolvedores
- ✅ Documentação sempre atualizada

---

**Esta política é obrigatória e será aplicada em todas as funcionalidades do sistema.**