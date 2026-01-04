"""Settlement endpoints for Splitwise functionality."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.app.api import get_current_user
from src.app.models import User
from src.app.services import SettlementService, GroupService
from src.app.schemas import (
    Settlement,
    SettlementCreate,
    SettlementUpdate,
    SettlementWithUsers,
    SettlementSuggestion,
)

router = APIRouter()


@router.get("/group/{group_id}")
async def get_group_settlements(
    group_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all settlements for a group."""
    service = SettlementService(db)
    settlements = await service.get_by_group(group_id, current_user.id, limit, offset)
    
    return [
        {
            "id": s.id,
            "group_id": s.group_id,
            "from_user_id": s.from_user_id,
            "from_user_name": s.from_user.name if s.from_user else None,
            "to_user_id": s.to_user_id,
            "to_user_name": s.to_user.name if s.to_user else None,
            "amount": s.amount,
            "currency": s.currency,
            "method": s.method,
            "settled_at": s.settled_at,
        }
        for s in settlements
    ]


@router.get("/group/{group_id}/suggestions")
async def get_settlement_suggestions(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get settlement suggestions to minimize transactions."""
    group_service = GroupService(db)
    
    # Verify user is a member
    if not await group_service.is_member(group_id, current_user.id):
        raise HTTPException(status_code=404, detail="Group not found")
    
    settlement_service = SettlementService(db)
    return await settlement_service.get_settlement_suggestions(group_id, group_service)


@router.get("/my")
async def get_my_settlements(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent settlements involving the current user."""
    service = SettlementService(db)
    settlements = await service.get_user_settlements(current_user.id, limit)
    
    return [
        {
            "id": s.id,
            "group_id": s.group_id,
            "group_name": s.group.name if s.group else None,
            "from_user_id": s.from_user_id,
            "from_user_name": s.from_user.name if s.from_user else None,
            "to_user_id": s.to_user_id,
            "to_user_name": s.to_user.name if s.to_user else None,
            "amount": s.amount,
            "currency": s.currency,
            "method": s.method,
            "settled_at": s.settled_at,
            "is_payer": s.from_user_id == current_user.id,
        }
        for s in settlements
    ]


@router.get("/{settlement_id}", response_model=Settlement)
async def get_settlement(
    settlement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific settlement."""
    service = SettlementService(db)
    settlement = await service.get_by_id(settlement_id, current_user.id)
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
    return settlement


@router.post("/", response_model=Settlement)
async def create_settlement(
    data: SettlementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new settlement (settle up)."""
    service = SettlementService(db)
    settlement = await service.create_settlement(current_user.id, data)
    if not settlement:
        raise HTTPException(status_code=404, detail="Group not found or invalid recipient")
    return settlement


@router.put("/{settlement_id}", response_model=Settlement)
async def update_settlement(
    settlement_id: str,
    data: SettlementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a settlement (only payer can update)."""
    service = SettlementService(db)
    settlement = await service.update_settlement(settlement_id, current_user.id, data)
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found or not authorized")
    return settlement


@router.delete("/{settlement_id}")
async def delete_settlement(
    settlement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a settlement (only payer can delete)."""
    service = SettlementService(db)
    success = await service.delete_settlement(settlement_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Settlement not found or not authorized")
    return {"message": "Settlement deleted successfully"}

