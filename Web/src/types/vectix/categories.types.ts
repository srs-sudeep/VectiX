/**
 * Category Types - Personal Finance
 */

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface CategoryUpdate {
  name?: string;
  type?: string;
  icon?: string;
  color?: string;
}

export interface CategoryWithStats extends Category {
  transaction_count: number;
  total_amount: number;
}

