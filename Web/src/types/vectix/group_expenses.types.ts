/**
 * Group Expense Types - Splitwise
 */

export interface ExpenseSplitInput {
  user_id: string;
  share_amount?: number;
  share_percentage?: number;
}

export interface GroupExpense {
  id: string;
  group_id: string;
  paid_by: string;
  title: string;
  amount: number;
  currency: string;
  split_type: 'equal' | 'unequal' | 'percentage';
  created_at: string;
  updated_at: string;
}

export interface GroupExpenseCreate {
  group_id: string;
  title: string;
  amount: number;
  currency?: string;
  split_type?: 'equal' | 'unequal' | 'percentage';
  paid_by?: string;
  splits?: ExpenseSplitInput[];
}

export interface GroupExpenseUpdate {
  title?: string;
  amount?: number;
  split_type?: string;
  splits?: ExpenseSplitInput[];
}

export interface ExpenseSplit {
  id: string;
  user_id: string;
  user_name?: string;
  share_amount: number;
  share_percentage?: number;
}

export interface GroupExpenseWithSplits extends GroupExpense {
  payer_name?: string;
  splits: ExpenseSplit[];
}

