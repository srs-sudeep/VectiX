/**
 * Dashboard Types - Analytics & Summaries
 */

import type { UpcomingSubscription } from './subscriptions.types';

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

