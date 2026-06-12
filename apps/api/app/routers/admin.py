from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.models import (
    ApplicationStatus,
    Contract,
    ContractApplication,
    ContractStatus,
    Order,
    OrderStatus,
    Organization,
    UsageLog,
    User,
)
from app.schemas import AdminUserOut, ApplicationOut, CustomerOut, DashboardOut, DayStat, OrderOut, SkuStat, UpdatePricingRequest
from app.routers.platform import _contract_out, _order_out

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    logs = db.query(UsageLog).all()
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

    days = sorted(by_day.keys())[-14:]
    orders = db.query(Order).order_by(Order.id.desc()).limit(8).all()
    revenue = sum(o.amount_cny_fen for o in db.query(Order).filter(Order.status == OrderStatus.paid).all())

    return DashboardOut(
        total_users=db.query(User).count(),
        total_orgs=db.query(Organization).count(),
        active_contracts=db.query(Contract).filter(Contract.status == ContractStatus.active).count(),
        total_calls=len(logs),
        success_rate=round(sum(1 for l in logs if l.success) / max(len(logs), 1) * 100, 1),
        total_revenue_fen=revenue,
        total_points_consumed=sum(l.points_charged for l in logs),
        calls_by_day=[
            DayStat(date=d, total=by_day[d]["total"], success=by_day[d]["success"], points=by_day[d]["points"])
            for d in days
        ],
        calls_by_sku=[
            SkuStat(sku=k, count=v["count"], points=v["points"])
            for k, v in sorted(by_sku.items(), key=lambda x: -x[1]["count"])
        ],
        recent_orders=[_order_out(o, db) for o in orders],
    )


@router.get("/users", response_model=list[AdminUserOut])
def admin_users(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.id).all()
    result = []
    for u in users:
        org = db.query(Organization).filter(Organization.id == u.org_id).first() if u.org_id else None
        result.append(
            AdminUserOut(
                id=u.id,
                email=u.email,
                role=u.role.value,
                points_balance=u.points_balance,
                is_active=u.is_active,
                org_id=u.org_id,
                org_name=org.name if org else None,
            )
        )
    return result


@router.get("/customers", response_model=list[CustomerOut])
def admin_customers(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    orgs = db.query(Organization).all()
    result = []
    for org in orgs:
        members = db.query(User).filter(User.org_id == org.id).all()
        member_ids = [m.id for m in members]
        logs = db.query(UsageLog).filter(UsageLog.user_id.in_(member_ids)).all() if member_ids else []
        result.append(
            CustomerOut(
                org_id=org.id,
                org_name=org.name,
                industry=org.industry,
                tier=org.tier,
                contact_name=org.contact_name,
                member_count=len(members),
                total_calls=len(logs),
                points_consumed=sum(l.points_charged for l in logs),
                active_contracts=db.query(Contract)
                .filter(Contract.org_id == org.id, Contract.status == ContractStatus.active)
                .count(),
            )
        )
    return result


@router.get("/orders", response_model=list[OrderOut])
def admin_orders(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.id.desc()).limit(100).all()
    return [_order_out(o, db) for o in orders]


@router.get("/contracts")
def admin_contracts(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    items = db.query(Contract).order_by(Contract.id.desc()).all()
    return [_contract_out(c, db) for c in items]


@router.get("/applications", response_model=list[ApplicationOut])
def admin_applications(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    apps = db.query(ContractApplication).order_by(ContractApplication.id.desc()).all()
    result = []
    for a in apps:
        org = db.query(Organization).filter(Organization.id == a.org_id).first()
        result.append(
            ApplicationOut(
                id=a.id,
                company_name=a.company_name,
                contact_name=a.contact_name,
                use_case=a.use_case,
                requested_points=a.requested_points,
                status=a.status.value,
                org_name=org.name if org else None,
                created_at=a.created_at.isoformat(),
            )
        )
    return result


@router.post("/applications/{app_id}/approve")
def approve_application(app_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    app = db.query(ContractApplication).filter(ContractApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    app.status = ApplicationStatus.approved
    now = datetime.utcnow()
    contract_no = f"CT{now.strftime('%Y%m%d')}{app_id:03d}"
    db.add(
        Contract(
            org_id=app.org_id,
            contract_no=contract_no,
            title=f"{app.company_name} 签约合同",
            points_quota=app.requested_points,
            points_used=0,
            amount_cny_fen=int(app.requested_points * 0.96),
            status=ContractStatus.active,
            sla_level="premium",
            start_at=now,
            end_at=now + timedelta(days=365),
        )
    )
    db.commit()
    return {"ok": True, "contract_no": contract_no}


@router.patch("/pricing/{sku}")
def admin_update_pricing(
    sku: str,
    body: UpdatePricingRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from app.models import PricingRule

    rule = db.query(PricingRule).filter(PricingRule.sku == sku).first()
    if not rule:
        raise HTTPException(status_code=404, detail="SKU not found")
    rule.points_per_unit = body.points_per_unit
    db.commit()
    return {"ok": True}
