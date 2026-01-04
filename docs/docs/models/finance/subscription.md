---
sidebar_position: 4
---

# Subscription Model

The `Subscription` model represents recurring bills and subscriptions that need to be tracked and paid periodically.

## Table: `subscription`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique subscription identifier (UUID) |
| `user_id` | String (FK) | Foreign key to `User` |
| `account_id` | String (FK) | Foreign key to `Account` - Account used for payment |
| `name` | String | Subscription name (e.g., "Netflix", "Spotify", "Gym Membership") |
| `amount` | Numeric(15, 2) | Subscription amount |
| `currency` | String | ISO 4217 currency code |
| `interval` | String | Billing interval: `monthly` or `yearly` |
| `next_due_date` | Date | Next payment due date |
| `is_active` | Boolean | Whether the subscription is active (default: `true`) |

## Billing Intervals

- **`monthly`** - Recurring monthly payments
- **`yearly`** - Recurring yearly payments

## Relationships

- **`user`** (Many-to-One) → `User` - Owner of the subscription
- **`account`** (Many-to-One) → `Account` - Account used for payments

## Usage Example

```python
from src.app.models.subscription import Subscription
from datetime import date, timedelta

# Create a monthly subscription
netflix_subscription = Subscription(
    id="uuid-here",
    user_id=user.id,
    account_id=credit_card.id,
    name="Netflix",
    amount=15.99,
    currency="USD",
    interval="monthly",
    next_due_date=date.today() + timedelta(days=30),
    is_active=True
)

# Create a yearly subscription
gym_subscription = Subscription(
    id="uuid-here",
    user_id=user.id,
    account_id=bank_account.id,
    name="Gym Membership",
    amount=600.00,
    currency="USD",
    interval="yearly",
    next_due_date=date.today() + timedelta(days=365),
    is_active=True
)
```

## Subscription Management

When a subscription payment is made, create a transaction and update the next due date:

```python
# Create transaction for subscription payment
transaction = Transaction(
    user_id=user.id,
    account_id=subscription.account_id,
    type="expense",
    amount=subscription.amount,
    currency=subscription.currency,
    description=f"{subscription.name} subscription",
    transaction_date=subscription.next_due_date
)

# Update next due date
if subscription.interval == "monthly":
    subscription.next_due_date += timedelta(days=30)
elif subscription.interval == "yearly":
    subscription.next_due_date += timedelta(days=365)
```

## Notes

- Subscriptions are automatically deleted when the linked account is deleted
- The `next_due_date` should be updated after each payment
- Inactive subscriptions can be kept for historical tracking
- Subscriptions can be used to generate reminders for upcoming payments

