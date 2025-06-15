# Documentação Completa - Sistema de Laboratório Geotécnico

## Índice Geral da Documentação

### 📚 Documentação Principal
- **[README.md](../README.md)** - Visão geral e início rápido
- **[replit.md](../replit.md)** - Arquitetura do projeto e changelog completo

### 🛠️ Documentação Técnica
- **[Guia do Desenvolvedor](DEVELOPER_GUIDE.md)** - Documentação completa para desenvolvedores
- **[Referência da API](API_REFERENCE.md)** - Documentação detalhada de todos os endpoints
- **[Configuração e Setup](SETUP_CONFIGURATION.md)** - Guia de instalação e configuração

### 🧪 Sistema de Testes
- **[Testes Automatizados](testing/automated-tests.md)** - Suíte completa de testes
- **Scripts de Teste**: `scripts/test-*.js` - Executáveis para validação
- **Verificação de Regressões**: `check-regressions.js` - Prevenção de bugs

### 🏗️ Arquitetura e Padrões
- **[Component Registry](../client/src/lib/component-registry.ts)** - Registro de componentes críticos
- **[Development Hooks](../client/src/lib/development-hooks.ts)** - Validação automática
- **[Schema Database](../shared/schema.ts)** - Estrutura do banco de dados

## Guia de Navegação por Perfil

### 👨‍💻 Para Desenvolvedores Experientes
1. [Guia do Desenvolvedor](DEVELOPER_GUIDE.md) - Arquitetura completa
2. [Referência da API](API_REFERENCE.md) - Endpoints e schemas
3. [replit.md](../replit.md) - Histórico e decisões técnicas

### 🚀 Para Deploy e Produção
1. [Configuração e Setup](SETUP_CONFIGURATION.md) - Environment setup
2. [README.md](../README.md) - Comandos e deploy
3. Scripts de validação antes do deploy

### 🧪 Para Controle de Qualidade
1. `node scripts/test-suite-completa.js` - Todos os testes
2. `node check-regressions.js` - Verificação de regressões
3. `node analyze-project-standards.js` - Análise de padrões

### 🎯 Para Implementação de Funcionalidades
1. [Guia do Desenvolvedor - Como Implementar](DEVELOPER_GUIDE.md#como-implementar-novas-funcionalidades)
2. `node scripts/check-duplicates.js ComponentName` - Verificar duplicidades
3. `node analyze-project-standards.js` - Validar padrões

## Estrutura de Documentação

```
docs/
├── INDEX.md                    # Este arquivo - índice geral
├── DEVELOPER_GUIDE.md          # Guia completo do desenvolvedor
├── API_REFERENCE.md            # Referência completa da API
├── SETUP_CONFIGURATION.md     # Configuração e instalação
├── testing/
│   └── automated-tests.md      # Documentação de testes
└── architecture/
    └── pdf-generation.md       # Documentação específica de PDFs
```

## Comandos Rápidos por Situação

### 🆘 Troubleshooting
```bash
# Verificar status geral
curl http://localhost:5000/api/health

# Executar todos os testes
node scripts/test-suite-completa.js

# Verificar regressões
node check-regressions.js

# Verificar logs do servidor
# (visível no console onde npm run dev está executando)
```

### 🔧 Desenvolvimento
```bash
# Iniciar desenvolvimento
npm run dev

# Aplicar mudanças no banco
npm run db:push

# Executar testes
npm test

# Analisar projeto
node analyze-project-standards.js
```

### 🚀 Deploy
```bash
# Build para produção
npm run build

# Testar build
npm run start

# Verificar se está pronto
node scripts/test-suite-completa.js
```

### 🧪 Antes de Implementar Nova Funcionalidade
```bash
# 1. Verificar duplicidades
node scripts/check-duplicates.js NomeDaFuncionalidade

# 2. Analisar padrões do projeto
node analyze-project-standards.js

# 3. Verificar estado atual
node check-regressions.js

# 4. Implementar funcionalidade
# 5. Executar testes
node scripts/test-suite-completa.js
```

## Sistema de Validação Automática

### Prevenção de Regressões
- **Component Registry**: Versionamento de componentes críticos
- **Development Hooks**: Validação automática durante desenvolvimento
- **Regression Tests**: Testes específicos para funcionalidades essenciais

### Testes Automatizados
- **Salvamento**: Validação de criação de ensaios
- **PDFs**: Verificação de geração de relatórios
- **Hierarquia**: Teste de camadas de acesso
- **Permissões**: Validação de controle granular

### Scripts de Auditoria
- **Níveis Hierárquicos**: Auditoria completa do sistema de roles
- **Firebase Sync**: Validação da sincronização Firebase-PostgreSQL
- **PDFs**: Verificação de dados incluídos nos relatórios

## Tecnologias e Versões

### Frontend
- React 18.2.0
- TypeScript 5.0+
- Tailwind CSS 3.3+
- Vite 4.4+

### Backend
- Node.js 18+
- Express.js 4.18+
- PostgreSQL 14+
- Firebase Admin SDK

### Ferramentas
- Drizzle ORM
- React Query v5
- Jest para testes
- ESLint + TypeScript

## Padrões de Código

### TypeScript
- Tipagem rigorosa obrigatória
- Interfaces claras para todas as APIs
- Schemas Zod para validação

### React
- Hooks customizados para lógica reutilizável
- Componentes funcionais apenas
- Props tipadas com TypeScript

### Backend
- Middleware de validação obrigatório
- Logs estruturados
- Error handling consistente

## Fluxo de Trabalho Recomendado

1. **Análise**: `node analyze-project-standards.js`
2. **Verificação**: `node scripts/check-duplicates.js`
3. **Implementação**: Seguir padrões estabelecidos
4. **Testes**: `node scripts/test-suite-completa.js`
5. **Validação**: `node check-regressions.js`
6. **Deploy**: Apenas se todos os testes passarem

## Suporte e Manutenção

### Monitoramento
- Health checks automáticos
- Métricas em tempo real
- Logs estruturados

### Debugging
- Console logs detalhados
- Testes específicos para cada funcionalidade
- Scripts de diagnóstico automático

### Performance
- Cache inteligente com React Query
- Connection pooling PostgreSQL
- Rate limiting configurável

Esta documentação garante que qualquer desenvolvedor possa entender, configurar, desenvolver e manter o sistema de laboratório geotécnico com segurança e eficiência.