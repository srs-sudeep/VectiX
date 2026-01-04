/**
 * Vectix API - Personal Finance & Splitwise
 */

import { apiClient } from '@/core';
import { CORE_URL } from '@/core/moduleApi';
import type {
    Account,
    AccountCreate,
    AccountSummary,
    AccountUpdate,
    AnalyticsData,
    Attachment,
    AttachmentCreate,
    AttachmentUpdate,
    Category,
    CategoryBreakdown,
    CategoryCreate,
    CategoryUpdate,
    CategoryWithStats,
    DashboardSummary,
    Group,
    GroupCreate,
    GroupDetail,
    GroupExpense,
    GroupExpenseCreate,
    GroupExpenseUpdate,
    GroupExpenseWithSplits,
    GroupMember,
    GroupSummary,
    GroupUpdate,
    MonthlyBreakdown,
    MonthlySummary,
    OnboardingData,
    QuickStats,
    Settlement,
    SettlementCreate,
    SettlementSuggestion,
    SettlementUpdate,
    SettlementWithUsers,
    Subscription,
    SubscriptionCreate,
    SubscriptionUpdate,
    Transaction,
    TransactionCreate,
    TransactionFilter,
    TransactionUpdate,
    UpcomingSubscription,
} from '@/types/vectix';

const VECTIX_URL = `${CORE_URL}/vectix`;

// ==================== Accounts API ====================

export const accountsApi = {
  getAll: async (params?: { is_active?: boolean; account_type?: string }): Promise<Account[]> => {
    const { data } = await apiClient.get<Account[]>(`${VECTIX_URL}/accounts`, { params });
    return data;
  },

  getSummary: async (): Promise<{ total_balance: number; account_count: number; accounts: AccountSummary[] }> => {
    const { data } = await apiClient.get(`${VECTIX_URL}/accounts/summary`);
    return data;
  },

  getById: async (id: string): Promise<Account> => {
    const { data } = await apiClient.get<Account>(`${VECTIX_URL}/accounts/${id}`);
    return data;
  },

  create: async (payload: AccountCreate): Promise<Account> => {
    const { data } = await apiClient.post<Account>(`${VECTIX_URL}/accounts`, payload);
    return data;
  },

  update: async (id: string, payload: AccountUpdate): Promise<Account> => {
    const { data } = await apiClient.put<Account>(`${VECTIX_URL}/accounts/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${VECTIX_URL}/accounts/${id}`);
  },

  getTransactions: async (accountId: string, limit?: number): Promise<{ account: AccountSummary; transactions: Transaction[] }> => {
    const { data } = await apiClient.get(`${VECTIX_URL}/accounts/${accountId}/transactions`, {
      params: { limit },
    });
    return data;
  },
};

// ==================== Transactions API ====================

export const transactionsApi = {
  getAll: async (params?: TransactionFilter & { limit?: number; offset?: number }): Promise<{ total_count: number; transactions: Transaction[] }> => {
    const { data } = await apiClient.get(`${VECTIX_URL}/transactions`, { params });
    return data;
  },

  getSummary: async (params?: { start_date?: string; end_date?: string }): Promise<{ income: number; expense: number; net: number }> => {
    const { data } = await apiClient.get(`${VECTIX_URL}/transactions/summary`, { params });
    return data;
  },

  getCategoryBreakdown: async (params?: { type?: string; start_date?: string; end_date?: string }): Promise<CategoryBreakdown[]> => {
    const { data } = await apiClient.get(`${VECTIX_URL}/transactions/category-breakdown`, { params });
    return data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.get<Transaction>(`${VECTIX_URL}/transactions/${id}`);
    return data;
  },

  create: async (payload: TransactionCreate): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>(`${VECTIX_URL}/transactions`, payload);
    return data;
  },

  update: async (id: string, payload: TransactionUpdate): Promise<Transaction> => {
    const { data } = await apiClient.put<Transaction>(`${VECTIX_URL}/transactions/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${VECTIX_URL}/transactions/${id}`);
  },
};

// ==================== Categories API ====================

export const categoriesApi = {
  getAll: async (type?: string): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>(`${VECTIX_URL}/categories`, {
      params: type ? { type } : undefined,
    });
    return data;
  },

  getWithStats: async (): Promise<CategoryWithStats[]> => {
    const { data } = await apiClient.get<CategoryWithStats[]>(`${VECTIX_URL}/categories/with-stats`);
    return data;
  },

  getById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<Category>(`${VECTIX_URL}/categories/${id}`);
    return data;
  },

  create: async (payload: CategoryCreate): Promise<Category> => {
    const { data } = await apiClient.post<Category>(`${VECTIX_URL}/categories`, payload);
    return data;
  },

  createDefaults: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.post(`${VECTIX_URL}/categories/defaults`);
    return data;
  },

  update: async (id: string, payload: CategoryUpdate): Promise<Category> => {
    const { data } = await apiClient.put<Category>(`${VECTIX_URL}/categories/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${VECTIX_URL}/categories/${id}`);
  },
};

// ==================== Subscriptions API ====================

export const subscriptionsApi = {
  getAll: async (is_active?: boolean): Promise<Subscription[]> => {
    const { data } = await apiClient.get<Subscription[]>(`${VECTIX_URL}/subscriptions`, {
      params: is_active !== undefined ? { is_active } : undefined,
    });
    return data;
  },

  getUpcoming: async (days?: number): Promise<UpcomingSubscription[]> => {
    const { data } = await apiClient.get<UpcomingSubscription[]>(`${VECTIX_URL}/subscriptions/upcoming`, {
      params: { days },
    });
    return data;
  },

  getById: async (id: string): Promise<Subscription> => {
    const { data } = await apiClient.get<Subscription>(`${VECTIX_URL}/subscriptions/${id}`);
    return data;
  },

  create: async (payload: SubscriptionCreate): Promise<Subscription> => {
    const { data } = await apiClient.post<Subscription>(`${VECTIX_URL}/subscriptions`, payload);
    return data;
  },

  update: async (id: string, payload: SubscriptionUpdate): Promise<Subscription> => {
    const { data } = await apiClient.put<Subscription>(`${VECTIX_URL}/subscriptions/${id}`, payload);
    return data;
  },

  markPaid: async (id: string): Promise<Subscription> => {
    const { data } = await apiClient.post<Subscription>(`${VECTIX_URL}/subscriptions/${id}/paid`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${VECTIX_URL}/subscriptions/${id}`);
  },
};

// ==================== Attachments API ====================

export const attachmentsApi = {
  getAll: async (params?: { type?: string; linked_only?: boolean }): Promise<Attachment[]> => {
    const { data } = await apiClient.get<Attachment[]>(`${VECTIX_URL}/attachments`, { params });
    return data;
  },

  getUnlinked: async (): Promise<Attachment[]> => {
    const { data } = await apiClient.get<Attachment[]>(`${VECTIX_URL}/attachments/unlinked`);
    return data;
  },

  getById: async (id: string): Promise<Attachment> => {
    const { data } = await apiClient.get<Attachment>(`${VECTIX_URL}/attachments/${id}`);
    return data;
  },

  create: async (payload: AttachmentCreate): Promise<Attachment> => {
    const { data } = await apiClient.post<Attachment>(`${VECTIX_URL}/attachments`, payload);
    return data;
  },

  update: async (id: string, payload: AttachmentUpdate): Promise<Attachment> => {
    const { data } = await apiClient.put<Attachment>(`${VECTIX_URL}/attachments/${id}`, payload);
    return data;
  },

  linkToTransaction: async (attachmentId: string, transactionId: string): Promise<Attachment> => {
    const { data } = await apiClient.post<Attachment>(`${VECTIX_URL}/attachments/${attachmentId}/link/${transactionId}`);
    return data;
  },

  unlink: async (id: string): Promise<Attachment> => {
    const { data } = await apiClient.post<Attachment>(`${VECTIX_URL}/attachments/${id}/unlink`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${VECTIX_URL}/attachments/${id}`);
  },
};

// ==================== Groups API ====================

export const groupsApi = {
  getAll: async (): Promise<GroupSummary[]> => {
    const { data } = await apiClient.get<GroupSummary[]>(`${VECTIX_URL}/groups`);
    return data;
  },

  getById: async (id: string): Promise<GroupDetail> => {
    const { data } = await apiClient.get<GroupDetail>(`${VECTIX_URL}/groups/${id}`);
    return data;
  },

  create: async (payload: GroupCreate): Promise<Group> => {
    const { data } = await apiClient.post<Group>(`${VECTIX_URL}/groups`, payload);
    return data;
  },

  update: async (id: string, payload: GroupUpdate): Promise<Group> => {
    const { data } = await apiClient.put<Group>(`${VECTIX_URL}/groups/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${VECTIX_URL}/groups/${id}`);
  },

  getMembers: async (groupId: string): Promise<GroupMember[]> => {
    const { data } = await apiClient.get<GroupMember[]>(`${VECTIX_URL}/groups/${groupId}/members`);
    return data;
  },

  addMember: async (groupId: string, userId: string): Promise<void> => {
    await apiClient.post(`${VECTIX_URL}/groups/${groupId}/members/${userId}`);
  },

  removeMember: async (groupId: string, userId: string): Promise<void> => {
    await apiClient.delete(`${VECTIX_URL}/groups/${groupId}/members/${userId}`);
  },

  getBalances: async (groupId: string): Promise<{ your_balance: number; all_balances: Array<{ user_id: string; user_name: string; balance: number }> }> => {
    const { data } = await apiClient.get(`${VECTIX_URL}/groups/${groupId}/balances`);
    return data;
  },
};

// ==================== Group Expenses API ====================

export const groupExpensesApi = {
  getByGroup: async (groupId: string, params?: { limit?: number; offset?: number }): Promise<GroupExpenseWithSplits[]> => {
    const { data } = await apiClient.get<GroupExpenseWithSplits[]>(`${VECTIX_URL}/expenses/group/${groupId}`, { params });
    return data;
  },

  getById: async (id: string): Promise<GroupExpenseWithSplits> => {
    const { data } = await apiClient.get<GroupExpenseWithSplits>(`${VECTIX_URL}/expenses/${id}`);
    return data;
  },

  create: async (payload: GroupExpenseCreate): Promise<GroupExpense> => {
    const { data } = await apiClient.post<GroupExpense>(`${VECTIX_URL}/expenses`, payload);
    return data;
  },

  update: async (id: string, payload: GroupExpenseUpdate): Promise<GroupExpense> => {
    const { data } = await apiClient.put<GroupExpense>(`${VECTIX_URL}/expenses/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${VECTIX_URL}/expenses/${id}`);
  },
};

// ==================== Settlements API ====================

export const settlementsApi = {
  getByGroup: async (groupId: string, params?: { limit?: number; offset?: number }): Promise<SettlementWithUsers[]> => {
    const { data } = await apiClient.get<SettlementWithUsers[]>(`${VECTIX_URL}/settlements/group/${groupId}`, { params });
    return data;
  },

  getSuggestions: async (groupId: string): Promise<SettlementSuggestion[]> => {
    const { data } = await apiClient.get<SettlementSuggestion[]>(`${VECTIX_URL}/settlements/group/${groupId}/suggestions`);
    return data;
  },

  getMy: async (limit?: number): Promise<SettlementWithUsers[]> => {
    const { data } = await apiClient.get<SettlementWithUsers[]>(`${VECTIX_URL}/settlements/my`, {
      params: { limit },
    });
    return data;
  },

  getById: async (id: string): Promise<Settlement> => {
    const { data } = await apiClient.get<Settlement>(`${VECTIX_URL}/settlements/${id}`);
    return data;
  },

  create: async (payload: SettlementCreate): Promise<Settlement> => {
    const { data } = await apiClient.post<Settlement>(`${VECTIX_URL}/settlements`, payload);
    return data;
  },

  update: async (id: string, payload: SettlementUpdate): Promise<Settlement> => {
    const { data } = await apiClient.put<Settlement>(`${VECTIX_URL}/settlements/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${VECTIX_URL}/settlements/${id}`);
  },
};

// ==================== Dashboard API ====================

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

