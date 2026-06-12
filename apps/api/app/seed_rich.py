"""Rich demo data for boss presentation."""

import random
from datetime import datetime, timedelta

from sqlalchemy import inspect

from app.database import Base, SessionLocal, engine
from app.models import (
    ApiKey,
    ApplicationStatus,
    Contract,
    ContractApplication,
    ContractStatus,
    Order,
    OrderStatus,
    OrderType,
    Organization,
    UsageLog,
    User,
    UserRole,
)
from app.security import generate_api_key, hash_password


def _ensure_schema_v2() -> None:
    inspector = inspect(engine)
    if "organizations" not in inspector.get_table_names():
        Base.metadata.create_all(bind=engine)
        return
    cols = {c["name"] for c in inspector.get_columns("organizations")}
    if "industry" not in cols or "orders" not in inspector.get_table_names():
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)


def _order_no(prefix: str, n: int) -> str:
    return f"{prefix}{datetime.utcnow().strftime('%Y%m%d')}{n:04d}"


def seed_rich_if_needed() -> None:
    _ensure_schema_v2()
    db = SessionLocal()
    try:
        if db.query(UsageLog).count() >= 80:
            return

        skus = ["I01", "A01", "V01", "H01", "T01", "T02"]
        sku_weights = [0.35, 0.12, 0.18, 0.15, 0.12, 0.08]

        def add_usage(user_id: int, key_id, day: datetime) -> None:
            sku = random.choices(skus, sku_weights)[0]
            success = random.random() > 0.06
            points = {"I01": 15, "A01": 20, "V01": 350, "H01": 280, "T01": 25, "T02": 40}[sku]
            db.add(
                UsageLog(
                    user_id=user_id,
                    api_key_id=key_id,
                    sku=sku,
                    units=1.0 if sku != "V01" else round(random.uniform(0.1, 2.0), 1),
                    points_charged=points if success else 0,
                    success=success,
                    error_code=None if success else random.choice(["missing_image", "timeout", "invalid_param"]),
                    created_at=day + timedelta(hours=random.randint(8, 20), minutes=random.randint(0, 59)),
                )
            )

        # Extra orgs
        orgs_data = [
            ("萌宠科技", "宠物 App", "enterprise", "张产品", "13800001111"),
            ("爪爪智能硬件", "智能硬件", "enterprise", "李硬件", "13900002222"),
            ("宠安保险科技", "保险/金融", "enterprise", "王商务", "13700003333"),
        ]
        extra_orgs: list[Organization] = []
        for name, industry, tier, contact, phone in orgs_data:
            org = db.query(Organization).filter(Organization.name == name).first()
            if not org:
                org = Organization(
                    name=name, industry=industry, tier=tier, contact_name=contact, contact_phone=phone
                )
                db.add(org)
                db.flush()
            extra_orgs.append(org)

        demo_org = db.query(Organization).filter(Organization.name == "Demo Pet Corp").first()
        if demo_org:
            demo_org.industry = "连锁医院"
            demo_org.tier = "enterprise"
            demo_org.contact_name = "陈总监"
            demo_org.contact_phone = "13600004444"

        # Enterprise user for 萌宠科技
        if not db.query(User).filter(User.email == "enterprise@chongsheng.demo").first():
            db.add(
                User(
                    email="enterprise@chongsheng.demo",
                    password_hash=hash_password("Ent123!"),
                    role=UserRole.org_admin,
                    points_balance=120000,
                    org_id=extra_orgs[0].id,
                )
            )

        db.flush()
        all_users = db.query(User).filter(User.role != UserRole.platform_admin).all()

        # Contracts
        if not db.query(Contract).first() and demo_org:
            contracts = [
                (demo_org.id, "CT20260001", "Demo Pet 年度 API 合同", 500000, 128000, 48000000, ContractStatus.active),
                (extra_orgs[0].id, "CT20260002", "萌宠科技 生态 API 年框", 800000, 245000, 72000000, ContractStatus.active),
                (extra_orgs[1].id, "CT20260003", "爪爪摄像头行为分析合同", 300000, 89000, 28000000, ContractStatus.active),
                (extra_orgs[2].id, "CT20260004", "宠安健康测评 POC", 100000, 12000, 9800000, ContractStatus.pending),
            ]
            now = datetime.utcnow()
            for org_id, no, title, quota, used, amount, status in contracts:
                db.add(
                    Contract(
                        org_id=org_id,
                        contract_no=no,
                        title=title,
                        points_quota=quota,
                        points_used=used,
                        amount_cny_fen=amount,
                        status=status,
                        sla_level="premium" if amount > 30000000 else "standard",
                        start_at=now - timedelta(days=90),
                        end_at=now + timedelta(days=275),
                    )
                )

        # Orders
        if not db.query(Order).first():
            demo_user = db.query(User).filter(User.email == "demo@chongsheng.demo").first()
            org_user = db.query(User).filter(User.email == "org@chongsheng.demo").first()
            orders = [
                (demo_user.id, None, OrderType.package, "入门包 · 自助购点", 9900, 10000),
                (demo_user.id, None, OrderType.package, "成长包 · 自助购点", 44900, 50000),
                (org_user.id, demo_org.id if demo_org else None, OrderType.contract, "Demo Pet 年度合同首付款", 48000000, 500000),
                (org_user.id, demo_org.id if demo_org else None, OrderType.enterprise_deposit, "企业预充值", 10000000, 1000000),
            ]
            for i, (uid, oid, otype, title, amount, pts) in enumerate(orders, 1):
                db.add(
                    Order(
                        order_no=_order_no("ORD", i),
                        user_id=uid,
                        org_id=oid,
                        order_type=otype,
                        status=OrderStatus.paid,
                        amount_cny_fen=amount,
                        points=pts,
                        title=title,
                        created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
                    )
                )

        # Pending application for demo org
        if demo_org and not db.query(ContractApplication).first():
            org_admin = db.query(User).filter(User.email == "org@chongsheng.demo").first()
            if org_admin:
                db.add(
                    ContractApplication(
                        org_id=demo_org.id,
                        user_id=org_admin.id,
                        company_name="Demo Pet Corp",
                        contact_name="陈总监",
                        contact_phone="13600004444",
                        use_case="连锁门店健康测评 + 问诊对话 API 扩容",
                        requested_points=200000,
                        status=ApplicationStatus.pending,
                    )
                )

        db.flush()

        # API keys + 30-day usage
        for user in all_users:
            if not db.query(ApiKey).filter(ApiKey.owner_id == user.id).first():
                raw, prefix, key_hash = generate_api_key()
                db.add(
                    ApiKey(
                        name="生产环境 Key",
                        key_prefix=prefix,
                        key_hash=key_hash,
                        owner_id=user.id,
                        org_id=user.org_id,
                        is_sub_key=False,
                    )
                )
            keys = db.query(ApiKey).filter(ApiKey.owner_id == user.id).all()
            key_id = keys[0].id if keys else None
            count = 25 if user.role == UserRole.user else 45
            for _ in range(count):
                day = datetime.utcnow() - timedelta(days=random.randint(0, 29))
                add_usage(user.id, key_id, day)

        db.commit()
        print("Rich demo seed complete.")
    finally:
        db.close()
