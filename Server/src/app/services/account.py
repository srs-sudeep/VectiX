"""Account service for Personal Finance."""

import uuid
from typing import List, Optional
from decimal import Decimal
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.app.models import Account, Transaction
from src.app.schemas import AccountCreate, AccountUpdate
from src.app.services.base import BaseService


class AccountService(BaseService[Account]):
    """Account service."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Account)

    async def get_by_id(self, account_id: str, user_id: str) -> Optional[Account]:
        """Get account by ID for a specific user."""
        query = select(Account).where(
            Account.id == account_id,
            Account.user_id == user_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all_by_user(
        self,
        user_id: str,
        is_active: Optional[bool] = None,
        account_type: Optional[str] = None
    ) -> List[Account]:
        """Get all accounts for a user."""
        query = select(Account).where(Account.user_id == user_id)
        
        if is_active is not None:
            query = query.where(Account.is_active == is_active)
        if account_type:
            query = query.where(Account.type == account_type)
        
        query = query.order_by(Account.name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_account(self, user_id: str, data: AccountCreate) -> Account:
        """Create a new account."""
        account = Account(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=data.name,
            type=data.type,
            currency=data.currency,
            opening_balance=data.opening_balance,
            current_balance=data.opening_balance,  # Initial balance = opening balance
            is_active=data.is_active,
        )
        self.db.add(account)
        await self.db.commit()
        await self.db.refresh(account)
        return account

    async def update_account(
        self, account_id: str, user_id: str, data: AccountUpdate
    ) -> Optional[Account]:
        """Update an account."""
        account = await self.get_by_id(account_id, user_id)
        if not account:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(account, key, value)
        
        await self.db.commit()
        await self.db.refresh(account)
        return account

    async def delete_account(self, account_id: str, user_id: str) -> bool:
        """Delete an account (soft delete by setting is_active=False)."""
        account = await self.get_by_id(account_id, user_id)
        if not account:
            return False
        
        account.is_active = False
        await self.db.commit()
        return True

    async def get_total_balance(self, user_id: str) -> Decimal:
        """Get total balance across all active accounts."""
        query = select(func.sum(Account.current_balance)).where(
            Account.user_id == user_id,
            Account.is_active == True
        )
        result = await self.db.execute(query)
        total = result.scalar_one_or_none()
        return total or Decimal("0.00")

    async def update_balance(
        self, account_id: str, amount: Decimal, is_credit: bool
    ) -> Optional[Account]:
        """Update account balance after a transaction."""
        query = select(Account).where(Account.id == account_id)
        result = await self.db.execute(query)
        account = result.scalar_one_or_none()
        
        if not account:
            return None
        
        if is_credit:
            account.current_balance += amount
        else:
            account.current_balance -= amount
        
        await self.db.commit()
        await self.db.refresh(account)
        return account

    async def transfer_money(
        self,
        from_account_id: str,
        to_account_id: str,
        amount: Decimal,
        user_id: str
    ) -> bool:
        """Transfer money between accounts."""
        from_account = await self.get_by_id(from_account_id, user_id)
        to_account = await self.get_by_id(to_account_id, user_id)
        
        if not from_account or not to_account:
            return False
        
        from_account.current_balance -= amount
        to_account.current_balance += amount
        
        await self.db.commit()
        return True

