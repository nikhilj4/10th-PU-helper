from pydantic import BaseModel, Field


class SendOtpRequest(BaseModel):
    phone: str = Field(min_length=8, max_length=20)


class VerifyOtpRequest(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    code: str = Field(min_length=4, max_length=8)


class VerifyOtpResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool
