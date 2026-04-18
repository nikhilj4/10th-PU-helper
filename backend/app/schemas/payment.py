from pydantic import BaseModel


class PaymentOrderRequest(BaseModel):
    plan_code: str = "INR9_1000TOKENS"


class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentVerifyResponse(BaseModel):
    success: bool
    balance_tokens: int
