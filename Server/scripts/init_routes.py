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


# Admin routes configuration
ADMIN_ROUTES = [
    {
        "path": "vectix/admin/role",
        "label": "Role Management",
        "icon": "Users",
        "is_sidebar": True,
        "is_active": True,
    },
    {
        "path": "vectix/admin/permission",
        "label": "Permission Management",
        "icon": "Shield",
        "is_sidebar": True,
        "is_active": True,
    },
    {
        "path": "vectix/admin/module",
        "label": "Module Management",
        "icon": "Package",
        "is_sidebar": True,
        "is_active": True,
    },
    {
        "path": "vectix/admin/user",
        "label": "User Management",
        "icon": "User",
        "is_sidebar": True,
        "is_active": True,
    },
    {
        "path": "vectix/admin/route",
        "label": "Route Management",
        "icon": "Route",
        "is_sidebar": True,
        "is_active": True,
    },
]


async def ensure_admin_module(session: AsyncSession) -> Module:
    """Ensure admin module exists."""
    module_service = ModuleService(session)
    
    # Check if admin module exists
    query = select(Module).where(Module.name == "admin")
    result = await session.execute(query)
    admin_module = result.scalar_one_or_none()

    if not admin_module:
        print("\n📦 Creating admin module...")
        admin_module = await module_service.create(
            name="admin",
            label="Admin",
            icon="Settings",
            is_active=True,
        )
        print("✅ Admin module created successfully")
    else:
        print("\n✅ Admin module already exists")

    return admin_module


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
    """Initialize admin routes."""
    try:
        # Ensure admin module exists
        admin_module = await ensure_admin_module(session)

        # Get superuser role for route assignment
        superuser_role = await get_superuser_role(session)
        role_ids = [superuser_role.role_id] if superuser_role else None

        # Initialize route service
        route_service = RouteService(session)

        print("\n🛣️  Initializing admin routes...")
        created_count = 0
        skipped_count = 0

        for route_config in ADMIN_ROUTES:
            # Check if route already exists
            query = select(Route).where(Route.path == route_config["path"])
            result = await session.execute(query)
            existing_route = result.scalar_one_or_none()

            if existing_route:
                print(f"   ⏭️  Route '{route_config['path']}' already exists, skipping...")
                skipped_count += 1
                continue

            # Create route
            try:
                route = await route_service.create(
                    path=route_config["path"],
                    label=route_config["label"],
                    module_id=admin_module.id,
                    icon=route_config.get("icon"),
                    is_active=route_config.get("is_active", True),
                    is_sidebar=route_config.get("is_sidebar", True),
                    parent_id=None,  # Top-level routes
                    role_ids=role_ids if role_ids else [],
                )
                print(f"   ✅ Created route: {route_config['path']} ({route_config['label']})")
                created_count += 1
            except Exception as e:
                print(f"   ❌ Failed to create route '{route_config['path']}': {str(e)}")
                continue

        print(f"\n📊 Summary:")
        print(f"   ✅ Created: {created_count} routes")
        print(f"   ⏭️  Skipped: {skipped_count} routes")
        print(f"   📦 Total: {len(ADMIN_ROUTES)} routes")

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

