from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "replyai",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.agent_runner", "app.tasks.scheduler"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    # Beat schedule — cada integração ativa roda a cada 15 min
    beat_schedule={
        "run-all-active-agents": {
            "task": "app.tasks.scheduler.schedule_active_agents",
            "schedule": 900.0,  # 15 minutos
        },
    },
)
