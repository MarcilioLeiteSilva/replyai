from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
import stripe
import requests
import uuid
import hmac
import hashlib
import json
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.config import settings
from app.api.v1.auth import get_current_user
from app.models.user import User, Plan, Subscription, SubscriptionStatus
from app.schemas.schemas import CheckoutRequest, CheckoutResponse, SubscriptionOut, PlanOut
from typing import List, Optional

router = APIRouter(prefix="/billing", tags=["billing"])

# ─── Planos ───────────────────────────────────────────────────────────────────
@router.get("/plans", response_model=List[PlanOut])
def list_plans(db: Session = Depends(get_db)):
    return db.query(Plan).filter(Plan.is_active == True).order_by(Plan.price_monthly).all()


@router.get("/subscription", response_model=Optional[SubscriptionOut])
def get_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.subscription


# ─── Checkout ─────────────────────────────────────────────────────────────────
@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = db.query(Plan).filter(Plan.slug == body.plan_slug).first()
    if not plan or plan.slug == "free":
        raise HTTPException(status_code=400, detail="Plano inválido")

    success_url = body.success_url or f"{settings.FRONTEND_URL}/billing?success=true"
    cancel_url = body.cancel_url or f"{settings.FRONTEND_URL}/billing?canceled=true"

    if body.gateway == "stripe":
        return _checkout_stripe(current_user, plan, success_url, cancel_url, db)
    elif body.gateway == "asaas":
        return _checkout_asaas(current_user, plan, body.payment_method or "pix", db)
    elif body.gateway == "mp":
        return _checkout_mp(current_user, plan, success_url, cancel_url, db)
    else:
        raise HTTPException(status_code=400, detail="Gateway inválido. Use: stripe, asaas ou mp")


def _checkout_stripe(user: User, plan: Plan, success_url: str, cancel_url: str, db: Session) -> CheckoutResponse:
    stripe.api_key = settings.STRIPE_SECRET_KEY
    if not plan.stripe_price_id:
        raise HTTPException(status_code=400, detail="Plano sem Stripe Price ID configurado")

    # Criar/obter customer Stripe
    if not user.stripe_customer_id:
        customer = stripe.Customer.create(email=user.email, name=user.name)
        user.stripe_customer_id = customer["id"]
        db.commit()

    session = stripe.checkout.Session.create(
        customer=user.stripe_customer_id,
        mode="subscription",
        line_items=[{"price": plan.stripe_price_id, "quantity": 1}],
        success_url=success_url + "&session_id={CHECKOUT_SESSION_ID}",
        cancel_url=cancel_url,
        metadata={"user_id": user.id, "plan_id": plan.id},
        subscription_data={"trial_period_days": 14} if not user.subscription or user.subscription.status == SubscriptionStatus.trialing else {},
    )
    return CheckoutResponse(gateway="stripe", checkout_url=session["url"])


def _checkout_asaas(user: User, plan: Plan, payment_method: str, db: Session) -> CheckoutResponse:
    headers = {"access_token": settings.ASAAS_API_KEY, "Content-Type": "application/json"}

    # Criar/obter customer Asaas
    if not user.asaas_customer_id:
        r = requests.post(
            f"{settings.ASAAS_API_URL}/customers",
            headers=headers,
            json={"name": user.name, "email": user.email, "externalReference": user.id}
        )
        customer_data = r.json()
        if "id" not in customer_data:
            raise HTTPException(status_code=502, detail=f"Erro ao criar cliente Asaas: {customer_data}")
        user.asaas_customer_id = customer_data["id"]
        db.commit()

    billing_type_map = {"pix": "PIX", "boleto": "BOLETO", "credit_card": "CREDIT_CARD"}
    billing_type = billing_type_map.get(payment_method, "PIX")

    from datetime import date
    payload = {
        "customer": user.asaas_customer_id,
        "billingType": billing_type,
        "value": plan.price_monthly,
        "dueDate": date.today().isoformat(),
        "description": f"ReplyAI — Plano {plan.name}",
        "externalReference": f"{user.id}:{plan.id}",
    }
    r = requests.post(f"{settings.ASAAS_API_URL}/payments", headers=headers, json=payload)
    data = r.json()
    if "id" not in data:
        raise HTTPException(status_code=502, detail=f"Erro Asaas: {data}")

    result = CheckoutResponse(gateway="asaas", payment_id=data["id"])
    if billing_type == "PIX":
        pix_r = requests.get(f"{settings.ASAAS_API_URL}/payments/{data['id']}/pixQrCode", headers=headers)
        pix_data = pix_r.json()
        result.pix_qr_code = pix_data.get("encodedImage")
        result.pix_copy_paste = pix_data.get("payload")
    elif billing_type == "BOLETO":
        result.boleto_url = data.get("bankSlipUrl")
    else:
        result.checkout_url = data.get("invoiceUrl")
    return result


def _checkout_mp(user: User, plan: Plan, success_url: str, cancel_url: str, db: Session) -> CheckoutResponse:
    import mercadopago
    sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)

    preference_data = {
        "items": [{"title": f"ReplyAI — Plano {plan.name}", "quantity": 1, "unit_price": plan.price_monthly}],
        "payer": {"email": user.email, "name": user.name},
        "back_urls": {"success": success_url, "failure": cancel_url, "pending": cancel_url},
        "auto_return": "approved",
        "external_reference": f"{user.id}:{plan.id}",
        "metadata": {"user_id": user.id, "plan_id": plan.id},
    }
    result = sdk.preference().create(preference_data)
    if result["status"] not in [200, 201]:
        raise HTTPException(status_code=502, detail=f"Erro Mercado Pago: {result}")

    preference = result["response"]
    checkout_url = preference.get("sandbox_init_point") if not settings.is_production else preference.get("init_point")
    return CheckoutResponse(gateway="mp", checkout_url=checkout_url, payment_id=preference["id"])


# ─── Webhooks ─────────────────────────────────────────────────────────────────
@router.post("/webhook/stripe", include_in_schema=False)
async def webhook_stripe(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook Stripe inválido")

    if event["type"] == "checkout.session.completed":
        _handle_stripe_checkout(event["data"]["object"], db)
    elif event["type"] in ["customer.subscription.updated", "customer.subscription.deleted"]:
        _handle_stripe_subscription(event["data"]["object"], db)
    return {"received": True}


def _handle_stripe_checkout(session: dict, db: Session):
    user_id = session.get("metadata", {}).get("user_id")
    plan_id = session.get("metadata", {}).get("plan_id")
    stripe_sub_id = session.get("subscription")
    if not user_id or not plan_id:
        return

    user = db.query(User).filter(User.id == user_id).first()
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not user or not plan:
        return

    stripe.api_key = settings.STRIPE_SECRET_KEY
    stripe_sub = stripe.Subscription.retrieve(stripe_sub_id)
    period_end = datetime.fromtimestamp(stripe_sub["current_period_end"], tz=timezone.utc)

    if user.subscription:
        sub = user.subscription
        sub.plan_id = plan.id
        sub.status = SubscriptionStatus.active
        sub.gateway = "stripe"
        sub.gateway_sub_id = stripe_sub_id
        sub.current_period_end = period_end
    else:
        sub = Subscription(
            id=str(uuid.uuid4()),
            user_id=user.id,
            plan_id=plan.id,
            status=SubscriptionStatus.active,
            gateway="stripe",
            gateway_sub_id=stripe_sub_id,
            current_period_end=period_end,
        )
        db.add(sub)

    user.plan_id = plan.id
    user.stripe_customer_id = session.get("customer")
    db.commit()


def _handle_stripe_subscription(sub_obj: dict, db: Session):
    customer_id = sub_obj.get("customer")
    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user or not user.subscription:
        return

    status_map = {
        "active": SubscriptionStatus.active,
        "past_due": SubscriptionStatus.past_due,
        "canceled": SubscriptionStatus.canceled,
        "trialing": SubscriptionStatus.trialing,
    }
    user.subscription.status = status_map.get(sub_obj["status"], SubscriptionStatus.past_due)
    user.subscription.cancel_at_period_end = sub_obj.get("cancel_at_period_end", False)
    db.commit()


@router.post("/webhook/asaas", include_in_schema=False)
async def webhook_asaas(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    event = data.get("event")
    payment = data.get("payment", {})
    external_ref = payment.get("externalReference", "")

    if event == "PAYMENT_RECEIVED" and ":" in external_ref:
        user_id, plan_id = external_ref.split(":", 1)
        _activate_subscription(user_id, plan_id, "asaas", payment.get("id"), db)
    return {"received": True}


@router.post("/webhook/mp", include_in_schema=False)
async def webhook_mp(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    if data.get("type") != "payment":
        return {"received": True}

    import mercadopago
    sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
    payment_id = data.get("data", {}).get("id")
    if not payment_id:
        return {"received": True}

    result = sdk.payment().get(payment_id)
    payment_info = result["response"]
    if payment_info.get("status") == "approved":
        external_ref = payment_info.get("external_reference", "")
        if ":" in external_ref:
            user_id, plan_id = external_ref.split(":", 1)
            _activate_subscription(user_id, plan_id, "mp", str(payment_id), db)
    return {"received": True}


def _activate_subscription(user_id: str, plan_id: str, gateway: str, payment_id: str, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not user or not plan:
        return

    from datetime import timedelta
    period_end = datetime.now(timezone.utc) + timedelta(days=30)

    if user.subscription:
        sub = user.subscription
        sub.plan_id = plan.id
        sub.status = SubscriptionStatus.active
        sub.gateway = gateway
        sub.gateway_sub_id = payment_id
        sub.current_period_end = period_end
    else:
        sub = Subscription(
            id=str(uuid.uuid4()),
            user_id=user_id,
            plan_id=plan_id,
            status=SubscriptionStatus.active,
            gateway=gateway,
            gateway_sub_id=payment_id,
            current_period_end=period_end,
        )
        db.add(sub)

    user.plan_id = plan.id
    db.commit()


@router.post("/cancel", status_code=200)
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = current_user.subscription
    if not sub or sub.status not in [SubscriptionStatus.active, SubscriptionStatus.trialing]:
        raise HTTPException(status_code=400, detail="Nenhuma assinatura ativa")

    if sub.gateway == "stripe" and sub.gateway_sub_id:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        stripe.Subscription.modify(sub.gateway_sub_id, cancel_at_period_end=True)
        sub.cancel_at_period_end = True
    else:
        sub.status = SubscriptionStatus.canceled
        sub.canceled_at = datetime.now(timezone.utc)

    db.commit()
    return {"message": "Assinatura cancelada"}
