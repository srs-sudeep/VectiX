"""Transaction service for Personal Finance."""

import uuid
from datetime import date, datetime
from typing import List, Optional, Tuple
from decimal import Decimal
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.app.models import Transaction, Account, Category
from src.app.schemas import TransactionCreate, TransactionUpdate, TransactionFilter
from src.app.services.base import BaseService


class TransactionService(BaseService[Transaction]):
    """Transaction service."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Transaction)

    async def get_by_id(self, transaction_id: str, user_id: str) -> Optional[Transaction]:
        """Get transaction by ID."""
        query = (
            select(Transaction)
            .where(Transaction.id == transaction_id, Transaction.user_id == user_id)
            .options(selectinload(Transaction.category), selectinload(Transaction.account))
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all_by_user(
        self,
        user_id: str,
        filters: Optional[TransactionFilter] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Transaction], int]:
        """Get all transactions for a user with filters and pagination."""
        query = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .options(selectinload(Transaction.category), selectinload(Transaction.account))
        )

        if filters:
            if filters.type:
                query = query.where(Transaction.type == filters.type)
            if filters.account_id:
                query = query.where(Transaction.account_id == filters.account_id)
            if filters.category_id:
                query = query.where(Transaction.category_id == filters.category_id)
            if filters.start_date:
                query = query.where(Transaction.transaction_date >= filters.start_date)
            if filters.end_date:
                query = query.where(Transaction.transaction_date <= filters.end_date)
            if filters.min_amount:
                query = query.where(Transaction.amount >= filters.min_amount)
            if filters.max_amount:
                query = query.where(Transaction.amount <= filters.max_amount)
            if filters.search:
                search_pattern = f"%{filters.search.lower()}%"
                query = query.where(
                    func.lower(Transaction.description).like(search_pattern)
                )

        # Count total
        count_query = select(func.count(Transaction.id)).where(Transaction.user_id == user_id)
        if filters:
            # Apply same filters to count query
            if filters.type:
                count_query = count_query.where(Transaction.type == filters.type)
            if filters.account_id:
                count_query = count_query.where(Transaction.account_id == filters.account_id)
        
        total = (await self.db.execute(count_query)).scalar_one()

        # Pagination and ordering
        query = query.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
        query = query.offset(offset).limit(limit)
        
        result = await self.db.execute(query)
        transactions = list(result.scalars().all())
        
        return transactions, total

    async def create_transaction(
        self, user_id: str, data: TransactionCreate, account_service
    ) -> Transaction:
        """Create a new transaction and update account balance."""
        transaction = Transaction(
            id=str(uuid.uuid4()),
            user_id=user_id,
            account_id=data.account_id,
            type=data.type,
            amount=data.amount,
            currency=data.currency,
            description=data.description,
            transaction_date=data.transaction_date,
            category_id=data.category_id,
            related_account_id=data.related_account_id,
            group_expense_id=data.group_expense_id,
        )
        
        self.db.add(transaction)
        
        # Update account balance
        if data.type == "income":
            await account_service.update_balance(data.account_id, data.amount, is_credit=True)
        elif data.type == "expense":
            await account_service.update_balance(data.account_id, data.amount, is_credit=False)
        elif data.type == "transfer" and data.related_account_id:
            await account_service.transfer_money(
                data.account_id, data.related_account_id, data.amount, user_id
            )
        
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction

    async def update_transaction(
        self, transaction_id: str, user_id: str, data: TransactionUpdate
    ) -> Optional[Transaction]:
        """Update a transaction."""
        transaction = await self.get_by_id(transaction_id, user_id)
        if not transaction:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(transaction, key, value)
        
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction

    async def delete_transaction(
        self, transaction_id: str, user_id: str, account_service
    ) -> bool:
        """Delete a transaction and reverse the balance change."""
        transaction = await self.get_by_id(transaction_id, user_id)
        if not transaction:
            return False
        
        # Reverse the balance change
        if transaction.type == "income":
            await account_service.update_balance(
                transaction.account_id, transaction.amount, is_credit=False
            )
        elif transaction.type == "expense":
            await account_service.update_balance(
                transaction.account_id, transaction.amount, is_credit=True
            )
        
        await self.db.delete(transaction)
        await self.db.commit()
        return True

    async def get_summary(
        self,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> dict:
        """Get transaction summary (income, expense, net)."""
        query = select(
            Transaction.type,
            func.sum(Transaction.amount).label("total")
        ).where(Transaction.user_id == user_id)
        
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        
        query = query.group_by(Transaction.type)
        result = await self.db.execute(query)
        rows = result.all()
        
        summary = {"income": Decimal("0.00"), "expense": Decimal("0.00")}
        for row in rows:
            if row.type in summary:
                summary[row.type] = row.total or Decimal("0.00")
        
        summary["net"] = summary["income"] - summary["expense"]
        return summary

    async def get_by_account(
        self, account_id: str, user_id: str, limit: int = 20
    ) -> List[Transaction]:
        """Get recent transactions for a specific account."""
        query = (
            select(Transaction)
            .where(
                Transaction.account_id == account_id,
                Transaction.user_id == user_id
            )
            .options(selectinload(Transaction.category))
            .order_by(Transaction.transaction_date.desc())
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_category_breakdown(
        self,
        user_id: str,
        transaction_type: str = "expense",
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[dict]:
        """Get spending breakdown by category."""
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
                Transaction.type == transaction_type
            )
        )
        
        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)
        
        query = query.group_by(Category.id, Category.name, Category.icon, Category.color)
        query = query.order_by(func.sum(Transaction.amount).desc())
        
        result = await self.db.execute(query)
        rows = result.all()
        
        return [
            {
                "category_id": row.id,
                "category_name": row.name,
                "category_icon": row.icon,
                "category_color": row.color,
                "amount": row.total or Decimal("0.00"),
                "transaction_count": row.count
            }
            for row in rows
        ]

