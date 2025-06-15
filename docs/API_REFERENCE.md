# Referência Completa da API - Sistema de Laboratório Geotécnico

## Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints de Ensaios](#endpoints-de-ensaios)
4. [Endpoints de Administração](#endpoints-de-administração)
5. [Endpoints de Monitoramento](#endpoints-de-monitoramento)
6. [Códigos de Status](#códigos-de-status)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [Rate Limiting](#rate-limiting)
9. [Tratamento de Erros](#tratamento-de-erros)

---

## Visão Geral

**Base URL**: `http://localhost:5000` (desenvolvimento) ou `https://sua-app.replit.app` (produção)

**Formato de Dados**: JSON
**Autenticação**: Firebase ID Token via header `Authorization: Bearer <token>`
**Rate Limiting**: 100 requests/15min (produção), 500 requests/15min (desenvolvimento)

---

## Autenticação

### Sincronizar Usuário Firebase com PostgreSQL
```http
POST /api/auth/sync-user
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "uid": "firebase-user-id",
  "email": "user@example.com",
  "name": "Nome do Usuário"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com", 
    "name": "Nome do Usuário",
    "role": "VIEWER"
  }
}
```

### Definir Role do Usuário
```http
POST /api/auth/set-role
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "targetUid": "firebase-user-id",
  "newRole": "TECHNICIAN"
}
```

**Permissões Necessárias**: ADMIN, DEVELOPER

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Role atualizado com sucesso"
}
```

---

## Endpoints de Ensaios

### Densidade In-Situ (NBR 9813:2021)

#### Listar Ensaios
```http
GET /api/tests/densidade-in-situ/temp
Authorization: Bearer <firebase-id-token>
```

**Permissões**: TECHNICIAN, MANAGER, ADMIN, DEVELOPER

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 1,
    "registrationNumber": "DIS-001-2025",
    "date": "2025-06-15",
    "operator": "João Silva",
    "material": "Solo Argiloso",
    "origin": "Obra ABC - Estaca 10",
    "north": "7123456.789",
    "east": "654321.123",
    "elevation": "12.50",
    "location": "Fundação",
    "quadrant": "NE",
    "layer": "Camada 2",
    "weather": "sol_forte",
    "humidity": "65",
    "temperature": "28",
    "balanceId": "BAL-001",
    "ovenId": "EST-001",
    "thermometerId": "TERM-001",
    "stopwatchId": "CRON-001",
    "retested": false,
    "createdAt": "2025-06-15T10:30:00Z",
    "userId": "firebase-user-id"
  }
]
```

#### Criar Ensaio
```http
POST /api/tests/densidade-in-situ/temp
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "registrationNumber": "DIS-002-2025",
  "date": "2025-06-15",
  "operator": "Maria Santos",
  "responsibleCalculation": "João Silva",
  "verifier": "Pedro Costa",
  "material": "Solo Arenoso",
  "origin": "Obra XYZ - Estaca 15",
  "north": "7123456.789",
  "east": "654321.123",
  "elevation": "15.20",
  "location": "Fundação",
  "quadrant": "SW",
  "layer": "Camada 1",
  "weather": "nublado",
  "humidity": "70",
  "temperature": "25",
  "balanceId": "BAL-002",
  "ovenId": "EST-002",
  "thermometerId": "TERM-002",
  "stopwatchId": "CRON-002",
  "retested": false
}
```

**Permissões**: TECHNICIAN, MANAGER, ADMIN, DEVELOPER

**Resposta de Sucesso (201)**:
```json
{
  "id": 2,
  "registrationNumber": "DIS-002-2025",
  "date": "2025-06-15",
  // ... todos os campos enviados
  "createdAt": "2025-06-15T14:30:00Z",
  "userId": "firebase-user-id"
}
```

#### Excluir Ensaio
```http
DELETE /api/tests/densidade-in-situ/temp/{id}
Authorization: Bearer <firebase-id-token>
```

**Permissões**: MANAGER, ADMIN, DEVELOPER

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Ensaio excluído com sucesso"
}
```

### Densidade Real (NBR 17212:2025)

#### Listar Ensaios
```http
GET /api/tests/densidade-real/temp
Authorization: Bearer <firebase-id-token>
```

**Permissões**: TECHNICIAN, MANAGER, ADMIN, DEVELOPER

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 1,
    "registrationNumber": "DR-001-2025",
    "date": "2025-06-15",
    "operator": "Ana Silva",
    "material": "Solo Passante #2,0mm",
    "origin": "Obra ABC - Amostra 1",
    "picnometerId": "PIC-001",
    "picnometerMass": 125.45,
    "picnometerSoilMass": 175.32,
    "picnometerSoilWaterMass": 685.21,
    "picnometerWaterMass": 645.18,
    "temperature": 23.5,
    "results": {
      "realDensity1": 2.654,
      "realDensity2": 2.658,
      "averageRealDensity": 2.656,
      "difference": 0.004,
      "status": "APROVADO"
    },
    "createdAt": "2025-06-15T10:30:00Z"
  }
]
```

#### Criar Ensaio
```http
POST /api/tests/densidade-real/temp
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "registrationNumber": "DR-002-2025",
  "date": "2025-06-15",
  "operator": "Carlos Lima",
  "responsibleCalculation": "Ana Silva",
  "verifier": "João Costa",
  "material": "Solo Arenoso Fino",
  "origin": "Obra XYZ - Amostra 2",
  "north": "7123456.789",
  "east": "654321.123",
  "elevation": "18.30",
  "location": "Aterro",
  "quadrant": "NW",
  "layer": "Camada 3",
  "weather": "chuva_fraca",
  "humidity": "85",
  "temperature": "22",
  "balanceId": "BAL-003",
  "ovenId": "EST-003",
  "thermometerId": "TERM-003",
  "stopwatchId": "CRON-003",
  "retested": true
}
```

**Permissões**: TECHNICIAN, MANAGER, ADMIN, DEVELOPER

**Resposta de Sucesso (201)**:
```json
{
  "id": 2,
  "registrationNumber": "DR-002-2025",
  // ... todos os campos
  "createdAt": "2025-06-15T14:30:00Z"
}
```

### Densidade Máx/Mín (NBR 12004:2021 e NBR 12051:2021)

#### Listar Ensaios
```http
GET /api/tests/densidade-max-min/temp
Authorization: Bearer <firebase-id-token>
```

**Permissões**: TECHNICIAN, MANAGER, ADMIN, DEVELOPER

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 1,
    "registrationNumber": "DMM-001-2025",
    "date": "2025-06-15",
    "operator": "Roberto Silva",
    "material": "Areia Fina Uniforme",
    "origin": "Jazida São João",
    "realSpecificMass": 2.656,
    "maxMoldId": "MOLDE-MAX-001",
    "maxMoldMass": 2145.32,
    "maxMoldSoilMass": 4523.18,
    "minMoldId": "MOLDE-MIN-001", 
    "minMoldMass": 2087.45,
    "minMoldSoilMass": 3234.67,
    "results": {
      "maxDensity": 1.845,
      "minDensity": 1.234,
      "maxVoidRatio": 1.152,
      "minVoidRatio": 0.439,
      "difference": 0.611,
      "status": "APROVADO"
    },
    "createdAt": "2025-06-15T10:30:00Z"
  }
]
```

#### Criar Ensaio
```http
POST /api/tests/densidade-max-min/temp
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "registrationNumber": "DMM-002-2025",
  "date": "2025-06-15",
  "operator": "Fernanda Costa",
  "responsibleCalculation": "Roberto Silva",
  "verifier": "Ana Lima",
  "material": "Areia Média Bem Graduada",
  "origin": "Jazida Pedra Branca",
  "north": "7125678.123",
  "east": "656543.789",
  "elevation": "25.80",
  "location": "Aterro Sanitário",
  "quadrant": "SE",
  "layer": "Base",
  "weather": "sol_forte",
  "humidity": "45",
  "temperature": "32",
  "balanceId": "BAL-004",
  "ovenId": "EST-004",
  "thermometerId": "TERM-004",
  "stopwatchId": "CRON-004",
  "retested": false
}
```

---

## Endpoints de Administração

### Listar Usuários
```http
GET /api/admin/users
Authorization: Bearer <firebase-id-token>
```

**Permissões**: ADMIN, DEVELOPER

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 1,
    "firebaseUid": "abc123def456",
    "email": "admin@lab.com",
    "name": "Administrador",
    "role": "ADMIN",
    "createdAt": "2025-06-15T08:00:00Z",
    "updatedAt": "2025-06-15T08:00:00Z"
  },
  {
    "id": 2,
    "firebaseUid": "def456ghi789",
    "email": "tecnico@lab.com", 
    "name": "Técnico Silva",
    "role": "TECHNICIAN",
    "createdAt": "2025-06-15T09:15:00Z",
    "updatedAt": "2025-06-15T09:15:00Z"
  }
]
```

### Listar Notificações
```http
GET /api/notifications
Authorization: Bearer <firebase-id-token>
```

**Permissões**: ADMIN, DEVELOPER

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 1,
    "type": "new_user",
    "title": "Novo usuário cadastrado",
    "message": "tecnico2@lab.com se cadastrou no sistema",
    "data": {
      "userId": "ghi789jkl012",
      "email": "tecnico2@lab.com",
      "name": "Técnico Santos"
    },
    "read": false,
    "createdAt": "2025-06-15T11:30:00Z"
  }
]
```

### Marcar Notificação como Lida
```http
PATCH /api/notifications/{id}/read
Authorization: Bearer <firebase-id-token>
```

**Permissões**: ADMIN, DEVELOPER

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Notificação marcada como lida"
}
```

### Informações do Sistema
```http
GET /api/developer/system-info
Authorization: Bearer <firebase-id-token>
```

**Permissões**: DEVELOPER

**Resposta de Sucesso (200)**:
```json
{
  "version": "1.0.0",
  "environment": "development",
  "database": {
    "status": "connected",
    "tables": ["users", "density_in_situ_tests", "density_real_tests", "density_max_min_tests", "notifications"]
  },
  "firebase": {
    "projectId": "laboratorio-evcs",
    "status": "connected"
  },
  "uptime": "2h 30m 15s",
  "memoryUsage": {
    "used": "156.2 MB",
    "total": "512 MB"
  }
}
```

---

## Endpoints de Monitoramento

### Health Check
```http
GET /api/health
```

**Permissões**: Público

**Resposta de Sucesso (200)**:
```json
{
  "status": "ok",
  "timestamp": "2025-06-15T14:30:00Z",
  "uptime": "2h 30m 15s",
  "version": "1.0.0"
}
```

### Métricas do Sistema
```http
GET /api/metrics
```

**Permissões**: Público

**Resposta de Sucesso (200)**:
```json
{
  "requests": {
    "total": 1247,
    "success": 1198,
    "errors": 49,
    "averageResponseTime": "145ms"
  },
  "database": {
    "connections": 5,
    "queries": 892,
    "averageQueryTime": "12ms"
  },
  "memory": {
    "used": "156.2 MB",
    "free": "355.8 MB",
    "total": "512 MB"
  },
  "timestamp": "2025-06-15T14:30:00Z"
}
```

---

## Códigos de Status

### Sucessos (2xx)
- `200 OK`: Requisição processada com sucesso
- `201 Created`: Recurso criado com sucesso

### Erros do Cliente (4xx)
- `400 Bad Request`: Dados inválidos ou malformados
- `401 Unauthorized`: Token de autenticação ausente ou inválido
- `403 Forbidden`: Usuário não tem permissão para acessar o recurso
- `404 Not Found`: Recurso não encontrado
- `422 Unprocessable Entity`: Dados válidos mas com regras de negócio violadas
- `429 Too Many Requests`: Rate limit excedido

### Erros do Servidor (5xx)
- `500 Internal Server Error`: Erro interno do servidor
- `503 Service Unavailable`: Serviço temporariamente indisponível

---

## Exemplos de Uso

### Exemplo Completo: Criar Ensaio de Densidade Real

```javascript
// 1. Fazer login no Firebase
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const token = await userCredential.user.getIdToken();

// 2. Sincronizar com PostgreSQL
const syncResponse = await fetch('/api/auth/sync-user', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    name: userCredential.user.displayName
  })
});

// 3. Criar ensaio
const testData = {
  registrationNumber: 'DR-003-2025',
  date: '2025-06-15',
  operator: 'Técnico Silva',
  responsibleCalculation: 'Eng. Santos',
  verifier: 'Eng. Costa',
  material: 'Solo Argiloso',
  origin: 'Obra Municipal - Amostra 3',
  north: '7123456.789',
  east: '654321.123',
  elevation: '20.50',
  location: 'Fundação',
  quadrant: 'NE',
  layer: 'Camada 2',
  weather: 'nublado',
  humidity: '68',
  temperature: '24',
  balanceId: 'BAL-001',
  ovenId: 'EST-001',
  thermometerId: 'TERM-001',
  stopwatchId: 'CRON-001',
  retested: false
};

const createResponse = await fetch('/api/tests/densidade-real/temp', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
});

const result = await createResponse.json();
console.log('Ensaio criado:', result);
```

### Exemplo: Buscar Ensaios com Paginação

```javascript
// Buscar primeiros 20 ensaios
const response = await fetch('/api/tests/densidade-real/temp?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const tests = await response.json();
```

### Exemplo: Tratamento de Erros

```javascript
try {
  const response = await fetch('/api/tests/densidade-in-situ/temp', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
  });

  if (!response.ok) {
    const error = await response.json();
    
    switch (response.status) {
      case 400:
        console.error('Dados inválidos:', error.error);
        break;
      case 401:
        console.error('Token expirado, faça login novamente');
        // Redirecionar para login
        break;
      case 403:
        console.error('Sem permissão para criar ensaios');
        break;
      case 429:
        console.error('Muitas requisições, aguarde um momento');
        break;
      default:
        console.error('Erro desconhecido:', error);
    }
    return;
  }

  const result = await response.json();
  console.log('Ensaio criado com sucesso:', result);
  
} catch (error) {
  console.error('Erro de rede:', error);
}
```

---

## Rate Limiting

### Limites por Ambiente

**Desenvolvimento**:
- 500 requests por 15 minutos por IP
- Sem limites por usuário específico

**Produção**:
- 100 requests por 15 minutos por IP
- Endpoints de autenticação: 5 requests por 15 minutos

### Headers de Rate Limit

Todas as respostas incluem headers informativos:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Resposta de Rate Limit Excedido

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Rate limit exceeded",
  "message": "Muitas requisições. Tente novamente em 15 minutos.",
  "retryAfter": 900
}
```

---

## Tratamento de Erros

### Formato Padrão de Erro

```json
{
  "error": "Código do erro",
  "message": "Descrição amigável do erro",
  "details": {
    "field": "Campo específico com erro",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "2025-06-15T14:30:00Z"
}
```

### Erros de Validação

```json
{
  "error": "Validation failed",
  "message": "Os dados enviados são inválidos",
  "details": {
    "registrationNumber": "Campo obrigatório",
    "date": "Data deve estar no formato YYYY-MM-DD",
    "operator": "Nome do operador é obrigatório"
  },
  "timestamp": "2025-06-15T14:30:00Z"
}
```

### Erros de Autenticação

```json
{
  "error": "Token inválido",
  "message": "Firebase ID token has expired",
  "details": {
    "code": "auth/id-token-expired"
  },
  "timestamp": "2025-06-15T14:30:00Z"
}
```

### Erros de Permissão

```json
{
  "error": "Acesso negado",
  "message": "Usuário não tem permissão para acessar este recurso",
  "details": {
    "requiredRole": "MANAGER",
    "userRole": "TECHNICIAN",
    "endpoint": "/api/tests/densidade-real/temp/123"
  },
  "timestamp": "2025-06-15T14:30:00Z"
}
```

---

## Notas Importantes

1. **Tokens Firebase**: Expiram automaticamente após 1 hora. Implemente renovação automática no frontend.

2. **Timestamps**: Todos os timestamps são em UTC formato ISO 8601.

3. **Paginação**: Endpoints de listagem suportam parâmetros `page` e `limit` (padrão: 20 itens).

4. **Ordenação**: Use parâmetro `sort` com valores `asc` ou `desc`.

5. **Filtros**: Endpoints de listagem suportam filtros por campos específicos.

6. **CORS**: Configurado para aceitar requests do domínio de produção e localhost em desenvolvimento.

7. **Logs**: Todas as requisições são logadas com IP, User-Agent e tempo de resposta.

Esta documentação da API serve como referência completa para desenvolvedores que trabalham com o sistema de laboratório geotécnico.