"""Group schemas for Splitwise functionality."""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


class GroupBase(BaseModel):
    """Base Group schema."""
    name: str = Field(..., min_length=1, description="Group name")
    currency: str = Field(default="INR", description="ISO 4217 currency code")


class GroupCreate(GroupBase):
    """Group creation schema."""
    member_ids: List[str] = Field(default=[], description="Initial member user IDs")


class GroupUpdate(BaseModel):
    """Group update schema."""
    name: Optional[str] = None
    currency: Optional[str] = None


class GroupInDB(GroupBase):
    """Group in DB schema."""
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Group(GroupInDB):
    """Group response schema."""
    pass


class GroupMemberSchema(BaseModel):
    """Group member schema."""
    id: str
    user_id: str
    role: str  # admin | member
    joined_at: datetime
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True


class GroupWithMembers(Group):
    """Group with member details."""
    members: List[GroupMemberSchema] = []
    member_count: int = 0


class GroupSummary(BaseModel):
    """Group summary for list view."""
    id: str
    name: str
    currency: str
    member_count: int
    total_expenses: Decimal = Decimal("0.00")
    your_balance: Decimal = Decimal("0.00")  # Positive = you are owed, Negative = you owe

    class Config:
        from_attributes = True


class GroupBalance(BaseModel):
    """Balance between two users in a group."""
    user_id: str
    user_name: str
    balance: Decimal  # Positive = they owe you, Negative = you owe them

    class Config:
        from_attributes = True


class GroupDetailWithBalances(GroupWithMembers):
    """Group detail with all balances."""
    balances: List[GroupBalance] = []
    total_expenses: Decimal = Decimal("0.00")

