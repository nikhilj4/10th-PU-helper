import razorpay
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.entities import PaymentEvent, PaymentOrder, User
from app.services.token_service import TokenService


class PaymentService:
    def __init__(self) -> None:
        self.client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))

    def create_order(self, db: Session, user: User) -> PaymentOrder:
        payload = {"amount": 900, "currency": "INR", "payment_capture": 1, "notes": {"user_id": str(user.id)}}
        rp_order = self.client.order.create(payload)
        order = PaymentOrder(user_id=user.id, razorpay_order_id=rp_order["id"], amount_paise=900, status="created")
        db.add(order)
        db.commit()
        db.refresh(order)
        return order

    def verify(self, db: Session, user: User, order_id: str, payment_id: str, signature: str) -> int:
        order = db.query(PaymentOrder).filter(PaymentOrder.razorpay_order_id == order_id, PaymentOrder.user_id == user.id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        existing = db.query(PaymentEvent).filter(PaymentEvent.razorpay_payment_id == payment_id).first()
        if existing and existing.signature_valid:
            return TokenService.ensure_wallet(db, user.id).balance_tokens

        params = {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        }
        try:
            self.client.utility.verify_payment_signature(params)
            is_valid = True
        except Exception:
            is_valid = False

        event = PaymentEvent(
            order_id=order.id,
            razorpay_payment_id=payment_id,
            signature_valid=is_valid,
            payload_json=params,
        )
        db.add(event)
        if not is_valid:
            order.status = "failed"
            db.commit()
            raise HTTPException(status_code=400, detail="Invalid payment signature")

        order.status = "paid"
        balance = TokenService.credit_after_payment(db, user.id, 1000)
        return balance
