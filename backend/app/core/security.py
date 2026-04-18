from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt

from app.core.config import settings


def create_access_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    payload: dict[str, Any] = {"sub": subject}
    if extra:
        payload.update(extra)
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload["exp"] = expire
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
