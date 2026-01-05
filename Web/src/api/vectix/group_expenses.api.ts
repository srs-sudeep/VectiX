/**
 * Group Expenses API - Splitwise
 */

import { apiClient } from '@/core';
import { CORE_URL } from '@/core/moduleApi';
import type {
  GroupExpense,
  GroupExpenseCreate,
  GroupExpenseUpdate,
  GroupExpenseWithSplits,
} from '@/types/vectix';

const VECTIX_URL = `${CORE_URL}/vectix`;

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

