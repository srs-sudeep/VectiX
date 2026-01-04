"""Settlement model for Splitwise functionality."""

from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base

if TYPE_CHECKING:
    from src.app.models.group import Group
    from src.app.models.user import User


class Settlement(Base):
    """Settlement model (Who Paid Whom)."""

    __tablename__ = "settlement"

    id = Column(String, primary_key=True, unique=True, index=True)
    group_id = Column(String, ForeignKey("group.id"), nullable=False, index=True)

    from_user_id = Column(String, ForeignKey("user.id"), nullable=False, index=True)
    to_user_id = Column(String, ForeignKey("user.id"), nullable=False, index=True)

    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String, nullable=False)  # ISO 4217 currency code
    method = Column(String, nullable=True)  # cash | upi | bank
    settled_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    group: Mapped["Group"] = relationship("Group", back_populates="settlements")
    from_user: Mapped["User"] = relationship("User", foreign_keys=[from_user_id], back_populates="sent_settlements")
    to_user: Mapped["User"] = relationship("User", foreign_keys=[to_user_id], back_populates="received_settlements")

