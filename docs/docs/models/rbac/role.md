---
sidebar_position: 2
---

# Role Model

The `Role` model represents user roles in the RBAC system. Roles are collections of permissions that can be assigned to users.

## Table: `role`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `role_id` | Integer (PK) | Auto-incrementing role identifier |
| `name` | String (unique) | Unique role name (e.g., "admin", "editor", "viewer") |
| `description` | String (nullable) | Human-readable description of the role |

## Relationships

- **`users`** (Many-to-Many) → `User` - Users assigned to this role
  - Association table: `user_role`
- **`permissions`** (Many-to-Many) → `Permission` - Permissions granted by this role
  - Association table: `role_permission`
- **`routes`** (Many-to-Many) → `Route` - Routes accessible to this role
  - Association table: `route_role`

## Usage Example

```python
from src.app.models.role import Role
from src.app.models.permission import Permission

# Create a new role
editor_role = Role(
    name="editor",
    description="Can create and edit content"
)

# Assign permissions to the role
create_permission = Permission(
    resource="posts",
    action="create"
)
editor_role.permissions.append(create_permission)

# Assign role to user
user.roles.append(editor_role)
```

## Common Roles

Typical roles in the system might include:
- **admin** - Full system access
- **editor** - Can create and modify content
- **viewer** - Read-only access
- **finance_manager** - Can manage financial data
- **group_admin** - Can manage groups and expenses

## Notes

- Roles provide a convenient way to group permissions
- Users can have multiple roles
- Roles can be assigned to routes for frontend access control
- The `role_id` is auto-incrementing for easy management

