# 🚀 ReplyAI — Deploy no Easypanel

## Pré-requisitos
- VPS com Ubuntu 22.04+ (mínimo 2 vCPU / 4GB RAM)
- Easypanel instalado: `curl -sSL https://easypanel.io/install.sh | sh`
- Domínio com **dois subdomínios** apontando para o IP do VPS:
  - `api.seudominio.com` → IP do VPS
  - `app.seudominio.com` → IP do VPS
- (registros A no seu provedor de DNS)

---

## Passo 1 — Conectar o repositório GitHub ao Easypanel

1. Acesse o painel: `http://SEU_IP:3000`
2. Clique em **"Projects"** → **"+ New Project"** → nome: `replyai`
3. Vá em **"Sources"** → conecte sua conta GitHub (autorize o Easypanel)

---

## Passo 2 — Criar o Stack via Docker Compose

1. Dentro do projeto **replyai**, clique em **"+ Add Service"**
2. Escolha **"Docker Compose"**
3. No campo **"Repository"**, selecione: `MarcilioLeiteSilva/replyai`
4. No campo **"File Path"**, coloque: `easypanel-compose.yml`
5. (Easypanel vai clonar o repositório e usar esse arquivo)

---

## Passo 3 — Configurar variáveis de ambiente

Clique em cada serviço e adicione as variáveis. Ou use o campo de variáveis globais do stack.

### Variáveis obrigatórias:

```env
# Banco de dados
POSTGRES_USER=replyai
POSTGRES_PASSWORD=SENHA_FORTE_AQUI

# Gere com: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=GERE_UMA_SENHA_FORTE_AQUI

# URLs da aplicação
APP_URL=https://api.seudominio.com
FRONTEND_URL=https://app.seudominio.com

# OpenAI
OPENAI_API_KEY=sk-...

# Google (para YouTube OAuth)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...

# Asaas
ASAAS_API_KEY=$aact_...
ASAAS_API_URL=https://api.asaas.com/api/v3

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@seudominio.com

# Fernet (criptografia de tokens OAuth)
# Gere com: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
FERNET_KEY=GERE_AQUI=
```

---

## Passo 4 — Configurar domínios e SSL

No Easypanel, para cada serviço clique em **"Domains"**:

| Serviço | Domínio | Porta |
|---------|---------|-------|
| `api` | `api.seudominio.com` | 8000 |
| `frontend` | `app.seudominio.com` | 3000 |

✅ O Let's Encrypt é ativado automaticamente pelo Easypanel.

---

## Passo 5 — Fazer o Deploy

1. Clique em **"Deploy"** no stack
2. O Easypanel vai:
   - Clonar o repositório GitHub
   - Buildar os Dockerfiles (backend e frontend)
   - Subir todos os containers
3. Acompanhe os logs no painel

> ⏱️ O primeiro build demora ~5-10 min (compilação do Next.js)

---

## Passo 6 — Verificar

```bash
# Testar API (substitua pelo seu domínio)
curl https://api.seudominio.com/health
# Resposta: {"status":"ok","app":"ReplyAI"}
```

Acesse `https://app.seudominio.com` — o frontend deve carregar.

---

## Passo 7 — Configurar Webhooks nos Gateways de Pagamento

### Stripe
- Dashboard → Webhooks → **Add endpoint**
- URL: `https://api.seudominio.com/api/v1/billing/webhook/stripe`
- Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copie o **Webhook Secret** gerado e atualize `STRIPE_WEBHOOK_SECRET` no Easypanel

### Asaas
- Dashboard → Integrações → Webhooks
- URL: `https://api.seudominio.com/api/v1/billing/webhook/asaas`
- Evento: `PAYMENT_RECEIVED`

### Mercado Pago
- Dashboard → Integrações → Webhooks
- URL: `https://api.seudominio.com/api/v1/billing/webhook/mp`
- Tipo: `payment`

---

## Deploy Automático (a cada push no GitHub)

No Easypanel:
1. Stack → **Webhook** → copiar URL do webhook
2. GitHub → repositório `replyai` → **Settings → Webhooks → Add webhook**
3. Cole a URL do Easypanel → Content type: `application/json` → **Add webhook**

A partir daí, cada `git push` ativa o redeploy automático. 🚀

---

## Gerar as chaves necessárias (rodar no Windows/Linux)

```bash
# SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# FERNET_KEY
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Ou via pip install se não tiver cryptography:
pip install cryptography -q && python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```
