# Guia Completo do Desenvolvedor - Sistema de Laboratório Geotécnico

## Índice
1. [Arquitetura Geral](#arquitetura-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Tecnologias e Dependências](#tecnologias-e-dependências)
4. [Sistema de Autenticação](#sistema-de-autenticação)
5. [Banco de Dados](#banco-de-dados)
6. [APIs e Endpoints](#apis-e-endpoints)
7. [Sistema de Testes](#sistema-de-testes)
8. [Camadas Hierárquicas](#camadas-hierárquicas)
9. [Frontend (React)](#frontend-react)
10. [Backend (Express)](#backend-express)
11. [Como Executar](#como-executar)
12. [Como Implementar Novas Funcionalidades](#como-implementar-novas-funcionalidades)
13. [Troubleshooting](#troubleshooting)

---

## Arquitetura Geral

O sistema é uma aplicação web full-stack para gerenciamento de laboratório geotécnico que implementa:

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Shadcn/UI
- **Backend**: Express.js + TypeScript + PostgreSQL
- **Autenticação**: Firebase Authentication (frontend) + PostgreSQL (roles/permissions)
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Build**: Vite para desenvolvimento e produção

### Fluxo de Dados
```
User → Firebase Auth → React Frontend → Express API → PostgreSQL → Response
```

### Arquitetura Híbrida de Autenticação
```
Firebase (Login/Tokens) ↔ PostgreSQL (Roles/Permissions) ↔ Session Storage
```

---

## Estrutura do Projeto

```
/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── ui/          # Componentes base (Shadcn)
│   │   │   ├── laboratory/  # Calculadoras de ensaios
│   │   │   └── layout/      # Layout e navegação
│   │   ├── lib/             # Utilitários e configurações
│   │   ├── hooks/           # React hooks customizados
│   │   └── pages/           # Páginas da aplicação
├── server/                   # Backend Express
│   ├── routes/              # Rotas da API
│   ├── middleware/          # Middlewares customizados
│   ├── auth-firebase-hybrid.ts  # Sistema de autenticação
│   └── index.ts            # Servidor principal
├── shared/                  # Código compartilhado
│   └── schema.ts           # Schemas do banco de dados
├── scripts/                # Scripts de teste e automação
│   ├── test-*.js          # Suíte completa de testes
│   └── audit-*.js         # Scripts de auditoria
└── docs/                   # Documentação
```

---

## Tecnologias e Dependências

### Frontend
- **React 18**: Interface de usuário
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utilitária
- **Shadcn/UI**: Componentes acessíveis
- **Wouter**: Roteamento client-side
- **React Query**: Gerenciamento de estado servidor
- **React PDF**: Geração de relatórios

### Backend
- **Express.js**: Servidor HTTP
- **TypeScript**: Tipagem estática
- **Drizzle ORM**: ORM para PostgreSQL
- **Firebase Admin**: Verificação de tokens
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Proteção contra abuso

### Banco de Dados
- **PostgreSQL**: Banco relacional principal
- **Neon Database**: Hosting PostgreSQL

---

## Sistema de Autenticação

### Autenticação Híbrida (Firebase + PostgreSQL)

#### 1. Login do Usuário
```javascript
// Frontend - Firebase Authentication
import { signInWithEmailAndPassword } from 'firebase/auth';

const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();
  
  // Sincronizar com PostgreSQL
  await syncUserWithDatabase(token);
};
```

#### 2. Sincronização com PostgreSQL
```javascript
// Backend - server/auth-firebase-hybrid.ts
export const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  
  // Buscar role no PostgreSQL
  const user = await db.select().from(users).where(eq(users.firebaseUid, decodedToken.uid));
  req.user = { ...decodedToken, role: user[0]?.role || 'VIEWER' };
  next();
};
```

#### 3. Controle de Acesso por Role
```javascript
// Middleware de proteção por role
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};
```

---

## Banco de Dados

### Schema Principal (shared/schema.ts)

```typescript
// Usuários
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firebaseUid: varchar('firebase_uid', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('VIEWER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Ensaios de Densidade In-Situ
export const densityInSituTests = pgTable('density_in_situ_tests', {
  id: serial('id').primaryKey(),
  registrationNumber: varchar('registration_number', { length: 255 }).notNull(),
  date: date('date').notNull(),
  operator: varchar('operator', { length: 255 }).notNull(),
  material: varchar('material', { length: 255 }).notNull(),
  origin: varchar('origin', { length: 255 }).notNull(),
  // ... campos específicos do ensaio
});

// Ensaios de Densidade Real
export const densityRealTests = pgTable('density_real_tests', {
  id: serial('id').primaryKey(),
  // ... estrutura similar
});

// Ensaios de Densidade Máx/Mín
export const densityMaxMinTests = pgTable('density_max_min_tests', {
  id: serial('id').primaryKey(),
  // ... estrutura similar
});
```

### Migrações
```bash
# Aplicar mudanças no schema
npm run db:push

# Gerar migrações (se necessário)
npm run db:generate
```

---

## APIs e Endpoints

### Estrutura de Rotas

#### Autenticação
```
POST /api/auth/sync-user     # Sincronizar Firebase com PostgreSQL
POST /api/auth/set-role      # Definir role do usuário (ADMIN+)
```

#### Ensaios
```
GET    /api/tests/densidade-in-situ/temp      # Listar ensaios densidade in-situ
POST   /api/tests/densidade-in-situ/temp      # Criar ensaio densidade in-situ
DELETE /api/tests/densidade-in-situ/temp/:id  # Excluir ensaio

GET    /api/tests/densidade-real/temp         # Listar ensaios densidade real  
POST   /api/tests/densidade-real/temp         # Criar ensaio densidade real
DELETE /api/tests/densidade-real/temp/:id     # Excluir ensaio

GET    /api/tests/densidade-max-min/temp      # Listar ensaios máx/mín
POST   /api/tests/densidade-max-min/temp      # Criar ensaio máx/mín
DELETE /api/tests/densidade-max-min/temp/:id  # Excluir ensaio
```

#### Administração
```
GET  /api/admin/users           # Listar usuários (ADMIN+)
GET  /api/notifications         # Notificações do sistema (ADMIN+)
GET  /api/developer/system-info # Informações do sistema (DEVELOPER)
```

#### Monitoramento
```
GET /api/health    # Health check
GET /api/metrics   # Métricas do sistema
```

### Exemplo de Implementação de Endpoint

```javascript
// server/routes/density-real.ts
router.post('/api/tests/densidade-real/temp', verifyFirebaseToken, requireRole(['TECHNICIAN', 'MANAGER', 'ADMIN', 'DEVELOPER']), async (req, res) => {
  try {
    // Validação de dados com Zod
    const validatedData = densityRealInsertSchema.parse(req.body);
    
    // Salvar no banco
    const result = await db.insert(densityRealTests).values({
      ...validatedData,
      userId: req.user.uid,
      createdBy: req.user.email
    }).returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## Sistema de Testes

### Suíte Completa de Testes Automatizados

#### Scripts Disponíveis
```bash
# Teste completo (todos os tipos)
node scripts/test-suite-completa.js

# Testes individuais
node scripts/test-ensaios-salvamento.js      # Salvamento de ensaios
node scripts/test-pdf-generation.js          # Geração de PDFs  
node scripts/test-hierarquia-roles.js        # Camadas hierárquicas
node scripts/test-permissoes-especificas.js  # Permissões por role

# Verificação de regressões
node check-regressions.js

# Auditoria do sistema
node scripts/audit-niveis-hierarquicos.js
```

#### Exemplo de Teste Automatizado
```javascript
// scripts/test-ensaios-salvamento.js
class EnsaiosSavingTester {
  async testDensidadeRealSaving() {
    const testData = {
      registrationNumber: 'TEST-001',
      date: '2025-06-15',
      operator: 'Teste Automático',
      material: 'Solo Teste',
      origin: 'Lab Teste'
    };

    const response = await fetch(`${this.baseUrl}/api/tests/densidade-real/temp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? await response.json() : null
    };
  }
}
```

---

## Camadas Hierárquicas

### 5 Níveis de Acesso

#### 1. VIEWER (Nível 1)
- **Permissões**: Visualizar relatórios básicos
- **Restrições**: Não pode criar, editar ou excluir
- **Uso**: Usuários que só precisam consultar dados

#### 2. TECHNICIAN (Nível 2)
- **Permissões**: VIEWER + criar ensaios + editar próprios ensaios
- **Restrições**: Não pode gerenciar outros usuários
- **Uso**: Técnicos de laboratório

#### 3. MANAGER (Nível 3)
- **Permissões**: TECHNICIAN + editar ensaios da equipe + excluir ensaios
- **Restrições**: Não pode gerenciar usuários
- **Uso**: Supervisores de laboratório

#### 4. ADMIN (Nível 4)
- **Permissões**: MANAGER + gerenciar usuários + configurar sistema
- **Restrições**: Não tem acesso a debug e logs detalhados
- **Uso**: Administradores do sistema

#### 5. DEVELOPER (Nível 5)
- **Permissões**: ADMIN + acesso completo + debug + logs + notificações
- **Restrições**: Nenhuma
- **Uso**: Desenvolvedores e suporte técnico

### Implementação de Controle de Acesso

```javascript
// client/src/hooks/useAuth.tsx
export const useAuth = () => {
  const hasRole = (requiredRole: string) => {
    const roleHierarchy = {
      'VIEWER': 1,
      'TECHNICIAN': 2, 
      'MANAGER': 3,
      'ADMIN': 4,
      'DEVELOPER': 5
    };
    
    const userLevel = roleHierarchy[user?.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 999;
    
    return userLevel >= requiredLevel;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some(role => hasRole(role));
  };

  return { user, hasRole, hasAnyRole, login, logout };
};
```

---

## Frontend (React)

### Estrutura de Componentes

#### Layout Principal
```typescript
// client/src/components/layout/AppLayout.tsx
export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className={`flex-1 transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
}
```

#### Calculadoras de Ensaios
```typescript
// client/src/components/laboratory/density-real.tsx
export function DensityReal() {
  const [formData, setFormData] = useState<DensityRealFormData>({});
  const { mutate: saveTest, isPending } = useMutation({
    mutationFn: (data) => apiRequest('/api/tests/densidade-real/temp', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({ title: 'Ensaio salvo com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['/api/tests/densidade-real/temp'] });
    }
  });

  return (
    <TestLayout>
      <TestHeader 
        title="Massa Específica dos Sólidos"
        onDataChange={setFormData}
      />
      {/* Formulário de ensaio */}
    </TestLayout>
  );
}
```

#### Sistema de Notificações
```typescript
// client/src/components/layout/NotificationBell.tsx
export function NotificationBell() {
  const { hasAnyRole } = useAuth();
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: hasAnyRole(['ADMIN', 'DEVELOPER'])
  });

  if (!hasAnyRole(['ADMIN', 'DEVELOPER'])) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications?.filter(n => !n.read).length > 0 && (
            <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs">
              {notifications.filter(n => !n.read).length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      {/* Menu de notificações */}
    </DropdownMenu>
  );
}
```

### State Management com React Query

```typescript
// client/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
});

// Hook customizado para ensaios
export function useTests(type: 'densidade-real' | 'densidade-max-min' | 'densidade-in-situ') {
  return useQuery({
    queryKey: [`/api/tests/${type}/temp`],
    queryFn: () => apiRequest(`/api/tests/${type}/temp`)
  });
}
```

---

## Backend (Express)

### Servidor Principal
```javascript
// server/index.ts
const app = express();

// Middlewares globais
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://laboratorio-evcs.firebaseapp.com'] : true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 500 : 100
}));

// Rotas
app.use('/api', routes);

// Middleware de erro global
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});
```

### Validação com Zod
```typescript
// shared/schema.ts
export const densityRealInsertSchema = createInsertSchema(densityRealTests).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type DensityRealInsert = z.infer<typeof densityRealInsertSchema>;
export type DensityRealSelect = typeof densityRealTests.$inferSelect;
```

### Sistema de Logs Estruturados
```javascript
// server/middleware/logging.ts
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`🔍 ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')?.substring(0, 100)}`);
    console.log(`📤 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    if (res.statusCode >= 400) {
      console.log(`⚠️ Erro ${res.statusCode} em ${req.method} ${req.path} - IP: ${req.ip}`);
    }
  });
  
  next();
};
```

---

## Como Executar

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL (ou acesso ao Neon Database)
- Conta Firebase com projeto configurado

### Configuração do Ambiente

1. **Clone o repositório**
```bash
git clone <repo-url>
cd laboratorio-geotecnico
```

2. **Instale dependências**
```bash
npm install
```

3. **Configure variáveis de ambiente**
```bash
# .env
DATABASE_URL=postgresql://user:password@host:port/database
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Configure o banco de dados**
```bash
npm run db:push
```

5. **Execute o projeto**
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5000`

### Scripts Disponíveis
```bash
npm run dev              # Desenvolvimento
npm run build           # Build para produção
npm run start          # Produção 
npm run db:push        # Aplicar schema ao banco
npm run db:generate    # Gerar migrações
npm test              # Executar testes Jest
```

---

## Como Implementar Novas Funcionalidades

### 1. Planejar Implementação

Antes de implementar qualquer funcionalidade nova:

```bash
# Verificar padrões do projeto
node analyze-project-standards.js

# Verificar duplicidades
node scripts/check-duplicates.js ComponentName

# Executar testes de regressão
node check-regressions.js
```

### 2. Implementar Nova Calculadora de Ensaio

#### Passo 1: Schema do Banco
```typescript
// shared/schema.ts
export const newTestType = pgTable('new_test_type', {
  id: serial('id').primaryKey(),
  registrationNumber: varchar('registration_number', { length: 255 }).notNull(),
  date: date('date').notNull(),
  // ... campos específicos
});

export const newTestInsertSchema = createInsertSchema(newTestType).omit({
  id: true,
  createdAt: true
});
```

#### Passo 2: API Routes
```javascript
// server/routes/new-test.ts
router.get('/api/tests/new-test/temp', verifyFirebaseToken, async (req, res) => {
  const tests = await db.select().from(newTestType);
  res.json(tests);
});

router.post('/api/tests/new-test/temp', verifyFirebaseToken, requireRole(['TECHNICIAN', 'MANAGER', 'ADMIN', 'DEVELOPER']), async (req, res) => {
  const validatedData = newTestInsertSchema.parse(req.body);
  const result = await db.insert(newTestType).values(validatedData).returning();
  res.status(201).json(result[0]);
});
```

#### Passo 3: Componente React
```typescript
// client/src/components/laboratory/new-test.tsx
export function NewTest() {
  const [formData, setFormData] = useState({});
  const { mutate: saveTest } = useMutation({
    mutationFn: (data) => apiRequest('/api/tests/new-test/temp', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  });

  return (
    <TestLayout>
      <TestHeader title="Novo Tipo de Ensaio" onDataChange={setFormData} />
      {/* Implementar formulário */}
    </TestLayout>
  );
}
```

#### Passo 4: Registrar no Component Registry
```typescript
// client/src/lib/component-registry.ts
export const componentRegistry = {
  // ... componentes existentes
  'new-test': {
    version: '1.0.0',
    requiredFeatures: ['form', 'validation', 'save', 'pdf-generation']
  }
};
```

#### Passo 5: Criar Testes
```javascript
// scripts/test-new-test.js
class NewTestTester {
  async testSaving() {
    const response = await fetch(`${this.baseUrl}/api/tests/new-test/temp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    return { success: response.ok, status: response.status };
  }
}
```

### 3. Implementar Nova Funcionalidade de Sistema

#### Exemplo: Sistema de Relatórios Avançados

1. **Definir Schema**
```typescript
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 100 }).notNull(),
  filters: json('filters'),
  generatedBy: varchar('generated_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});
```

2. **Criar API**
```javascript
router.post('/api/reports/generate', verifyFirebaseToken, requireRole(['MANAGER', 'ADMIN', 'DEVELOPER']), async (req, res) => {
  // Implementar lógica de geração de relatórios
});
```

3. **Componente Frontend**
```typescript
export function ReportsGenerator() {
  const { hasRole } = useAuth();
  
  if (!hasRole('MANAGER')) {
    return <div>Acesso negado</div>;
  }
  
  // Implementar interface
}
```

---

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Autenticação Firebase
```
Erro: Firebase ID token has expired
```

**Solução**: O token Firebase expira automaticamente. O sistema deve renovar tokens automaticamente:

```javascript
// client/src/hooks/useAuth.tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Renovar token automaticamente
      const token = await user.getIdToken(true);
      // Atualizar token nos headers
    }
  });
  return unsubscribe;
}, []);
```

#### 2. Rate Limit Exceeded
```
Erro: Too many requests
```

**Solução**: Ajustar limites no desenvolvimento:

```javascript
// server/index.ts
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 500 : 100 // Mais permissivo em dev
}));
```

#### 3. Problemas de CORS
```
Erro: CORS policy blocked
```

**Solução**: Verificar configuração CORS:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://laboratorio-evcs.firebaseapp.com', 'https://*.replit.app'] 
    : true,
  credentials: true
}));
```

#### 4. Erro de Schema do Banco
```
Erro: column "xyz" does not exist
```

**Solução**: Aplicar mudanças do schema:

```bash
npm run db:push
```

#### 5. Testes Falhando
```
❌ Alguns testes falharam
```

**Solução**: Executar testes individuais para diagnosticar:

```bash
node scripts/test-ensaios-salvamento.js
node scripts/test-hierarquia-roles.js
node check-regressions.js
```

### Comandos de Debug

```bash
# Verificar status do sistema
curl http://localhost:5000/api/health

# Verificar métricas
curl http://localhost:5000/api/metrics

# Testar endpoint específico
curl -X POST http://localhost:5000/api/tests/densidade-real/temp \
  -H "Content-Type: application/json" \
  -d '{"registrationNumber":"TEST","date":"2025-06-15"}'

# Verificar logs do servidor
# (logs aparecem no console onde npm run dev está executando)
```

### Ferramentas de Monitoramento

1. **Health Check**: `GET /api/health`
2. **Métricas do Sistema**: `GET /api/metrics`
3. **Dashboard de Monitoramento**: `/system-monitoring`
4. **Testes Automatizados**: `node scripts/test-suite-completa.js`

---

## Conclusão

Este sistema implementa uma arquitetura robusta e escalável para gerenciamento de laboratório geotécnico, com:

- ✅ **Segurança**: Autenticação híbrida com 5 camadas hierárquicas
- ✅ **Qualidade**: Suíte completa de testes automatizados
- ✅ **Escalabilidade**: Arquitetura modular e bem documentada
- ✅ **Manutenibilidade**: Sistema de prevenção de regressões
- ✅ **Observabilidade**: Logs estruturados e monitoramento

Para qualquer dúvida ou problema, consulte primeiro este guia e execute os testes automatizados para verificar o status do sistema.