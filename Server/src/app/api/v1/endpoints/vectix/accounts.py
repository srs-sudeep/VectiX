"""Account endpoints for Personal Finance."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.app.api import get_current_user
from src.app.models import User
from src.app.services import AccountService
from src.app.schemas import (
    Account,
    AccountCreate,
    AccountUpdate,
    AccountSummary,
)

router = APIRouter()


@router.get("/", response_model=List[Account])
async def get_accounts(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    account_type: Optional[str] = Query(None, description="Filter by account type"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all accounts for the current user."""
    service = AccountService(db)
    return await service.get_all_by_user(
        current_user.id, is_active=is_active, account_type=account_type
    )


@router.get("/summary")
async def get_accounts_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get account summary with total balance."""
    service = AccountService(db)
    accounts = await service.get_all_by_user(current_user.id, is_active=True)
    total_balance = await service.get_total_balance(current_user.id)
    
    return {
        "total_balance": total_balance,
        "account_count": len(accounts),
        "accounts": [
            AccountSummary(
                id=acc.id,
                name=acc.name,
                type=acc.type,
                currency=acc.currency,
                current_balance=acc.current_balance,
                is_active=acc.is_active,
            )
            for acc in accounts
        ],
    }


@router.get("/{account_id}", response_model=Account)
async def get_account(
    account_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific account."""
    service = AccountService(db)
    account = await service.get_by_id(account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.post("/", response_model=Account)
async def create_account(
    data: AccountCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new account."""
    service = AccountService(db)
    return await service.create_account(current_user.id, data)


@router.put("/{account_id}", response_model=Account)
async def update_account(
    account_id: str,
    data: AccountUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an account."""
    service = AccountService(db)
    account = await service.update_account(account_id, current_user.id, data)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.delete("/{account_id}")
async def delete_account(
    account_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Archive an account (soft delete)."""
    service = AccountService(db)
    success = await service.delete_account(account_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account archived successfully"}


@router.get("/{account_id}/transactions")
async def get_account_transactions(
    account_id: str,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent transactions for an account."""
    from src.app.services import TransactionService
    
    # Verify account ownership
    account_service = AccountService(db)
    account = await account_service.get_by_id(account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    transaction_service = TransactionService(db)
    transactions = await transaction_service.get_by_account(
        account_id, current_user.id, limit
    )
    
    return {
        "account": AccountSummary(
            id=account.id,
            name=account.name,
            type=account.type,
            currency=account.currency,
            current_balance=account.current_balance,
            is_active=account.is_active,
        ),
        "transactions": transactions,
    }

