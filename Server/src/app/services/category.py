"""Category service for Personal Finance."""

import uuid
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.models import Category, Transaction
from src.app.schemas import CategoryCreate, CategoryUpdate
from src.app.services.base import BaseService


class CategoryService(BaseService[Category]):
    """Category service."""

    def __init__(self, db: AsyncSession):
        super().__init__(db, Category)

    async def get_by_id(self, category_id: str, user_id: str) -> Optional[Category]:
        """Get category by ID for a specific user."""
        query = select(Category).where(
            Category.id == category_id,
            Category.user_id == user_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all_by_user(
        self,
        user_id: str,
        category_type: Optional[str] = None
    ) -> List[Category]:
        """Get all categories for a user."""
        query = select(Category).where(Category.user_id == user_id)
        
        if category_type:
            query = query.where(Category.type == category_type)
        
        query = query.order_by(Category.name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_category(self, user_id: str, data: CategoryCreate) -> Category:
        """Create a new category."""
        category = Category(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=data.name,
            type=data.type,
            icon=data.icon,
            color=data.color,
        )
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update_category(
        self, category_id: str, user_id: str, data: CategoryUpdate
    ) -> Optional[Category]:
        """Update a category."""
        category = await self.get_by_id(category_id, user_id)
        if not category:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(category, key, value)
        
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete_category(self, category_id: str, user_id: str) -> bool:
        """Delete a category."""
        category = await self.get_by_id(category_id, user_id)
        if not category:
            return False
        
        await self.db.delete(category)
        await self.db.commit()
        return True

    async def get_with_stats(self, user_id: str) -> List[dict]:
        """Get all categories with transaction statistics."""
        query = (
            select(
                Category,
                func.count(Transaction.id).label("transaction_count"),
                func.coalesce(func.sum(Transaction.amount), 0).label("total_amount")
            )
            .outerjoin(Transaction, Category.id == Transaction.category_id)
            .where(Category.user_id == user_id)
            .group_by(Category.id)
            .order_by(Category.name)
        )
        
        result = await self.db.execute(query)
        rows = result.all()
        
        return [
            {
                "id": row.Category.id,
                "name": row.Category.name,
                "type": row.Category.type,
                "icon": row.Category.icon,
                "color": row.Category.color,
                "created_at": row.Category.created_at,
                "updated_at": row.Category.updated_at,
                "transaction_count": row.transaction_count,
                "total_amount": float(row.total_amount)
            }
            for row in rows
        ]

    async def create_default_categories(self, user_id: str) -> List[Category]:
        """Create default categories for a new user."""
        default_categories = [
            # Expense categories
            {"name": "Food & Dining", "type": "expense", "icon": "Utensils", "color": "#FF6B6B"},
            {"name": "Transportation", "type": "expense", "icon": "Car", "color": "#4ECDC4"},
            {"name": "Shopping", "type": "expense", "icon": "ShoppingBag", "color": "#45B7D1"},
            {"name": "Entertainment", "type": "expense", "icon": "Film", "color": "#96CEB4"},
            {"name": "Bills & Utilities", "type": "expense", "icon": "Receipt", "color": "#FFEAA7"},
            {"name": "Healthcare", "type": "expense", "icon": "Heart", "color": "#DDA0DD"},
            {"name": "Education", "type": "expense", "icon": "GraduationCap", "color": "#98D8C8"},
            {"name": "Travel", "type": "expense", "icon": "Plane", "color": "#F7DC6F"},
            {"name": "Other Expense", "type": "expense", "icon": "MoreHorizontal", "color": "#BDC3C7"},
            # Income categories
            {"name": "Salary", "type": "income", "icon": "Briefcase", "color": "#2ECC71"},
            {"name": "Freelance", "type": "income", "icon": "Laptop", "color": "#3498DB"},
            {"name": "Investment", "type": "income", "icon": "TrendingUp", "color": "#9B59B6"},
            {"name": "Gift", "type": "income", "icon": "Gift", "color": "#E74C3C"},
            {"name": "Other Income", "type": "income", "icon": "MoreHorizontal", "color": "#1ABC9C"},
        ]
        
        categories = []
        for cat_data in default_categories:
            category = Category(
                id=str(uuid.uuid4()),
                user_id=user_id,
                name=cat_data["name"],
                type=cat_data["type"],
                icon=cat_data["icon"],
                color=cat_data["color"],
            )
            self.db.add(category)
            categories.append(category)
        
        await self.db.commit()
        return categories

