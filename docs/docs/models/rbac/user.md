---
sidebar_position: 1
---

# User Model

The `User` model represents user accounts in the VectiX system. It supports both local authentication and OAuth (Google) authentication.

## Table: `user`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique user identifier (UUID) |
| `name` | String | User's full name |
| `phoneNumber` | String (nullable) | Phone number (nullable for OAuth users) |
| `email` | String (unique) | User's email address |
| `username` | String (unique) | Unique username |
| `hashed_password` | String (nullable) | Hashed password (nullable for OAuth users) |
| `is_active` | Boolean | Whether the user account is active (default: `true`) |
| `is_superuser` | Boolean | Whether the user has superuser privileges (default: `false`) |
| `google_id` | String (unique, nullable) | Google OAuth ID |
| `auth_provider` | String (nullable) | Authentication provider: `'local'` or `'google'` (default: `'local'`) |
| `photo` | String (nullable) | Profile picture URL from OAuth |
| `timezone` | String (nullable) | User's timezone (default: `"UTC"`) |
| `default_currency` | String (nullable) | Default currency code (ISO 4217, default: `"USD"`) |
| `country` | String (nullable) | Country code (ISO 3166-1 alpha-2) |

## Relationships

### RBAC Relationships
- **`roles`** (Many-to-Many) → `Role` - Roles assigned to the user
  - Association table: `user_role`

### Personal Finance Relationships
- **`accounts`** (One-to-Many) → `Account` - User's financial accounts
- **`transactions`** (One-to-Many) → `Transaction` - User's transactions
- **`categories`** (One-to-Many) → `Category` - User's transaction categories
- **`subscriptions`** (One-to-Many) → `Subscription` - User's recurring subscriptions
- **`attachments`** (One-to-Many) → `Attachment` - User's bill attachments

### Splitwise Relationships
- **`created_groups`** (One-to-Many) → `Group` - Groups created by the user
- **`group_memberships`** (One-to-Many) → `GroupMember` - Group memberships
- **`paid_expenses`** (One-to-Many) → `GroupExpense` - Expenses paid by the user
- **`expense_splits`** (One-to-Many) → `ExpenseSplit` - Expense splits assigned to the user
- **`sent_settlements`** (One-to-Many) → `Settlement` - Settlements sent by the user
- **`received_settlements`** (One-to-Many) → `Settlement` - Settlements received by the user

## Usage Example

```python
from src.app.models.user import User

# Create a new user
user = User(
    id="uuid-here",
    name="John Doe",
    email="john@example.com",
    username="johndoe",
    hashed_password="hashed_password_here",
    auth_provider="local",
    default_currency="USD",
    timezone="America/New_York"
)

# Access user's accounts
user_accounts = user.accounts

# Check if user is superuser
if user.is_superuser:
    # Grant all permissions
    pass
```

## Notes

- Users can authenticate via local credentials or Google OAuth
- Superusers bypass all permission checks
- The `phoneNumber` and `hashed_password` fields are nullable to support OAuth-only users
- User preferences like timezone and currency are stored for personalization

