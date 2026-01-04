---
sidebar_position: 4
---

# Module Model

The `Module` model represents application modules for organizing routes and features in the frontend.

## Table: `module`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Auto-incrementing module identifier |
| `name` | String (unique) | Unique module identifier (e.g., "finance", "splitwise") |
| `label` | String | Display name for the module |
| `icon` | String (nullable) | Icon identifier for UI display |
| `is_active` | Boolean | Whether the module is active (default: `true`) |

## Relationships

- **`routes`** (One-to-Many) → `Route` - Routes belonging to this module
  - Back-reference from `Route.module`

## Usage Example

```python
from src.app.models.module import Module

# Create a module
finance_module = Module(
    name="finance",
    label="Personal Finance",
    icon="wallet",
    is_active=True
)

# Access module routes
finance_routes = finance_module.routes
```

## Common Modules

Typical modules in VectiX:
- **dashboard** - Main dashboard
- **finance** - Personal finance management
- **splitwise** - Group expense splitting
- **admin** - Administration panel
- **settings** - User settings

## Notes

- Modules help organize the application into logical sections
- Routes are grouped under modules for better navigation
- Inactive modules can be hidden from the UI
- The `name` field is used as a unique identifier in code

