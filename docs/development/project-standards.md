# Padrões de Desenvolvimento - Sistema Geotécnico

## Política de Qualidade Obrigatória

**TODA funcionalidade nova DEVE seguir os padrões estabelecidos e ter testes implementados.**

## Estrutura de Desenvolvimento

### 1. Test-Driven Development (TDD)
- **Red Phase:** Escrever teste que falha
- **Green Phase:** Implementar código mínimo que passa
- **Refactor Phase:** Melhorar e otimizar código
- **Documentation:** Atualizar documentação

### 2. Estrutura de Arquivos Obrigatória

```
src/nova-funcionalidade/
├── index.ts                    # Funcionalidade principal
├── types.ts                    # Tipos TypeScript
├── utils.ts                    # Utilitários específicos
└── __tests__/
    ├── unit.test.ts            # Testes unitários
    ├── integration.test.ts     # Testes de integração
    ├── security.test.ts        # Testes de segurança
    └── performance.test.ts     # Testes de performance
```

### 3. Padrões de Nomenclatura

#### Arquivos
- **Componentes:** `PascalCase.tsx` (ex: `DensityCalculator.tsx`)
- **Utilitários:** `kebab-case.ts` (ex: `calculation-utils.ts`)
- **Testes:** `nome.test.ts` (ex: `density-calculator.test.ts`)
- **Tipos:** `types.ts` ou `nome.types.ts`

#### Funções e Variáveis
- **Funções:** `camelCase` (ex: `calculateDensity`)
- **Constantes:** `UPPER_SNAKE_CASE` (ex: `MAX_DENSITY_VALUE`)
- **Interfaces:** `PascalCase` com `I` (ex: `IDensityTest`)
- **Types:** `PascalCase` (ex: `DensityResult`)

#### Componentes React
- **Props:** `ComponentNameProps` (ex: `DensityCalculatorProps`)
- **State:** Usar hooks com prefixo descritivo (ex: `useDensityCalculation`)

### 4. Padrões de Código

#### TypeScript Obrigatório
```typescript
// ✅ Correto - Tipagem explícita
interface DensityTestData {
  soilMass: number;
  volume: number;
  operator: string;
  date: Date;
}

function calculateDensity(data: DensityTestData): number {
  if (data.volume <= 0) {
    throw new Error('Volume deve ser maior que zero');
  }
  return data.soilMass / data.volume;
}

// ❌ Incorreto - Sem tipagem
function calculateDensity(mass, volume) {
  return mass / volume;
}
```

#### Validação de Entrada
```typescript
// ✅ Correto - Validação robusta
function processTestData(input: unknown): DensityTestData {
  const schema = z.object({
    soilMass: z.number().positive(),
    volume: z.number().positive(),
    operator: z.string().min(1),
    date: z.date()
  });
  
  return schema.parse(input);
}

// ❌ Incorreto - Sem validação
function processTestData(input: any) {
  return input;
}
```

#### Tratamento de Erros
```typescript
// ✅ Correto - Errors específicos
class DensityCalculationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DensityCalculationError';
  }
}

function calculateDensity(mass: number, volume: number): number {
  if (volume <= 0) {
    throw new DensityCalculationError(
      'Volume deve ser maior que zero',
      'INVALID_VOLUME'
    );
  }
  return mass / volume;
}

// ❌ Incorreto - Erro genérico
function calculateDensity(mass: number, volume: number): number {
  if (volume <= 0) {
    throw new Error('Erro');
  }
  return mass / volume;
}
```

### 5. Padrões de Testes

#### Testes Unitários
```typescript
describe('calculateDensity', () => {
  test('calcula densidade corretamente com valores válidos', () => {
    const result = calculateDensity(1850, 1000);
    expect(result).toBe(1.85);
  });

  test('lança erro para volume zero', () => {
    expect(() => calculateDensity(1850, 0))
      .toThrow(DensityCalculationError);
  });

  test('lança erro para volume negativo', () => {
    expect(() => calculateDensity(1850, -100))
      .toThrow('Volume deve ser maior que zero');
  });
});
```

#### Testes de Integração
```typescript
describe('Fluxo Completo - Ensaio de Densidade', () => {
  test('deve salvar ensaio e gerar PDF', async () => {
    // Preparação
    const testData = createValidTestData();
    
    // Execução
    const savedTest = await saveTest(testData);
    const pdfResult = await generatePDF(savedTest);
    
    // Verificação
    expect(savedTest.id).toBeDefined();
    expect(pdfResult.success).toBe(true);
  });
});
```

#### Testes de Segurança
```typescript
describe('Segurança - Input Validation', () => {
  test('bloqueia SQL injection', () => {
    const maliciousInput = "'; DROP TABLE tests; --";
    expect(() => processInput(maliciousInput))
      .toThrow('Input inválido detectado');
  });

  test('sanitiza XSS', () => {
    const xssInput = '<script>alert("xss")</script>';
    const result = sanitizeInput(xssInput);
    expect(result).not.toContain('<script>');
  });
});
```

### 6. Documentação Obrigatória

#### JSDoc para Funções Públicas
```typescript
/**
 * Calcula a densidade aparente do solo conforme NBR 9813:2021
 * 
 * @param soilMass - Massa do solo em gramas
 * @param volume - Volume do cilindro em cm³
 * @returns Densidade aparente em g/cm³
 * @throws {DensityCalculationError} Quando volume é inválido
 * 
 * @example
 * ```typescript
 * const density = calculateDensity(1850, 1000);
 * console.log(density); // 1.85
 * ```
 */
function calculateDensity(soilMass: number, volume: number): number {
  // implementação
}
```

#### README para Módulos
```markdown
# Módulo de Cálculo de Densidade

## Objetivo
Implementa cálculos de densidade conforme normas NBR para ensaios geotécnicos.

## Uso
```typescript
import { calculateDensity } from './density-calculator';

const result = calculateDensity(1850, 1000);
```

## Testes
- ✅ Testes unitários (100% cobertura)
- ✅ Testes de integração
- ✅ Testes de segurança
- ✅ Validação NBR 9813:2021
```

### 7. Ferramentas de Validação

#### Scripts Obrigatórios
```bash
# Validar antes de commit
npm run pre-commit

# Verificar cobertura de testes
npm run validate-tests

# Análise de padrões
npm run analyze-standards

# Verificar regressões
npm run check-regressions
```

#### Git Hooks Automáticos
```bash
# Configurar hooks obrigatórios
npm run setup-hooks
```

### 8. Critérios de Qualidade

#### Cobertura de Testes Mínima
- **Funções críticas:** 100%
- **Componentes UI:** 90%
- **Fluxos de integração:** 85%
- **APIs:** 95%

#### Performance Obrigatória
- **Tempo de resposta:** < 500ms para operações normais
- **Cálculos:** < 50ms para funções matemáticas
- **Carregamento:** < 1s para interfaces

#### Segurança Obrigatória
- **Validação de entrada:** 100% dos inputs
- **Sanitização:** Para todos os dados de usuário
- **Rate limiting:** Em todas as APIs
- **Logs:** Para ações críticas

### 9. Revisão de Código

#### Checklist Obrigatório
- [ ] Testes implementados e passando
- [ ] Documentação atualizada
- [ ] Tipagem TypeScript completa
- [ ] Validação de segurança
- [ ] Performance verificada
- [ ] Padrões de nomenclatura seguidos
- [ ] Sem TODO ou FIXME no código final

#### Aprovação Necessária
- **Funcionalidades críticas:** 2 aprovações
- **Funcionalidades normais:** 1 aprovação
- **Correções de bug:** 1 aprovação

### 10. Consequências

#### Bloqueios Automáticos
- **Commit:** Bloqueado se validações falharem
- **Merge:** Bloqueado sem testes obrigatórios
- **Deploy:** Bloqueado com cobertura < 85%

#### Responsabilidades
- **Desenvolvedor:** Seguir padrões e implementar testes
- **Revisor:** Verificar qualidade e padrões
- **Tech Lead:** Garantir cumprimento das políticas

---

**Estes padrões são obrigatórios e aplicados automaticamente através de ferramentas de validação.**