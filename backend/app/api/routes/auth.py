from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from twilio.base.exceptions import TwilioRestException

from app.core.security import create_access_token
from app.db.session import get_db
from app.models.entities import OtpSession, User
from app.schemas.auth import SendOtpRequest, VerifyOtpRequest, VerifyOtpResponse
from app.services.auth_service import AuthService
from app.services.token_service import TokenService

router = APIRouter(prefix="/auth")
auth_service = AuthService()


@router.post("/send-otp")
def send_otp(payload: SendOtpRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        sid = auth_service.send_otp(payload.phone)
    except TwilioRestException as exc:
        msg = getattr(exc, "msg", None) or str(exc)
        raise HTTPException(
            status_code=400,
            detail=f"Twilio OTP failed: {msg}",
        ) from exc
    db.add(
        OtpSession(
            phone=payload.phone,
            otp_reference_id=sid,
            status="sent",
            expires_at=datetime.utcnow() + timedelta(minutes=10),
        )
    )
    db.commit()
    return {"message": "OTP sent"}


@router.post("/verify-otp", response_model=VerifyOtpResponse)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)) -> VerifyOtpResponse:
    approved = auth_service.verify_otp(payload.phone, payload.code)
    if not approved:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    user = db.query(User).filter(User.phone == payload.phone).first()
    is_new = user is None
    if is_new:
        user = User(phone=payload.phone, name="Student")
        db.add(user)
        db.commit()
        db.refresh(user)
    TokenService.ensure_wallet(db, user.id)
    token = create_access_token(str(user.id), extra={"phone": user.phone})
    return VerifyOtpResponse(access_token=token, is_new_user=is_new)
