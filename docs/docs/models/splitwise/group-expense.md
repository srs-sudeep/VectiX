---
sidebar_position: 3
---

# GroupExpense Model

The `GroupExpense` model represents shared expenses (bills) within a group. It tracks who paid and how the expense should be split among group members.

## Table: `group_expense`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique expense identifier (UUID) |
| `group_id` | String (FK) | Foreign key to `Group` |
| `paid_by` | String (FK) | Foreign key to `User` - User who paid the expense |
| `title` | String | Expense title/description |
| `amount` | Numeric(15, 2) | Total expense amount |
| `currency` | String | ISO 4217 currency code |
| `split_type` | String | How the expense is split: `equal`, `unequal`, or `percentage` |

## Split Types

- **`equal`** - Split equally among all members
- **`unequal`** - Split with custom amounts per member
- **`percentage`** - Split by percentage for each member

## Relationships

- **`group`** (Many-to-One) → `Group` - Group this expense belongs to
- **`payer`** (Many-to-One) → `User` - User who paid the expense
- **`splits`** (One-to-Many) → `ExpenseSplit` - Individual splits of the expense
  - Cascade: `all, delete-orphan`
- **`linked_transaction`** (One-to-One, nullable) → `Transaction` - Linked personal finance transaction

## Usage Example

```python
from src.app.models.group_expense import GroupExpense

# Create an equal split expense
dinner_expense = GroupExpense(
    id="uuid-here",
    group_id=group.id,
    paid_by=user.id,
    title="Dinner at Restaurant",
    amount=100.00,
    currency="USD",
    split_type="equal"
)

# Create an unequal split expense
rent_expense = GroupExpense(
    id="uuid-here",
    group_id=group.id,
    paid_by=user.id,
    title="Monthly Rent",
    amount=2000.00,
    currency="USD",
    split_type="unequal"
)

# Create a percentage split expense
utilities_expense = GroupExpense(
    id="uuid-here",
    group_id=group.id,
    paid_by=user.id,
    title="Utilities",
    amount=150.00,
    currency="USD",
    split_type="percentage"
)
```

## Expense Splitting Logic

### Equal Split
Split the amount equally among all group members:

```python
# For equal split, create splits for all members
member_count = len(group.members)
split_amount = expense.amount / member_count

for member in group.members:
    ExpenseSplit(
        group_expense_id=expense.id,
        user_id=member.user_id,
        share_amount=split_amount
    )
```

### Unequal Split
Each member gets a custom amount (must sum to total):

```python
# For unequal split, specify custom amounts
splits = [
    {"user_id": user1.id, "amount": 60.00},
    {"user_id": user2.id, "amount": 40.00}
]

for split_data in splits:
    ExpenseSplit(
        group_expense_id=expense.id,
        user_id=split_data["user_id"],
        share_amount=split_data["amount"]
    )
```

### Percentage Split
Each member gets a percentage of the total:

```python
# For percentage split
splits = [
    {"user_id": user1.id, "percentage": 60.0},
    {"user_id": user2.id, "percentage": 40.0}
]

for split_data in splits:
    ExpenseSplit(
        group_expense_id=expense.id,
        user_id=split_data["user_id"],
        share_amount=expense.amount * (split_data["percentage"] / 100),
        share_percentage=split_data["percentage"]
    )
```

## Linking to Transactions

Expenses can be linked to personal finance transactions:

```python
# Create transaction for the expense
transaction = Transaction(
    user_id=expense.paid_by,
    account_id=account.id,
    type="expense",
    amount=expense.amount,
    currency=expense.currency,
    description=expense.title,
    group_expense_id=expense.id
)

expense.linked_transaction = transaction
```

## Notes

- The payer is the user who actually paid the expense
- Splits must sum to the total expense amount
- Expenses can be linked to personal finance transactions for tracking
- All splits are automatically deleted when the expense is deleted

