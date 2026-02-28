from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.integration import SocialIntegration


@celery_app.task(name="app.tasks.scheduler.schedule_active_agents")
def schedule_active_agents():
    """Executa a cada 15 minutos via Celery Beat.
    Enfileira run_agent_for_integration para cada integração ativa."""
    from app.tasks.agent_runner import run_agent_for_integration

    db = SessionLocal()
    try:
        active = db.query(SocialIntegration).filter(
            SocialIntegration.is_active == True
        ).all()

        count = 0
        for integration in active:
            # Enfileirar sempre que estiver ativo (para buscar novos comentários)
            run_agent_for_integration.delay(integration.id)
            count += 1

        return {"scheduled": count}
    finally:
        db.close()
