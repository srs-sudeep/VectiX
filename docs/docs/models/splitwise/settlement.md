---
sidebar_position: 5
---

# Settlement Model

The `Settlement` model represents payments made between group members to settle their debts. It tracks who paid whom and how much.

## Table: `settlement`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique settlement identifier (UUID) |
| `group_id` | String (FK) | Foreign key to `Group` |
| `from_user_id` | String (FK) | Foreign key to `User` - User who paid |
| `to_user_id` | String (FK) | Foreign key to `User` - User who received payment |
| `amount` | Numeric(15, 2) | Settlement amount |
| `currency` | String | ISO 4217 currency code |
| `method` | String (nullable) | Payment method: `cash`, `upi`, `bank`, etc. |
| `settled_at` | DateTime | Timestamp when settlement was made (default: `datetime.utcnow`) |

## Relationships

- **`group`** (Many-to-One) → `Group` - Group this settlement belongs to
- **`from_user`** (Many-to-One) → `User` - User who made the payment
- **`to_user`** (Many-to-One) → `User` - User who received the payment

## Usage Example

```python
from src.app.models.settlement import Settlement
from datetime import datetime

# Create a settlement
settlement = Settlement(
    id="uuid-here",
    group_id=group.id,
    from_user_id=user1.id,  # User who paid
    to_user_id=user2.id,     # User who received
    amount=50.00,
    currency="USD",
    method="upi",
    settled_at=datetime.utcnow()
)
```

## Settlement Workflow

1. **Calculate Balances** - Determine who owes whom based on expenses
2. **Create Settlement** - Record when a payment is made
3. **Update Balances** - Adjust balances after settlement

## Calculating Who Owes Whom

```python
def calculate_balances(group: Group) -> dict:
    """Calculate net balances for each member."""
    balances = {member.user_id: 0.0 for member in group.members}
    
    for expense in group.expenses:
        balances[expense.paid_by] += expense.amount
        for split in expense.splits:
            balances[split.user_id] -= split.share_amount
    
    return balances

def get_settlement_suggestions(group: Group) -> list[dict]:
    """Get suggested settlements to minimize transactions."""
    balances = calculate_balances(group)
    
    # Find who owes (negative) and who is owed (positive)
    debtors = {uid: -amt for uid, amt in balances.items() if amt < 0}
    creditors = {uid: amt for uid, amt in balances.items() if amt > 0}
    
    suggestions = []
    # Simplified: match largest debtor with largest creditor
    # In practice, use a more sophisticated algorithm
    
    return suggestions
```

## Settlement Methods

Common payment methods:
- **`cash`** - Physical cash
- **`upi`** - UPI payment (India)
- **`bank`** - Bank transfer
- **`card`** - Card payment
- **`paypal`** - PayPal
- **`venmo`** - Venmo
- **`other`** - Other methods

## Example: Recording a Settlement

```python
# User1 owes User2 $50
settlement = Settlement(
    group_id=group.id,
    from_user_id=user1.id,  # User1 pays
    to_user_id=user2.id,    # User2 receives
    amount=50.00,
    currency="USD",
    method="upi",
    settled_at=datetime.utcnow()
)

# After settlement, balances should be updated
# User1's balance: -50.00 + 50.00 = 0.00
# User2's balance: +50.00 - 50.00 = 0.00
```

## Notes

- Settlements reduce the net balance between two users
- Multiple settlements can be made to fully settle a debt
- The `method` field is optional but useful for tracking
- Settlements are automatically deleted when the group is deleted
- The `settled_at` timestamp records when the payment was made

