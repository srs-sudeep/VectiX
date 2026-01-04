"""Group service for Splitwise functionality."""

import uuid
from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.app.models import Group, GroupMember, GroupExpense, ExpenseSplit, Settlement, User
from src.app.schemas import GroupCreate, GroupUpdate
from src.app.services.base import BaseService


class GroupService(BaseService[Group]):
    """Group service."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Group)

    async def get_by_id(self, group_id: str, user_id: str) -> Optional[Group]:
        """Get group by ID (only if user is a member)."""
        query = (
            select(Group)
            .join(GroupMember, Group.id == GroupMember.group_id)
            .where(Group.id == group_id, GroupMember.user_id == user_id)
            .options(
                selectinload(Group.members).selectinload(GroupMember.user),
                selectinload(Group.creator)
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all_by_user(self, user_id: str) -> List[dict]:
        """Get all groups for a user with summary info."""
        # Get all groups where user is a member
        query = (
            select(Group)
            .join(GroupMember, Group.id == GroupMember.group_id)
            .where(GroupMember.user_id == user_id)
            .options(selectinload(Group.members))
        )
        result = await self.db.execute(query)
        groups = result.scalars().unique().all()
        
        summaries = []
        for group in groups:
            balance = await self.calculate_user_balance(group.id, user_id)
            total_expenses = await self.get_total_expenses(group.id)
            
            summaries.append({
                "id": group.id,
                "name": group.name,
                "currency": group.currency,
                "member_count": len(group.members),
                "total_expenses": total_expenses,
                "your_balance": balance,
                "created_at": group.created_at,
            })
        
        return summaries

    async def create_group(self, user_id: str, data: GroupCreate) -> Group:
        """Create a new group and add creator as admin."""
        group_id = str(uuid.uuid4())
        
        group = Group(
            id=group_id,
            name=data.name,
            currency=data.currency,
            created_by=user_id,
        )
        self.db.add(group)
        
        # Add creator as admin member
        creator_member = GroupMember(
            id=str(uuid.uuid4()),
            group_id=group_id,
            user_id=user_id,
            role="admin",
            joined_at=datetime.utcnow(),
        )
        self.db.add(creator_member)
        
        # Add other members if provided
        for member_id in data.member_ids:
            if member_id != user_id:  # Don't add creator twice
                member = GroupMember(
                    id=str(uuid.uuid4()),
                    group_id=group_id,
                    user_id=member_id,
                    role="member",
                    joined_at=datetime.utcnow(),
                )
                self.db.add(member)
        
        await self.db.commit()
        await self.db.refresh(group)
        return group

    async def update_group(
        self, group_id: str, user_id: str, data: GroupUpdate
    ) -> Optional[Group]:
        """Update a group (only admins can update)."""
        # Check if user is admin
        if not await self.is_admin(group_id, user_id):
            return None
        
        group = await self.get_by_id(group_id, user_id)
        if not group:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(group, key, value)
        
        await self.db.commit()
        await self.db.refresh(group)
        return group

    async def delete_group(self, group_id: str, user_id: str) -> bool:
        """Delete a group (only creator can delete)."""
        query = select(Group).where(
            Group.id == group_id,
            Group.created_by == user_id
        )
        result = await self.db.execute(query)
        group = result.scalar_one_or_none()
        
        if not group:
            return False
        
        await self.db.delete(group)
        await self.db.commit()
        return True

    async def add_member(
        self, group_id: str, new_member_id: str, admin_user_id: str
    ) -> Optional[GroupMember]:
        """Add a member to a group (admins only)."""
        if not await self.is_admin(group_id, admin_user_id):
            return None
        
        # Check if user is already a member
        existing = await self.db.execute(
            select(GroupMember).where(
                GroupMember.group_id == group_id,
                GroupMember.user_id == new_member_id
            )
        )
        if existing.scalar_one_or_none():
            return None  # Already a member
        
        member = GroupMember(
            id=str(uuid.uuid4()),
            group_id=group_id,
            user_id=new_member_id,
            role="member",
            joined_at=datetime.utcnow(),
        )
        self.db.add(member)
        await self.db.commit()
        await self.db.refresh(member)
        return member

    async def remove_member(
        self, group_id: str, member_user_id: str, admin_user_id: str
    ) -> bool:
        """Remove a member from a group (admins only, can't remove creator)."""
        if not await self.is_admin(group_id, admin_user_id):
            return False
        
        # Check if trying to remove creator
        group = await self.db.execute(
            select(Group).where(Group.id == group_id)
        )
        group_obj = group.scalar_one_or_none()
        if group_obj and group_obj.created_by == member_user_id:
            return False  # Can't remove creator
        
        member = await self.db.execute(
            select(GroupMember).where(
                GroupMember.group_id == group_id,
                GroupMember.user_id == member_user_id
            )
        )
        member_obj = member.scalar_one_or_none()
        
        if not member_obj:
            return False
        
        await self.db.delete(member_obj)
        await self.db.commit()
        return True

    async def is_admin(self, group_id: str, user_id: str) -> bool:
        """Check if user is an admin of the group."""
        query = select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
            GroupMember.role == "admin"
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def is_member(self, group_id: str, user_id: str) -> bool:
        """Check if user is a member of the group."""
        query = select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def get_members(self, group_id: str) -> List[dict]:
        """Get all members of a group with user details."""
        query = (
            select(GroupMember, User)
            .join(User, GroupMember.user_id == User.id)
            .where(GroupMember.group_id == group_id)
            .order_by(GroupMember.joined_at)
        )
        result = await self.db.execute(query)
        rows = result.all()
        
        return [
            {
                "id": row.GroupMember.id,
                "user_id": row.GroupMember.user_id,
                "role": row.GroupMember.role,
                "joined_at": row.GroupMember.joined_at,
                "user_name": row.User.name,
                "user_email": row.User.email,
            }
            for row in rows
        ]

    async def calculate_user_balance(self, group_id: str, user_id: str) -> Decimal:
        """
        Calculate user's balance in a group.
        Positive = user is owed money
        Negative = user owes money
        """
        # What user paid
        paid_query = select(func.coalesce(func.sum(GroupExpense.amount), 0)).where(
            GroupExpense.group_id == group_id,
            GroupExpense.paid_by == user_id
        )
        paid_result = await self.db.execute(paid_query)
        total_paid = Decimal(str(paid_result.scalar_one()))
        
        # What user owes (their share of expenses)
        owed_query = select(func.coalesce(func.sum(ExpenseSplit.share_amount), 0)).where(
            ExpenseSplit.user_id == user_id
        ).join(GroupExpense).where(GroupExpense.group_id == group_id)
        owed_result = await self.db.execute(owed_query)
        total_owed = Decimal(str(owed_result.scalar_one()))
        
        # Settlements received
        received_query = select(func.coalesce(func.sum(Settlement.amount), 0)).where(
            Settlement.group_id == group_id,
            Settlement.to_user_id == user_id
        )
        received_result = await self.db.execute(received_query)
        total_received = Decimal(str(received_result.scalar_one()))
        
        # Settlements made
        made_query = select(func.coalesce(func.sum(Settlement.amount), 0)).where(
            Settlement.group_id == group_id,
            Settlement.from_user_id == user_id
        )
        made_result = await self.db.execute(made_query)
        total_made = Decimal(str(made_result.scalar_one()))
        
        # Balance = (paid + received) - (owed + made)
        return (total_paid + total_received) - (total_owed + total_made)

    async def get_total_expenses(self, group_id: str) -> Decimal:
        """Get total expenses in a group."""
        query = select(func.coalesce(func.sum(GroupExpense.amount), 0)).where(
            GroupExpense.group_id == group_id
        )
        result = await self.db.execute(query)
        return Decimal(str(result.scalar_one()))

    async def get_all_balances(self, group_id: str) -> List[dict]:
        """Get balance for all members in a group."""
        members = await self.get_members(group_id)
        balances = []
        
        for member in members:
            balance = await self.calculate_user_balance(group_id, member["user_id"])
            balances.append({
                "user_id": member["user_id"],
                "user_name": member["user_name"],
                "balance": balance
            })
        
        return balances

