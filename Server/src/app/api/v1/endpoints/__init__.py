# Core endpoints
from src.app.api.v1.endpoints.file_serving import router as file_router
from src.app.api.v1.endpoints.auth import router as auth_router
from src.app.api.v1.endpoints.rbac import router as rbac_router
from src.app.api.v1.endpoints.users import router as users_router
from src.app.api.v1.endpoints.module import router as module_router
from src.app.api.v1.endpoints.route import router as route_router
from src.app.api.v1.endpoints.sidebar import router as sidebar_router

# Vectix endpoints
from src.app.api.v1.endpoints.vectix import (
    accounts_router,
    transactions_router,
    categories_router,
    subscriptions_router,
    attachments_router,
    groups_router,
    group_expenses_router,
    settlements_router,
    dashboard_router,
)

__all__ = [
    # Core
    "file_router",
    "auth_router",
    "rbac_router",
    "users_router",
    "module_router",
    "route_router",
    "sidebar_router",
    # Vectix
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
