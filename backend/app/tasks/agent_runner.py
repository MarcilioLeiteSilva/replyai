import uuid
import time
from datetime import datetime, timezone
from celery import shared_task
from sqlalchemy.orm import Session

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.security import decrypt_token
from app.core.ai.classifier import classify_comment
from app.core.ai.responder import generate_reply
from app.models.integration import SocialIntegration, Platform
from app.models.comment import Comment, Response as CommentResponse, ResponseStatus, CommentCategory
from app.models.user import User


def _get_db() -> Session:
    return SessionLocal()


@celery_app.task(bind=True, name="app.tasks.agent_runner.run_agent_for_integration", max_retries=3)
def run_agent_for_integration(self, integration_id: str):
    """Executa o agente de resposta para uma integração específica (multi-tenant)."""
    db = _get_db()
    try:
        integration = db.query(SocialIntegration).filter(
            SocialIntegration.id == integration_id,
            SocialIntegration.is_active == True
        ).first()

        if not integration:
            return {"status": "integration_not_found"}

        # Verificar plano do usuário
        user = db.query(User).filter(User.id == integration.user_id).first()
        if not user or not user.plan:
            return {"status": "no_plan"}

        config = integration.agent_config
        if not config:
            return {"status": "no_config"}

        # Verificar quota diária (Plano)
        from datetime import date, timedelta
        from sqlalchemy import func
        today_date = date.today()
        today_str = today_date.isoformat()
        
        sent_today = db.query(func.count(CommentResponse.id)).join(Comment).filter(
            Comment.integration_id == integration_id,
            CommentResponse.status == ResponseStatus.sent,
            func.date(CommentResponse.sent_at) == today_str,
        ).scalar() or 0
 
        daily_limit_plan = user.plan.max_responses_per_day
        if sent_today >= daily_limit_plan:
            return {"status": "plan_daily_limit_reached", "sent_today": sent_today}

        # Verificar Quotas Horárias (Anti-Spam)
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)

        sent_this_hour = db.query(func.count(CommentResponse.id)).join(Comment).filter(
            Comment.integration_id == integration_id,
            CommentResponse.status == ResponseStatus.sent,
            CommentResponse.sent_at >= one_hour_ago
        ).scalar() or 0

        if sent_this_hour >= config.max_comments_per_hour:
            return {"status": "hourly_limit_reached", "sent_hour": sent_this_hour}

        # Obter serviço YouTube
        if integration.platform == Platform.youtube:
            # A quota restante é o menor valor entre os limites
            remaining = min(
                daily_limit_plan - sent_today,
                config.max_comments_per_hour - sent_this_hour
            )
            result = _run_youtube_agent(integration, config, user, db, remaining)


        else:
            result = {"status": "platform_not_supported"}

        # Atualizar last_run_at
        integration.last_run_at = datetime.now(timezone.utc)
        db.commit()
        return result

    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()


def _run_youtube_agent(integration: SocialIntegration, config, user: User, db: Session, remaining_quota: int) -> dict:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    access_token = decrypt_token(integration.access_token_enc or "")
    refresh_token = decrypt_token(integration.refresh_token_enc or "")

    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token or None,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=None,
        client_secret=None,
    )

    youtube = build("youtube", "v3", credentials=creds)

    responded = 0
    max_run = min(config.max_responses_per_run, remaining_quota)

    # Buscar comentários recentes do canal
    try:
        comment_threads = youtube.commentThreads().list(
            part="snippet",
            allThreadsRelatedToChannelId=integration.channel_id,
            textFormat="plainText",
            maxResults=50,
            order="time",
        ).execute()
    except Exception as e:
        return {"status": "youtube_api_error", "error": str(e)}

    for item in comment_threads.get("items", []):
        if responded >= max_run:
            break

        snippet = item["snippet"]["topLevelComment"]["snippet"]
        external_id = item["id"]
        text = snippet.get("textDisplay", "")
        author = snippet.get("authorDisplayName", "")
        author_channel_id = snippet.get("authorChannelId", {}).get("value", "")
        video_id = snippet.get("videoId", "")

        # Verificar blacklist
        text_lower = text.lower()
        if any(bw.lower() in text_lower for bw in (config.blacklist_words or [])):
            continue

        # Verificar se já respondido
        existing = db.query(Comment).filter(Comment.external_comment_id == external_id).first()
        if existing:
            continue

        # Classificar comentário
        category_str = classify_comment(text, integration.user.language if hasattr(integration, 'user') else "pt-BR")

        # Verificar filtros de categoria
        skip_map = {
            "spam": config.skip_spam,
            "ofensa": config.skip_offensive,
            "elogio": not config.respond_to_praise,
            "duvida": not config.respond_to_questions,
            "neutro": not config.respond_to_neutral,
            "critica": not config.respond_to_criticism,
        }
        if skip_map.get(category_str, False):
            # Salvar como skipped
            comment = Comment(
                id=str(uuid.uuid4()),
                integration_id=integration.id,
                external_comment_id=external_id,
                author=author,
                author_channel_id=author_channel_id,
                text=text,
                category=category_str,
                video_id=video_id,
                received_at=datetime.now(timezone.utc),
            )
            db.add(comment)
            response = CommentResponse(
                id=str(uuid.uuid4()),
                comment_id=comment.id,
                text="",
                status=ResponseStatus.skipped,
            )
            db.add(response)
            db.flush()
            continue

        # Gerar resposta
        reply_text = generate_reply(
            comment=text,
            category=category_str,
            persona_name=config.persona_name,
            tone=config.tone,
            custom_prompt=config.custom_prompt,
        )
        if not reply_text:
            continue

        # Salvar comentário
        comment = Comment(
            id=str(uuid.uuid4()),
            integration_id=integration.id,
            external_comment_id=external_id,
            author=author,
            author_channel_id=author_channel_id,
            text=text,
            category=category_str,
            video_id=video_id,
            received_at=datetime.now(timezone.utc),
        )
        db.add(comment)
        db.flush()

        status_val = ResponseStatus.pending if config.approval_required else ResponseStatus.sent
        response = CommentResponse(
            id=str(uuid.uuid4()),
            comment_id=comment.id,
            text=reply_text,
            status=status_val,
            ai_model_used="gpt-4o-mini",
        )
        db.add(response)
        db.flush()

        # Enviar resposta automaticamente se não precisa de aprovação
        if not config.approval_required:
            try:
                youtube.comments().insert(
                    part="snippet",
                    body={"snippet": {"parentId": external_id, "textOriginal": reply_text}}
                ).execute()
                response.sent_at = datetime.now(timezone.utc)
                responded += 1
                time.sleep(2)  # respeitar rate limits
            except Exception as e:
                response.status = ResponseStatus.failed
                response.error_message = str(e)

        db.commit()

    return {"status": "completed", "responded": responded}


@celery_app.task(name="app.tasks.agent_runner.send_single_reply")
def send_single_reply(response_id: str):
    """Envia uma resposta aprovada manualmente."""
    db = _get_db()
    try:
        response = db.query(CommentResponse).filter(CommentResponse.id == response_id).first()
        if not response or response.status != ResponseStatus.pending:
            return {"status": "not_pending"}

        comment = response.comment
        integration = comment.integration

        if integration.platform == Platform.youtube:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build

            creds = Credentials(
                token=decrypt_token(integration.access_token_enc or ""),
                refresh_token=decrypt_token(integration.refresh_token_enc or "") or None,
                token_uri="https://oauth2.googleapis.com/token",
            )
            youtube = build("youtube", "v3", credentials=creds)
            youtube.comments().insert(
                part="snippet",
                body={"snippet": {"parentId": comment.external_comment_id, "textOriginal": response.text}}
            ).execute()

        response.status = ResponseStatus.sent
        response.sent_at = datetime.now(timezone.utc)
        db.commit()
        return {"status": "sent"}

    except Exception as e:
        if db_response := db.query(CommentResponse).filter(CommentResponse.id == response_id).first():
            db_response.status = ResponseStatus.failed
            db_response.error_message = str(e)
            db.commit()
        return {"status": "error", "error": str(e)}
    finally:
        db.close()
