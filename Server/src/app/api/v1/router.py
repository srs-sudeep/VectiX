"""API v1 router."""

from fastapi import APIRouter

from src.app.api.v1.endpoints import (
    # Core routers
    file_router,
    auth_router,
    rbac_router,
    users_router,
    module_router,
    route_router,
    sidebar_router,
    # Vectix routers
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

# Create API router
router = APIRouter()

# Include core endpoint routers
router.include_router(file_router, prefix="/file", tags=["file"])
router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(users_router, prefix="/users", tags=["users"])
router.include_router(rbac_router, prefix="/rbac", tags=["rbac"])
router.include_router(module_router, prefix="/module", tags=["module"])
router.include_router(route_router, prefix="/route", tags=["route"])
router.include_router(sidebar_router, prefix="/sidebar", tags=["sidebar"])

# Include Vectix endpoint routers
router.include_router(accounts_router, prefix="/vectix/accounts", tags=["vectix-accounts"])
router.include_router(transactions_router, prefix="/vectix/transactions", tags=["vectix-transactions"])
router.include_router(categories_router, prefix="/vectix/categories", tags=["vectix-categories"])
router.include_router(subscriptions_router, prefix="/vectix/subscriptions", tags=["vectix-subscriptions"])
router.include_router(attachments_router, prefix="/vectix/attachments", tags=["vectix-attachments"])
router.include_router(groups_router, prefix="/vectix/groups", tags=["vectix-groups"])
router.include_router(group_expenses_router, prefix="/vectix/expenses", tags=["vectix-expenses"])
router.include_router(settlements_router, prefix="/vectix/settlements", tags=["vectix-settlements"])
router.include_router(dashboard_router, prefix="/vectix/dashboard", tags=["vectix-dashboard"])
