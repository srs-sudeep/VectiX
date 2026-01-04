---
sidebar_position: 5
---

# Route Model

The `Route` model represents frontend routes with access control. Routes can be organized hierarchically and are associated with modules and roles.

## Table: `route`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Auto-incrementing route identifier |
| `path` | String (unique) | Unique route path (e.g., "/dashboard", "/finance/transactions") |
| `label` | String | Display name for the route |
| `icon` | String (nullable) | Icon identifier for UI display |
| `is_active` | Boolean | Whether the route is active (default: `true`) |
| `is_sidebar` | Boolean | Whether to show in sidebar navigation (default: `true`) |
| `module_id` | Integer (FK) | Foreign key to `Module` |
| `parent_id` | Integer (FK, nullable) | Foreign key to parent `Route` for hierarchical routes |

## Relationships

- **`module`** (Many-to-One) → `Module` - Module this route belongs to
- **`parent`** (Many-to-One, self-referential) → `Route` - Parent route for nested routes
- **`children`** (One-to-Many, self-referential) → `Route` - Child routes
- **`roles`** (Many-to-Many) → `Role` - Roles that can access this route
  - Association table: `route_role`

## Hierarchical Routes

Routes can be organized in a tree structure using the `parent_id` field:

```
/dashboard (parent)
  ├── /dashboard/overview (child)
  └── /dashboard/analytics (child)
```

## Usage Example

```python
from src.app.models.route import Route
from src.app.models.module import Module

# Create a route
transactions_route = Route(
    path="/finance/transactions",
    label="Transactions",
    icon="receipt",
    module_id=finance_module.id,
    is_sidebar=True,
    is_active=True
)

# Create a nested route
transaction_detail_route = Route(
    path="/finance/transactions/:id",
    label="Transaction Details",
    icon="file-text",
    module_id=finance_module.id,
    parent_id=transactions_route.id,
    is_sidebar=False  # Not shown in sidebar, accessed via parent
)

# Assign roles to route
transactions_route.roles.append(viewer_role)
transactions_route.roles.append(editor_role)
```

## Route Access Control

Routes are filtered based on user roles in the frontend:

```typescript
// Frontend route filtering
const availableRoutes = routes.filter(route => 
  user.roles.some(role => route.roles.includes(role.id))
);
```

## Notes

- Routes define what pages users can access in the frontend
- Hierarchical routes support nested navigation structures
- Routes can be hidden from the sidebar but still accessible via direct navigation
- The `path` field should match the frontend route definition

