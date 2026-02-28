from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.v1.auth import get_current_admin_user
from app.models.user import User, Plan, Subscription
from app.models.integration import SocialIntegration
from app.models.comment import Comment, Response
from typing import List, Dict

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Estatísticas globais para o dashboard administrativo."""
    total_users = db.query(func.count(User.id)).scalar()
    total_integrations = db.query(func.count(SocialIntegration.id)).scalar()
    total_comments = db.query(func.count(Comment.id)).scalar()
    total_responses = db.query(func.count(Response.id)).scalar()
    
    # Usuários por plano
    users_by_plan = db.query(Plan.name, func.count(User.id)).join(User).group_by(Plan.name).all()
    
    return {
        "total_users": total_users,
        "total_integrations": total_integrations,
        "total_comments": total_comments,
        "total_responses": total_responses,
        "users_by_plan": {name: count for name, count in users_by_plan}
    }

@router.get("/users")
def list_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Lista todos os usuários do sistema."""
    users = db.query(User).all()
    return users

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: str,
    is_active: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Ativar/Desativar um usuário."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    user.is_active = is_active
    db.commit()
    return {"message": f"Usuário {'ativado' if is_active else 'desativado'} com sucesso"}

@router.get("/system-status")
def get_system_status(admin: User = Depends(get_current_admin_user)):
    """Verifica a saúde dos serviços essenciais (Celery, Banco, etc)."""
    from app.core.celery_app import celery_app
    from sqlalchemy import text
    from app.core.database import SessionLocal
    
    db_status = "offline"
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
            db_status = "online"
    except Exception:
        pass

    worker_status = "offline"
    try:
        # ping return something like: [{'celery@hostname': {'ok': 'pong'}}] or empty if offline
        ping = celery_app.control.ping(timeout=1.0)
        if ping:
            worker_status = "online"
    except Exception:
        pass

    return {
        "api": "online",
        "database": db_status,
        "celery_workers": worker_status,
        "scheduler": "active" if worker_status == "online" else "inactive"
    }
