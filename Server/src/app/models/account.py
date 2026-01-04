"""Account model for Personal Finance."""

from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Column, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base

if TYPE_CHECKING:
    from src.app.models.user import User
    from src.app.models.transaction import Transaction
    from src.app.models.subscription import Subscription


class Account(Base):
    """Account model (Wallets, Banks, Credit Cards)."""

    __tablename__ = "account"

    id = Column(String, primary_key=True, unique=True, index=True)
    user_id = Column(String, ForeignKey("user.id"), nullable=False, index=True)
    
    name = Column(String, nullable=False)  # SBI Savings, Cash, Credit Card
    type = Column(String, nullable=False)  # bank | cash | wallet | credit
    currency = Column(String, nullable=False)  # ISO 4217 currency code
    opening_balance = Column(Numeric(15, 2), default=0, nullable=False)
    current_balance = Column(Numeric(15, 2), default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="accounts")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", foreign_keys="[Transaction.account_id]", back_populates="account"
    )
    subscriptions: Mapped[list["Subscription"]] = relationship(
        "Subscription", back_populates="account", cascade="all, delete-orphan"
    )

