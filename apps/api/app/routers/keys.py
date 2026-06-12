from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import ApiKey, Organization, User, UserRole
from app.schemas import ApiKeyCreated, ApiKeyOut, CreateKeyRequest, UsageOut
from app.security import generate_api_key
from app.models import UsageLog

router = APIRouter(prefix="/api/keys", tags=["keys"])


@router.get("", response_model=list[ApiKeyOut])
def list_keys(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(ApiKey).filter(ApiKey.owner_id == user.id)
    if user.org_id:
        q = db.query(ApiKey).filter((ApiKey.owner_id == user.id) | (ApiKey.org_id == user.org_id))
    return q.order_by(ApiKey.id.desc()).all()


@router.post("", response_model=ApiKeyCreated)
def create_key(
    body: CreateKeyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.is_sub_key and user.role not in (UserRole.org_admin, UserRole.platform_admin):
        raise HTTPException(status_code=403, detail="Org admin required for sub keys")
    raw, prefix, key_hash = generate_api_key()
    api_key = ApiKey(
        name=body.name,
        key_prefix=prefix,
        key_hash=key_hash,
        owner_id=user.id,
        org_id=user.org_id,
        is_sub_key=body.is_sub_key,
        quota_points=body.quota_points,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    return ApiKeyCreated(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        is_sub_key=api_key.is_sub_key,
        quota_points=api_key.quota_points,
        used_points=api_key.used_points,
        is_active=api_key.is_active,
        api_key=raw,
    )


@router.delete("/{key_id}")
def revoke_key(key_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    api_key = db.query(ApiKey).filter(ApiKey.id == key_id, ApiKey.owner_id == user.id).first()
    if not api_key:
        raise HTTPException(status_code=404, detail="Key not found")
    api_key.is_active = False
    db.commit()
    return {"ok": True}


@router.get("/usage", response_model=list[UsageOut])
def my_usage(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = (
        db.query(UsageLog)
        .filter(UsageLog.user_id == user.id)
        .order_by(UsageLog.id.desc())
        .limit(100)
        .all()
    )
    return [
        UsageOut(
            id=l.id,
            sku=l.sku,
            units=l.units,
            points_charged=l.points_charged,
            success=l.success,
            error_code=l.error_code,
            created_at=l.created_at.isoformat(),
        )
        for l in logs
    ]
