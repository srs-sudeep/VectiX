---
sidebar_position: 1
---

# Introduction

Welcome to **VectiX** - a comprehensive personal finance and expense management platform built with modern technologies.

## What is VectiX?

VectiX is a full-stack application that combines personal finance management with group expense splitting capabilities, similar to Splitwise. It provides a robust backend API built with FastAPI and a modern React frontend, all secured with a comprehensive Role-Based Access Control (RBAC) system.

## Key Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** for secure user sessions
- **OAuth integration** (Google) for seamless login
- **Role-Based Access Control (RBAC)** with granular permissions
- **Module and Route management** for dynamic access control

### 💰 Personal Finance Management
- **Multi-account support** (Banks, Cash, Wallets, Credit Cards)
- **Transaction tracking** (Income, Expenses, Transfers)
- **Category management** with custom icons and colors
- **Subscription tracking** for recurring bills
- **Attachment support** with OCR capabilities for bills and receipts

### 👥 Group Expense Splitting
- **Group creation** for shared expenses
- **Flexible expense splitting** (Equal, Unequal, Percentage)
- **Settlement tracking** to manage who paid whom
- **Multi-currency support** for international groups

## Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Async ORM with PostgreSQL
- **Alembic** - Database migrations
- **Redis** - Caching and rate limiting
- **PostgreSQL** - Primary database

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management

## Project Structure

```
VectiX/
├── Server/          # FastAPI backend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/        # API routes and endpoints
│   │   │   ├── models/     # SQLAlchemy database models
│   │   │   ├── schemas/    # Pydantic schemas
│   │   │   └── services/   # Business logic
│   │   └── core/           # Core utilities and configuration
│   └── migrations/         # Alembic database migrations
│
├── Web/            # React frontend
│   └── src/
│       ├── api/            # API client functions
│       ├── components/     # React components
│       ├── routes/         # Route definitions
│       ├── store/          # State management
│       └── views/          # Page components
│
└── docs/          # Documentation (this site)
```

## Getting Started

### Prerequisites

- **Python 3.13+** with UV package manager
- **Node.js 20+** with npm/bun
- **PostgreSQL** database
- **Redis** for caching
- **Docker** (optional, for containerized deployment)

### Installation

1. **Backend Setup:**
   ```bash
   cd Server
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   uv pip install -e .
   ```

2. **Frontend Setup:**
   ```bash
   cd Web
   npm install  # or bun install
   ```

3. **Database Setup:**
   ```bash
   # Using Docker
   docker-compose up -d postgres redis
   
   # Initialize database
   cd Server
   uv run init-db
   ```

4. **Run Development Servers:**
   ```bash
   # Backend (from Server directory)
   uv run dev
   
   # Frontend (from Web directory)
   npm run dev  # or bun run dev
   ```

## API Documentation

Once the backend is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database Models

VectiX uses a well-structured database schema organized into three main categories:

1. **RBAC Models** - User authentication, roles, permissions, modules, and routes
2. **Personal Finance Models** - Accounts, transactions, categories, subscriptions, and attachments
3. **Splitwise Models** - Groups, group members, expenses, splits, and settlements

For detailed information about each model, see the [Models Documentation](/docs/models/intro).

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

This project is licensed under the MIT License.
