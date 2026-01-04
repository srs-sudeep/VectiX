"""Group Expense model for Splitwise functionality."""

from typing import TYPE_CHECKING
from sqlalchemy import Column, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base

if TYPE_CHECKING:
    from src.app.models.group import Group
    from src.app.models.user import User
    from src.app.models.transaction import Transaction
    from src.app.models.expense_split import ExpenseSplit


class GroupExpense(Base):
    """Group Expense (Bill) model."""

    __tablename__ = "group_expense"

    id = Column(String, primary_key=True, unique=True, index=True)
    group_id = Column(String, ForeignKey("group.id"), nullable=False, index=True)
    paid_by = Column(String, ForeignKey("user.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String, nullable=False)  # ISO 4217 currency code
    split_type = Column(String, nullable=False)  # equal | unequal | percentage

    # Relationships
    group: Mapped["Group"] = relationship("Group", back_populates="expenses")
    payer: Mapped["User"] = relationship("User", foreign_keys=[paid_by], back_populates="paid_expenses")
    splits: Mapped[list["ExpenseSplit"]] = relationship(
        "ExpenseSplit", back_populates="group_expense", cascade="all, delete-orphan"
    )
    linked_transaction: Mapped["Transaction"] = relationship(
        "Transaction", back_populates="group_expense"
    )

