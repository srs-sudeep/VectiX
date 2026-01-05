/**
 * Dashboard Hooks - Analytics & Summaries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/api/vectix';
import type { OnboardingData } from '@/types/vectix';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.getSummary,
  });
}

export function useMonthlyBreakdown(months?: number) {
  return useQuery({
    queryKey: ['dashboard', 'monthly-breakdown', months],
    queryFn: () => dashboardApi.getMonthlyBreakdown(months),
  });
}

export function useCategoryBreakdown(params?: { type?: string; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['dashboard', 'category-breakdown', params],
    queryFn: () => dashboardApi.getCategoryBreakdown(params),
  });
}

export function useMonthlySummary(year: number, month: number) {
  return useQuery({
    queryKey: ['dashboard', 'monthly-summary', year, month],
    queryFn: () => dashboardApi.getMonthlySummary(year, month),
    enabled: !!year && !!month,
  });
}

export function useAnalytics(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['dashboard', 'analytics', params],
    queryFn: () => dashboardApi.getAnalytics(params),
  });
}

export function useQuickStats() {
  return useQuery({
    queryKey: ['dashboard', 'quick-stats'],
    queryFn: dashboardApi.getQuickStats,
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OnboardingData) => dashboardApi.completeOnboarding(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

