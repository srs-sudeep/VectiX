"""Group Expense endpoints for Splitwise functionality."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.app.api import get_current_user
from src.app.models import User
from src.app.services import GroupExpenseService, GroupService
from src.app.schemas import (
    GroupExpense,
    GroupExpenseCreate,
    GroupExpenseUpdate,
    GroupExpenseWithSplits,
)

router = APIRouter()


@router.get("/group/{group_id}")
async def get_group_expenses(
    group_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all expenses for a group."""
    service = GroupExpenseService(db)
    expenses = await service.get_by_group(group_id, current_user.id, limit, offset)
    
    # Get expense details with splits
    result = []
    for expense in expenses:
        detail = await service.get_expense_with_splits(expense.id, current_user.id)
        if detail:
            result.append(detail)
    
    return result


@router.get("/{expense_id}")
async def get_expense(
    expense_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific expense with splits."""
    service = GroupExpenseService(db)
    expense = await service.get_expense_with_splits(expense_id, current_user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.post("/", response_model=GroupExpense)
async def create_expense(
    data: GroupExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new group expense."""
    service = GroupExpenseService(db)
    expense = await service.create_expense(current_user.id, data)
    if not expense:
        raise HTTPException(status_code=404, detail="Group not found or not authorized")
    return expense


@router.put("/{expense_id}", response_model=GroupExpense)
async def update_expense(
    expense_id: str,
    data: GroupExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an expense (only payer can update)."""
    service = GroupExpenseService(db)
    expense = await service.update_expense(expense_id, current_user.id, data)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found or not authorized")
    return expense


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an expense (only payer can delete)."""
    service = GroupExpenseService(db)
    success = await service.delete_expense(expense_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found or not authorized")
    return {"message": "Expense deleted successfully"}

