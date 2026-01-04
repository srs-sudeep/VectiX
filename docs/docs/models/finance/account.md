---
sidebar_position: 1
---

# Account Model

The `Account` model represents financial accounts such as bank accounts, cash, wallets, and credit cards.

## Table: `account`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique account identifier (UUID) |
| `user_id` | String (FK) | Foreign key to `User` |
| `name` | String | Account name (e.g., "SBI Savings", "Cash", "Credit Card") |
| `type` | String | Account type: `bank`, `cash`, `wallet`, or `credit` |
| `currency` | String | ISO 4217 currency code (e.g., "USD", "INR", "EUR") |
| `opening_balance` | Numeric(15, 2) | Initial balance when account was created (default: `0`) |
| `current_balance` | Numeric(15, 2) | Current account balance (default: `0`) |
| `is_active` | Boolean | Whether the account is active (default: `true`) |

## Account Types

- **`bank`** - Traditional bank accounts (savings, checking)
- **`cash`** - Physical cash
- **`wallet`** - Digital wallets (PayPal, Paytm, etc.)
- **`credit`** - Credit cards

## Relationships

- **`user`** (Many-to-One) → `User` - Owner of the account
- **`transactions`** (One-to-Many) → `Transaction` - Transactions associated with this account
- **`subscriptions`** (One-to-Many) → `Subscription` - Recurring subscriptions linked to this account
  - Cascade: `all, delete-orphan`

## Usage Example

```python
from src.app.models.account import Account

# Create a bank account
savings_account = Account(
    id="uuid-here",
    user_id=user.id,
    name="SBI Savings Account",
    type="bank",
    currency="INR",
    opening_balance=10000.00,
    current_balance=10000.00,
    is_active=True
)

# Create a cash account
cash_account = Account(
    id="uuid-here",
    user_id=user.id,
    name="Cash",
    type="cash",
    currency="INR",
    opening_balance=5000.00,
    current_balance=5000.00
)

# Access account transactions
account_transactions = savings_account.transactions
```

## Balance Management

The `current_balance` should be updated when transactions are created or modified:

```python
# When creating a transaction
transaction = Transaction(
    account_id=account.id,
    amount=100.00,
    type="expense"
)
# Update balance
account.current_balance -= transaction.amount
```

## Notes

- Accounts support multiple currencies
- The `current_balance` should be maintained by the application logic
- Inactive accounts can be hidden but retain historical data
- Subscriptions are automatically deleted when an account is deleted

