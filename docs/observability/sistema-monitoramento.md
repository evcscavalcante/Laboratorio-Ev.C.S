# Sistema de Observabilidade - Laboratório Geotécnico

## Implementação Completa

O sistema de observabilidade fornece monitoramento abrangente com:

### 1. Logs Estruturados
- **Níveis:** ERROR, WARN, INFO, DEBUG, TRACE
- **Formato JSON** em produção para análise automatizada
- **Contexto rico** com metadados específicos

### 2. Monitoramento de Erros
- **Classificação automática** por severidade e categoria
- **Agrupamento inteligente** de erros similares
- **Alertas baseados em thresholds** configuráveis

### 3. Métricas de Performance
- **Tempo de resposta** por endpoint
- **Uso de recursos** (memória, CPU)
- **Throughput** e percentis
- **Detecção de degradação** automática

### 4. Sistema de Alertas
- **Multi-canal:** Slack, email, console
- **Rate limiting** para evitar spam
- **Escalation** baseado em severidade

## Endpoints Disponíveis

```
GET /api/health           # Status geral do sistema
GET /api/metrics/performance  # Métricas de performance
GET /api/metrics/errors      # Estatísticas de erros
GET /api/alerts             # Alertas ativos
GET /api/observability/dashboard  # Dashboard consolidado
```

## Configuração

### Variáveis de Ambiente
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
ALERT_EMAIL=admin@lab.com
NODE_ENV=production
```

### Uso no Código
```typescript
import { serverLogger, errorMonitor } from './observability';

// Log estruturado
serverLogger.info('Ensaio criado', { ensaioId: 123, tipo: 'densidade' });

// Captura de erro com contexto
errorMonitor.captureError(
  error,
  'high',
  'calculation',
  { ensaioId: 123, operador: 'João' }
);
```

## Benefícios

- **Visibilidade completa** do sistema em produção
- **Detecção proativa** de problemas
- **Debugging facilitado** com contexto rico
- **Alertas inteligentes** para ação rápida
- **Métricas de performance** para otimização