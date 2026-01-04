---
sidebar_position: 1
---

# Group Model

The `Group` model represents expense groups for splitting bills and expenses among multiple users, similar to Splitwise functionality.

## Table: `group`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique group identifier (UUID) |
| `name` | String | Group name (e.g., "Apartment Rent", "Trip to Paris") |
| `created_by` | String (FK) | Foreign key to `User` - User who created the group |
| `currency` | String | ISO 4217 currency code for the group |

## Relationships

- **`creator`** (Many-to-One) → `User` - User who created the group
- **`members`** (One-to-Many) → `GroupMember` - Members of the group
  - Cascade: `all, delete-orphan`
- **`expenses`** (One-to-Many) → `GroupExpense` - Expenses in the group
  - Cascade: `all, delete-orphan`
- **`settlements`** (One-to-Many) → `Settlement` - Settlements within the group
  - Cascade: `all, delete-orphan`

## Usage Example

```python
from src.app.models.group import Group

# Create a group
apartment_group = Group(
    id="uuid-here",
    name="Apartment Expenses",
    created_by=user.id,
    currency="USD"
)

# Access group members
group_members = apartment_group.members

# Access group expenses
group_expenses = apartment_group.expenses

# Access settlements
group_settlements = apartment_group.settlements
```

## Group Workflow

1. **Create Group** - A user creates a group
2. **Add Members** - Users are added as group members
3. **Add Expenses** - Expenses are added and split among members
4. **Track Balances** - The system tracks who owes whom
5. **Settle Up** - Members settle their debts

## Notes

- Groups have a single currency for all expenses
- The creator is automatically added as a group member
- All related data (members, expenses, settlements) is deleted when the group is deleted
- Groups can be used for various scenarios: roommates, trips, events, etc.

