"""Seed demo data. Run: python -m app.seed"""

from app.database import Base, SessionLocal, engine
from app.models import Organization, PointPackage, PricingRule, User, UserRole
from app.security import hash_password

PRICING = [
    ("I01", "call", 15),
    ("A01", "call", 20),
    ("V01", "minute", 350),
    ("H01", "call", 280),
    ("T01", "1k_tokens", 25),
    ("T02", "1k_tokens", 40),
]

PACKAGES = [
    ("体验包", 1000, 1200),
    ("入门包", 10000, 9900),
    ("成长包", 50000, 44900),
    ("专业包", 200000, 159900),
]


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(PricingRule).first():
            for sku, unit, pts in PRICING:
                db.add(PricingRule(sku=sku, unit=unit, points_per_unit=pts))

        if not db.query(PointPackage).first():
            for name, points, price in PACKAGES:
                db.add(PointPackage(name=name, points=points, price_cny_fen=price))

        org = db.query(Organization).filter(Organization.name == "Demo Pet Corp").first()
        if not org:
            org = Organization(name="Demo Pet Corp")
            db.add(org)
            db.flush()

        seeds = [
            ("demo@chongsheng.demo", "Demo123!", UserRole.user, 10000, None),
            ("org@chongsheng.demo", "Org123!", UserRole.org_admin, 50000, org.id),
            ("admin@chongsheng.demo", "Admin123!", UserRole.platform_admin, 0, None),
        ]
        for email, pwd, role, points, org_id in seeds:
            if not db.query(User).filter(User.email == email).first():
                db.add(
                    User(
                        email=email,
                        password_hash=hash_password(pwd),
                        role=role,
                        points_balance=points,
                        org_id=org_id,
                    )
                )
        db.commit()
        print("Seed complete.")
        from app.seed_rich import seed_rich_if_needed

        seed_rich_if_needed()
    finally:
        db.close()


if __name__ == "__main__":
    main()
