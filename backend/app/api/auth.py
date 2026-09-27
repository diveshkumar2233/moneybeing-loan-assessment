from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.dependencies.auth import current_user
from app.models.user import User
from app.schemas.auth import Token, UserRead

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
# Verify a hash even for unknown emails to reduce account-lookup timing differences.
dummy_hash = hash_password("dummy-password-for-timing")


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == form.username.lower()))
    valid = verify_password(form.password, user.password_hash if user else dummy_hash)
    if not user or not valid or not user.is_active:
        raise HTTPException(
            401, "Incorrect email or password", headers={"WWW-Authenticate": "Bearer"}
        )
    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(current_user)):
    return UserRead(id=user.id, email=user.email, role=user.role)
