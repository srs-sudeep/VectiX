"""Subscription model for Personal Finance."""

from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Column, Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base

if TYPE_CHECKING:
    from src.app.models.user import User
    from src.app.models.account import Account


class Subscription(Base):
    """Subscription / Recurring Bills model."""

    __tablename__ = "subscription"

    id = Column(String, primary_key=True, unique=True, index=True)
    user_id = Column(String, ForeignKey("user.id"), nullable=False, index=True)
    account_id = Column(String, ForeignKey("account.id"), nullable=False, index=True)

    name = Column(String, nullable=False)  # Netflix, Spotify, etc.
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String, nullable=False)  # ISO 4217 currency code
    interval = Column(String, nullable=False)  # monthly | yearly
    next_due_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="subscriptions")
    account: Mapped["Account"] = relationship("Account", back_populates="subscriptions")

