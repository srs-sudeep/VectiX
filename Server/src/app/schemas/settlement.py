"""Settlement schemas for Splitwise functionality."""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class SettlementBase(BaseModel):
    """Base Settlement schema."""
    amount: Decimal = Field(..., gt=0, description="Settlement amount")
    currency: str = Field(default="INR", description="ISO 4217 currency code")
    method: Optional[str] = Field(None, description="Payment method: cash | upi | bank")


class SettlementCreate(SettlementBase):
    """Settlement creation schema."""
    group_id: str = Field(..., description="Group ID")
    to_user_id: str = Field(..., description="User ID receiving payment")


class SettlementUpdate(BaseModel):
    """Settlement update schema."""
    amount: Optional[Decimal] = None
    method: Optional[str] = None


class SettlementInDB(SettlementBase):
    """Settlement in DB schema."""
    id: str
    group_id: str
    from_user_id: str
    to_user_id: str
    settled_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Settlement(SettlementInDB):
    """Settlement response schema."""
    pass


class SettlementWithUsers(Settlement):
    """Settlement with user details."""
    from_user_name: Optional[str] = None
    to_user_name: Optional[str] = None


class SettlementSuggestion(BaseModel):
    """Settlement suggestion based on balances."""
    from_user_id: str
    from_user_name: str
    to_user_id: str
    to_user_name: str
    amount: Decimal

    class Config:
        from_attributes = True

