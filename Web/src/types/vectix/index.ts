/**
 * Vectix Types - Personal Finance & Splitwise
 */

// ==================== Personal Finance Types ====================

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'bank' | 'cash' | 'wallet' | 'credit';
  currency: string;
  opening_balance: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountCreate {
  name: string;
  type: 'bank' | 'cash' | 'wallet' | 'credit';
  currency?: string;
  opening_balance?: number;
  is_active?: boolean;
}

export interface AccountUpdate {
  name?: string;
  type?: string;
  currency?: string;
  is_active?: boolean;
}

export interface AccountSummary {
  id: string;
  name: string;
  type: string;
  currency: string;
  current_balance: number;
  is_active: boolean;
}

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

export interface Subscription {
  id: string;
  user_id: string;
  account_id: string;
  name: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  next_due_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionCreate {
  account_id: string;
  name: string;
  amount: number;
  currency?: string;
  interval: 'monthly' | 'yearly';
  next_due_date: string;
  is_active?: boolean;
}

export interface SubscriptionUpdate {
  name?: string;
  amount?: number;
  currency?: string;
  interval?: string;
  next_due_date?: string;
  account_id?: string;
  is_active?: boolean;
}

export interface UpcomingSubscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  next_due_date: string;
  days_until_due: number;
}

export interface Attachment {
  id: string;
  user_id: string;
  file_url: string;
  type: 'bill' | 'receipt';
  extracted_text?: string;
  linked_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AttachmentCreate {
  file_url: string;
  type: 'bill' | 'receipt';
  extracted_text?: string;
  linked_transaction_id?: string;
}

export interface AttachmentUpdate {
  type?: string;
  extracted_text?: string;
  linked_transaction_id?: string;
}

// ==================== Splitwise Types ====================

export interface Group {
  id: string;
  name: string;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupCreate {
  name: string;
  currency?: string;
  member_ids?: string[];
}

export interface GroupUpdate {
  name?: string;
  currency?: string;
}

export interface GroupMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user_name?: string;
  user_email?: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  currency: string;
  member_count: number;
  total_expenses: number;
  your_balance: number;
  created_at: string;
}

export interface GroupBalance {
  user_id: string;
  user_name: string;
  balance: number;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
  member_count: number;
  balances: GroupBalance[];
  total_expenses: number;
}

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

export interface Settlement {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: string;
  method?: 'cash' | 'upi' | 'bank';
  settled_at: string;
  created_at: string;
  updated_at: string;
}

export interface SettlementCreate {
  group_id: string;
  to_user_id: string;
  amount: number;
  currency?: string;
  method?: 'cash' | 'upi' | 'bank';
}

export interface SettlementUpdate {
  amount?: number;
  method?: string;
}

export interface SettlementWithUsers extends Settlement {
  from_user_name?: string;
  to_user_name?: string;
  group_name?: string;
  is_payer?: boolean;
}

export interface SettlementSuggestion {
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  amount: number;
}

// ==================== Dashboard Types ====================

export interface DashboardSummary {
  net_balance: number;
  total_income: number;
  total_expense: number;
  pending_group_dues: number;
  account_count: number;
  group_count: number;
}

export interface MonthlyBreakdown {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category_id: string;
  category_name: string;
  category_icon?: string;
  category_color?: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface AnalyticsData {
  monthly_breakdown: MonthlyBreakdown[];
  category_breakdown: CategoryBreakdown[];
  personal_total: number;
  group_total: number;
}

export interface MonthlySummary {
  month: string;
  total_income: number;
  total_expense: number;
  group_dues: number;
  net_savings: number;
  top_categories: CategoryBreakdown[];
}

export interface OnboardingData {
  default_currency: string;
  timezone: string;
  country: string;
  first_account_name: string;
  first_account_type: 'bank' | 'cash' | 'wallet' | 'credit';
  first_account_balance: number;
}

export interface QuickStats extends DashboardSummary {
  upcoming_subscriptions: UpcomingSubscription[];
  upcoming_subscription_count: number;
}

