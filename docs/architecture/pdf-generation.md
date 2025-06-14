# Geração de PDF - Arquitetura

## Visão Geral

O sistema de geração de PDF utiliza a biblioteca `@react-pdf/renderer` para criar relatórios técnicos padronizados conforme as normas brasileiras NBR para ensaios geotécnicos.

## Componentes Principais

### 1. PDF Vertical Tables (`client/src/lib/pdf-vertical-tables.tsx`)

Utilitário principal para geração de relatórios com layout vertical otimizado para economia de espaço.

#### Funcionalidades:
- **Densidade In-Situ**: Relatórios conforme NBR 9813:2016
- **Densidade Real**: Relatórios conforme NBR 6508:1984  
- **Densidade Máx/Mín**: Relatórios conforme NBR 12004:1990

#### Estrutura do Relatório:
```
┌─────────────────────────────────┐
│ Cabeçalho com Logo e Dados      │
├─────────────────────────────────┤
│ Informações do Ensaio           │
├─────────────────────────────────┤
│ Tabelas de Determinações        │
├─────────────────────────────────┤
│ Resultados e Cálculos           │
├─────────────────────────────────┤
│ Assinaturas e Responsáveis      │
└─────────────────────────────────┘
```

## Implementação Técnica

### Formatação de Dados
- Arredondamento automático baseado na precisão dos equipamentos
- Validação de faixas de valores conforme normas técnicas
- Formatação de datas no padrão brasileiro (DD/MM/AAAA)

### Layout Responsivo
- Tabelas ajustam automaticamente o espaçamento
- Quebras de página controladas para evitar divisão de seções
- Fontes otimizadas para legibilidade em impressão

### Padrões de Qualidade
- Compliance com normas NBR vigentes
- Logotipo e identidade visual do laboratório
- Campos obrigatórios para rastreabilidade

## Uso

```typescript
import { generateDensityInSituPDF } from '@/lib/pdf-vertical-tables';

// Gerar PDF de densidade in-situ
const pdfBlob = await generateDensityInSituPDF(testData);

// Download automático
const url = URL.createObjectURL(pdfBlob);
const link = document.createElement('a');
link.href = url;
link.download = `densidade-in-situ-${testData.registrationNumber}.pdf`;
link.click();
```

## Manutenção

### Atualizações de Normas
Quando houver mudanças nas normas NBR, atualizar:
1. Layouts de tabelas
2. Fórmulas de cálculo
3. Campos obrigatórios
4. Formatação de resultados

### Performance
- PDFs são gerados no lado cliente para reduzir carga no servidor
- Cache de templates para melhor performance
- Compressão automática de imagens e logotipos

## Dependências

- `@react-pdf/renderer`: ^3.x.x
- `date-fns`: Para formatação de datas
- Tipos TypeScript customizados para dados de ensaios