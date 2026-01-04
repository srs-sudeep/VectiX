---
sidebar_position: 3
---

# Permission Model

The `Permission` model represents granular permissions in the RBAC system. Permissions follow a `resource:action` pattern for fine-grained access control.

## Table: `permission`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `permission_id` | Integer (PK) | Auto-incrementing permission identifier |
| `name` | String (unique) | Unique permission name (e.g., "posts:create") |
| `description` | String (nullable) | Human-readable description |
| `resource` | String | The resource being protected (e.g., "posts", "users") |
| `action` | String | The action allowed (e.g., "create", "read", "update", "delete", "*") |
| `expression` | JSON (nullable) | Optional JSON expression for complex permission logic |

## Permission Format

Permissions follow the format: `resource:action`

### Common Actions
- `create` - Create new resources
- `read` - View resources
- `update` - Modify existing resources
- `delete` - Remove resources
- `*` - All actions on a resource

### Examples

```python
# Full access to posts
Permission(
    name="posts:*",
    resource="posts",
    action="*"
)

# Read-only access to users
Permission(
    name="users:read",
    resource="users",
    action="read"
)

# Create and update products
Permission(
    name="products:create",
    resource="products",
    action="create"
)
```

## Relationships

- **`roles`** (Many-to-Many) → `Role` - Roles that have this permission
  - Association table: `role_permission`

## Usage Example

```python
from src.app.models.permission import Permission
from src.app.models.role import Role

# Create permissions
post_create = Permission(
    name="posts:create",
    resource="posts",
    action="create",
    description="Can create new posts"
)

post_update = Permission(
    name="posts:update",
    resource="posts",
    action="update",
    description="Can update existing posts"
)

# Assign to role
editor_role = Role(name="editor")
editor_role.permissions.extend([post_create, post_update])
```

## API Usage

Permissions are checked in API endpoints using dependencies:

```python
from src.app.api.deps import has_permission

@router.post("/posts/")
async def create_post(
    post: PostCreate,
    current_user: User = Depends(has_permission("posts", "create"))
):
    # Only users with 'posts:create' permission can access
    pass
```

## Notes

- Use lowercase for resources and actions
- Be descriptive with resource names (e.g., "user_profiles" not "profiles")
- The `*` action grants all permissions for a resource
- The `expression` field allows for complex permission logic if needed

