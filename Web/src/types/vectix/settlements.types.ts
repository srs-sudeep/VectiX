/**
 * Settlement Types - Splitwise
 */

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

