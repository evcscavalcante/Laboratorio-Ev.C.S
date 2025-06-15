# Guia Rápido - Sistema de Laboratório Geotécnico

## O que é este projeto?

Sistema web para laboratórios de geotecnia que calcula densidade de solos seguindo normas brasileiras (NBR). Inclui geração de relatórios PDF e gerenciamento de equipamentos.

## Principais Funcionalidades

- **Calculadoras de Densidade:** In-situ, Real, Máx/Mín
- **Relatórios PDF:** Geração automática seguindo padrões NBR
- **Gerenciamento:** Ensaios, equipamentos, usuários
- **Autenticação:** Firebase + PostgreSQL híbrido

## Como Rodar

```bash
npm run dev
```
Sistema estará em: http://localhost:5000

## Verificar se Tudo Funciona

```bash
node check-regressions.js
```

Se aparecer "🎉 VERIFICAÇÃO PASSOU" está tudo OK.

## Inovação Principal: Sistema Anti-Regressão

**Problema:** Ao adicionar funcionalidades novas, outras param de funcionar.

**Solução:** Sistema automático que detecta quando algo importante é removido ou quebrado.

### Como Funciona:
1. **Tempo Real:** Console mostra alertas durante desenvolvimento
2. **Verificação Manual:** Comando `node check-regressions.js`
3. **Componentes Críticos:** Sidebar, Dashboard, Autenticação são monitorados
4. **Features Obrigatórias:** Sistema verifica se botões/links essenciais existem

### Exemplo Prático:
Se alguém remover o botão "Dashboard" da sidebar:
- Console mostra alerta imediatamente
- Comando de verificação falha
- Deploy é bloqueado até correção

## Estrutura dos Arquivos

```
client/src/
├── components/         # Componentes React
├── pages/             # Páginas principais
├── lib/               # Configurações e utils
└── test/              # Testes

server/
├── index.ts           # Servidor principal
├── storage.ts         # Banco de dados
└── routes.ts          # API endpoints

docs/                  # Documentação
check-regressions.js   # Script de verificação
```

## Tecnologias Principais

- **Frontend:** React + TypeScript + Tailwind
- **Backend:** Express.js + PostgreSQL
- **Autenticação:** Firebase
- **Build:** Vite
- **Testes:** Jest

## Status Atual

- ✅ Sistema funcionando completamente
- ✅ 18 ensaios salvos detectados
- ✅ Autenticação operacional
- ✅ Sistema anti-regressão ativo
- ✅ Todas as calculadoras funcionais

## Para Desenvolvedores

1. Clone o repositório
2. Execute `npm run dev`
3. Acesse http://localhost:5000
4. Faça login com Firebase
5. Use as calculadoras na seção "Ensaios"
6. Antes de fazer deploy: `node check-regressions.js`

**Importante:** O sistema de prevenção de regressões elimina o problema comum de "consertar uma coisa e quebrar outra". Sempre verifique antes de publicar mudanças.