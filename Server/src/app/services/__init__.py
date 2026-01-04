"""Services package."""

# Auth & RBAC Services
from src.app.services.auth import AuthService
from src.app.services.role import RoleService
from src.app.services.user import UserService
from src.app.services.permission import PermissionService
from src.app.services.base import BaseService
from src.app.services.module import ModuleService
from src.app.services.route import RouteService
from src.app.services.sidebar import SidebarService
from src.app.services.google_auth import GoogleAuthService

# Personal Finance Services
from src.app.services.account import AccountService
from src.app.services.transaction import TransactionService
from src.app.services.category import CategoryService
from src.app.services.subscription_service import SubscriptionService
from src.app.services.attachment_service import AttachmentService

# Splitwise Services
from src.app.services.group_service import GroupService
from src.app.services.group_expense_service import GroupExpenseService
from src.app.services.settlement_service import SettlementService

# Dashboard Service
from src.app.services.dashboard_service import DashboardService

__all__ = [
    # Auth & RBAC
    "UserService",
    "RoleService",
    "AuthService",
    "PermissionService",
    "BaseService",
    "ModuleService",
    "RouteService",
    "SidebarService",
    "GoogleAuthService",
    # Personal Finance
    "AccountService",
    "TransactionService",
    "CategoryService",
    "SubscriptionService",
    "AttachmentService",
    # Splitwise
    "GroupService",
    "GroupExpenseService",
    "SettlementService",
    # Dashboard
    "DashboardService",
]
