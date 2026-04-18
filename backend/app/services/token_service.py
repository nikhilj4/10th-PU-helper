from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.entities import TokenLedger, TokenWallet


class TokenService:
    @staticmethod
    def ensure_wallet(db: Session, user_id) -> TokenWallet:
        wallet = db.query(TokenWallet).filter(TokenWallet.user_id == user_id).first()
        if not wallet:
            wallet = TokenWallet(user_id=user_id, balance_tokens=1000)
            db.add(wallet)
            db.add(TokenLedger(user_id=user_id, delta_tokens=1000, reason="initial_credit", metadata_json={}))
            db.commit()
            db.refresh(wallet)
        return wallet

    @staticmethod
    def deduct_for_chat(db: Session, user_id, tokens_used: int) -> int:
        wallet = db.query(TokenWallet).filter(TokenWallet.user_id == user_id).with_for_update().first()
        if not wallet or wallet.balance_tokens <= 0:
            raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="PAYMENT_REQUIRED")
        wallet.balance_tokens = max(0, wallet.balance_tokens - tokens_used)
        db.add(TokenLedger(user_id=user_id, delta_tokens=-tokens_used, reason="chat_deduct", metadata_json={}))
        db.commit()
        return wallet.balance_tokens

    @staticmethod
    def credit_after_payment(db: Session, user_id, tokens: int) -> int:
        wallet = TokenService.ensure_wallet(db, user_id)
        wallet.balance_tokens += tokens
        db.add(TokenLedger(user_id=user_id, delta_tokens=tokens, reason="recharge_credit", metadata_json={}))
        db.commit()
        db.refresh(wallet)
        return wallet.balance_tokens
