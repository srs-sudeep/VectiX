"""Attachment schemas for Personal Finance (Bills/Receipts)."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AttachmentBase(BaseModel):
    """Base Attachment schema."""
    file_url: str = Field(..., description="URL to stored file")
    type: str = Field(..., description="Attachment type: bill | receipt")
    extracted_text: Optional[str] = Field(None, description="OCR extracted text")


class AttachmentCreate(AttachmentBase):
    """Attachment creation schema."""
    linked_transaction_id: Optional[str] = Field(None, description="Linked transaction ID")


class AttachmentUpdate(BaseModel):
    """Attachment update schema."""
    type: Optional[str] = None
    extracted_text: Optional[str] = None
    linked_transaction_id: Optional[str] = None


class AttachmentInDB(AttachmentBase):
    """Attachment in DB schema."""
    id: str
    user_id: str
    linked_transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Attachment(AttachmentInDB):
    """Attachment response schema."""
    pass


class AttachmentWithTransaction(Attachment):
    """Attachment with linked transaction details."""
    transaction_amount: Optional[float] = None
    transaction_description: Optional[str] = None
    transaction_date: Optional[datetime] = None

