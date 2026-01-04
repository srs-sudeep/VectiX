"""Dashboard service for unified views and analytics."""

from datetime import date, timedelta
from typing import Optional
from decimal import Decimal
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.models import (
    Account, Transaction, Category, Subscription,
    Group, GroupMember, GroupExpense, ExpenseSplit
)
from src.app.schemas import DashboardSummary, AnalyticsData, MonthlySummary


class DashboardService:
    """Dashboard service for analytics and summaries."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_summary(self, user_id: str) -> dict:
        """Get main dashboard summary."""
        # Net balance from accounts
        balance_query = select(func.coalesce(func.sum(Account.current_balance), 0)).where(
            Account.user_id == user_id,
            Account.is_active == True
        )
        net_balance = Decimal(str((await self.db.execute(balance_query)).scalar_one()))
        
        # This month's transactions
        today = date.today()
        first_of_month = today.replace(day=1)
        
        income_query = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.transaction_date >= first_of_month
        )
        total_income = Decimal(str((await self.db.execute(income_query)).scalar_one()))
        
        expense_query = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.transaction_date >= first_of_month
        )
        total_expense = Decimal(str((await self.db.execute(expense_query)).scalar_one()))
        
        # Pending group dues
        pending_dues = await self._calculate_pending_dues(user_id)
        
        # Counts
        account_count = (await self.db.execute(
            select(func.count(Account.id)).where(
                Account.user_id == user_id,
                Account.is_active == True
            )
        )).scalar_one()
        
        group_count = (await self.db.execute(
            select(func.count(GroupMember.id)).where(GroupMember.user_id == user_id)
        )).scalar_one()
        
        return {
            "net_balance": net_balance,
            "total_income": total_income,
            "total_expense": total_expense,
            "pending_group_dues": pending_dues,
            "account_count": account_count,
            "group_count": group_count,
        }

    async def _calculate_pending_dues(self, user_id: str) -> Decimal:
        """Calculate total pending dues across all groups."""
        # Get all groups user is member of
        groups_query = select(GroupMember.group_id).where(GroupMember.user_id == user_id)
        groups_result = await self.db.execute(groups_query)
        group_ids = [row[0] for row in groups_result.all()]
        
        if not group_ids:
            return Decimal("0.00")
        
        total_dues = Decimal("0.00")
        
        for group_id in group_ids:
            # What user owes (their share)
            owed_query = select(func.coalesce(func.sum(ExpenseSplit.share_amount), 0)).where(
                ExpenseSplit.user_id == user_id
            ).join(GroupExpense).where(GroupExpense.group_id == group_id)
            total_owed = Decimal(str((await self.db.execute(owed_query)).scalar_one()))
            
            # What user paid
            paid_query = select(func.coalesce(func.sum(GroupExpense.amount), 0)).where(
                GroupExpense.group_id == group_id,
                GroupExpense.paid_by == user_id
            )
            total_paid = Decimal(str((await self.db.execute(paid_query)).scalar_one()))
            
            balance = total_paid - total_owed
            if balance < 0:
                total_dues += abs(balance)
        
        return total_dues

    async def get_monthly_breakdown(
        self, user_id: str, months: int = 6
    ) -> list:
        """Get income/expense breakdown for last N months."""
        today = date.today()
        breakdowns = []
        
        for i in range(months):
            # Calculate month start and end
            month_offset = i
            year = today.year
            month = today.month - month_offset
            
            while month <= 0:
                month += 12
                year -= 1
            
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = date(year, month + 1, 1) - timedelta(days=1)
            
            # Query income
            income_query = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.user_id == user_id,
                Transaction.type == "income",
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date
            )
            income = Decimal(str((await self.db.execute(income_query)).scalar_one()))
            
            # Query expense
            expense_query = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.user_id == user_id,
                Transaction.type == "expense",
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date
            )
            expense = Decimal(str((await self.db.execute(expense_query)).scalar_one()))
            
            breakdowns.append({
                "month": f"{year}-{month:02d}",
                "income": income,
                "expense": expense,
                "net": income - expense,
            })
        
        return list(reversed(breakdowns))

    async def get_category_breakdown(
        self, user_id: str, transaction_type: str = "expense",
        start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list:
        """Get spending breakdown by category."""
        if not start_date:
            start_date = date.today().replace(day=1)
        if not end_date:
            end_date = date.today()
        
        query = (
            select(
                Category.id,
                Category.name,
                Category.icon,
                Category.color,
                func.sum(Transaction.amount).label("total"),
                func.count(Transaction.id).label("count")
            )
            .join(Category, Transaction.category_id == Category.id)
            .where(
                Transaction.user_id == user_id,
                Transaction.type == transaction_type,
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date
            )
            .group_by(Category.id, Category.name, Category.icon, Category.color)
            .order_by(func.sum(Transaction.amount).desc())
        )
        
        result = await self.db.execute(query)
        rows = result.all()
        
        # Calculate total for percentages
        total = sum(row.total or 0 for row in rows)
        
        return [
            {
                "category_id": row.id,
                "category_name": row.name,
                "category_icon": row.icon,
                "category_color": row.color,
                "amount": row.total or Decimal("0.00"),
                "percentage": float((row.total or 0) / total * 100) if total > 0 else 0,
                "transaction_count": row.count,
            }
            for row in rows
        ]

    async def get_monthly_summary(self, user_id: str, year: int, month: int) -> dict:
        """Get detailed monthly summary."""
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        # Income
        income_query = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date
        )
        total_income = Decimal(str((await self.db.execute(income_query)).scalar_one()))
        
        # Expense
        expense_query = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date
        )
        total_expense = Decimal(str((await self.db.execute(expense_query)).scalar_one()))
        
        # Group dues
        group_dues = await self._calculate_pending_dues(user_id)
        
        # Top categories
        top_categories = await self.get_category_breakdown(
            user_id, "expense", start_date, end_date
        )
        
        return {
            "month": f"{year}-{month:02d}",
            "total_income": total_income,
            "total_expense": total_expense,
            "group_dues": group_dues,
            "net_savings": total_income - total_expense,
            "top_categories": top_categories[:5],
        }

    async def get_analytics(
        self, user_id: str, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> dict:
        """Get comprehensive analytics data."""
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=180)  # Last 6 months
        
        monthly_breakdown = await self.get_monthly_breakdown(user_id, 6)
        category_breakdown = await self.get_category_breakdown(
            user_id, "expense", start_date, end_date
        )
        
        # Personal total
        personal_query = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date
        )
        personal_total = Decimal(str((await self.db.execute(personal_query)).scalar_one()))
        
        # Group total (user's share)
        group_query = select(func.coalesce(func.sum(ExpenseSplit.share_amount), 0)).where(
            ExpenseSplit.user_id == user_id
        ).join(GroupExpense).where(
            GroupExpense.created_at >= start_date,
            GroupExpense.created_at <= end_date
        )
        group_total = Decimal(str((await self.db.execute(group_query)).scalar_one()))
        
        return {
            "monthly_breakdown": monthly_breakdown,
            "category_breakdown": category_breakdown,
            "personal_total": personal_total,
            "group_total": group_total,
        }

