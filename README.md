# ReplyAI 🤖

**SaaS de respostas automáticas para redes sociais com IA**

Automatize comentários no YouTube, Instagram, TikTok e Facebook usando GPT-4o.

---

## Stack

| Camada | Tech |
|---|---|
| Backend API | FastAPI (Python 3.12) + Celery |
| Frontend | Next.js 14 (App Router, TypeScript) |
| Banco | PostgreSQL 16 + Redis 7 |
| Pagamentos | Stripe + Asaas + Mercado Pago |
| Deploy | VPS + Easypanel (Docker) |
| CI/CD | GitHub Actions |

---

## Rodar localmente

### 1. Pré-requisitos
- Docker + Docker Compose
- Python 3.12
- Node.js 20

### 2. Configurar variáveis de ambiente

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Edite os arquivos com suas chaves
```

### 3. Subir com Docker Compose

```bash
docker-compose up --build
```

Serviços:
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Flower (Celery): http://localhost:5555

### 4. Seed do banco de dados

```bash
docker-compose exec api python scripts/seed_plans.py
```

---

## Deploy em Produção

Veja o guia completo em [`EASYPANEL_DEPLOY.md`](./EASYPANEL_DEPLOY.md)

---

## Estrutura do Projeto

```
replyai/
├── backend/          # FastAPI API + Celery workers
├── frontend/         # Next.js 14 frontend
├── .github/          # GitHub Actions CI/CD
├── docker-compose.yml        # Dev local
├── docker-compose.prod.yml   # Produção VPS
└── EASYPANEL_DEPLOY.md       # Guia de deploy
```

---

## Planos

| Plano | Preço | Integrações | Respostas/dia |
|---|---|---|---|
| Gratuito | R$0 | 1 | 20 |
| Starter | R$49/mês | 2 | 200 |
| Pro | R$149/mês | 5 | 1.000 |
| Agency | R$449/mês | Ilimitado | 10.000 |

---

## Licença

Proprietário — All rights reserved © 2026 ReplyAI
