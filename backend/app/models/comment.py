import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Text, Float,
    ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class CommentCategory(str, enum.Enum):
    elogio = "elogio"
    duvida = "duvida"
    critica = "critica"
    discordancia = "discordancia"
    ofensa = "ofensa"
    spam = "spam"
    neutro = "neutro"
    pedido_de_conteudo = "pedido_de_conteudo"


class ResponseStatus(str, enum.Enum):
    pending = "pending"      # aguardando aprovação manual
    sent = "sent"            # enviado com sucesso
    failed = "failed"        # erro ao enviar
    skipped = "skipped"      # pulado (spam/ofensa)
    rejected = "rejected"    # rejeitado pelo usuário (modo manual)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String(36), primary_key=True)
    integration_id = Column(String(36), ForeignKey("social_integrations.id"), nullable=False)
    external_comment_id = Column(String(300), unique=True, nullable=False)
    author = Column(String(200), nullable=True)
    author_channel_id = Column(String(200), nullable=True)
    text = Column(Text, nullable=False)
    category = Column(SAEnum(CommentCategory), nullable=True)
    platform_url = Column(String(800), nullable=True)
    video_id = Column(String(200), nullable=True)
    received_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    integration = relationship("SocialIntegration", back_populates="comments")
    response = relationship("Response", back_populates="comment", uselist=False)


class Response(Base):
    __tablename__ = "responses"

    id = Column(String(36), primary_key=True)
    comment_id = Column(String(36), ForeignKey("comments.id"), unique=True, nullable=False)
    text = Column(Text, nullable=False)
    status = Column(SAEnum(ResponseStatus), default=ResponseStatus.pending)
    ai_model_used = Column(String(100), nullable=True)
    tokens_used = Column(Integer, default=0)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    comment = relationship("Comment", back_populates="response")


class DailyStat(Base):
    __tablename__ = "daily_stats"

    id = Column(String(36), primary_key=True)
    integration_id = Column(String(36), ForeignKey("social_integrations.id"), nullable=False)
    date = Column(String(10), nullable=False)                    # "2026-02-26"
    comments_received = Column(Integer, default=0)
    responses_sent = Column(Integer, default=0)
    responses_failed = Column(Integer, default=0)
    responses_skipped = Column(Integer, default=0)
    avg_response_time_s = Column(Float, default=0.0)
    tokens_consumed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    integration = relationship("SocialIntegration", back_populates="daily_stats")
