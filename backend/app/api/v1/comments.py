from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.integration import SocialIntegration
from app.models.comment import Comment, Response as CommentResponse, ResponseStatus
from app.schemas.schemas import CommentOut, DashboardStats, DailyStatOut

router = APIRouter(prefix="/comments", tags=["comments"])


@router.get("/", response_model=List[CommentOut])
def list_comments(
    platform: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Pegar IDs de integrações do usuário
    integration_ids = [
        i.id for i in db.query(SocialIntegration.id).filter(
            SocialIntegration.user_id == current_user.id
        ).all()
    ]

    q = db.query(Comment).options(joinedload(Comment.response)).filter(
        Comment.integration_id.in_(integration_ids)
    )

    if category:
        q = q.filter(Comment.category == category)
    if search:
        q = q.filter(Comment.text.ilike(f"%{search}%"))
    if status and status in [s.value for s in ResponseStatus]:
        q = q.join(Comment.response).filter(CommentResponse.status == status)

    total = q.count()
    items = q.order_by(desc(Comment.created_at)).offset((page - 1) * limit).limit(limit).all()
    return items


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from datetime import datetime, timezone, date

    integration_ids = [
        i.id for i in db.query(SocialIntegration.id).filter(
            SocialIntegration.user_id == current_user.id
        ).all()
    ]

    today_str = date.today().isoformat()

    total_comments = db.query(func.count(Comment.id)).filter(
        Comment.integration_id.in_(integration_ids)
    ).scalar() or 0

    total_responses = db.query(func.count(CommentResponse.id)).join(Comment).filter(
        Comment.integration_id.in_(integration_ids),
        CommentResponse.status == ResponseStatus.sent
    ).scalar() or 0

    today_comments = db.query(func.count(Comment.id)).filter(
        Comment.integration_id.in_(integration_ids),
        func.date(Comment.created_at) == today_str
    ).scalar() or 0

    today_responses = db.query(func.count(CommentResponse.id)).join(Comment).filter(
        Comment.integration_id.in_(integration_ids),
        CommentResponse.status == ResponseStatus.sent,
        func.date(CommentResponse.sent_at) == today_str
    ).scalar() or 0

    active_integrations = db.query(func.count(SocialIntegration.id)).filter(
        SocialIntegration.user_id == current_user.id,
        SocialIntegration.is_active == True
    ).scalar() or 0

    rate = round((total_responses / total_comments * 100) if total_comments > 0 else 0, 1)

    return DashboardStats(
        today_comments=today_comments,
        today_responses=today_responses,
        total_comments=total_comments,
        total_responses=total_responses,
        response_rate=rate,
        active_integrations=active_integrations,
    )


@router.patch("/{comment_id}/approve", status_code=200)
def approve_response(
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Aprova manualmente uma resposta pendente e a envia."""
    comment = db.query(Comment).join(SocialIntegration).filter(
        Comment.id == comment_id,
        SocialIntegration.user_id == current_user.id,
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comentário não encontrado")
    if not comment.response or comment.response.status != ResponseStatus.pending:
        raise HTTPException(status_code=400, detail="Nenhuma resposta pendente")

    # Enfileira envio como task Celery
    from app.tasks.agent_runner import send_single_reply
    send_single_reply.delay(str(comment.response.id))
    return {"message": "Resposta aprovada e enfileirada para envio"}


@router.patch("/{comment_id}/reject", status_code=200)
def reject_response(
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = db.query(Comment).join(SocialIntegration).filter(
        Comment.id == comment_id,
        SocialIntegration.user_id == current_user.id,
    ).first()
    if not comment or not comment.response:
        raise HTTPException(status_code=404, detail="Comentário não encontrado")

    comment.response.status = ResponseStatus.rejected
    db.commit()
    return {"message": "Resposta rejeitada"}
