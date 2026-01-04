"""Transaction schemas for Personal Finance."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


class TransactionBase(BaseModel):
    """Base Transaction schema."""
    type: str = Field(..., description="Transaction type: income | expense | transfer")
    amount: Decimal = Field(..., gt=0, description="Transaction amount")
    currency: str = Field(default="INR", description="ISO 4217 currency code")
    description: Optional[str] = Field(None, description="Transaction description")
    transaction_date: date = Field(default_factory=date.today, description="Date of transaction")
    category_id: Optional[str] = Field(None, description="Category ID")


class TransactionCreate(TransactionBase):
    """Transaction creation schema."""
    account_id: str = Field(..., description="Source account ID")
    related_account_id: Optional[str] = Field(None, description="Target account for transfers")
    group_expense_id: Optional[str] = Field(None, description="Linked group expense ID")


class TransactionUpdate(BaseModel):
    """Transaction update schema."""
    type: Optional[str] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    transaction_date: Optional[date] = None
    category_id: Optional[str] = None
    account_id: Optional[str] = None


class TransactionInDB(TransactionBase):
    """Transaction in DB schema."""
    id: str
    user_id: str
    account_id: str
    related_account_id: Optional[str] = None
    group_expense_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Transaction(TransactionInDB):
    """Transaction response schema."""
    pass


class TransactionWithDetails(Transaction):
    """Transaction with account and category details."""
    account_name: Optional[str] = None
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color: Optional[str] = None


class TransactionSummary(BaseModel):
    """Transaction summary for analytics."""
    total_income: Decimal = Decimal("0.00")
    total_expense: Decimal = Decimal("0.00")
    net_balance: Decimal = Decimal("0.00")
    transaction_count: int = 0


class TransactionFilter(BaseModel):
    """Transaction filter parameters."""
    type: Optional[str] = None
    account_id: Optional[str] = None
    category_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    search: Optional[str] = None

