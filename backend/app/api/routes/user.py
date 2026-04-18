from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.entities import Subject, User, UserSubject
from app.schemas.user import UserCreateRequest, UserProfileRequest, UserProfileResponse, UserTokensResponse
from app.services.token_service import TokenService
from app.services.user_service import UserService

router = APIRouter(prefix="/user")


@router.post("/create", response_model=UserProfileResponse)
def create_user(
    payload: UserCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    user = UserService.create_or_update_name(db, current_user.phone, payload.name)
    wallet = TokenService.ensure_wallet(db, user.id)
    _ = wallet
    return UserProfileResponse(
        user_id=user.id,
        name=user.name,
        phone=user.phone,
        class_level=user.class_level,
        subjects=[],
    )


@router.patch("/profile", response_model=UserProfileResponse)
def update_profile(
    payload: UserProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    user = UserService.update_profile(db, current_user, payload.class_level, payload.subjects)
    subject_names = (
        db.query(Subject.subject_name)
        .join(UserSubject, Subject.id == UserSubject.subject_id)
        .filter(UserSubject.user_id == user.id)
        .all()
    )
    return UserProfileResponse(
        user_id=user.id,
        name=user.name,
        phone=user.phone,
        class_level=user.class_level,
        subjects=[s[0] for s in subject_names],
    )


@router.get("/tokens", response_model=UserTokensResponse)
def get_tokens(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserTokensResponse:
    wallet = TokenService.ensure_wallet(db, current_user.id)
    return UserTokensResponse(balance_tokens=wallet.balance_tokens)
