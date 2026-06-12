from typing import Optional

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

    class Config:
        from_attributes = True
