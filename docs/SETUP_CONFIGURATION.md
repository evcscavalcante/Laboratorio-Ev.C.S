# Guia de Configuração e Setup - Sistema de Laboratório Geotécnico

## Índice
1. [Configuração Inicial](#configuração-inicial)
2. [Firebase Setup](#firebase-setup)
3. [PostgreSQL Setup](#postgresql-setup)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Configuração de Desenvolvimento](#configuração-de-desenvolvimento)
6. [Configuração de Produção](#configuração-de-produção)
7. [Troubleshooting de Setup](#troubleshooting-de-setup)

---

## Configuração Inicial

### Pré-requisitos

- **Node.js**: v18.0.0 ou superior
- **npm**: v8.0.0 ou superior
- **PostgreSQL**: v14.0 ou superior (ou acesso ao Neon Database)
- **Conta Firebase**: Para autenticação
- **Git**: Para controle de versão

### Verificar Pré-requisitos

```bash
# Verificar versões
node --version    # Deve mostrar v18+
npm --version     # Deve mostrar v8+
psql --version    # Se usando PostgreSQL local

# Verificar se as portas estão livres
lsof -i :5000     # Porta do servidor
lsof -i :5432     # Porta padrão PostgreSQL
```

---

## Firebase Setup

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Criar um projeto"
3. Nome sugerido: `laboratorio-geotecnico` ou `laboratorio-evcs`
4. Habilite Google Analytics (opcional)

### 2. Configurar Authentication

```bash
# No Firebase Console:
# 1. Vá para Authentication > Sign-in method
# 2. Habilite "Email/Password"
# 3. Configure domínio autorizado (se necessário)
```

### 3. Obter Credenciais Web

```javascript
// No Firebase Console > Project Settings > General
// Copie a configuração do Firebase SDK:

const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 4. Configurar Firebase Admin (Backend)

```bash
# No Firebase Console > Project Settings > Service accounts
# 1. Clique em "Generate new private key"
# 2. Baixe o arquivo JSON
# 3. Salve como 'firebase-admin-key.json' na raiz do projeto
```

### 5. Configurar Firestore (Opcional)

Se quiser usar Firestore para sincronização em tempo real:

```bash
# No Firebase Console:
# 1. Vá para Firestore Database
# 2. Clique em "Create database"
# 3. Comece no modo de produção
# 4. Escolha localização (us-central1 recomendado)
```

---

## PostgreSQL Setup

### Opção 1: Neon Database (Recomendado para Produção)

```bash
# 1. Acesse https://neon.tech
# 2. Crie uma conta gratuita
# 3. Crie um novo projeto
# 4. Copie a connection string fornecida
```

### Opção 2: PostgreSQL Local

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Baixe e instale do site oficial: https://www.postgresql.org/download/windows/
```

#### Configurar Usuário e Banco Local

```sql
-- Conectar como postgres
sudo -u postgres psql

-- Criar usuário
CREATE USER laboratorio_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';

-- Criar banco de dados
CREATE DATABASE laboratorio_geotecnico OWNER laboratorio_user;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE laboratorio_geotecnico TO laboratorio_user;

-- Sair
\q
```

#### Testar Conexão

```bash
# Testar conexão local
psql -h localhost -U laboratorio_user -d laboratorio_geotecnico

# Testar conexão Neon
psql "postgresql://usuario:senha@host:5432/database?sslmode=require"
```

---

## Variáveis de Ambiente

### Arquivo .env

Crie o arquivo `.env` na raiz do projeto:

```bash
# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@host:5432/database

# Firebase (Frontend)
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Ambiente
NODE_ENV=development

# Opcional: Configurações de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Opcional: CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Opcional: Logs
LOG_LEVEL=info
```

### Verificar Variáveis

```javascript
// Script para verificar variáveis (create: scripts/check-env.js)
const requiredVars = [
  'DATABASE_URL',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Variável ${varName} não configurada`);
  } else {
    console.log(`✅ ${varName} configurada`);
  }
});
```

```bash
node scripts/check-env.js
```

---

## Configuração de Desenvolvimento

### 1. Clone e Install

```bash
# Clonar repositório
git clone <repo-url>
cd laboratorio-geotecnico

# Instalar dependências
npm install

# Verificar instalação
npm list --depth=0
```

### 2. Configurar Banco de Dados

```bash
# Aplicar schema ao banco
npm run db:push

# Verificar tabelas criadas
npm run db:studio  # Abre interface visual (se configurado)
```

### 3. Executar em Desenvolvimento

```bash
# Executar servidor de desenvolvimento
npm run dev

# Em outro terminal, executar testes
npm test

# Verificar health do sistema
curl http://localhost:5000/api/health
```

### 4. Verificar Configurações

```bash
# Executar suite de testes
node scripts/test-suite-completa.js

# Verificar estrutura do projeto
node analyze-project-standards.js

# Verificar regressões
node check-regressions.js
```

### 5. Configurações do Editor

#### VSCode (.vscode/settings.json)

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

#### ESLint (.eslintrc.js) - Já configurado

```javascript
module.exports = {
  extends: [
    '@eslint/js/recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  // ... configuração existente
};
```

---

## Configuração de Produção

### 1. Build do Projeto

```bash
# Build para produção
npm run build

# Verificar build
ls -la dist/

# Testar build localmente
npm run start
```

### 2. Variáveis de Produção

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:senha@prod_host:5432/prod_db
VITE_FIREBASE_API_KEY=prod_api_key
VITE_FIREBASE_PROJECT_ID=prod_project_id
VITE_FIREBASE_APP_ID=prod_app_id

# Rate limiting mais restritivo
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# CORS específico
ALLOWED_ORIGINS=https://laboratorio-evcs.firebaseapp.com,https://seu-dominio.com
```

### 3. Deploy no Replit

```bash
# 1. Configurar secrets no Replit
# Vá para Secrets tab e adicione todas as variáveis

# 2. Verificar configuração
echo $DATABASE_URL  # Deve mostrar URL do banco

# 3. Deploy automático via Git push
git add .
git commit -m "Deploy para produção"
git push origin main
```

### 4. Deploy no Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicializar projeto
firebase init hosting

# Configurar firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# Deploy
firebase deploy
```

### 5. Configuração Nginx (Se aplicável)

```nginx
# /etc/nginx/sites-available/laboratorio-geotecnico
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting de Setup

### Problema: Node.js/npm

```bash
# Erro: versão incompatível
# Solução: usar nvm para gerenciar versões

# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node.js 18
nvm install 18
nvm use 18
nvm alias default 18
```

### Problema: PostgreSQL Connection

```bash
# Erro: ECONNREFUSED
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Testar conexão
psql -h localhost -U laboratorio_user -d laboratorio_geotecnico
```

### Problema: Firebase Authentication

```javascript
// Erro: Firebase configuration
// Verificar se todas as variáveis estão definidas

const checkFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'projectId', 'appId'];
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  requiredKeys.forEach(key => {
    if (!config[key]) {
      console.error(`Firebase ${key} não configurado`);
    }
  });
};
```

### Problema: CORS Errors

```javascript
// server/index.ts - Configuração CORS para desenvolvimento
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? true  // Permite qualquer origem em desenvolvimento
    : ['https://laboratorio-evcs.firebaseapp.com'],
  credentials: true
}));
```

### Problema: Rate Limiting em Desenvolvimento

```javascript
// Ajustar limites para desenvolvimento
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: 'Muitas requisições, tente novamente em 15 minutos'
};
```

### Problema: Database Schema

```bash
# Erro: tabela não existe
# Aplicar schema
npm run db:push

# Se falhar, verificar conexão
node -e "console.log(process.env.DATABASE_URL)"

# Testar conexão manualmente
psql "$DATABASE_URL"
```

### Problema: Build Errors

```bash
# Erro: TypeScript compilation
# Verificar tipos
npx tsc --noEmit

# Erro: Vite build
# Limpar cache
rm -rf node_modules/.vite
npm run build

# Erro: dependências
rm -rf node_modules package-lock.json
npm install
```

### Verificação Final

```bash
# Script completo de verificação de setup
#!/bin/bash

echo "🔍 Verificando setup do projeto..."

# Verificar Node.js
node_version=$(node --version)
echo "Node.js: $node_version"

# Verificar npm
npm_version=$(npm --version)
echo "npm: $npm_version"

# Verificar variáveis de ambiente
if [ -f .env ]; then
    echo "✅ Arquivo .env encontrado"
else
    echo "❌ Arquivo .env não encontrado"
fi

# Verificar dependências
if [ -d node_modules ]; then
    echo "✅ node_modules encontrado"
else
    echo "❌ Execute: npm install"
fi

# Testar conexão com banco
echo "🔍 Testando conexão com banco..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ Erro de conexão:', err.message);
  } else {
    console.log('✅ Banco conectado:', res.rows[0].now);
  }
  pool.end();
});
"

# Testar servidor
echo "🔍 Testando servidor..."
timeout 10s npm run dev &
sleep 5
curl -s http://localhost:5000/api/health && echo "✅ Servidor funcionando" || echo "❌ Servidor não responde"

echo "🎉 Verificação de setup concluída!"
```

Este guia cobre todos os aspectos de configuração necessários para executar o sistema de laboratório geotécnico em diferentes ambientes.