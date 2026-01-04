---
sidebar_position: 3
---

# Category Model

The `Category` model represents transaction categories for organizing income and expenses. Categories can have custom icons and colors for better visualization.

## Table: `category`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique category identifier (UUID) |
| `user_id` | String (FK) | Foreign key to `User` |
| `name` | String | Category name (e.g., "Food", "Travel", "Rent") |
| `type` | String | Category type: `income` or `expense` |
| `icon` | String (nullable) | Icon identifier for UI display |
| `color` | String (nullable) | Hex color code (e.g., "#FF5733") |

## Category Types

- **`income`** - Categories for income transactions (Salary, Gifts, etc.)
- **`expense`** - Categories for expense transactions (Food, Travel, etc.)

## Relationships

- **`user`** (Many-to-One) → `User` - Owner of the category
- **`transactions`** (One-to-Many) → `Transaction` - Transactions using this category

## Usage Example

```python
from src.app.models.category import Category

# Create an expense category
food_category = Category(
    id="uuid-here",
    user_id=user.id,
    name="Food & Dining",
    type="expense",
    icon="utensils",
    color="#FF5733"
)

# Create an income category
salary_category = Category(
    id="uuid-here",
    user_id=user.id,
    name="Salary",
    type="income",
    icon="briefcase",
    color="#33FF57"
)

# Access category transactions
food_transactions = food_category.transactions
```

## Common Categories

### Expense Categories
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel

### Income Categories
- Salary
- Freelance
- Investments
- Gifts
- Business

## Notes

- Categories are user-specific (each user has their own categories)
- Icons and colors help with visual organization in the UI
- Categories must match the transaction type (income categories for income transactions)
- Categories can be reused across multiple transactions

