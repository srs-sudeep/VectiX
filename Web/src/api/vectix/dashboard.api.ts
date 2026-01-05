/**
 * Dashboard API - Analytics & Summaries
 */

import { apiClient } from '@/core';
import { CORE_URL } from '@/core/moduleApi';
import type {
  AnalyticsData,
  CategoryBreakdown,
  DashboardSummary,
  MonthlyBreakdown,
  MonthlySummary,
  OnboardingData,
  QuickStats,
} from '@/types/vectix';

const VECTIX_URL = `${CORE_URL}/vectix`;

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get<DashboardSummary>(`${VECTIX_URL}/dashboard/summary`);
    return data;
  },

  getMonthlyBreakdown: async (months?: number): Promise<MonthlyBreakdown[]> => {
    const { data } = await apiClient.get<MonthlyBreakdown[]>(`${VECTIX_URL}/dashboard/monthly-breakdown`, {
      params: { months },
    });
    return data;
  },

  getCategoryBreakdown: async (params?: { type?: string; start_date?: string; end_date?: string }): Promise<CategoryBreakdown[]> => {
    const { data } = await apiClient.get<CategoryBreakdown[]>(`${VECTIX_URL}/dashboard/category-breakdown`, { params });
    return data;
  },

  getMonthlySummary: async (year: number, month: number): Promise<MonthlySummary> => {
    const { data } = await apiClient.get<MonthlySummary>(`${VECTIX_URL}/dashboard/monthly-summary`, {
      params: { year, month },
    });
    return data;
  },

  getAnalytics: async (params?: { start_date?: string; end_date?: string }): Promise<AnalyticsData> => {
    const { data } = await apiClient.get<AnalyticsData>(`${VECTIX_URL}/dashboard/analytics`, { params });
    return data;
  },

  completeOnboarding: async (payload: OnboardingData): Promise<{ message: string; categories_created: number; first_account: { id: string; name: string; type: string; balance: number } }> => {
    const { data } = await apiClient.post(`${VECTIX_URL}/dashboard/onboarding`, payload);
    return data;
  },

  getQuickStats: async (): Promise<QuickStats> => {
    const { data } = await apiClient.get<QuickStats>(`${VECTIX_URL}/dashboard/quick-stats`);
    return data;
  },
};

