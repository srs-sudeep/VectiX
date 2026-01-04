"""Models package."""

# RBAC Models
from src.app.models.permission import Permission
from src.app.models.role import Role
from src.app.models.user import User, user_role
from src.app.models.module import Module
from src.app.models.route import Route, route_role

# Personal Finance Models
from src.app.models.account import Account
from src.app.models.transaction import Transaction
from src.app.models.category import Category
from src.app.models.subscription import Subscription
from src.app.models.attachment import Attachment

# Splitwise Models
from src.app.models.group import Group
from src.app.models.group_member import GroupMember
from src.app.models.group_expense import GroupExpense
from src.app.models.expense_split import ExpenseSplit
from src.app.models.settlement import Settlement

__all__ = [
    # RBAC
    "User",
    "Role",
    "Permission",
    "Module",
    "Route",
    "route_role",
    "user_role",
    # Personal Finance
    "Account",
    "Transaction",
    "Category",
    "Subscription",
    "Attachment",
    # Splitwise
    "Group",
    "GroupMember",
    "GroupExpense",
    "ExpenseSplit",
    "Settlement",
]
