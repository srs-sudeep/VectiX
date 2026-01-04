"""Group model for Splitwise functionality."""

from typing import TYPE_CHECKING
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base

if TYPE_CHECKING:
    from src.app.models.user import User
    from src.app.models.group_member import GroupMember
    from src.app.models.group_expense import GroupExpense
    from src.app.models.settlement import Settlement


class Group(Base):
    """Group model for expense splitting."""

    __tablename__ = "group"

    id = Column(String, primary_key=True, unique=True, index=True)
    name = Column(String, nullable=False)
    created_by = Column(String, ForeignKey("user.id"), nullable=False, index=True)
    currency = Column(String, nullable=False)  # ISO 4217 currency code

    # Relationships
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by], back_populates="created_groups")
    members: Mapped[list["GroupMember"]] = relationship(
        "GroupMember", back_populates="group", cascade="all, delete-orphan"
    )
    expenses: Mapped[list["GroupExpense"]] = relationship(
        "GroupExpense", back_populates="group", cascade="all, delete-orphan"
    )
    settlements: Mapped[list["Settlement"]] = relationship(
        "Settlement", back_populates="group", cascade="all, delete-orphan"
    )

