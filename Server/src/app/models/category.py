"""Category model for Personal Finance."""

from typing import TYPE_CHECKING
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base

if TYPE_CHECKING:
    from src.app.models.user import User
    from src.app.models.transaction import Transaction


class Category(Base):
    """Category model for transactions."""

    __tablename__ = "category"

    id = Column(String, primary_key=True, unique=True, index=True)
    user_id = Column(String, ForeignKey("user.id"), nullable=False, index=True)

    name = Column(String, nullable=False)  # Food, Travel, Rent
    type = Column(String, nullable=False)  # income | expense
    icon = Column(String, nullable=True)  # Icon identifier
    color = Column(String, nullable=True)  # Hex color code

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="categories")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="category"
    )

