"""Group Expense schemas for Splitwise functionality."""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


class ExpenseSplitInput(BaseModel):
    """Input for expense split."""
    user_id: str = Field(..., description="User ID")
    share_amount: Optional[Decimal] = Field(None, description="Share amount for unequal splits")
    share_percentage: Optional[Decimal] = Field(None, description="Share percentage for percentage splits")


class GroupExpenseBase(BaseModel):
    """Base Group Expense schema."""
    title: str = Field(..., min_length=1, description="Expense title")
    amount: Decimal = Field(..., gt=0, description="Total expense amount")
    currency: str = Field(default="INR", description="ISO 4217 currency code")
    split_type: str = Field(default="equal", description="Split type: equal | unequal | percentage")


class GroupExpenseCreate(GroupExpenseBase):
    """Group Expense creation schema."""
    group_id: str = Field(..., description="Group ID")
    paid_by: Optional[str] = Field(None, description="User ID who paid (defaults to current user)")
    splits: List[ExpenseSplitInput] = Field(default=[], description="Custom splits for unequal/percentage")


class GroupExpenseUpdate(BaseModel):
    """Group Expense update schema."""
    title: Optional[str] = None
    amount: Optional[Decimal] = None
    split_type: Optional[str] = None
    splits: Optional[List[ExpenseSplitInput]] = None


class ExpenseSplitSchema(BaseModel):
    """Expense split response schema."""
    id: str
    user_id: str
    user_name: Optional[str] = None
    share_amount: Decimal
    share_percentage: Optional[Decimal] = None

    class Config:
        from_attributes = True


class GroupExpenseInDB(GroupExpenseBase):
    """Group Expense in DB schema."""
    id: str
    group_id: str
    paid_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GroupExpense(GroupExpenseInDB):
    """Group Expense response schema."""
    pass


class GroupExpenseWithSplits(GroupExpense):
    """Group Expense with split details."""
    payer_name: Optional[str] = None
    splits: List[ExpenseSplitSchema] = []


class GroupExpenseSummary(BaseModel):
    """Summary of group expenses."""
    total_expenses: Decimal = Decimal("0.00")
    expense_count: int = 0
    your_share: Decimal = Decimal("0.00")
    you_paid: Decimal = Decimal("0.00")

