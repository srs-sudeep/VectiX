"""Subscription schemas for Personal Finance."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class SubscriptionBase(BaseModel):
    """Base Subscription schema."""
    name: str = Field(..., min_length=1, description="Subscription name (e.g., Netflix)")
    amount: Decimal = Field(..., gt=0, description="Subscription amount")
    currency: str = Field(default="INR", description="ISO 4217 currency code")
    interval: str = Field(..., description="Billing interval: monthly | yearly")
    next_due_date: date = Field(..., description="Next payment due date")
    is_active: bool = Field(default=True, description="Subscription status")


class SubscriptionCreate(SubscriptionBase):
    """Subscription creation schema."""
    account_id: str = Field(..., description="Payment account ID")


class SubscriptionUpdate(BaseModel):
    """Subscription update schema."""
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    interval: Optional[str] = None
    next_due_date: Optional[date] = None
    account_id: Optional[str] = None
    is_active: Optional[bool] = None


class SubscriptionInDB(SubscriptionBase):
    """Subscription in DB schema."""
    id: str
    user_id: str
    account_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Subscription(SubscriptionInDB):
    """Subscription response schema."""
    pass


class SubscriptionWithAccount(Subscription):
    """Subscription with account details."""
    account_name: Optional[str] = None


class UpcomingSubscription(BaseModel):
    """Upcoming subscription payment."""
    id: str
    name: str
    amount: Decimal
    currency: str
    next_due_date: date
    days_until_due: int

    class Config:
        from_attributes = True

