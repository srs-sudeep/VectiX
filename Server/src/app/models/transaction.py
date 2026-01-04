"""Transaction model for Personal Finance."""

from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import Column, Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base

if TYPE_CHECKING:
    from src.app.models.user import User
    from src.app.models.account import Account
    from src.app.models.category import Category
    from src.app.models.group_expense import GroupExpense
    from src.app.models.attachment import Attachment


class Transaction(Base):
    """Transaction model (Income / Expense / Transfer)."""

    __tablename__ = "transaction"

    id = Column(String, primary_key=True, unique=True, index=True)
    user_id = Column(String, ForeignKey("user.id"), nullable=False, index=True)
    account_id = Column(String, ForeignKey("account.id"), nullable=False, index=True)

    type = Column(String, nullable=False)  # income | expense | transfer
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String, nullable=False)  # ISO 4217 currency code
    description = Column(String, nullable=True)
    transaction_date = Column(Date, nullable=False, default=date.today)

    category_id = Column(String, ForeignKey("category.id"), nullable=True, index=True)
    related_account_id = Column(String, ForeignKey("account.id"), nullable=True)  # For transfers
    group_expense_id = Column(String, ForeignKey("group_expense.id"), nullable=True, index=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="transactions")
    account: Mapped["Account"] = relationship(
        "Account", foreign_keys=[account_id], back_populates="transactions"
    )
    category: Mapped["Category"] = relationship("Category", back_populates="transactions")
    related_account: Mapped["Account"] = relationship(
        "Account", foreign_keys=[related_account_id]
    )
    group_expense: Mapped["GroupExpense"] = relationship(
        "GroupExpense", back_populates="linked_transaction"
    )
    attachments: Mapped[list["Attachment"]] = relationship(
        "Attachment", back_populates="linked_transaction"
    )

