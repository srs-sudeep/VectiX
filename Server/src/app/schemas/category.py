"""Category schemas for Personal Finance."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    """Base Category schema."""
    name: str = Field(..., min_length=1, description="Category name (e.g., Food, Travel)")
    type: str = Field(..., description="Category type: income | expense")
    icon: Optional[str] = Field(None, description="Icon identifier")
    color: Optional[str] = Field(None, description="Hex color code")


class CategoryCreate(CategoryBase):
    """Category creation schema."""
    pass


class CategoryUpdate(BaseModel):
    """Category update schema."""
    name: Optional[str] = None
    type: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryInDB(CategoryBase):
    """Category in DB schema."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Category(CategoryInDB):
    """Category response schema."""
    pass


class CategoryWithStats(Category):
    """Category with usage statistics."""
    transaction_count: int = 0
    total_amount: float = 0.0

