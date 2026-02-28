from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, field_validator
import re


# ─── Auth ────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("A senha deve ter pelo menos 8 caracteres")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ─── User ─────────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    is_admin: bool = False
    email_verified: bool = False
    timezone: str
    language: str
    plan_id: Optional[str] = None
    trial_ends_at: Optional[datetime] = None
    stripe_customer_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None


# ─── Plan ─────────────────────────────────────────────────────────────────────
class PlanOut(BaseModel):
    id: str
    slug: str
    name: str
    price_monthly: float
    max_integrations: int
    max_responses_per_day: int
    max_personas: int
    platforms_json: List[str]
    features_json: Dict[str, Any]

    model_config = {"from_attributes": True}


# ─── Integration ──────────────────────────────────────────────────────────────
class IntegrationOut(BaseModel):
    id: str
    platform: str
    channel_id: str
    channel_name: Optional[str] = None
    channel_avatar: Optional[str] = None
    is_active: bool
    last_run_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AgentConfigOut(BaseModel):
    id: str
    persona_name: str
    tone: str
    custom_prompt: Optional[str] = None
    language: str
    blacklist_words: List[str]
    respond_to_praise: bool
    respond_to_questions: bool
    respond_to_neutral: bool
    respond_to_criticism: bool
    skip_spam: bool
    skip_offensive: bool
    working_hours_start: str
    working_hours_end: str
    working_days: List[int]
    auto_mode: bool
    approval_required: bool


    model_config = {"from_attributes": True}


class AgentConfigUpdate(BaseModel):
    persona_name: Optional[str] = None
    tone: Optional[str] = None
    custom_prompt: Optional[str] = None
    language: Optional[str] = None
    blacklist_words: Optional[List[str]] = None
    respond_to_praise: Optional[bool] = None
    respond_to_questions: Optional[bool] = None
    respond_to_neutral: Optional[bool] = None
    respond_to_criticism: Optional[bool] = None
    skip_spam: Optional[bool] = None
    skip_offensive: Optional[bool] = None
    working_hours_start: Optional[str] = None
    working_hours_end: Optional[str] = None
    working_days: Optional[List[int]] = None
    auto_mode: Optional[bool] = None
    approval_required: Optional[bool] = None



# ─── Comments ─────────────────────────────────────────────────────────────────
class CommentOut(BaseModel):
    id: str
    integration_id: str
    external_comment_id: str
    author: Optional[str] = None
    text: str
    category: Optional[str] = None
    platform_url: Optional[str] = None
    video_id: Optional[str] = None
    received_at: Optional[datetime] = None
    created_at: datetime
    response: Optional["ResponseOut"] = None

    model_config = {"from_attributes": True}


class ResponseOut(BaseModel):
    id: str
    text: str
    status: str
    ai_model_used: Optional[str] = None
    tokens_used: int
    sent_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Analytics ────────────────────────────────────────────────────────────────
class DailyStatOut(BaseModel):
    date: str
    comments_received: int
    responses_sent: int
    responses_failed: int
    responses_skipped: int
    tokens_consumed: int

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    today_comments: int
    today_responses: int
    total_comments: int
    total_responses: int
    response_rate: float
    active_integrations: int


# ─── Billing ──────────────────────────────────────────────────────────────────
class CheckoutRequest(BaseModel):
    plan_slug: str
    gateway: str  # "stripe" | "asaas" | "mp"
    payment_method: Optional[str] = None  # "pix" | "boleto" | "credit_card"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CheckoutResponse(BaseModel):
    gateway: str
    checkout_url: Optional[str] = None
    pix_qr_code: Optional[str] = None
    pix_copy_paste: Optional[str] = None
    boleto_url: Optional[str] = None
    payment_id: Optional[str] = None


class SubscriptionOut(BaseModel):
    id: str
    status: str
    gateway: Optional[str] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool
    plan: Optional[PlanOut] = None

    model_config = {"from_attributes": True}
