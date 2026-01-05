/**
 * Transaction Types - Personal Finance
 */

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  description?: string;
  transaction_date: string;
  category_id?: string;
  related_account_id?: string;
  group_expense_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  account_id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency?: string;
  description?: string;
  transaction_date?: string;
  category_id?: string;
  related_account_id?: string;
}

export interface TransactionUpdate {
  type?: string;
  amount?: number;
  description?: string;
  transaction_date?: string;
  category_id?: string;
  account_id?: string;
}

export interface TransactionWithDetails extends Transaction {
  account_name?: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface TransactionSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  transaction_count: number;
}

export interface TransactionFilter {
  type?: string;
  account_id?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

