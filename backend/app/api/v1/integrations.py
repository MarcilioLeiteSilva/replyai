import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from app.core.database import get_db
from app.core.config import settings
from app.core.security import encrypt_token, decrypt_token
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.integration import SocialIntegration, AgentConfig, Platform, AgentTone
from app.schemas.schemas import IntegrationOut, AgentConfigOut, AgentConfigUpdate

router = APIRouter(prefix="/integrations", tags=["integrations"])

YOUTUBE_SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]


def _check_integration_limit(user: User, db: Session):
    plan = user.plan
    if not plan:
        raise HTTPException(status_code=403, detail="Sem plano ativo")
    count = db.query(SocialIntegration).filter(
        SocialIntegration.user_id == user.id,
        SocialIntegration.is_active == True
    ).count()
    if count >= plan.max_integrations:
        raise HTTPException(
            status_code=402,
            detail=f"Limite de {plan.max_integrations} integração(ões) atingido. Faça upgrade do plano."
        )


@router.get("/", response_model=List[IntegrationOut])
def list_integrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SocialIntegration).filter(
        SocialIntegration.user_id == current_user.id
    ).all()


@router.delete("/{integration_id}", status_code=204)
def delete_integration(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    integration = db.query(SocialIntegration).filter(
        SocialIntegration.id == integration_id,
        SocialIntegration.user_id == current_user.id
    ).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    integration.is_active = False
    db.commit()


# ─── YouTube OAuth ────────────────────────────────────────────────────────────
@router.get("/youtube/connect")
def youtube_connect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _check_integration_limit(current_user, db)
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=YOUTUBE_SCOPES,
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        state=current_user.id,  # passamos o user_id no state
        prompt="consent",
    )
    return {"auth_url": auth_url}


@router.get("/youtube/callback")
def youtube_callback(
    code: str = Query(...),
    state: str = Query(...),  # user_id
    db: Session = Depends(get_db)
):
    user_id = state
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Usuário inválido no state")

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=YOUTUBE_SCOPES,
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    flow.fetch_token(code=code)
    creds = flow.credentials

    # Obter info do canal
    youtube = build("youtube", "v3", credentials=creds)
    channel_resp = youtube.channels().list(part="snippet", mine=True).execute()
    channel_info = channel_resp.get("items", [{}])[0]
    channel_id = channel_info.get("id", "")
    channel_name = channel_info.get("snippet", {}).get("title", "")
    channel_avatar = channel_info.get("snippet", {}).get("thumbnails", {}).get("default", {}).get("url")

    # Verificar se já existe integração ativa com este canal
    existing = db.query(SocialIntegration).filter(
        SocialIntegration.user_id == user_id,
        SocialIntegration.channel_id == channel_id,
        SocialIntegration.platform == Platform.youtube,
    ).first()

    if existing:
        # Atualiza tokens
        existing.access_token_enc = encrypt_token(creds.token)
        existing.refresh_token_enc = encrypt_token(creds.refresh_token or "")
        existing.is_active = True
        db.commit()
    else:
        integration = SocialIntegration(
            id=str(uuid.uuid4()),
            user_id=user_id,
            platform=Platform.youtube,
            channel_id=channel_id,
            channel_name=channel_name,
            channel_avatar=channel_avatar,
            access_token_enc=encrypt_token(creds.token),
            refresh_token_enc=encrypt_token(creds.refresh_token or ""),
        )
        db.add(integration)
        db.flush()

        # Config padrão do agente
        config = AgentConfig(
            id=str(uuid.uuid4()),
            integration_id=integration.id,
        )
        db.add(config)
        db.commit()

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?connected=youtube")


# ─── Agent Config ─────────────────────────────────────────────────────────────
@router.get("/{integration_id}/config", response_model=AgentConfigOut)
def get_agent_config(
    integration_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    integration = db.query(SocialIntegration).filter(
        SocialIntegration.id == integration_id,
        SocialIntegration.user_id == current_user.id
    ).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    if not integration.agent_config:
        raise HTTPException(status_code=404, detail="Config não encontrada")
    return integration.agent_config


@router.patch("/{integration_id}/config", response_model=AgentConfigOut)
def update_agent_config(
    integration_id: str,
    body: AgentConfigUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    integration = db.query(SocialIntegration).filter(
        SocialIntegration.id == integration_id,
        SocialIntegration.user_id == current_user.id
    ).first()
    if not integration or not integration.agent_config:
        raise HTTPException(status_code=404, detail="Integração/config não encontrada")

    config = integration.agent_config
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(config, field, value)
    db.commit()
    db.refresh(config)
    return config
