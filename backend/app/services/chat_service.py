import uuid

from sqlalchemy.orm import Session

from app.models.entities import ChatMessage, ChatSession, Subject, User
from app.pipeline.rag_pipeline import RagPipeline
from app.services.token_service import TokenService


class ChatService:
    def __init__(self) -> None:
        self.rag: RagPipeline | None = None

    def process_query(self, db: Session, user: User, subject_name: str, query: str, session_id: uuid.UUID | None):
        subject = db.query(Subject).filter(Subject.subject_name == subject_name).first()
        if not subject:
            subject = Subject(class_level=user.class_level or "10th", subject_name=subject_name)
            db.add(subject)
            db.flush()

        if session_id:
            session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user.id).first()
        else:
            session = None
        if not session:
            session = ChatSession(user_id=user.id, subject_id=subject.id)
            db.add(session)
            db.flush()

        if self.rag is None:
            self.rag = RagPipeline()
        answer, prompt_tokens, completion_tokens, total_tokens = self.rag.answer(query=query, subject=subject_name)
        deduction = max(1, total_tokens)
        remaining = TokenService.deduct_for_chat(db, user.id, deduction)

        db.add(ChatMessage(session_id=session.id, role="user", content=query, total_tokens=0))
        db.add(
            ChatMessage(
                session_id=session.id,
                role="assistant",
                content=answer,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
            )
        )
        db.commit()
        return session.id, answer, deduction, remaining
