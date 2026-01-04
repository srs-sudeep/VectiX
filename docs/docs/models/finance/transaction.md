---
sidebar_position: 2
---

# Transaction Model

The `Transaction` model represents financial transactions including income, expenses, and transfers between accounts.

## Table: `transaction`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique transaction identifier (UUID) |
| `user_id` | String (FK) | Foreign key to `User` |
| `account_id` | String (FK) | Foreign key to `Account` (source account) |
| `type` | String | Transaction type: `income`, `expense`, or `transfer` |
| `amount` | Numeric(15, 2) | Transaction amount |
| `currency` | String | ISO 4217 currency code |
| `description` | String (nullable) | Transaction description/notes |
| `transaction_date` | Date | Date of the transaction (default: today) |
| `category_id` | String (FK, nullable) | Foreign key to `Category` |
| `related_account_id` | String (FK, nullable) | Foreign key to `Account` (for transfers - destination account) |
| `group_expense_id` | String (FK, nullable) | Foreign key to `GroupExpense` (if linked to a group expense) |

## Transaction Types

### Income
Money received (salary, gifts, etc.)
- Increases account balance
- Requires a category

### Expense
Money spent (purchases, bills, etc.)
- Decreases account balance
- Requires a category

### Transfer
Money moved between accounts
- Decreases source account balance
- Increases destination account balance (handled separately)
- Does not require a category
- Uses `related_account_id` for destination

## Relationships

- **`user`** (Many-to-One) → `User` - Owner of the transaction
- **`account`** (Many-to-One) → `Account` - Source account
- **`category`** (Many-to-One, nullable) → `Category` - Transaction category
- **`related_account`** (Many-to-One, nullable) → `Account` - Destination account (for transfers)
- **`group_expense`** (Many-to-One, nullable) → `GroupExpense` - Linked group expense
- **`attachments`** (One-to-Many) → `Attachment` - Bill scans and receipts

## Usage Example

```python
from src.app.models.transaction import Transaction
from datetime import date

# Create an expense transaction
expense = Transaction(
    id="uuid-here",
    user_id=user.id,
    account_id=savings_account.id,
    type="expense",
    amount=50.00,
    currency="USD",
    description="Lunch at restaurant",
    transaction_date=date.today(),
    category_id=food_category.id
)

# Create a transfer transaction
transfer = Transaction(
    id="uuid-here",
    user_id=user.id,
    account_id=savings_account.id,
    type="transfer",
    amount=1000.00,
    currency="USD",
    description="Transfer to checking",
    transaction_date=date.today(),
    related_account_id=checking_account.id
)

# Link to group expense
group_expense_transaction = Transaction(
    id="uuid-here",
    user_id=user.id,
    account_id=savings_account.id,
    type="expense",
    amount=200.00,
    currency="USD",
    group_expense_id=group_expense.id
)
```

## Balance Updates

When creating transactions, update account balances:

```python
# For income
if transaction.type == "income":
    account.current_balance += transaction.amount

# For expense
elif transaction.type == "expense":
    account.current_balance -= transaction.amount

# For transfer
elif transaction.type == "transfer":
    account.current_balance -= transaction.amount
    related_account.current_balance += transaction.amount
```

## Notes

- Transactions can be linked to group expenses for expense splitting
- Attachments can be added for bills and receipts
- The `transaction_date` allows backdating transactions
- Transfers require both `account_id` and `related_account_id`

