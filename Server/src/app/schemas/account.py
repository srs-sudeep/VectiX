"""Account schemas for Personal Finance."""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


class AccountBase(BaseModel):
    """Base Account schema."""
    name: str = Field(..., min_length=1, description="Account name (e.g., SBI Savings, Cash)")
    type: str = Field(..., description="Account type: bank | cash | wallet | credit")
    currency: str = Field(default="INR", description="ISO 4217 currency code")
    opening_balance: Decimal = Field(default=Decimal("0.00"), description="Opening balance")
    is_active: bool = Field(default=True, description="Account status")


class AccountCreate(AccountBase):
    """Account creation schema."""
    pass


class AccountUpdate(BaseModel):
    """Account update schema."""
    name: Optional[str] = None
    type: Optional[str] = None
    currency: Optional[str] = None
    is_active: Optional[bool] = None


class AccountInDB(AccountBase):
    """Account in DB schema."""
    id: str
    user_id: str
    current_balance: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Account(AccountInDB):
    """Account response schema."""
    pass


class AccountSummary(BaseModel):
    """Account summary for dashboard."""
    id: str
    name: str
    type: str
    currency: str
    current_balance: Decimal
    is_active: bool

    class Config:
        from_attributes = True


class AccountWithTransactions(Account):
    """Account with recent transactions."""
    transaction_count: int = 0

