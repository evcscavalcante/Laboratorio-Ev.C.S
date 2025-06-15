# Padrões do Projeto - Sistema Geotécnico

## Análise Automática de Consistência

### Arquitetura Estabelecida
- **Frontend:** React + TypeScript + Tailwind CSS + Shadcn/UI
- **Backend:** Express.js + Drizzle ORM + PostgreSQL
- **Autenticação:** Firebase Authentication (híbrido)
- **Estado:** React Query para server state
- **Roteamento:** Wouter (client-side)

### Padrões de Código Obrigatórios

#### 1. Estrutura de Arquivos
```
client/src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── lib/           # Utilitários e configurações
├── hooks/         # Custom hooks
└── test/          # Testes automatizados

server/
├── auth-*.ts      # Módulos de autenticação
├── storage-*.ts   # Camada de dados
├── routes.ts      # Definições de rotas
└── index.ts       # Servidor principal
```

#### 2. Nomenclatura Técnica (NBR ABNT)
- **NBR 9813:2021** - Massa específica aparente in situ
- **NBR 17212:2025** - Massa específica dos sólidos
- **NBR 12004/12051:2021** - Índices de vazios máximo e mínimo

#### 3. Padrões de Implementação
- Sempre usar TypeScript com tipagem forte
- Componentes funcionais com hooks
- Validação com Zod schemas
- Error boundaries e tratamento robusto
- Responsividade mobile-first
- Acessibilidade (aria-labels, keyboard navigation)

#### 4. Dados e Persistência
- PostgreSQL como fonte única da verdade
- Drizzle ORM para queries tipadas
- React Query para cache e sincronização
- LocalStorage apenas para dados temporários
- Validação server-side obrigatória

#### 5. Autenticação
- Firebase Authentication para login
- PostgreSQL para roles e permissões
- Middleware de verificação em rotas protegidas
- Sincronização automática user Firebase ↔ PostgreSQL

### Sistema de Prevenção de Regressões

#### Componentes Críticos Protegidos
- `sidebar` v2.1.0 - Navegação principal
- `breadcrumb` v1.1.0 - Orientação de localização
- `dashboard` v2.0.0 - Painel estatístico
- `auth-system` v1.2.0 - Sistema de autenticação

#### Verificação Automática
- Script: `node check-regressions.js`
- Hooks de desenvolvimento ativos
- Testes de regressão em tempo real
- Alertas visuais quando regressões detectadas

### Regras de Modificação

#### ❌ Proibido Modificar
- `server/vite.ts` - Configuração crítica
- `vite.config.ts` - Build configuration
- `package.json` - Use packager tool
- `drizzle.config.ts` - Database config

#### ✅ Sempre Seguir
1. Analisar arquitetura existente antes de implementar
2. Manter consistência com padrões estabelecidos
3. Usar componentes Shadcn/UI quando disponíveis
4. Implementar validação client + server
5. Adicionar testes para novas funcionalidades
6. Documentar mudanças significativas

### Checklist Pré-Implementação

#### Antes de Qualquer Mudança
- [ ] Revisar arquitetura atual do módulo
- [ ] Verificar padrões de nomenclatura técnica
- [ ] Confirmar tipagem TypeScript adequada
- [ ] Validar consistência com sistema existente
- [ ] Executar verificação de regressões

#### Durante Implementação
- [ ] Seguir estrutura de arquivos estabelecida
- [ ] Usar componentes e hooks existentes
- [ ] Manter padrões de validação
- [ ] Implementar tratamento de erro robusto
- [ ] Adicionar logs para debugging

#### Pós-Implementação
- [ ] Executar `node check-regressions.js`
- [ ] Testar funcionalidade completa
- [ ] Verificar responsividade
- [ ] Atualizar documentação se necessário
- [ ] Registrar mudanças no replit.md

## Ferramenta de Análise Automática

Esta documentação serve como referência obrigatória. Qualquer implementação deve:

1. **Analisar padrões existentes** no módulo/área afetada
2. **Seguir nomenclatura técnica** conforme normas ABNT
3. **Manter consistência arquitetural** com sistema atual
4. **Preservar funcionalidades existentes** sem regressões
5. **Documentar mudanças significativas** no replit.md

### Comando de Verificação
```bash
node analyze-project-standards.js
```
Executar sempre antes de solicitar feedback ou concluir implementação.