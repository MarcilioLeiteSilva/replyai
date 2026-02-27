# 🚀 ReplyAI — Deploy no Easypanel (VPS)

## Pré-requisitos
- VPS com Ubuntu 22.04+ (mínimo 2 vCPU / 4GB RAM)
- Easypanel instalado: `curl -sSL https://easypanel.io/install.sh | sh`
- Domínio apontando para o IP do VPS (A record)
- Repositório no GitHub

---

## Passo 1 — Preparar repositório

```bash
# Clone e configure
git clone https://github.com/SEU_USUARIO/replyai.git
cd replyai

# Copie os .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edite com suas chaves reais
nano backend/.env
nano frontend/.env.local
```

---

## Passo 2 — Acessar o Easypanel

Acesse `http://SEU_IP:3000` → faça login → clique em **"Create Project"**

---

## Passo 3 — Criar o Stack

1. Clique em **"+ Add Service"** → **"App"**
2. Escolha **"Docker Compose"** e cole o conteúdo do `docker-compose.prod.yml`
3. Configure as variáveis de ambiente:

### Variáveis necessárias (Easypanel → Environment):

```env
# DB
POSTGRES_USER=replyai
POSTGRES_PASSWORD=SENHA_FORTE_AQUI
POSTGRES_DB=replyai_db

# App
DATABASE_URL=postgresql://replyai:SENHA_FORTE_AQUI@postgres:5432/replyai_db
REDIS_URL=redis://redis:6379/0
SECRET_KEY=GERE_COM: python -c "import secrets; print(secrets.token_hex(32))"
FRONTEND_URL=https://app.SEUDOMINIO.com
APP_URL=https://api.SEUDOMINIO.com

# OpenAI
OPENAI_API_KEY=sk-...

# Google
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.SEUDOMINIO.com/api/v1/integrations/youtube/callback

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Asaas
ASAAS_API_KEY=$aact_...
ASAAS_API_URL=https://api.asaas.com/api/v3

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-...

# Email
RESEND_API_KEY=re_...

# Fernet
FERNET_KEY=GERE_COM: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

## Passo 4 — Configurar Domínios & SSL

No Easypanel, para cada serviço:

| Serviço | Domínio | Porta |
|---------|---------|-------|
| `api` | `api.SEUDOMINIO.com` | 8000 |
| `frontend` | `app.SEUDOMINIO.com` | 3000 |

✅ Easypanel gera SSL automático com Let's Encrypt.

---

## Passo 5 — Fazer Deploy

```bash
# Build e push das imagens (CI/CD vai fazer isso automaticamente)
docker build -t ghcr.io/SEU_USUARIO/replyai-api:latest ./backend
docker push ghcr.io/SEU_USUARIO/replyai-api:latest

docker build -t ghcr.io/SEU_USUARIO/replyai-frontend:latest ./frontend
docker push ghcr.io/SEU_USUARIO/replyai-frontend:latest
```

No Easypanel, clique em **"Deploy"** → aguarde os containers subirem.

---

## Passo 6 — Verificar

```bash
# Testar API
curl https://api.SEUDOMINIO.com/health
# Resposta esperada: {"status":"ok","app":"ReplyAI"}

# Verificar logs
# Easypanel → Service → Logs
```

---

## Configurar Webhooks nos Gateways

### Stripe
- Dashboard Stripe → Webhooks → Adicionar endpoint:
  - URL: `https://api.SEUDOMINIO.com/api/v1/billing/webhook/stripe`
  - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Asaas
- Dashboard Asaas → Integrações → Webhooks:
  - URL: `https://api.SEUDOMINIO.com/api/v1/billing/webhook/asaas`
  - Evento: `PAYMENT_RECEIVED`

### Mercado Pago
- Dashboard MP → Suas integrações → Webhooks:
  - URL: `https://api.SEUDOMINIO.com/api/v1/billing/webhook/mp`
  - Tipo: `payment`

---

## CI/CD Automático (GitHub Actions)

O workflow `.github/workflows/ci.yml` vai:
1. Rodar testes e lint a cada push
2. Fazer build das imagens Docker no push para `main`

Para deploy automático no Easypanel, adicione um **Deploy Hook**:
- Easypanel → Service → Webhooks → Copiar URL
- GitHub → Settings → Webhooks → Adicionar URL do Easypanel
