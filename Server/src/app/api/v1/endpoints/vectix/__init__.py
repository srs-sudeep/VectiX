"""Vectix API endpoints package."""

from src.app.api.v1.endpoints.vectix.accounts import router as accounts_router
from src.app.api.v1.endpoints.vectix.transactions import router as transactions_router
from src.app.api.v1.endpoints.vectix.categories import router as categories_router
from src.app.api.v1.endpoints.vectix.subscriptions import router as subscriptions_router
from src.app.api.v1.endpoints.vectix.attachments import router as attachments_router
from src.app.api.v1.endpoints.vectix.groups import router as groups_router
from src.app.api.v1.endpoints.vectix.group_expenses import router as group_expenses_router
from src.app.api.v1.endpoints.vectix.settlements import router as settlements_router
from src.app.api.v1.endpoints.vectix.dashboard import router as dashboard_router

__all__ = [
    "accounts_router",
    "transactions_router",
    "categories_router",
    "subscriptions_router",
    "attachments_router",
    "groups_router",
    "group_expenses_router",
    "settlements_router",
    "dashboard_router",
]

