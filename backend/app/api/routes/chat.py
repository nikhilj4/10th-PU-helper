from fastapi import APIRouter, Depends, HTTPException
from openai import APIError, AuthenticationError, RateLimitError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.entities import User
from app.schemas.chat import ChatQueryRequest, ChatQueryResponse
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat")
chat_service = ChatService()


@router.post("/query", response_model=ChatQueryResponse)
def chat_query(
    payload: ChatQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatQueryResponse:
    try:
        session_id, answer, used, remaining = chat_service.process_query(
            db=db,
            user=current_user,
            subject_name=payload.subject,
            query=payload.query,
            session_id=payload.session_id,
        )
    except RateLimitError as exc:
        raise HTTPException(status_code=429, detail="OpenAI quota exceeded. Please update billing/quota.") from exc
    except AuthenticationError as exc:
        raise HTTPException(status_code=401, detail="OpenAI authentication failed. Check OPENAI_API_KEY.") from exc
    except APIError as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI API error: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {exc}") from exc
    return ChatQueryResponse(session_id=session_id, answer=answer, tokens_used=used, remaining_tokens=remaining)
