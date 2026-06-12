from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ApiKey, User, UserRole
from app.security import decode_token, verify_api_key


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    email = decode_token(authorization[7:])
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == email, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.platform_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return user


def get_api_key_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> tuple:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing API key")
    raw = authorization[7:]
    prefix = raw[:12]
    candidates = db.query(ApiKey).filter(ApiKey.key_prefix == prefix, ApiKey.is_active.is_(True)).all()
    api_key = None
    for c in candidates:
        if verify_api_key(raw, c.key_hash):
            api_key = c
            break
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    user = db.query(User).filter(User.id == api_key.owner_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Key owner inactive")
    return api_key, user
