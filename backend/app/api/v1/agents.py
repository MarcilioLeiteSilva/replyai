from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.integration import SocialIntegration

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/run/{integration_id}")
def run_agent(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    integration = db.query(SocialIntegration).filter(
        SocialIntegration.id == integration_id,
        SocialIntegration.user_id == current_user.id,
        SocialIntegration.is_active == True,
    ).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integração não encontrada")

    from app.tasks.agent_runner import run_agent_for_integration
    task = run_agent_for_integration.delay(integration_id)
    return {"status": "queued", "task_id": task.id}


@router.get("/status/{task_id}")
def agent_status(task_id: str, current_user: User = Depends(get_current_user)):
    from app.core.celery_app import celery_app
    result = celery_app.AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": result.status,
        "result": result.result if result.ready() else None,
    }


@router.post("/stop/{task_id}")
def stop_agent(task_id: str, current_user: User = Depends(get_current_user)):
    from app.core.celery_app import celery_app
    celery_app.control.revoke(task_id, terminate=True)
    return {"status": "revoked", "task_id": task_id}
