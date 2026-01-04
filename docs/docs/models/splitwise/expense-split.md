---
sidebar_position: 4
---

# ExpenseSplit Model

The `ExpenseSplit` model represents how a group expense is divided among group members. This is the core of the Splitwise splitting logic.

## Table: `expense_split`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique split identifier (UUID) |
| `group_expense_id` | String (FK) | Foreign key to `GroupExpense` |
| `user_id` | String (FK) | Foreign key to `User` - User who owes this share |
| `share_amount` | Numeric(15, 2) | Amount this user owes |
| `share_percentage` | Numeric(5, 2) (nullable) | Percentage of total (for percentage splits) |

## Relationships

- **`group_expense`** (Many-to-One) → `GroupExpense` - The expense this split belongs to
- **`user`** (Many-to-One) → `User` - User who owes this share

## Usage Example

```python
from src.app.models.expense_split import ExpenseSplit

# Create a split for equal division
split = ExpenseSplit(
    id="uuid-here",
    group_expense_id=expense.id,
    user_id=user.id,
    share_amount=25.00  # 100.00 / 4 members
)

# Create a split with percentage
percentage_split = ExpenseSplit(
    id="uuid-here",
    group_expense_id=expense.id,
    user_id=user.id,
    share_amount=60.00,  # 60% of 100.00
    share_percentage=60.00
)
```

## Split Validation

When creating splits, ensure they sum to the expense amount:

```python
def validate_splits(expense: GroupExpense, splits: list[ExpenseSplit]) -> bool:
    total = sum(split.share_amount for split in splits)
    return abs(total - expense.amount) < 0.01  # Allow small floating point differences
```

## Calculating Balances

Expense splits are used to calculate who owes whom:

```python
def calculate_balances(group: Group) -> dict:
    """
    Calculate net balances for each member in a group.
    Returns: {user_id: balance} where positive = owed, negative = owes
    """
    balances = {member.user_id: 0.0 for member in group.members}
    
    for expense in group.expenses:
        # The payer paid the full amount
        balances[expense.paid_by] += expense.amount
        
        # Each split member owes their share
        for split in expense.splits:
            balances[split.user_id] -= split.share_amount
    
    return balances
```

## Example: Equal Split

For a $100 expense split equally among 4 members:

```python
expense = GroupExpense(amount=100.00, split_type="equal")

# Create 4 equal splits of $25 each
for member in group.members:
    ExpenseSplit(
        group_expense_id=expense.id,
        user_id=member.user_id,
        share_amount=25.00
    )
```

## Example: Unequal Split

For a $100 expense with custom amounts:

```python
expense = GroupExpense(amount=100.00, split_type="unequal")

splits_data = [
    {"user_id": user1.id, "amount": 40.00},
    {"user_id": user2.id, "amount": 35.00},
    {"user_id": user3.id, "amount": 25.00}
]

for split_data in splits_data:
    ExpenseSplit(
        group_expense_id=expense.id,
        user_id=split_data["user_id"],
        share_amount=split_data["amount"]
    )
```

## Example: Percentage Split

For a $100 expense split by percentage:

```python
expense = GroupExpense(amount=100.00, split_type="percentage")

splits_data = [
    {"user_id": user1.id, "percentage": 50.0},  # $50
    {"user_id": user2.id, "percentage": 30.0},  # $30
    {"user_id": user3.id, "percentage": 20.0}   # $20
]

for split_data in splits_data:
    amount = expense.amount * (split_data["percentage"] / 100)
    ExpenseSplit(
        group_expense_id=expense.id,
        user_id=split_data["user_id"],
        share_amount=amount,
        share_percentage=split_data["percentage"]
    )
```

## Notes

- All splits for an expense must sum to the expense amount
- The `share_percentage` field is only used for percentage splits
- Splits determine how much each member owes
- The payer's split is typically negative (they paid, others owe them)

