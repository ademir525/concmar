# API de Pagamentos PIX - ConcSP

API para processamento de pagamentos PIX via gateway Mangofy.

## Endpoints

### Health Check
```
GET /health
```

### Gerar Pagamento PIX
```
POST /api/pix/generate
Content-Type: application/json

{
  "cpf": "12345678901",
  "name": "Nome Completo",
  "email": "email@exemplo.com",
  "phone": "11999999999",
  "amount": 9000,
  "description": "Taxa de Inscrição - Concurso GCM-SP"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "paymentCode": "abc123",
    "status": "pending",
    "amount": 9000,
    "amountFormatted": "R$ 90,00",
    "externalCode": "CONCSP-123456",
    "pix": {
      "qrCode": "00020126...",
      "qrCodeImage": "data:image/png;base64,...",
      "expiresAt": "2024-01-01T23:59:59"
    }
  }
}
```

### Consultar Status
```
GET /api/pix/status/:paymentCode
```

### Webhook (recebe notificações da Mangofy)
```
POST /api/webhook
```

## Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `MANGOFY_API_KEY` | Chave de API da Mangofy | Sim |
| `MANGOFY_STORE_CODE` | Código da loja na Mangofy | Sim |
| `PORT` | Porta do servidor (padrão: 3000) | Não |
| `ALLOWED_ORIGINS` | URLs permitidas para CORS (separar por vírgula) | Não |
| `WEBHOOK_URL` | URL para receber webhooks de pagamento | Não |

## Deploy no Coolify

### 1. Criar novo serviço
- No Coolify, clique em "New Resource" > "Docker"
- Conecte ao repositório Git ou faça upload do código

### 2. Configurar variáveis de ambiente
No painel do Coolify, adicione as variáveis:
```
MANGOFY_API_KEY=sua_chave_aqui
MANGOFY_STORE_CODE=seu_codigo_aqui
ALLOWED_ORIGINS=https://seu-frontend.com
WEBHOOK_URL=https://sua-api.com/api/webhook
```

### 3. Configurar porta
- Container Port: 3000
- Exposed Port: 3000 (ou a porta que preferir)

### 4. Deploy
Clique em "Deploy" e aguarde o build.

## Desenvolvimento Local

```bash
# Instalar dependências
bun install

# Criar arquivo .env
cp .env.example .env
# Edite o .env com suas credenciais

# Rodar em desenvolvimento
bun run dev
```

## Testando a API

```bash
# Health check
curl http://localhost:3000/health

# Gerar pagamento PIX
curl -X POST http://localhost:3000/api/pix/generate \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "name": "Teste Usuario",
    "email": "teste@email.com",
    "amount": 9000,
    "description": "Taxa de Inscrição"
  }'
```
