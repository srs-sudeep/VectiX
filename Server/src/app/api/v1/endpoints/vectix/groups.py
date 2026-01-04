"""Group endpoints for Splitwise functionality."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.app.api import get_current_user
from src.app.models import User
from src.app.services import GroupService
from src.app.schemas import (
    Group,
    GroupCreate,
    GroupUpdate,
    GroupWithMembers,
    GroupSummary,
    GroupDetailWithBalances,
)

router = APIRouter()


@router.get("/")
async def get_groups(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all groups for the current user."""
    service = GroupService(db)
    return await service.get_all_by_user(current_user.id)


@router.get("/{group_id}")
async def get_group(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific group with members and balances."""
    service = GroupService(db)
    group = await service.get_by_id(group_id, current_user.id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    members = await service.get_members(group_id)
    balances = await service.get_all_balances(group_id)
    total_expenses = await service.get_total_expenses(group_id)
    
    return {
        "id": group.id,
        "name": group.name,
        "currency": group.currency,
        "created_by": group.created_by,
        "created_at": group.created_at,
        "members": members,
        "member_count": len(members),
        "balances": balances,
        "total_expenses": total_expenses,
    }


@router.post("/", response_model=Group)
async def create_group(
    data: GroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new group."""
    service = GroupService(db)
    return await service.create_group(current_user.id, data)


@router.put("/{group_id}", response_model=Group)
async def update_group(
    group_id: str,
    data: GroupUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a group (admins only)."""
    service = GroupService(db)
    group = await service.update_group(group_id, current_user.id, data)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found or not authorized")
    return group


@router.delete("/{group_id}")
async def delete_group(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a group (creator only)."""
    service = GroupService(db)
    success = await service.delete_group(group_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Group not found or not authorized")
    return {"message": "Group deleted successfully"}


@router.get("/{group_id}/members")
async def get_group_members(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all members of a group."""
    service = GroupService(db)
    
    # Verify user is a member
    if not await service.is_member(group_id, current_user.id):
        raise HTTPException(status_code=404, detail="Group not found")
    
    return await service.get_members(group_id)


@router.post("/{group_id}/members/{user_id}")
async def add_group_member(
    group_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a member to a group (admins only)."""
    service = GroupService(db)
    member = await service.add_member(group_id, user_id, current_user.id)
    if not member:
        raise HTTPException(
            status_code=400,
            detail="Could not add member (not authorized or already a member)"
        )
    return {"message": "Member added successfully"}


@router.delete("/{group_id}/members/{user_id}")
async def remove_group_member(
    group_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a member from a group (admins only)."""
    service = GroupService(db)
    success = await service.remove_member(group_id, user_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Could not remove member (not authorized or cannot remove creator)"
        )
    return {"message": "Member removed successfully"}


@router.get("/{group_id}/balances")
async def get_group_balances(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get balance information for all members in a group."""
    service = GroupService(db)
    
    # Verify user is a member
    if not await service.is_member(group_id, current_user.id):
        raise HTTPException(status_code=404, detail="Group not found")
    
    balances = await service.get_all_balances(group_id)
    user_balance = await service.calculate_user_balance(group_id, current_user.id)
    
    return {
        "your_balance": user_balance,
        "all_balances": balances,
    }

