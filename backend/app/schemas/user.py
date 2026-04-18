import uuid

from pydantic import BaseModel, Field


class UserCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)


class UserProfileRequest(BaseModel):
    class_level: str = Field(pattern="^(10th|PUC)$")
    subjects: list[str]


class UserProfileResponse(BaseModel):
    user_id: uuid.UUID
    name: str
    phone: str
    class_level: str | None
    subjects: list[str]


class UserTokensResponse(BaseModel):
    balance_tokens: int
