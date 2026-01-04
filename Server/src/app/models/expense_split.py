"""Expense Split model for Splitwise functionality."""

from typing import TYPE_CHECKING
from sqlalchemy import Column, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base

if TYPE_CHECKING:
    from src.app.models.group_expense import GroupExpense
    from src.app.models.user import User


class ExpenseSplit(Base):
    """Expense Split model (Core Splitwise Logic)."""

    __tablename__ = "expense_split"

    id = Column(String, primary_key=True, unique=True, index=True)
    group_expense_id = Column(String, ForeignKey("group_expense.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("user.id"), nullable=False, index=True)

    share_amount = Column(Numeric(15, 2), nullable=False)
    share_percentage = Column(Numeric(5, 2), nullable=True)  # For percentage splits

    # Relationships
    group_expense: Mapped["GroupExpense"] = relationship("GroupExpense", back_populates="splits")
    user: Mapped["User"] = relationship("User", back_populates="expense_splits")

