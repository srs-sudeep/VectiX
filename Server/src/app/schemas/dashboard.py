"""Dashboard schemas for unified views."""

from datetime import date
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    """Main dashboard summary."""
    net_balance: Decimal = Decimal("0.00")
    total_income: Decimal = Decimal("0.00")
    total_expense: Decimal = Decimal("0.00")
    pending_group_dues: Decimal = Decimal("0.00")
    account_count: int = 0
    group_count: int = 0


class MonthlyBreakdown(BaseModel):
    """Monthly income/expense breakdown."""
    month: str  # YYYY-MM format
    income: Decimal = Decimal("0.00")
    expense: Decimal = Decimal("0.00")
    net: Decimal = Decimal("0.00")


class CategoryBreakdown(BaseModel):
    """Category-wise expense breakdown."""
    category_id: str
    category_name: str
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    amount: Decimal = Decimal("0.00")
    percentage: float = 0.0
    transaction_count: int = 0


class AnalyticsData(BaseModel):
    """Analytics data for charts."""
    monthly_breakdown: List[MonthlyBreakdown] = []
    category_breakdown: List[CategoryBreakdown] = []
    personal_total: Decimal = Decimal("0.00")
    group_total: Decimal = Decimal("0.00")


class MonthlySummary(BaseModel):
    """Monthly summary report."""
    month: str
    total_income: Decimal = Decimal("0.00")
    total_expense: Decimal = Decimal("0.00")
    group_dues: Decimal = Decimal("0.00")
    net_savings: Decimal = Decimal("0.00")
    top_categories: List[CategoryBreakdown] = []


class OnboardingData(BaseModel):
    """First-time onboarding data."""
    default_currency: str = "INR"
    timezone: str = "Asia/Kolkata"
    country: str = "IN"
    first_account_name: str = "Cash"
    first_account_type: str = "cash"
    first_account_balance: Decimal = Decimal("0.00")

