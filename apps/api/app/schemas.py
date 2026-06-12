from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    points_balance: int
    org_id: Optional[int] = None
    org_name: Optional[str] = None
    org_industry: Optional[str] = None
    org_tier: Optional[str] = None

    class Config:
        from_attributes = True


class CreateKeyRequest(BaseModel):
    name: str
    is_sub_key: bool = False
    quota_points: Optional[int] = None


class ApiKeyOut(BaseModel):
    id: int
    name: str
    key_prefix: str
    is_sub_key: bool
    quota_points: Optional[int]
    used_points: int
    is_active: bool

    class Config:
        from_attributes = True


class ApiKeyCreated(ApiKeyOut):
    api_key: str


class PackageOut(BaseModel):
    id: int
    name: str
    points: int
    price_cny_fen: int

    class Config:
        from_attributes = True


class PurchaseRequest(BaseModel):
    package_id: int


class PricingOut(BaseModel):
    sku: str
    unit: str
    points_per_unit: int

    class Config:
        from_attributes = True


class UpdatePricingRequest(BaseModel):
    points_per_unit: int


class UsageOut(BaseModel):
    id: int
    sku: str
    units: float
    points_charged: int
    success: bool
    error_code: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


class AdminUserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    points_balance: int
    is_active: bool
    org_id: Optional[int] = None
    org_name: Optional[str] = None

    class Config:
        from_attributes = True


class ContractOut(BaseModel):
    id: int
    contract_no: str
    title: str
    points_quota: int
    points_used: int
    amount_cny_fen: int
    status: str
    sla_level: str
    org_name: Optional[str] = None
    start_at: Optional[str] = None
    end_at: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    order_no: str
    order_type: str
    status: str
    title: str
    amount_cny_fen: int
    points: int
    org_name: Optional[str] = None
    user_email: Optional[str] = None
    created_at: str


class ContractApplyRequest(BaseModel):
    company_name: str
    contact_name: str
    contact_phone: str
    use_case: str
    requested_points: int = Field(ge=10000)


class ApplicationOut(BaseModel):
    id: int
    company_name: str
    contact_name: str
    use_case: str
    requested_points: int
    status: str
    org_name: Optional[str] = None
    created_at: str


class DayStat(BaseModel):
    date: str
    total: int
    success: int
    points: int


class SkuStat(BaseModel):
    sku: str
    count: int
    points: int


class DashboardOut(BaseModel):
    total_users: int
    total_orgs: int
    active_contracts: int
    total_calls: int
    success_rate: float
    total_revenue_fen: int
    total_points_consumed: int
    calls_by_day: List[DayStat]
    calls_by_sku: List[SkuStat]
    recent_orders: List[OrderOut]


class CustomerOut(BaseModel):
    org_id: int
    org_name: str
    industry: Optional[str]
    tier: str
    contact_name: Optional[str]
    member_count: int
    total_calls: int
    points_consumed: int
    active_contracts: int
