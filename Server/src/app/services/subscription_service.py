"""Subscription service for Personal Finance."""

import uuid
from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.app.models import Subscription, Account
from src.app.schemas import SubscriptionCreate, SubscriptionUpdate
from src.app.services.base import BaseService


class SubscriptionService(BaseService[Subscription]):
    """Subscription service."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Subscription)

    async def get_by_id(self, subscription_id: str, user_id: str) -> Optional[Subscription]:
        """Get subscription by ID."""
        query = (
            select(Subscription)
            .where(Subscription.id == subscription_id, Subscription.user_id == user_id)
            .options(selectinload(Subscription.account))
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all_by_user(
        self,
        user_id: str,
        is_active: Optional[bool] = None
    ) -> List[Subscription]:
        """Get all subscriptions for a user."""
        query = (
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .options(selectinload(Subscription.account))
        )
        
        if is_active is not None:
            query = query.where(Subscription.is_active == is_active)
        
        query = query.order_by(Subscription.next_due_date)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_subscription(
        self, user_id: str, data: SubscriptionCreate
    ) -> Subscription:
        """Create a new subscription."""
        subscription = Subscription(
            id=str(uuid.uuid4()),
            user_id=user_id,
            account_id=data.account_id,
            name=data.name,
            amount=data.amount,
            currency=data.currency,
            interval=data.interval,
            next_due_date=data.next_due_date,
            is_active=data.is_active,
        )
        self.db.add(subscription)
        await self.db.commit()
        await self.db.refresh(subscription)
        return subscription

    async def update_subscription(
        self, subscription_id: str, user_id: str, data: SubscriptionUpdate
    ) -> Optional[Subscription]:
        """Update a subscription."""
        subscription = await self.get_by_id(subscription_id, user_id)
        if not subscription:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(subscription, key, value)
        
        await self.db.commit()
        await self.db.refresh(subscription)
        return subscription

    async def delete_subscription(self, subscription_id: str, user_id: str) -> bool:
        """Delete a subscription."""
        subscription = await self.get_by_id(subscription_id, user_id)
        if not subscription:
            return False
        
        await self.db.delete(subscription)
        await self.db.commit()
        return True

    async def get_upcoming(
        self, user_id: str, days: int = 30
    ) -> List[dict]:
        """Get upcoming subscription payments."""
        today = date.today()
        end_date = today + timedelta(days=days)
        
        query = (
            select(Subscription)
            .where(
                Subscription.user_id == user_id,
                Subscription.is_active == True,
                Subscription.next_due_date <= end_date
            )
            .order_by(Subscription.next_due_date)
        )
        
        result = await self.db.execute(query)
        subscriptions = result.scalars().all()
        
        return [
            {
                "id": sub.id,
                "name": sub.name,
                "amount": sub.amount,
                "currency": sub.currency,
                "next_due_date": sub.next_due_date,
                "days_until_due": (sub.next_due_date - today).days
            }
            for sub in subscriptions
        ]

    async def advance_due_date(self, subscription_id: str, user_id: str) -> Optional[Subscription]:
        """Advance the due date after a payment is recorded."""
        subscription = await self.get_by_id(subscription_id, user_id)
        if not subscription:
            return None
        
        if subscription.interval == "monthly":
            # Add one month
            next_month = subscription.next_due_date.month + 1
            next_year = subscription.next_due_date.year
            if next_month > 12:
                next_month = 1
                next_year += 1
            try:
                subscription.next_due_date = subscription.next_due_date.replace(
                    month=next_month, year=next_year
                )
            except ValueError:
                # Handle cases like Jan 31 -> Feb 28
                subscription.next_due_date = subscription.next_due_date.replace(
                    day=28, month=next_month, year=next_year
                )
        elif subscription.interval == "yearly":
            subscription.next_due_date = subscription.next_due_date.replace(
                year=subscription.next_due_date.year + 1
            )
        
        await self.db.commit()
        await self.db.refresh(subscription)
        return subscription

