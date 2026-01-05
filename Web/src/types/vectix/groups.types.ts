/**
 * Group Types - Splitwise
 */

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

