import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Float,
    ForeignKey, Text, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class PlanSlug(str, enum.Enum):
    free = "free"
    starter = "starter"
    pro = "pro"
    agency = "agency"


class SubscriptionStatus(str, enum.Enum):
    trialing = "trialing"
    active = "active"
    past_due = "past_due"
    canceled = "canceled"
    incomplete = "incomplete"


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String(36), primary_key=True)
    slug = Column(SAEnum(PlanSlug), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    price_monthly = Column(Float, default=0.0)
    max_integrations = Column(Integer, default=1)
    max_responses_per_day = Column(Integer, default=20)
    max_personas = Column(Integer, default=1)
    platforms_json = Column(JSON, default=list)   # ex: ["youtube"]
    features_json = Column(JSON, default=dict)    # flags booleanas
    stripe_price_id = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    subscriptions = relationship("Subscription", back_populates="plan")
    users = relationship("User", back_populates="plan")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    hashed_password = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    timezone = Column(String(60), default="America/Sao_Paulo")
    language = Column(String(10), default="pt-BR")

    plan_id = Column(String(36), ForeignKey("plans.id"), nullable=True)
    trial_ends_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    # Billing
    stripe_customer_id = Column(String(200), nullable=True)
    asaas_customer_id = Column(String(200), nullable=True)
    mp_customer_id = Column(String(200), nullable=True)

    plan = relationship("Plan", back_populates="users")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    integrations = relationship("SocialIntegration", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    plan_id = Column(String(36), ForeignKey("plans.id"), nullable=False)
    status = Column(SAEnum(SubscriptionStatus), default=SubscriptionStatus.trialing)
    gateway = Column(String(50), nullable=True)          # "stripe" | "asaas" | "mp"
    gateway_sub_id = Column(String(300), nullable=True)  # ID no gateway
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    canceled_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="subscription")
    plan = relationship("Plan", back_populates="subscriptions")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    type = Column(String(80), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")
