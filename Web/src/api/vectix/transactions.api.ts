/**
 * Transactions API - Personal Finance
 */

import { apiClient } from '@/core';
import { CORE_URL } from '@/core/moduleApi';
import type {
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  TransactionFilter,
  CategoryBreakdown,
} from '@/types/vectix';

const VECTIX_URL = `${CORE_URL}/vectix`;

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

