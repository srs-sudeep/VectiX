"""Category endpoints for Personal Finance."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.db import get_db
from src.app.api import get_current_user
from src.app.models import User
from src.app.services import CategoryService
from src.app.schemas import (
    Category,
    CategoryCreate,
    CategoryUpdate,
    CategoryWithStats,
)

router = APIRouter()


@router.get("/", response_model=List[Category])
async def get_categories(
    type: Optional[str] = Query(None, description="Filter by type: income | expense"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all categories for the current user."""
    service = CategoryService(db)
    return await service.get_all_by_user(current_user.id, category_type=type)


@router.get("/with-stats")
async def get_categories_with_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all categories with usage statistics."""
    service = CategoryService(db)
    return await service.get_with_stats(current_user.id)


@router.get("/{category_id}", response_model=Category)
async def get_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific category."""
    service = CategoryService(db)
    category = await service.get_by_id(category_id, current_user.id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=Category)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new category."""
    service = CategoryService(db)
    return await service.create_category(current_user.id, data)


@router.post("/defaults")
async def create_default_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create default categories for the user."""
    service = CategoryService(db)
    categories = await service.create_default_categories(current_user.id)
    return {"message": f"Created {len(categories)} default categories"}


@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a category."""
    service = CategoryService(db)
    category = await service.update_category(category_id, current_user.id, data)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a category."""
    service = CategoryService(db)
    success = await service.delete_category(category_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

