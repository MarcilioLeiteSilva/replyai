import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from datetime import datetime, timezone
from sqlalchemy import text
from app.core.database import SessionLocal, engine, Base

from app.models import *  # importa todos os modelos


def seed_plans():
    import time
    max_retries = 5
    for i in range(max_retries):
        try:
            db = SessionLocal()
            # Test connection
            db.execute(text("SELECT 1"))
            print(f"✅ Conexão com banco estabelecida (tentativa {i+1})")
            break
        except Exception as e:
            if i == max_retries - 1:
                print(f"❌ Erro fatal após {max_retries} tentativas: {e}")
                return
            print(f"⚠️  Banco não disponível, tentando novamente em 5s... ({e})")
            time.sleep(5)
    
    try:
        from app.models.user import Plan, PlanSlug
        plans = [
            Plan(
                id=str(uuid.uuid4()),
                slug=PlanSlug.free,
                name="Gratuito",
                price_monthly=0.0,
                max_integrations=1,
                max_responses_per_day=20,
                max_personas=1,
                platforms_json=["youtube"],
                features_json={"export_csv": False, "analytics_advanced": False, "api_access": False},
            ),
            Plan(
                id=str(uuid.uuid4()),
                slug=PlanSlug.starter,
                name="Starter",
                price_monthly=49.0,
                max_integrations=2,
                max_responses_per_day=200,
                max_personas=1,
                platforms_json=["youtube", "instagram"],
                features_json={"export_csv": True, "analytics_advanced": False, "api_access": False},
            ),
            Plan(
                id=str(uuid.uuid4()),
                slug=PlanSlug.pro,
                name="Pro",
                price_monthly=149.0,
                max_integrations=5,
                max_responses_per_day=1000,
                max_personas=3,
                platforms_json=["youtube", "instagram", "tiktok", "facebook"],
                features_json={"export_csv": True, "analytics_advanced": True, "api_access": False},
            ),
            Plan(
                id=str(uuid.uuid4()),
                slug=PlanSlug.agency,
                name="Agency",
                price_monthly=449.0,
                max_integrations=999,
                max_responses_per_day=10000,
                max_personas=999,
                platforms_json=["youtube", "instagram", "tiktok", "facebook", "twitter"],
                features_json={"export_csv": True, "analytics_advanced": True, "api_access": True},
            ),
        ]

        for plan in plans:
            existing = db.query(Plan).filter(Plan.slug == plan.slug).first()
            if not existing:
                db.add(plan)
                print(f"✅ Plano criado: {plan.name}")
            else:
                print(f"⚠️  Plano já existe: {plan.name}")

        db.commit()
        print("\n🎉 Seed de planos concluído!")
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Criando tabelas e populando planos...")
    Base.metadata.create_all(bind=engine)
    seed_plans()
