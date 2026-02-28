import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Text, JSON,
    ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Platform(str, enum.Enum):
    youtube = "youtube"
    instagram = "instagram"
    tiktok = "tiktok"
    facebook = "facebook"
    twitter = "twitter"


class AgentTone(str, enum.Enum):
    formal = "formal"
    casual = "casual"
    funny = "funny"
    empathetic = "empathetic"
    professional = "professional"


class SocialIntegration(Base):
    __tablename__ = "social_integrations"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    platform = Column(SAEnum(Platform), nullable=False)
    channel_id = Column(String(200), nullable=False)
    channel_name = Column(String(200), nullable=True)
    channel_avatar = Column(String(500), nullable=True)
    access_token_enc = Column(Text, nullable=True)     # criptografado
    refresh_token_enc = Column(Text, nullable=True)    # criptografado
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="integrations")
    agent_config = relationship("AgentConfig", back_populates="integration", uselist=False)
    comments = relationship("Comment", back_populates="integration")
    daily_stats = relationship("DailyStat", back_populates="integration")


class AgentConfig(Base):
    __tablename__ = "agent_configs"

    id = Column(String(36), primary_key=True)
    integration_id = Column(String(36), ForeignKey("social_integrations.id"), unique=True)

    # Persona
    persona_name = Column(String(100), default="Assistente")
    tone = Column(SAEnum(AgentTone), default=AgentTone.casual)
    custom_prompt = Column(Text, nullable=True)   # instrução extra do usuário
    language = Column(String(10), default="pt-BR")

    # Agendamento
    working_hours_start = Column(String(5), default="00:00") # HH:MM
    working_hours_end = Column(String(5), default="23:59")   # HH:MM
    working_days = Column(JSON, default=lambda: [0, 1, 2, 3, 4, 5, 6]) # 0=Segunda, 6=Domingo


    # Filtros
    blacklist_words = Column(JSON, default=list)        # ["palavra1", "palavra2"]
    whitelist_channels = Column(JSON, default=list)     # responder SOMENTE estes autores
    respond_to_praise = Column(Boolean, default=True)
    respond_to_questions = Column(Boolean, default=True)
    respond_to_neutral = Column(Boolean, default=True)
    respond_to_criticism = Column(Boolean, default=True)
    skip_spam = Column(Boolean, default=True)
    skip_offensive = Column(Boolean, default=True)

    # Limites por execução e períodos
    max_responses_per_run = Column(Integer, default=10)
    max_comments_per_hour = Column(Integer, default=10)
    max_comments_per_day = Column(Integer, default=100)
    
    auto_mode = Column(Boolean, default=True)       # False = aprovação manual

    approval_required = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    integration = relationship("SocialIntegration", back_populates="agent_config")
