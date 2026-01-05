/**
 * Account Types - Personal Finance
 */

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

