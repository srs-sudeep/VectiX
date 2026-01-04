"""Script to initialize admin routes for the application."""
import asyncio
import sys
from pathlib import Path

# Add project root to Python path
sys.path.append(str(Path(__file__).parent.parent))

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import Module, Route, Role
from src.app.services.module import ModuleService
from src.app.services.route import RouteService
from src.core.db.session import async_session_factory


# Home module routes
HOME_ROUTES = [
    {
        "path": "/vectix/dashboard/admin",
        "label": "Dashboard",
        "icon": "home",
        "is_sidebar": True,
        "is_active": True,
        "parent_id": None,
    },
    {
        "path": "/vectix/profile",
        "label": "Profile",
        "icon": "user",
        "is_sidebar": True,
        "is_active": True,
        "parent_id": None,
    },
]

# Admin module routes with parent-child structure
ADMIN_ROUTES = [
    # Parent routes
    {
        "path": "/vectix/admin/rbac",
        "label": "Role Based Access Control",
        "icon": "globeLock",
        "is_sidebar": True,
        "is_active": True,
        "parent_id": None,
    },
    {
        "path": "/vectix/admin/route",
        "label": "Routes",
        "icon": "database",
        "is_sidebar": True,
        "is_active": True,
        "parent_id": None,
    },
    # Children of RBAC
    {
        "path": "/vectix/admin/rbac/permission",
        "label": "Permissions",
        "icon": "folderLock",
        "is_sidebar": True,
        "is_active": True,
        "parent_path": "/vectix/admin/rbac",  # Will be resolved to parent_id
    },
    {
        "path": "/vectix/admin/rbac/role",
        "label": "Roles",
        "icon": "userLock",
        "is_sidebar": True,
        "is_active": True,
        "parent_path": "/vectix/admin/rbac",
    },
    {
        "path": "/vectix/admin/rbac/user",
        "label": "Users",
        "icon": "users",
        "is_sidebar": True,
        "is_active": True,
        "parent_path": "/vectix/admin/rbac",
    },
    # Children of Routes
    {
        "path": "/vectix/admin/route/module",
        "label": "Modules",
        "icon": "boxes",
        "is_sidebar": True,
        "is_active": True,
        "parent_path": "/vectix/admin/route",
    },
    {
        "path": "/vectix/admin/route/path",
        "label": "Paths",
        "icon": "route",
        "is_sidebar": True,
        "is_active": True,
        "parent_path": "/vectix/admin/route",
    },
]


async def ensure_module(session: AsyncSession, name: str, label: str, icon: str) -> Module:
    """Ensure a module exists, create if it doesn't."""
    module_service = ModuleService(session)
    
    query = select(Module).where(Module.name == name)
    result = await session.execute(query)
    module = result.scalar_one_or_none()

    if not module:
        print(f"\n📦 Creating {name} module...")
        module = await module_service.create(
            name=name,
            label=label,
            icon=icon,
            is_active=True,
        )
        print(f"✅ {label} module created successfully")
    else:
        print(f"\n✅ {label} module already exists")

    return module


async def get_superuser_role(session: AsyncSession) -> Optional[Role]:
    """Get superuser role, create if doesn't exist."""
    query = select(Role).where(Role.name == "superuser")
    result = await session.execute(query)
    superuser_role = result.scalar_one_or_none()

    if not superuser_role:
        # Try to find admin role as fallback
        query = select(Role).where(Role.name == "admin")
        result = await session.execute(query)
        superuser_role = result.scalar_one_or_none()

    if not superuser_role:
        print("\n⚠️  Warning: No superuser or admin role found!")
        print("   Please create a superuser role first using: poetry run createsuperuser")
        print("   Routes will be created but not assigned to any role.")
        return None

    return superuser_role


async def init_routes_async(session: AsyncSession) -> None:
    """Initialize routes for home and admin modules."""
    try:
        # Ensure modules exist
        home_module = await ensure_module(session, "home", "Home", "home")
        admin_module = await ensure_module(session, "admin", "Admin", "shield")

        # Get superuser role for route assignment
        superuser_role = await get_superuser_role(session)
        role_ids = [superuser_role.role_id] if superuser_role else None

        # Initialize route service
        route_service = RouteService(session)

        # Store created routes to resolve parent_id for child routes
        created_routes: dict[str, int] = {}

        print("\n🛣️  Initializing routes...")
        created_count = 0
        skipped_count = 0

        # First, create all parent routes (home and admin parent routes)
        all_routes = HOME_ROUTES + ADMIN_ROUTES
        
        # Separate parent and child routes
        parent_routes = [r for r in all_routes if r.get("parent_id") is None and "parent_path" not in r]
        child_routes = [r for r in all_routes if "parent_path" in r]

        # Create parent routes first
        for route_config in parent_routes:
            # Check if route already exists
            query = select(Route).where(Route.path == route_config["path"])
            result = await session.execute(query)
            existing_route = result.scalar_one_or_none()

            if existing_route:
                print(f"   ⏭️  Route '{route_config['path']}' already exists, skipping...")
                created_routes[route_config["path"]] = existing_route.id
                skipped_count += 1
                continue

            # Determine module based on path
            module = home_module if route_config["path"].startswith("/vectix/dashboard") or route_config["path"].startswith("/vectix/profile") else admin_module

            # Create route
            try:
                route = await route_service.create(
                    path=route_config["path"],
                    label=route_config["label"],
                    module_id=module.id,
                    icon=route_config.get("icon"),
                    is_active=route_config.get("is_active", True),
                    is_sidebar=route_config.get("is_sidebar", True),
                    parent_id=None,
                    role_ids=role_ids if role_ids else [],
                )
                created_routes[route_config["path"]] = route.id
                print(f"   ✅ Created route: {route_config['path']} ({route_config['label']})")
                created_count += 1
            except Exception as e:
                print(f"   ❌ Failed to create route '{route_config['path']}': {str(e)}")
                continue

        # Now create child routes with parent_id
        for route_config in child_routes:
            # Check if route already exists
            query = select(Route).where(Route.path == route_config["path"])
            result = await session.execute(query)
            existing_route = result.scalar_one_or_none()

            if existing_route:
                print(f"   ⏭️  Route '{route_config['path']}' already exists, skipping...")
                skipped_count += 1
                continue

            # Get parent_id from created_routes or database
            parent_path = route_config.get("parent_path")
            if not parent_path:
                print(f"   ⚠️  No parent_path specified for '{route_config['path']}', skipping...")
                continue

            # Check if parent is in created_routes, otherwise fetch from database
            if parent_path in created_routes:
                parent_id = created_routes[parent_path]
            else:
                parent_query = select(Route).where(Route.path == parent_path)
                parent_result = await session.execute(parent_query)
                parent_route = parent_result.scalar_one_or_none()
                if not parent_route:
                    print(f"   ⚠️  Parent route '{parent_path}' not found for '{route_config['path']}', skipping...")
                    continue
                parent_id = parent_route.id

            # Create child route
            try:
                route = await route_service.create(
                    path=route_config["path"],
                    label=route_config["label"],
                    module_id=admin_module.id,
                    icon=route_config.get("icon"),
                    is_active=route_config.get("is_active", True),
                    is_sidebar=route_config.get("is_sidebar", True),
                    parent_id=parent_id,
                    role_ids=role_ids if role_ids else [],
                )
                print(f"   ✅ Created route: {route_config['path']} ({route_config['label']})")
                created_count += 1
            except Exception as e:
                print(f"   ❌ Failed to create route '{route_config['path']}': {str(e)}")
                continue

        total_routes = len(HOME_ROUTES) + len(ADMIN_ROUTES)
        print(f"\n📊 Summary:")
        print(f"   ✅ Created: {created_count} routes")
        print(f"   ⏭️  Skipped: {skipped_count} routes")
        print(f"   📦 Total: {total_routes} routes")

        if superuser_role:
            print(f"\n✅ All routes assigned to '{superuser_role.name}' role")
        else:
            print("\n⚠️  Routes created but not assigned to any role")
            print("   Assign routes to roles manually through the admin panel")

    except Exception as e:
        print(f"\n❌ Error initializing routes: {str(e)}")
        await session.rollback()
        raise


async def init_routes() -> None:
    """Main function to initialize routes."""
    print("\n" + "=" * 60)
    print("  Initialize Admin Routes")
    print("=" * 60)

    async with async_session_factory() as session:
        try:
            await init_routes_async(session)
            print("\n✅ Route initialization completed successfully!")
        except Exception as e:
            print(f"\n❌ Failed to initialize routes: {str(e)}")
            sys.exit(1)


def main() -> None:
    """Main entry point."""
    try:
        # Create event loop
        if sys.platform == 'win32':
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
        # Run the async function
        asyncio.run(init_routes())
    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()



