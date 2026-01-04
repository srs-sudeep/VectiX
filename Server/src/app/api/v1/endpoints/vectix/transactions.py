"""Transaction endpoints for Personal Finance."""

from datetime import date
from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.app.api import get_current_user
from src.app.models import User
from src.app.services import TransactionService, AccountService
from src.app.schemas import (
    Transaction,
    TransactionCreate,
    TransactionUpdate,
    TransactionFilter,
    TransactionSummary,
)

router = APIRouter()


@router.get("/")
async def get_transactions(
    type: Optional[str] = Query(None, description="Filter by type: income | expense | transfer"),
    account_id: Optional[str] = Query(None, description="Filter by account"),
    category_id: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    search: Optional[str] = Query(None, description="Search in description"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all transactions with filters."""
    filters = TransactionFilter(
        type=type,
        account_id=account_id,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )
    
    service = TransactionService(db)
    transactions, total = await service.get_all_by_user(
        current_user.id, filters, limit, offset
    )
    
    return {
        "total_count": total,
        "transactions": transactions,
    }


@router.get("/summary")
async def get_transaction_summary(
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get transaction summary (income, expense, net)."""
    service = TransactionService(db)
    summary = await service.get_summary(current_user.id, start_date, end_date)
    return summary


@router.get("/category-breakdown")
async def get_category_breakdown(
    type: str = Query("expense", description="Transaction type"),
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get spending breakdown by category."""
    service = TransactionService(db)
    breakdown = await service.get_category_breakdown(
        current_user.id, type, start_date, end_date
    )
    return breakdown


@router.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific transaction."""
    service = TransactionService(db)
    transaction = await service.get_by_id(transaction_id, current_user.id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.post("/", response_model=Transaction)
async def create_transaction(
    data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new transaction."""
    account_service = AccountService(db)
    
    # Verify account ownership
    account = await account_service.get_by_id(data.account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # For transfers, verify target account
    if data.type == "transfer" and data.related_account_id:
        related = await account_service.get_by_id(data.related_account_id, current_user.id)
        if not related:
            raise HTTPException(status_code=404, detail="Target account not found")
    
    service = TransactionService(db)
    return await service.create_transaction(current_user.id, data, account_service)


@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: str,
    data: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a transaction."""
    service = TransactionService(db)
    transaction = await service.update_transaction(transaction_id, current_user.id, data)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a transaction and reverse balance changes."""
    account_service = AccountService(db)
    service = TransactionService(db)
    success = await service.delete_transaction(transaction_id, current_user.id, account_service)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}

