import uuid

from pydantic import BaseModel, Field


class ChatQueryRequest(BaseModel):
    subject: str
    query: str = Field(min_length=2, max_length=3000)
    session_id: uuid.UUID | None = None


class ChatQueryResponse(BaseModel):
    session_id: uuid.UUID
    answer: str
    tokens_used: int
    remaining_tokens: int
