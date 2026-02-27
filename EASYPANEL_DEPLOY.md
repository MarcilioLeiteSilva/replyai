# 🚀 ReplyAI — Deploy no Easypanel via Dockerfile

## Visão geral

No Easypanel, crie cada serviço como um **"App"** apontando para o Dockerfile no GitHub. O Easypanel builda automaticamente a cada push.

```
GitHub Push → Easypanel detecta → Docker build → Deploy ✅
```

---

## Pré-requisitos
- VPS Ubuntu 22.04+ (mínimo 2 vCPU / 4GB RAM)
- Easypanel instalado (`curl -sSL https://easypanel.io/install.sh | sh`)
- Domínios apontando para o IP do VPS:
  - `api.seudominio.com` → A record para IP do VPS
  - `app.seudominio.com` → A record para IP do VPS

---

## Passo 1 — Criar o Projeto

1. Acesse Easypanel: `http://SEU_IP:3000`
2. **Projects** → **+ New Project** → nome: `replyai`

---

## Passo 2 — Adicionar PostgreSQL e Redis (Add-ons)

Dentro do projeto `replyai`:

1. **+ Add Service** → **Postgres** → nome: `postgres`
   - Copie o **connection string** gerado (você vai usar em `DATABASE_URL`)

2. **+ Add Service** → **Redis** → nome: `redis`
   - Copie o **connection string** gerado (você vai usar em `REDIS_URL`)

---

## Passo 3 — Serviço API (FastAPI)

**+ Add Service** → **App** → configure:

| Campo | Valor |
|---|---|
| **Name** | `api` |
| **Source** | GitHub → `MarcilioLeiteSilva/replyai` |
| **Branch** | `main` |
| **Dockerfile** | `backend/Dockerfile` |
| **Port** | `8000` |
| **Command** *(override)* | `sh -c "python scripts/seed_plans.py && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2"` |

**Domínio:** `api.seudominio.com` → porta 8000

**Variáveis de ambiente** (aba *Environment*):
```env
DATABASE_URL=postgresql://replyai:SENHA@postgres:5432/replyai_db
REDIS_URL=redis://redis:6379/0
SECRET_KEY=GERE_COM: python -c "import secrets; print(secrets.token_hex(32))"
APP_ENV=production
APP_URL=https://api.seudominio.com
FRONTEND_URL=https://app.seudominio.com
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.seudominio.com/api/v1/integrations/youtube/callback
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ASAAS_API_KEY=$aact_...
ASAAS_API_URL=https://api.asaas.com/api/v3
MP_ACCESS_TOKEN=APP_USR-...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@seudominio.com
FERNET_KEY=GERE_COM: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

## Passo 4 — Serviço Worker (Celery)

**+ Add Service** → **App** → configure:

| Campo | Valor |
|---|---|
| **Name** | `worker` |
| **Source** | GitHub → `MarcilioLeiteSilva/replyai` |
| **Branch** | `main` |
| **Dockerfile** | `backend/Dockerfile` |
| **Command** | `celery -A app.core.celery_app.celery_app worker --loglevel=info --concurrency=2` |

**Variáveis de ambiente** (mesmas da API):
```env
DATABASE_URL=...  (igual ao serviço api)
REDIS_URL=...
SECRET_KEY=...
OPENAI_API_KEY=...
FERNET_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Passo 5 — Serviço Beat (Agendador)

**+ Add Service** → **App** → configure:

| Campo | Valor |
|---|---|
| **Name** | `beat` |
| **Source** | GitHub → `MarcilioLeiteSilva/replyai` |
| **Branch** | `main` |
| **Dockerfile** | `backend/Dockerfile` |
| **Command** | `celery -A app.core.celery_app.celery_app beat --loglevel=info` |

**Variáveis:** `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`, `OPENAI_API_KEY`, `FERNET_KEY`

---

## Passo 6 — Serviço Frontend (Next.js)

**+ Add Service** → **App** → configure:

| Campo | Valor |
|---|---|
| **Name** | `frontend` |
| **Source** | GitHub → `MarcilioLeiteSilva/replyai` |
| **Branch** | `main` |
| **Dockerfile** | `frontend/Dockerfile` |
| **Port** | `3000` |
| **Build Args** | `NEXT_PUBLIC_API_URL=https://api.seudominio.com` |

**Domínio:** `app.seudominio.com` → porta 3000

**Variável de ambiente:**
```env
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

---

## Passo 7 — Deploy

Clique em **Deploy** em cada serviço (comece pelo `postgres` e `redis`, depois `api`, depois o resto).

> ⏱️ O primeiro build demora ~5-10 min (compilação do Next.js). Os próximos são mais rápidos pelo cache do Docker.

---

## Passo 8 — Verificar

```bash
curl https://api.seudominio.com/health
# {"status":"ok","app":"ReplyAI"}
```

Acesse `https://app.seudominio.com` — deve carregar o landing page.

---

## Auto-deploy a cada push

No Easypanel, cada serviço tem a opção **"Auto-deploy"** — ative para que a cada `git push` o Easypanel refaça o build automaticamente.

---

## Configurar Webhooks de Pagamento

| Gateway | URL do Webhook |
|---|---|
| **Stripe** | `https://api.seudominio.com/api/v1/billing/webhook/stripe` |
| **Asaas** | `https://api.seudominio.com/api/v1/billing/webhook/asaas` |
| **Mercado Pago** | `https://api.seudominio.com/api/v1/billing/webhook/mp` |

---

## Gerar chaves

```bash
# SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# FERNET_KEY
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```
