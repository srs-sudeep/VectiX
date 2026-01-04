"""Attachment endpoints for Personal Finance (Bills/Receipts)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.app.api import get_current_user
from src.app.models import User
from src.app.services import AttachmentService
from src.app.schemas import (
    Attachment,
    AttachmentCreate,
    AttachmentUpdate,
)

router = APIRouter()


@router.get("/", response_model=List[Attachment])
async def get_attachments(
    type: Optional[str] = Query(None, description="Filter by type: bill | receipt"),
    linked_only: bool = Query(False, description="Only show linked attachments"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all attachments for the current user."""
    service = AttachmentService(db)
    return await service.get_all_by_user(
        current_user.id, attachment_type=type, linked_only=linked_only
    )


@router.get("/unlinked", response_model=List[Attachment])
async def get_unlinked_attachments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all unlinked attachments (bills not converted to expenses)."""
    service = AttachmentService(db)
    return await service.get_unlinked(current_user.id)


@router.get("/{attachment_id}", response_model=Attachment)
async def get_attachment(
    attachment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific attachment."""
    service = AttachmentService(db)
    attachment = await service.get_by_id(attachment_id, current_user.id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return attachment


@router.post("/", response_model=Attachment)
async def create_attachment(
    data: AttachmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new attachment."""
    service = AttachmentService(db)
    return await service.create_attachment(current_user.id, data)


@router.put("/{attachment_id}", response_model=Attachment)
async def update_attachment(
    attachment_id: str,
    data: AttachmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an attachment."""
    service = AttachmentService(db)
    attachment = await service.update_attachment(attachment_id, current_user.id, data)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return attachment


@router.post("/{attachment_id}/link/{transaction_id}", response_model=Attachment)
async def link_attachment_to_transaction(
    attachment_id: str,
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Link an attachment to a transaction."""
    service = AttachmentService(db)
    attachment = await service.link_to_transaction(
        attachment_id, transaction_id, current_user.id
    )
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return attachment


@router.post("/{attachment_id}/unlink", response_model=Attachment)
async def unlink_attachment(
    attachment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Unlink an attachment from its transaction."""
    service = AttachmentService(db)
    attachment = await service.unlink_from_transaction(attachment_id, current_user.id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return attachment


@router.delete("/{attachment_id}")
async def delete_attachment(
    attachment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an attachment."""
    service = AttachmentService(db)
    success = await service.delete_attachment(attachment_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return {"message": "Attachment deleted successfully"}

