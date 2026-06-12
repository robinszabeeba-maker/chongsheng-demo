from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import PointPackage, PricingRule, PurchaseLog, User
from app.schemas import (
    AdminUserOut,
    PackageOut,
    PricingOut,
    PurchaseRequest,
    UpdatePricingRequest,
    UserOut,
)

router = APIRouter(prefix="/api", tags=["platform"])


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.get("/packages", response_model=list[PackageOut])
def list_packages(db: Session = Depends(get_db)):
    return db.query(PointPackage).filter(PointPackage.is_active.is_(True)).all()


@router.post("/purchase")
def purchase(
    body: PurchaseRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pkg = db.query(PointPackage).filter(PointPackage.id == body.package_id, PointPackage.is_active.is_(True)).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    user.points_balance += pkg.points
    db.add(PurchaseLog(user_id=user.id, package_id=pkg.id, points_added=pkg.points, simulated=True))
    db.commit()
    return {"ok": True, "points_balance": user.points_balance, "simulated": True}


@router.get("/pricing", response_model=list[PricingOut])
def list_pricing(db: Session = Depends(get_db)):
    return db.query(PricingRule).all()


@router.get("/admin/users", response_model=list[AdminUserOut])
def admin_users(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id).all()


@router.patch("/admin/pricing/{sku}")
def admin_update_pricing(
    sku: str,
    body: UpdatePricingRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    rule = db.query(PricingRule).filter(PricingRule.sku == sku).first()
    if not rule:
        raise HTTPException(status_code=404, detail="SKU not found")
    rule.points_per_unit = body.points_per_unit
    db.commit()
    return {"ok": True}


@router.get("/admin/stats")
def admin_stats(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    from app.models import UsageLog

    total_users = db.query(User).count()
    total_calls = db.query(UsageLog).count()
    success_calls = db.query(UsageLog).filter(UsageLog.success.is_(True)).count()
    return {
        "total_users": total_users,
        "total_calls": total_calls,
        "success_calls": success_calls,
    }
