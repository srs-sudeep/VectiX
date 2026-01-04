"""Subscription endpoints for Personal Finance."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.app.api import get_current_user
from src.app.models import User
from src.app.services import SubscriptionService, AccountService
from src.app.schemas import (
    Subscription,
    SubscriptionCreate,
    SubscriptionUpdate,
    UpcomingSubscription,
)

router = APIRouter()


@router.get("/", response_model=List[Subscription])
async def get_subscriptions(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all subscriptions for the current user."""
    service = SubscriptionService(db)
    return await service.get_all_by_user(current_user.id, is_active=is_active)


@router.get("/upcoming")
async def get_upcoming_subscriptions(
    days: int = Query(30, ge=1, le=90, description="Days to look ahead"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get upcoming subscription payments."""
    service = SubscriptionService(db)
    return await service.get_upcoming(current_user.id, days)


@router.get("/{subscription_id}", response_model=Subscription)
async def get_subscription(
    subscription_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific subscription."""
    service = SubscriptionService(db)
    subscription = await service.get_by_id(subscription_id, current_user.id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription


@router.post("/", response_model=Subscription)
async def create_subscription(
    data: SubscriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new subscription."""
    # Verify account ownership
    account_service = AccountService(db)
    account = await account_service.get_by_id(data.account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    service = SubscriptionService(db)
    return await service.create_subscription(current_user.id, data)


@router.put("/{subscription_id}", response_model=Subscription)
async def update_subscription(
    subscription_id: str,
    data: SubscriptionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a subscription."""
    service = SubscriptionService(db)
    subscription = await service.update_subscription(subscription_id, current_user.id, data)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription


@router.post("/{subscription_id}/paid", response_model=Subscription)
async def mark_subscription_paid(
    subscription_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a subscription as paid and advance the due date."""
    service = SubscriptionService(db)
    subscription = await service.advance_due_date(subscription_id, current_user.id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription


@router.delete("/{subscription_id}")
async def delete_subscription(
    subscription_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a subscription."""
    service = SubscriptionService(db)
    success = await service.delete_subscription(subscription_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"message": "Subscription deleted successfully"}

