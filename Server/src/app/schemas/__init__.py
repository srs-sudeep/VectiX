"""Schemas package."""

from src.app.schemas.auth import (
    Login,
    RefreshToken,
    Token,
    TokenPayload,
    GoogleAuthRequest,
    GoogleTokenRequest,
    GoogleUserInfo,
    GoogleAuthResponse,
)
from src.app.schemas.permission import (
    Permission,
    PermissionCreate,
    PermissionInDB,
    PermissionUpdate,
    PermissionWithSelected,
)
from src.app.schemas.role import Role, RoleCreate, RoleInDB, RoleUpdate
from src.app.schemas.user import (
    User,
    UserBase,
    UserCreate,
    UserInDB,
    UserUpdate,
    UserResponse,
    UserRole,
    UserWithRoles,
    UserWithAllRoles,
    UserRoleWithAssigned,
)
from src.app.schemas.module import (
    ModuleBase,
    ModuleCreate,
    ModuleResponse,
    ModuleUpdate,
)
from src.app.schemas.route import (
    RouteBase,
    RouteCreate,
    RouteResponse,
    RouteUpdate,
)
from src.app.schemas.sidebar import SidebarModuleItem, SidebarRouteItem

__all__ = [
    "User",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "UserResponse",
    "UserRole",
    "UserWithRoles",
    "UserWithAllRoles",
    "UserRoleWithAssigned",
    "Role",
    "RoleCreate",
    "RoleUpdate",
    "RoleInDB",
    "Permission",
    "PermissionCreate",
    "PermissionUpdate",
    "PermissionInDB",
    "PermissionWithSelected",
    "Token",
    "TokenPayload",
    "Login",
    "RefreshToken",
    "GoogleAuthRequest",
    "GoogleTokenRequest",
    "GoogleUserInfo",
    "GoogleAuthResponse",
    "ModuleBase",
    "ModuleCreate",
    "ModuleUpdate",
    "ModuleResponse",
    "RouteBase",
    "RouteCreate",
    "RouteUpdate",
    "RouteResponse",
    "SidebarModuleItem",
    "SidebarRouteItem",
]
