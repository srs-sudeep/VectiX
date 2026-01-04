"""User model."""

from typing import List, TYPE_CHECKING

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, relationship

from src.core.db import Base

if TYPE_CHECKING:
    from src.app.models.role import Role
    from src.app.models.account import Account
    from src.app.models.transaction import Transaction
    from src.app.models.category import Category
    from src.app.models.subscription import Subscription
    from src.app.models.attachment import Attachment
    from src.app.models.group import Group
    from src.app.models.group_member import GroupMember
    from src.app.models.group_expense import GroupExpense
    from src.app.models.expense_split import ExpenseSplit
    from src.app.models.settlement import Settlement

# User-Role association table
user_role = Table(
    "user_role",
    Base.metadata,
    Column("user_id", String, ForeignKey("user.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("role.role_id"), primary_key=True),
)

class User(Base):
    """User model."""
    __tablename__ = "user"
    
    id = Column(String, primary_key=True, unique=True, index=True)
    name = Column(String, nullable=False)
    phoneNumber = Column(String, nullable=True)  # Nullable for OAuth users
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # OAuth fields
    google_id = Column(String, unique=True, nullable=True, index=True)
    auth_provider = Column(String, nullable=True, default="local")  # 'local', 'google'
    photo = Column(String, nullable=True)  # Profile picture URL from OAuth

    # Personal Finance fields
    timezone = Column(String, nullable=True, default="UTC")  # e.g., "America/New_York"
    default_currency = Column(String, nullable=True, default="USD")  # ISO 4217 currency code
    country = Column(String, nullable=True)  # ISO 3166-1 alpha-2 country code

    # Relationships - RBAC
    roles: Mapped[List["Role"]] = relationship(
        "Role", secondary=user_role, back_populates="users"
    )

    # Relationships - Personal Finance
    accounts: Mapped[List["Account"]] = relationship(
        "Account", back_populates="user"
    )
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="user"
    )
    categories: Mapped[List["Category"]] = relationship(
        "Category", back_populates="user"
    )
    subscriptions: Mapped[List["Subscription"]] = relationship(
        "Subscription", back_populates="user"
    )
    attachments: Mapped[List["Attachment"]] = relationship(
        "Attachment", back_populates="user"
    )

    # Relationships - Splitwise
    created_groups: Mapped[List["Group"]] = relationship(
        "Group", foreign_keys="[Group.created_by]", back_populates="creator"
    )
    group_memberships: Mapped[List["GroupMember"]] = relationship(
        "GroupMember", back_populates="user"
    )
    paid_expenses: Mapped[List["GroupExpense"]] = relationship(
        "GroupExpense", foreign_keys="[GroupExpense.paid_by]", back_populates="payer"
    )
    expense_splits: Mapped[List["ExpenseSplit"]] = relationship(
        "ExpenseSplit", back_populates="user"
    )
    sent_settlements: Mapped[List["Settlement"]] = relationship(
        "Settlement", foreign_keys="[Settlement.from_user_id]", back_populates="from_user"
    )
    received_settlements: Mapped[List["Settlement"]] = relationship(
        "Settlement", foreign_keys="[Settlement.to_user_id]", back_populates="to_user"
    )
