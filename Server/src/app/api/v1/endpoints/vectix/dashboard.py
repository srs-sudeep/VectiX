"""Dashboard endpoints for unified views and analytics."""

from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.app.api import get_current_user
from src.app.models import User
from src.app.services import DashboardService, CategoryService, AccountService
from src.app.schemas import (
    DashboardSummary,
    AnalyticsData,
    MonthlySummary,
    OnboardingData,
)

router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get main dashboard summary."""
    service = DashboardService(db)
    return await service.get_dashboard_summary(current_user.id)


@router.get("/monthly-breakdown")
async def get_monthly_breakdown(
    months: int = Query(6, ge=1, le=12, description="Number of months"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get monthly income/expense breakdown."""
    service = DashboardService(db)
    return await service.get_monthly_breakdown(current_user.id, months)


@router.get("/category-breakdown")
async def get_category_breakdown(
    type: str = Query("expense", description="Transaction type"),
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get spending breakdown by category."""
    service = DashboardService(db)
    return await service.get_category_breakdown(
        current_user.id, type, start_date, end_date
    )


@router.get("/monthly-summary")
async def get_monthly_summary(
    year: int = Query(..., description="Year"),
    month: int = Query(..., ge=1, le=12, description="Month"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed monthly summary."""
    service = DashboardService(db)
    return await service.get_monthly_summary(current_user.id, year, month)


@router.get("/analytics")
async def get_analytics(
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get comprehensive analytics data."""
    service = DashboardService(db)
    return await service.get_analytics(current_user.id, start_date, end_date)


@router.post("/onboarding")
async def complete_onboarding(
    data: OnboardingData,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Complete first-time onboarding setup."""
    # Update user preferences
    from src.app.services import UserService
    from src.app.models import User as UserModel
    from sqlalchemy import select
    
    user_query = select(UserModel).where(UserModel.id == current_user.id)
    result = await db.execute(user_query)
    user = result.scalar_one_or_none()
    
    if user:
        user.default_currency = data.default_currency
        user.timezone = data.timezone
        user.country = data.country
    
    # Create default categories
    category_service = CategoryService(db)
    categories = await category_service.create_default_categories(current_user.id)
    
    # Create first account
    account_service = AccountService(db)
    from src.app.schemas import AccountCreate
    
    first_account = await account_service.create_account(
        current_user.id,
        AccountCreate(
            name=data.first_account_name,
            type=data.first_account_type,
            currency=data.default_currency,
            opening_balance=data.first_account_balance,
            is_active=True,
        )
    )
    
    await db.commit()
    
    return {
        "message": "Onboarding completed successfully",
        "categories_created": len(categories),
        "first_account": {
            "id": first_account.id,
            "name": first_account.name,
            "type": first_account.type,
            "balance": first_account.current_balance,
        },
    }


@router.get("/quick-stats")
async def get_quick_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get quick stats for dashboard widgets."""
    from src.app.services import SubscriptionService
    
    dashboard_service = DashboardService(db)
    subscription_service = SubscriptionService(db)
    
    summary = await dashboard_service.get_dashboard_summary(current_user.id)
    upcoming_subs = await subscription_service.get_upcoming(current_user.id, 7)
    
    return {
        **summary,
        "upcoming_subscriptions": upcoming_subs[:3],  # Top 3 upcoming
        "upcoming_subscription_count": len(upcoming_subs),
    }

