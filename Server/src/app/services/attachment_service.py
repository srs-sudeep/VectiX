"""Attachment service for Personal Finance (Bills/Receipts)."""

import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.app.models import Attachment, Transaction
from src.app.schemas import AttachmentCreate, AttachmentUpdate
from src.app.services.base import BaseService


class AttachmentService(BaseService[Attachment]):
    """Attachment service."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Attachment)

    async def get_by_id(self, attachment_id: str, user_id: str) -> Optional[Attachment]:
        """Get attachment by ID."""
        query = (
            select(Attachment)
            .where(Attachment.id == attachment_id, Attachment.user_id == user_id)
            .options(selectinload(Attachment.linked_transaction))
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all_by_user(
        self,
        user_id: str,
        attachment_type: Optional[str] = None,
        linked_only: bool = False
    ) -> List[Attachment]:
        """Get all attachments for a user."""
        query = (
            select(Attachment)
            .where(Attachment.user_id == user_id)
            .options(selectinload(Attachment.linked_transaction))
        )
        
        if attachment_type:
            query = query.where(Attachment.type == attachment_type)
        
        if linked_only:
            query = query.where(Attachment.linked_transaction_id.isnot(None))
        
        query = query.order_by(Attachment.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_attachment(
        self, user_id: str, data: AttachmentCreate
    ) -> Attachment:
        """Create a new attachment."""
        attachment = Attachment(
            id=str(uuid.uuid4()),
            user_id=user_id,
            file_url=data.file_url,
            type=data.type,
            extracted_text=data.extracted_text,
            linked_transaction_id=data.linked_transaction_id,
        )
        self.db.add(attachment)
        await self.db.commit()
        await self.db.refresh(attachment)
        return attachment

    async def update_attachment(
        self, attachment_id: str, user_id: str, data: AttachmentUpdate
    ) -> Optional[Attachment]:
        """Update an attachment."""
        attachment = await self.get_by_id(attachment_id, user_id)
        if not attachment:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(attachment, key, value)
        
        await self.db.commit()
        await self.db.refresh(attachment)
        return attachment

    async def delete_attachment(self, attachment_id: str, user_id: str) -> bool:
        """Delete an attachment."""
        attachment = await self.get_by_id(attachment_id, user_id)
        if not attachment:
            return False
        
        await self.db.delete(attachment)
        await self.db.commit()
        return True

    async def link_to_transaction(
        self, attachment_id: str, transaction_id: str, user_id: str
    ) -> Optional[Attachment]:
        """Link an attachment to a transaction."""
        attachment = await self.get_by_id(attachment_id, user_id)
        if not attachment:
            return None
        
        attachment.linked_transaction_id = transaction_id
        await self.db.commit()
        await self.db.refresh(attachment)
        return attachment

    async def unlink_from_transaction(
        self, attachment_id: str, user_id: str
    ) -> Optional[Attachment]:
        """Unlink an attachment from a transaction."""
        attachment = await self.get_by_id(attachment_id, user_id)
        if not attachment:
            return None
        
        attachment.linked_transaction_id = None
        await self.db.commit()
        await self.db.refresh(attachment)
        return attachment

    async def get_unlinked(self, user_id: str) -> List[Attachment]:
        """Get all unlinked attachments (bills not yet converted to expenses)."""
        query = (
            select(Attachment)
            .where(
                Attachment.user_id == user_id,
                Attachment.linked_transaction_id.is_(None)
            )
            .order_by(Attachment.created_at.desc())
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

