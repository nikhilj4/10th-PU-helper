from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.entities import User
from app.schemas.payment import (
    PaymentOrderRequest,
    PaymentOrderResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
)
from app.services.payment_service import PaymentService
router = APIRouter(prefix="/payment")
payment_service = PaymentService()


@router.post("/create-order", response_model=PaymentOrderResponse)
def create_order(
    payload: PaymentOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaymentOrderResponse:
    _ = payload
    order = payment_service.create_order(db, current_user)
    return PaymentOrderResponse(
        order_id=order.razorpay_order_id,
        amount=order.amount_paise,
        currency="INR",
        key_id=settings.razorpay_key_id,
    )


@router.post("/verify", response_model=PaymentVerifyResponse)
def verify_payment(
    payload: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaymentVerifyResponse:
    balance = payment_service.verify(
        db,
        current_user,
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature,
    )
    return PaymentVerifyResponse(success=True, balance_tokens=balance)
