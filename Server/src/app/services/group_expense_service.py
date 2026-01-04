"""Group Expense service for Splitwise functionality."""

import uuid
from typing import List, Optional
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.app.models import GroupExpense, ExpenseSplit, Group, GroupMember, User
from src.app.schemas import GroupExpenseCreate, GroupExpenseUpdate, ExpenseSplitInput
from src.app.services.base import BaseService


class GroupExpenseService(BaseService[GroupExpense]):
    """Group Expense service."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, GroupExpense)

    async def get_by_id(self, expense_id: str, user_id: str) -> Optional[GroupExpense]:
        """Get expense by ID (only if user is in the group)."""
        query = (
            select(GroupExpense)
            .join(Group, GroupExpense.group_id == Group.id)
            .join(GroupMember, Group.id == GroupMember.group_id)
            .where(GroupExpense.id == expense_id, GroupMember.user_id == user_id)
            .options(
                selectinload(GroupExpense.splits).selectinload(ExpenseSplit.user),
                selectinload(GroupExpense.payer)
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_group(
        self, group_id: str, user_id: str, limit: int = 50, offset: int = 0
    ) -> List[GroupExpense]:
        """Get all expenses for a group."""
        # Verify user is a member
        member_check = await self.db.execute(
            select(GroupMember).where(
                GroupMember.group_id == group_id,
                GroupMember.user_id == user_id
            )
        )
        if not member_check.scalar_one_or_none():
            return []
        
        query = (
            select(GroupExpense)
            .where(GroupExpense.group_id == group_id)
            .options(
                selectinload(GroupExpense.splits),
                selectinload(GroupExpense.payer)
            )
            .order_by(GroupExpense.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_expense(
        self, user_id: str, data: GroupExpenseCreate
    ) -> Optional[GroupExpense]:
        """Create a new group expense with splits."""
        # Verify user is a member
        member_check = await self.db.execute(
            select(GroupMember).where(
                GroupMember.group_id == data.group_id,
                GroupMember.user_id == user_id
            )
        )
        if not member_check.scalar_one_or_none():
            return None
        
        expense_id = str(uuid.uuid4())
        paid_by = data.paid_by or user_id  # Default to current user
        
        expense = GroupExpense(
            id=expense_id,
            group_id=data.group_id,
            paid_by=paid_by,
            title=data.title,
            amount=data.amount,
            currency=data.currency,
            split_type=data.split_type,
        )
        self.db.add(expense)
        
        # Create splits based on split_type
        if data.split_type == "equal":
            await self._create_equal_splits(expense_id, data.group_id, data.amount)
        elif data.split_type in ["unequal", "percentage"]:
            await self._create_custom_splits(expense_id, data.splits, data.amount, data.split_type)
        
        await self.db.commit()
        await self.db.refresh(expense)
        return expense

    async def _create_equal_splits(
        self, expense_id: str, group_id: str, total_amount: Decimal
    ):
        """Create equal splits for all group members."""
        # Get all members
        query = select(GroupMember).where(GroupMember.group_id == group_id)
        result = await self.db.execute(query)
        members = result.scalars().all()
        
        if not members:
            return
        
        share_amount = total_amount / len(members)
        
        for member in members:
            split = ExpenseSplit(
                id=str(uuid.uuid4()),
                group_expense_id=expense_id,
                user_id=member.user_id,
                share_amount=share_amount,
                share_percentage=Decimal("100") / len(members),
            )
            self.db.add(split)

    async def _create_custom_splits(
        self,
        expense_id: str,
        splits: List[ExpenseSplitInput],
        total_amount: Decimal,
        split_type: str
    ):
        """Create custom splits (unequal or percentage)."""
        for split_input in splits:
            if split_type == "percentage" and split_input.share_percentage:
                share_amount = (split_input.share_percentage / 100) * total_amount
            else:
                share_amount = split_input.share_amount or Decimal("0")
            
            split = ExpenseSplit(
                id=str(uuid.uuid4()),
                group_expense_id=expense_id,
                user_id=split_input.user_id,
                share_amount=share_amount,
                share_percentage=split_input.share_percentage,
            )
            self.db.add(split)

    async def update_expense(
        self, expense_id: str, user_id: str, data: GroupExpenseUpdate
    ) -> Optional[GroupExpense]:
        """Update an expense (only payer can update)."""
        expense = await self.get_by_id(expense_id, user_id)
        if not expense or expense.paid_by != user_id:
            return None
        
        update_data = data.model_dump(exclude_unset=True, exclude={"splits"})
        for key, value in update_data.items():
            setattr(expense, key, value)
        
        # If splits are updated, recreate them
        if data.splits is not None:
            # Delete existing splits
            await self.db.execute(
                ExpenseSplit.__table__.delete().where(
                    ExpenseSplit.group_expense_id == expense_id
                )
            )
            
            # Create new splits
            if expense.split_type == "equal":
                await self._create_equal_splits(expense_id, expense.group_id, expense.amount)
            else:
                await self._create_custom_splits(
                    expense_id, data.splits, expense.amount, expense.split_type
                )
        
        await self.db.commit()
        await self.db.refresh(expense)
        return expense

    async def delete_expense(self, expense_id: str, user_id: str) -> bool:
        """Delete an expense (only payer can delete)."""
        expense = await self.get_by_id(expense_id, user_id)
        if not expense or expense.paid_by != user_id:
            return False
        
        await self.db.delete(expense)
        await self.db.commit()
        return True

    async def get_expense_with_splits(self, expense_id: str, user_id: str) -> Optional[dict]:
        """Get expense with detailed split information."""
        expense = await self.get_by_id(expense_id, user_id)
        if not expense:
            return None
        
        splits = []
        for split in expense.splits:
            user_name = None
            if split.user:
                user_name = split.user.name
            
            splits.append({
                "id": split.id,
                "user_id": split.user_id,
                "user_name": user_name,
                "share_amount": split.share_amount,
                "share_percentage": split.share_percentage,
            })
        
        return {
            "id": expense.id,
            "group_id": expense.group_id,
            "title": expense.title,
            "amount": expense.amount,
            "currency": expense.currency,
            "split_type": expense.split_type,
            "paid_by": expense.paid_by,
            "payer_name": expense.payer.name if expense.payer else None,
            "splits": splits,
            "created_at": expense.created_at,
        }

