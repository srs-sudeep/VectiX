/**
 * Subscription Types - Personal Finance
 */

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

