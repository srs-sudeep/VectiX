/**
 * Accounts API - Personal Finance
 */

import { apiClient } from '@/core';
import { CORE_URL } from '@/core/moduleApi';
import type { Account, AccountCreate, AccountSummary, AccountUpdate, Transaction } from '@/types/vectix';

const VECTIX_URL = `${CORE_URL}/vectix`;

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

