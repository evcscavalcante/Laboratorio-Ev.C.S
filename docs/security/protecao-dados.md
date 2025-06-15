# Segurança do Sistema - Laboratório Geotécnico

## Visão Geral

O sistema implementa medidas básicas de segurança através de:

- **Autenticação Firebase** para controle de acesso
- **Validação de entrada** com schemas Zod
- **Controle de acesso granular** com RBAC (Role-Based Access Control)
- **Rate limiting** para proteção contra ataques

## 1. Sistema de Autenticação

### Firebase Authentication
- **Tokens JWT** validados em todos os endpoints protegidos
- **5 roles hierárquicos**: VIEWER, TECHNICIAN, MANAGER, ADMIN, DEVELOPER
- **27 endpoints** protegidos com middleware de autenticação
- **4 endpoints temporários** bloqueados com status 410

### Validação de Dados
```typescript
// Exemplo de validação com Zod
import { densityInSituSchema } from '../shared/validation-schemas';

const validatedData = densityInSituSchema.parse(requestData);
```

## 2. Sistema de Backup Automático

### Configuração de Backup
- **Backup completo**: Diário às 2:00 AM
- **Backup incremental**: A cada 6 horas
- **Criptografia**: Todos os backups são criptografados
- **Compressão**: Gzip para reduzir tamanho
- **Retenção**: 7 dias (diário), 4 semanas (semanal), 12 meses (mensal)

### Estrutura de Armazenamento
```
backups/
├── daily/          # Backups diários
├── weekly/         # Backups semanais
├── monthly/        # Backups mensais
└── incremental/    # Backups incrementais
```

### Comandos de Backup
```bash
# Criar backup manual
curl -X POST /api/security/backup \
  -H "Authorization: Bearer $TOKEN"

# Listar backups disponíveis
curl /api/security/backups \
  -H "Authorization: Bearer $TOKEN"

# Restaurar backup específico
node scripts/restore-backup.js backup-path.sql.gz.encrypted
```

### Recuperação de Desastres
1. **Identificar backup mais recente**
2. **Descriptografar arquivo de backup**
3. **Descompactar se necessário**
4. **Restaurar no PostgreSQL**
5. **Verificar integridade dos dados**

## 3. Sistema de Auditoria

### Eventos Auditados
- **Autenticação**: login, logout, tentativas falhas
- **Autorização**: mudanças de permissões e roles
- **Dados**: criação, modificação, exclusão
- **Sistema**: configurações, backups, acessos administrativos
- **Segurança**: violações, tentativas de acesso não autorizado

### Níveis de Severidade
- **LOW**: Operações normais (visualizações, login)
- **MEDIUM**: Modificações de dados, configurações
- **HIGH**: Mudanças de permissões, operações administrativas
- **CRITICAL**: Violações de segurança, falhas de sistema

### Consulta de Logs
```bash
# Logs por usuário
curl "/api/security/audit-logs?userId=user123&limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Logs por tipo de evento
curl "/api/security/audit-logs?eventType=data_modified" \
  -H "Authorization: Bearer $TOKEN"

# Resumo semanal
curl "/api/security/audit-summary?timeframe=week" \
  -H "Authorization: Bearer $TOKEN"
```

### Alertas Automáticos
- **Eventos críticos**: Notificação imediata
- **Múltiplas tentativas de login**: Rate limiting + alerta
- **Mudanças de permissão**: Log detalhado + notificação
- **Backup failures**: Alerta para administradores

## 4. Controle de Acesso Granular (RBAC)

### Roles do Sistema
```typescript
ADMIN      // Acesso total ao sistema
MANAGER    // Gerenciamento de laboratório
TECHNICIAN // Operação de ensaios
ANALYST    // Análise de dados
VIEWER     // Apenas visualização
GUEST      // Acesso muito limitado
```

### Permissões Granulares
```typescript
// Usuários
USER_CREATE, USER_READ, USER_UPDATE, USER_DELETE, USER_ASSIGN_ROLES

// Ensaios
TEST_CREATE, TEST_READ, TEST_UPDATE, TEST_DELETE, TEST_APPROVE, TEST_EXPORT

// Equipamentos
EQUIPMENT_CREATE, EQUIPMENT_READ, EQUIPMENT_UPDATE, EQUIPMENT_DELETE, EQUIPMENT_CALIBRATE

// Sistema
SYSTEM_CONFIG, SYSTEM_BACKUP, SYSTEM_RESTORE, SYSTEM_LOGS, SYSTEM_AUDIT, SYSTEM_MONITORING

// Dados sensíveis
DATA_EXPORT_ALL, DATA_IMPORT, DATA_PURGE
```

### Gerenciamento de Permissões
```bash
# Atribuir role
curl -X POST "/api/security/users/user123/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"role": "TECHNICIAN", "action": "assign"}'

# Conceder permissão específica
curl -X POST "/api/security/users/user123/permissions" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"permission": "TEST_APPROVE", "granted": true, "reason": "Técnico sênior"}'
```

### Middleware de Proteção
```typescript
// Proteger rota com permissão específica
app.get('/api/admin/users', 
  accessControl.requirePermission(Permission.USER_READ),
  (req, res) => {
    // Handler protegido
  }
);

// Proteger rota com role
app.post('/api/system/config',
  accessControl.requireRole(SystemRole.ADMIN),
  (req, res) => {
    // Apenas administradores
  }
);
```

## 2. Controle de Acesso

### Sistema de Roles
- **5 níveis hierárquicos**: VIEWER, TECHNICIAN, MANAGER, ADMIN, DEVELOPER
- **Validação por token**: Firebase Authentication em 27 endpoints
- **Middleware de proteção**: requireRole() implementado
- **Rate limiting**: Proteção básica contra ataques

### Logs Básicos
```bash
# Status básico do sistema
curl "/api/health" 

# Métricas simples
curl "/api/metrics"
```

## 6. Procedimentos de Emergência

### Comprometimento de Chave
1. **Gerar nova chave mestra**
2. **Re-criptografar todos os dados**
3. **Atualizar variável de ambiente**
4. **Reiniciar aplicação**
5. **Auditar todos os acessos recentes**

### Violação de Segurança
1. **Identificar escopo da violação**
2. **Bloquear acessos comprometidos**
3. **Revisar logs de auditoria**
4. **Notificar partes interessadas**
5. **Implementar correções necessárias**

### Falha de Backup
1. **Verificar última cópia funcional**
2. **Executar backup manual imediato**
3. **Investigar causa da falha**
4. **Ajustar configuração se necessário**
5. **Documentar incidente**

## 7. Monitoramento e Alertas

### Métricas de Segurança
- **Taxa de tentativas de login falhosas**
- **Frequência de mudanças de permissão**
- **Sucesso de backups automáticos**
- **Tempo de resposta do sistema de auditoria**

### Dashboards
- **Status de segurança geral**
- **Atividade de auditoria em tempo real**
- **Saúde do sistema de backup**
- **Distribuição de roles e permissões**

### Alertas Configuráveis
- **Email**: Para eventos críticos
- **Slack**: Para alertas operacionais
- **Dashboard**: Para monitoramento contínuo
- **Logs estruturados**: Para integração com SIEM

---

**Este sistema de proteção de dados garante conformidade com LGPD, segurança empresarial e recuperação robusta em casos de emergência.**