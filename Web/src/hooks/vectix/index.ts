/**
 * Vectix Hooks - Personal Finance & Splitwise
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  accountsApi,
  transactionsApi,
  categoriesApi,
  subscriptionsApi,
  attachmentsApi,
  groupsApi,
  groupExpensesApi,
  settlementsApi,
  dashboardApi,
} from '@/api/vectix';
import type {
  AccountCreate,
  AccountUpdate,
  TransactionCreate,
  TransactionUpdate,
  TransactionFilter,
  CategoryCreate,
  CategoryUpdate,
  SubscriptionCreate,
  SubscriptionUpdate,
  AttachmentCreate,
  AttachmentUpdate,
  GroupCreate,
  GroupUpdate,
  GroupExpenseCreate,
  GroupExpenseUpdate,
  SettlementCreate,
  SettlementUpdate,
  OnboardingData,
} from '@/types/vectix';

// ==================== Account Hooks ====================

export function useAccounts(params?: { is_active?: boolean; account_type?: string }) {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => accountsApi.getAll(params),
  });
}

export function useAccountsSummary() {
  return useQuery({
    queryKey: ['accounts', 'summary'],
    queryFn: accountsApi.getSummary,
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountsApi.getById(id),
    enabled: !!id,
  });
}

export function useAccountTransactions(accountId: string, limit?: number) {
  return useQuery({
    queryKey: ['accounts', accountId, 'transactions', limit],
    queryFn: () => accountsApi.getTransactions(accountId, limit),
    enabled: !!accountId,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AccountCreate) => accountsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AccountUpdate }) =>
      accountsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ==================== Transaction Hooks ====================

export function useTransactions(params?: TransactionFilter & { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionsApi.getAll(params),
  });
}

export function useTransactionSummary(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['transactions', 'summary', params],
    queryFn: () => transactionsApi.getSummary(params),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransactionCreate) => transactionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TransactionUpdate }) =>
      transactionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ==================== Category Hooks ====================

export function useCategories(type?: string) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoriesApi.getAll(type),
  });
}

export function useCategoriesWithStats() {
  return useQuery({
    queryKey: ['categories', 'with-stats'],
    queryFn: categoriesApi.getWithStats,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryCreate) => categoriesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useCreateDefaultCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.createDefaults,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryUpdate }) =>
      categoriesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ==================== Subscription Hooks ====================

export function useSubscriptions(is_active?: boolean) {
  return useQuery({
    queryKey: ['subscriptions', is_active],
    queryFn: () => subscriptionsApi.getAll(is_active),
  });
}

export function useUpcomingSubscriptions(days?: number) {
  return useQuery({
    queryKey: ['subscriptions', 'upcoming', days],
    queryFn: () => subscriptionsApi.getUpcoming(days),
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => subscriptionsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubscriptionCreate) => subscriptionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubscriptionUpdate }) =>
      subscriptionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useMarkSubscriptionPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

// ==================== Attachment Hooks ====================

export function useAttachments(params?: { type?: string; linked_only?: boolean }) {
  return useQuery({
    queryKey: ['attachments', params],
    queryFn: () => attachmentsApi.getAll(params),
  });
}

export function useUnlinkedAttachments() {
  return useQuery({
    queryKey: ['attachments', 'unlinked'],
    queryFn: attachmentsApi.getUnlinked,
  });
}

export function useCreateAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AttachmentCreate) => attachmentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}

export function useLinkAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attachmentId, transactionId }: { attachmentId: string; transactionId: string }) =>
      attachmentsApi.linkToTransaction(attachmentId, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attachmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}

// ==================== Group Hooks ====================

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsApi.getById(id),
    enabled: !!id,
  });
}

export function useGroupBalances(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'balances'],
    queryFn: () => groupsApi.getBalances(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GroupCreate) => groupsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GroupUpdate }) =>
      groupsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      groupsApi.addMember(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      groupsApi.removeMember(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
    },
  });
}

// ==================== Group Expense Hooks ====================

export function useGroupExpenses(groupId: string, params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['group-expenses', groupId, params],
    queryFn: () => groupExpensesApi.getByGroup(groupId, params),
    enabled: !!groupId,
  });
}

export function useGroupExpense(id: string) {
  return useQuery({
    queryKey: ['group-expenses', id],
    queryFn: () => groupExpensesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateGroupExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GroupExpenseCreate) => groupExpensesApi.create(payload),
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses', group_id] });
      queryClient.invalidateQueries({ queryKey: ['groups', group_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateGroupExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GroupExpenseUpdate }) =>
      groupExpensesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useDeleteGroupExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupExpensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ==================== Settlement Hooks ====================

export function useGroupSettlements(groupId: string, params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['settlements', groupId, params],
    queryFn: () => settlementsApi.getByGroup(groupId, params),
    enabled: !!groupId,
  });
}

export function useSettlementSuggestions(groupId: string) {
  return useQuery({
    queryKey: ['settlements', groupId, 'suggestions'],
    queryFn: () => settlementsApi.getSuggestions(groupId),
    enabled: !!groupId,
  });
}

export function useMySettlements(limit?: number) {
  return useQuery({
    queryKey: ['settlements', 'my', limit],
    queryFn: () => settlementsApi.getMy(limit),
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SettlementCreate) => settlementsApi.create(payload),
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: ['settlements', group_id] });
      queryClient.invalidateQueries({ queryKey: ['groups', group_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settlementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ==================== Dashboard Hooks ====================

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

