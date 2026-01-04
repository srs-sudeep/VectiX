---
sidebar_position: 1
---

# Models Overview

VectiX uses SQLAlchemy ORM with PostgreSQL to manage its database models. The models are organized into three main categories based on their functionality.

## Model Categories

### 🔐 RBAC Models
Role-Based Access Control models for authentication, authorization, and access management:
- **User** - User accounts with authentication
- **Role** - User roles for permission grouping
- **Permission** - Granular permissions (resource:action)
- **Module** - Application modules for organization
- **Route** - Frontend routes with access control

### 💰 Personal Finance Models
Models for personal finance tracking and management:
- **Account** - Financial accounts (banks, cash, wallets, credit cards)
- **Transaction** - Income, expense, and transfer transactions
- **Category** - Transaction categories with icons and colors
- **Subscription** - Recurring bills and subscriptions
- **Attachment** - Bill scans and receipts with OCR support

### 👥 Splitwise Models
Models for group expense splitting functionality:
- **Group** - Expense groups for shared expenses
- **GroupMember** - Members of expense groups
- **GroupExpense** - Shared expenses/bills
- **ExpenseSplit** - Individual splits of expenses
- **Settlement** - Records of who paid whom

## Database Relationships

The models are interconnected through well-defined relationships:

- **User** is the central entity connected to all other models
- **RBAC models** control access to the application
- **Finance models** track personal financial data
- **Splitwise models** manage group expenses and settlements

## Model Conventions

All models follow these conventions:

- **Primary Keys**: String IDs (UUIDs) for most models, Integer IDs for RBAC models
- **Timestamps**: Created/updated timestamps where applicable
- **Soft Deletes**: `is_active` flags for soft deletion
- **Relationships**: Properly defined foreign keys and back-references
- **Indexes**: Strategic indexes on foreign keys and frequently queried fields

## Next Steps

Explore the models by category:
- [RBAC Models](/docs/models/rbac/user)
- [Personal Finance Models](/docs/models/finance/account)
- [Splitwise Models](/docs/models/splitwise/group)

