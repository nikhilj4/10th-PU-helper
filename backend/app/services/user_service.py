from sqlalchemy.orm import Session

from app.models.entities import Subject, User, UserSubject


class UserService:
    @staticmethod
    def create_or_update_name(db: Session, phone: str, name: str) -> User:
        user = db.query(User).filter(User.phone == phone).first()
        if user:
            user.name = name
        else:
            user = User(phone=phone, name=name)
            db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_profile(db: Session, user: User, class_level: str, subjects: list[str]) -> User:
        user.class_level = class_level
        db.query(UserSubject).filter(UserSubject.user_id == user.id).delete()
        for subject_name in subjects:
            subject = (
                db.query(Subject)
                .filter(Subject.class_level == class_level, Subject.subject_name == subject_name)
                .first()
            )
            if not subject:
                subject = Subject(class_level=class_level, subject_name=subject_name)
                db.add(subject)
                db.flush()
            db.add(UserSubject(user_id=user.id, subject_id=subject.id))
        db.commit()
        db.refresh(user)
        return user
