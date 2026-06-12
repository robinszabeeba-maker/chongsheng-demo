from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import (
    ApplicationStatus,
    Contract,
    ContractApplication,
    ContractStatus,
    Order,
    OrderStatus,
    OrderType,
    Organization,
    PointPackage,
    PurchaseLog,
    UsageLog,
    User,
    UserRole,
)
from app.schemas import (
    ApplicationOut,
    ContractApplyRequest,
    ContractOut,
    CustomerOut,
    DashboardOut,
    DayStat,
    OrderOut,
    PackageOut,
    PricingOut,
    PurchaseRequest,
    SkuStat,
    UpdatePricingRequest,
    UsageOut,
    UserOut,
)

router = APIRouter(prefix="/api", tags=["platform"])


def _user_out(user: User, db: Session) -> UserOut:
    org = db.query(Organization).filter(Organization.id == user.org_id).first() if user.org_id else None
    return UserOut(
        id=user.id,
        email=user.email,
        role=user.role.value,
        points_balance=user.points_balance,
        org_id=user.org_id,
        org_name=org.name if org else None,
        org_industry=org.industry if org else None,
        org_tier=org.tier if org else None,
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _user_out(user, db)


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
    order_no = f"ORD{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    db.add(
        Order(
            order_no=order_no,
            user_id=user.id,
            org_id=user.org_id,
            order_type=OrderType.package,
            status=OrderStatus.paid,
            amount_cny_fen=pkg.price_cny_fen,
            points=pkg.points,
            title=f"{pkg.name} · 自助购点",
        )
    )
    db.commit()
    return {"ok": True, "points_balance": user.points_balance, "simulated": True, "order_no": order_no}


@router.get("/pricing", response_model=list[PricingOut])
def list_pricing(db: Session = Depends(get_db)):
    from app.models import PricingRule

    return db.query(PricingRule).all()


@router.get("/orders", response_model=list[OrderOut])
def my_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Order).filter(Order.user_id == user.id)
    if user.org_id and user.role == UserRole.org_admin:
        q = db.query(Order).filter((Order.user_id == user.id) | (Order.org_id == user.org_id))
    return [_order_out(o, db) for o in q.order_by(Order.id.desc()).limit(50)]


@router.get("/org/contract", response_model=Optional[ContractOut])
def org_contract(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.org_id:
        return None
    c = (
        db.query(Contract)
        .filter(Contract.org_id == user.org_id, Contract.status == ContractStatus.active)
        .order_by(Contract.id.desc())
        .first()
    )
    return _contract_out(c, db) if c else None


@router.get("/org/contracts", response_model=list[ContractOut])
def org_contracts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.org_id:
        return []
    items = db.query(Contract).filter(Contract.org_id == user.org_id).order_by(Contract.id.desc()).all()
    return [_contract_out(c, db) for c in items]


@router.post("/org/contract/apply")
def apply_contract(
    body: ContractApplyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role not in (UserRole.org_admin, UserRole.platform_admin):
        raise HTTPException(status_code=403, detail="Enterprise admin required")
    if not user.org_id:
        raise HTTPException(status_code=400, detail="No organization")
    db.add(
        ContractApplication(
            org_id=user.org_id,
            user_id=user.id,
            company_name=body.company_name,
            contact_name=body.contact_name,
            contact_phone=body.contact_phone,
            use_case=body.use_case,
            requested_points=body.requested_points,
            status=ApplicationStatus.pending,
        )
    )
    db.commit()
    return {"ok": True, "message": "签约申请已提交，运营将在 1 个工作日内联系您"}


@router.get("/analytics/usage")
def usage_analytics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(UsageLog).filter(UsageLog.user_id == user.id)
    if user.org_id and user.role == UserRole.org_admin:
        member_ids = [u.id for u in db.query(User).filter(User.org_id == user.org_id).all()]
        q = db.query(UsageLog).filter(UsageLog.user_id.in_(member_ids))
    logs = q.all()
    by_day: dict = {}
    by_sku: dict = {}
    for log in logs:
        day = log.created_at.strftime("%Y-%m-%d")
        if day not in by_day:
            by_day[day] = {"total": 0, "success": 0, "points": 0}
        by_day[day]["total"] += 1
        if log.success:
            by_day[day]["success"] += 1
            by_day[day]["points"] += log.points_charged
        if log.sku not in by_sku:
            by_sku[log.sku] = {"count": 0, "points": 0}
        by_sku[log.sku]["count"] += 1
        by_sku[log.sku]["points"] += log.points_charged
    days = sorted(by_day.keys())[-30:]
    return {
        "calls_by_day": [
            DayStat(date=d, total=by_day[d]["total"], success=by_day[d]["success"], points=by_day[d]["points"])
            for d in days
        ],
        "calls_by_sku": [
            SkuStat(sku=k, count=v["count"], points=v["points"]) for k, v in sorted(by_sku.items(), key=lambda x: -x[1]["count"])
        ],
        "total_calls": len(logs),
        "success_rate": round(sum(1 for l in logs if l.success) / max(len(logs), 1) * 100, 1),
    }


def _contract_out(c: Contract, db: Session) -> ContractOut:
    org = db.query(Organization).filter(Organization.id == c.org_id).first()
    return ContractOut(
        id=c.id,
        contract_no=c.contract_no,
        title=c.title,
        points_quota=c.points_quota,
        points_used=c.points_used,
        amount_cny_fen=c.amount_cny_fen,
        status=c.status.value,
        sla_level=c.sla_level,
        org_name=org.name if org else None,
        start_at=c.start_at.isoformat() if c.start_at else None,
        end_at=c.end_at.isoformat() if c.end_at else None,
    )


def _order_out(o: Order, db: Session) -> OrderOut:
    org = db.query(Organization).filter(Organization.id == o.org_id).first() if o.org_id else None
    u = db.query(User).filter(User.id == o.user_id).first()
    return OrderOut(
        id=o.id,
        order_no=o.order_no,
        order_type=o.order_type.value,
        status=o.status.value,
        title=o.title,
        amount_cny_fen=o.amount_cny_fen,
        points=o.points,
        org_name=org.name if org else None,
        user_email=u.email if u else None,
        created_at=o.created_at.isoformat(),
    )
