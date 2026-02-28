from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from app.core.config import settings

from app.core.database import engine, Base, SessionLocal
from app.api.v1 import auth, users, integrations, comments, agents, billing


def _create_tables_and_seed():
    """Cria tabelas e popula planos no banco (idempotente)."""
    # Importa todos os modelos para registrá-los no metadata
    from app.models import user, integration, comment  # noqa: F401

    Base.metadata.create_all(bind=engine)

    # Seed dos planos (só insere se não existir)
    from app.models.user import Plan, PlanSlug
    import uuid
    from datetime import datetime, timezone

    default_plans = [
        dict(slug=PlanSlug.free, name="Gratuito", price_monthly=0.0,
             max_integrations=1, max_responses_per_day=20, max_personas=1,
             platforms_json=["youtube"],
             features_json={"export_csv": False, "analytics_advanced": False, "api_access": False}),
        dict(slug=PlanSlug.starter, name="Starter", price_monthly=49.0,
             max_integrations=2, max_responses_per_day=200, max_personas=1,
             platforms_json=["youtube", "instagram"],
             features_json={"export_csv": True, "analytics_advanced": False, "api_access": False}),
        dict(slug=PlanSlug.pro, name="Pro", price_monthly=149.0,
             max_integrations=5, max_responses_per_day=1000, max_personas=3,
             platforms_json=["youtube", "instagram", "tiktok", "facebook"],
             features_json={"export_csv": True, "analytics_advanced": True, "api_access": False}),
        dict(slug=PlanSlug.agency, name="Agency", price_monthly=449.0,
             max_integrations=999, max_responses_per_day=10000, max_personas=999,
             platforms_json=["youtube", "instagram", "tiktok", "facebook", "twitter"],
             features_json={"export_csv": True, "analytics_advanced": True, "api_access": True}),
    ]

    db = SessionLocal()
    try:
        for p in default_plans:
            if not db.query(Plan).filter(Plan.slug == p["slug"]).first():
                db.add(Plan(id=str(uuid.uuid4()), **p))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[startup] seed error (ignorado): {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        _create_tables_and_seed()
        print("[startup] Tabelas criadas e planos populados ✓")
    except Exception as e:
        print(f"[startup] ERRO ao criar tabelas: {e}")
    yield


app = FastAPI(
    title="ReplyAI API",
    description="SaaS de respostas automáticas para redes sociais",
    version="1.0.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

# Proxy Headers (Necessário atrás de Traefik/Easypanel/Nginx)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporário para depuração; em produção deve ser mais restrito
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Rotas
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(integrations.router, prefix="/api/v1")
app.include_router(comments.router, prefix="/api/v1")
app.include_router(agents.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME}

