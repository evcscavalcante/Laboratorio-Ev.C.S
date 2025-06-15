# Testes Automatizados para Futuras Implementações

## Visão Geral

Sistema completo de testes automatizados criado para validar funcionalidades de salvamento e geração de PDFs antes de implementar novas funcionalidades.

## Scripts de Teste Disponíveis

### 1. Teste de Salvamento de Ensaios
**Arquivo:** `scripts/test-ensaios-salvamento.js`

Valida o salvamento nos três tipos de ensaios:
- **Densidade In-Situ** (NBR 9813:2021)
- **Densidade Real** (NBR 17212:2025) 
- **Densidade Máx/Mín** (NBR 12004/12051:2021)

**Execução:**
```bash
node scripts/test-ensaios-salvamento.js
```

**Validações:**
- Campos obrigatórios do cabeçalho técnico
- Dados específicos de cada tipo de ensaio
- Resposta da API (status 200/400/500)
- Estrutura de dados retornados

### 2. Teste de Geração de PDFs
**Arquivo:** `scripts/test-pdf-generation.js`

Valida a capacidade de gerar relatórios PDF:
- Busca ensaios existentes no banco
- Verifica campos obrigatórios para PDF
- Valida completude dos dados técnicos
- Confirma disponibilidade de dados para relatório

**Execução:**
```bash
node scripts/test-pdf-generation.js
```

**Validações:**
- Presença de ensaios no banco de dados
- Campos técnicos obrigatórios preenchidos
- Dados de cálculo disponíveis
- Estrutura de dados para PDF

### 3. Suíte Completa de Testes
**Arquivo:** `scripts/test-suite-completa.js`

Executa todos os testes de forma integrada:
- Testes de salvamento sequenciais
- Testes de PDF após salvamento
- Relatório consolidado final
- Exit codes para CI/CD

**Execução:**
```bash
node scripts/test-suite-completa.js
```

## Comandos Rápidos

```bash
# Testar apenas salvamento
node scripts/test-ensaios-salvamento.js

# Testar apenas PDFs  
node scripts/test-pdf-generation.js

# Executar suíte completa
node scripts/test-suite-completa.js
```

## Interpretação de Resultados

### Status dos Testes
- **✅ APROVADO**: Funcionalidade operacional
- **⚠️ ATENÇÃO**: Dados incompletos mas funcionais
- **❌ FALHOU**: Erro crítico encontrado

### Exit Codes
- **0**: Todos os testes aprovados
- **1**: Pelo menos um teste falhou

### Campos Validados

#### Densidade In-Situ
- Dados do cabeçalho técnico (operador, responsável, verificador)
- Identificação do cilindro e medições
- Dados de umidade (TOPO e BASE)
- Massas e volumes para cálculos

#### Densidade Real  
- Identificação do picnômetro
- Massas (picnômetro, solo, água)
- Temperatura de ensaio
- Segunda determinação (validação)

#### Densidade Máx/Mín
- Massa específica real dos grãos
- Dados de densidade máxima (2 determinações)
- Dados de densidade mínima (2 determinações)
- Identificação dos moldes

## Uso em Desenvolvimento

### Antes de Implementar Nova Funcionalidade
1. Execute a suíte completa: `node scripts/test-suite-completa.js`
2. Verifique se todos os testes passam
3. Implemente a nova funcionalidade
4. Execute os testes novamente
5. Corrija qualquer regressão detectada

### Integração com CI/CD
Os scripts retornam exit codes apropriados para automação:

```yaml
# Exemplo GitHub Actions
- name: Test Ensaios Functionality
  run: node scripts/test-suite-completa.js
```

## Dados de Teste

Os scripts utilizam dados realistas seguindo padrões técnicos:
- Valores dentro de faixas esperadas para ensaios geotécnicos
- Nomenclatura conforme normas ABNT
- Estrutura de dados compatível com o sistema

## Manutenção

### Atualizar Testes
- Modificar dados de teste conforme mudanças no schema
- Adicionar validações para novos campos obrigatórios
- Ajustar endpoints conforme evolução da API

### Adicionar Novos Tipos de Ensaio
1. Criar método específico em `test-ensaios-salvamento.js`
2. Adicionar validação de PDF em `test-pdf-generation.js`
3. Incluir no relatório da suíte completa
4. Documentar campos obrigatórios

## Benefícios

- **Prevenção de Regressões**: Detecta quebras antes do deploy
- **Validação Automática**: Confirma funcionalidades sem intervenção manual
- **Documentação Viva**: Serve como especificação dos requisitos
- **Confiança em Mudanças**: Permite refatoração segura
- **Integração Contínua**: Suporte completo para pipelines automatizados