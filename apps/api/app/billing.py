from typing import Optional

from sqlalchemy.orm import Session

from app.models import ApiKey, PricingRule, UsageLog, User


def get_pricing(db: Session, sku: str) -> Optional[PricingRule]:
    return db.query(PricingRule).filter(PricingRule.sku == sku).first()


def compute_points(db: Session, sku: str, units: float) -> int:
    rule = get_pricing(db, sku)
    if not rule:
        return 0
    import math

    if rule.unit in ("minute", "1k_tokens"):
        billed = math.ceil(units * 10) / 10 if rule.unit == "minute" else max(math.ceil(units), 1)
    else:
        billed = max(math.ceil(units), 1)
    return int(billed * rule.points_per_unit)


def charge_user(
    db: Session,
    user: User,
    api_key: Optional[ApiKey],
    sku: str,
    units: float,
    success: bool,
    error_code: Optional[str] = None,
) -> tuple:
    points = compute_points(db, sku, units) if success else 0

    if success and points > 0:
        if api_key and api_key.quota_points is not None:
            remaining = api_key.quota_points - api_key.used_points
            if remaining < points:
                raise ValueError("quota_exceeded")
            api_key.used_points += points
        if user.points_balance < points:
            raise ValueError("insufficient_points")
        user.points_balance -= points

    log = UsageLog(
        user_id=user.id,
        api_key_id=api_key.id if api_key else None,
        sku=sku,
        units=units,
        points_charged=points,
        success=success,
        error_code=error_code,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return points, log
