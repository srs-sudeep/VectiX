"""Group Member model for Splitwise functionality."""

from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base


class GroupMember(Base):
    """Group Member model."""

    __tablename__ = "group_member"

    id = Column(String, primary_key=True, unique=True, index=True)
    group_id = Column(String, ForeignKey("group.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("user.id"), nullable=False, index=True)

    role = Column(String, nullable=False, default="member")  # admin | member
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    group: Mapped["Group"] = relationship("Group", back_populates="members")
    user: Mapped["User"] = relationship("User", back_populates="group_memberships")

