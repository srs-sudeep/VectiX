"""Settlement service for Splitwise functionality."""

import uuid
from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.app.models import Settlement, GroupMember, User
from src.app.schemas import SettlementCreate, SettlementUpdate
from src.app.services.base import BaseService


class SettlementService(BaseService[Settlement]):
    """Settlement service."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Settlement)

    async def get_by_id(self, settlement_id: str, user_id: str) -> Optional[Settlement]:
        """Get settlement by ID (only if user is involved)."""
        query = (
            select(Settlement)
            .where(
                Settlement.id == settlement_id,
                ((Settlement.from_user_id == user_id) | (Settlement.to_user_id == user_id))
            )
            .options(
                selectinload(Settlement.from_user),
                selectinload(Settlement.to_user)
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_group(
        self, group_id: str, user_id: str, limit: int = 50, offset: int = 0
    ) -> List[Settlement]:
        """Get all settlements for a group."""
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
            select(Settlement)
            .where(Settlement.group_id == group_id)
            .options(
                selectinload(Settlement.from_user),
                selectinload(Settlement.to_user)
            )
            .order_by(Settlement.settled_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_settlement(
        self, user_id: str, data: SettlementCreate
    ) -> Optional[Settlement]:
        """Create a new settlement (user pays to_user)."""
        # Verify user is a member
        member_check = await self.db.execute(
            select(GroupMember).where(
                GroupMember.group_id == data.group_id,
                GroupMember.user_id == user_id
            )
        )
        if not member_check.scalar_one_or_none():
            return None
        
        # Verify to_user is also a member
        to_member_check = await self.db.execute(
            select(GroupMember).where(
                GroupMember.group_id == data.group_id,
                GroupMember.user_id == data.to_user_id
            )
        )
        if not to_member_check.scalar_one_or_none():
            return None
        
        settlement = Settlement(
            id=str(uuid.uuid4()),
            group_id=data.group_id,
            from_user_id=user_id,
            to_user_id=data.to_user_id,
            amount=data.amount,
            currency=data.currency,
            method=data.method,
            settled_at=datetime.utcnow(),
        )
        self.db.add(settlement)
        await self.db.commit()
        await self.db.refresh(settlement)
        return settlement

    async def update_settlement(
        self, settlement_id: str, user_id: str, data: SettlementUpdate
    ) -> Optional[Settlement]:
        """Update a settlement (only payer can update)."""
        settlement = await self.get_by_id(settlement_id, user_id)
        if not settlement or settlement.from_user_id != user_id:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(settlement, key, value)
        
        await self.db.commit()
        await self.db.refresh(settlement)
        return settlement

    async def delete_settlement(self, settlement_id: str, user_id: str) -> bool:
        """Delete a settlement (only payer can delete)."""
        settlement = await self.get_by_id(settlement_id, user_id)
        if not settlement or settlement.from_user_id != user_id:
            return False
        
        await self.db.delete(settlement)
        await self.db.commit()
        return True

    async def get_settlement_suggestions(
        self, group_id: str, group_service
    ) -> List[dict]:
        """
        Get settlement suggestions based on current balances.
        Uses a simple algorithm to minimize number of transactions.
        """
        balances = await group_service.get_all_balances(group_id)
        
        # Separate creditors (positive balance) and debtors (negative balance)
        creditors = [(b["user_id"], b["user_name"], b["balance"]) 
                     for b in balances if b["balance"] > 0]
        debtors = [(b["user_id"], b["user_name"], -b["balance"]) 
                   for b in balances if b["balance"] < 0]
        
        # Sort by amount (descending)
        creditors.sort(key=lambda x: x[2], reverse=True)
        debtors.sort(key=lambda x: x[2], reverse=True)
        
        suggestions = []
        
        i, j = 0, 0
        while i < len(creditors) and j < len(debtors):
            creditor_id, creditor_name, credit = creditors[i]
            debtor_id, debtor_name, debt = debtors[j]
            
            amount = min(credit, debt)
            
            if amount > 0:
                suggestions.append({
                    "from_user_id": debtor_id,
                    "from_user_name": debtor_name,
                    "to_user_id": creditor_id,
                    "to_user_name": creditor_name,
                    "amount": amount,
                })
            
            creditors[i] = (creditor_id, creditor_name, credit - amount)
            debtors[j] = (debtor_id, debtor_name, debt - amount)
            
            if creditors[i][2] == 0:
                i += 1
            if debtors[j][2] == 0:
                j += 1
        
        return suggestions

    async def get_user_settlements(
        self, user_id: str, limit: int = 20
    ) -> List[Settlement]:
        """Get recent settlements involving the user across all groups."""
        query = (
            select(Settlement)
            .where(
                (Settlement.from_user_id == user_id) | 
                (Settlement.to_user_id == user_id)
            )
            .options(
                selectinload(Settlement.from_user),
                selectinload(Settlement.to_user),
                selectinload(Settlement.group)
            )
            .order_by(Settlement.settled_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

