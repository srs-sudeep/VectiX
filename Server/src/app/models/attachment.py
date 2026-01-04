"""Attachment model for Personal Finance (Bill Scans / OCR Ready)."""

from typing import TYPE_CHECKING
from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base

if TYPE_CHECKING:
    from src.app.models.user import User
    from src.app.models.transaction import Transaction


class Attachment(Base):
    """Attachment model for bills, receipts, and OCR data."""

    __tablename__ = "attachment"

    id = Column(String, primary_key=True, unique=True, index=True)
    user_id = Column(String, ForeignKey("user.id"), nullable=False, index=True)

    file_url = Column(String, nullable=False)  # URL to stored file
    type = Column(String, nullable=False)  # bill | receipt
    extracted_text = Column(Text, nullable=True)  # OCR extracted text
    linked_transaction_id = Column(String, ForeignKey("transaction.id"), nullable=True, index=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="attachments")
    linked_transaction: Mapped["Transaction"] = relationship(
        "Transaction", back_populates="attachments"
    )

