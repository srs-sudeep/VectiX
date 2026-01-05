/**
 * Settlements API - Splitwise
 */

import { apiClient } from '@/core';
import { CORE_URL } from '@/core/moduleApi';
import type {
  Settlement,
  SettlementCreate,
  SettlementSuggestion,
  SettlementUpdate,
  SettlementWithUsers,
} from '@/types/vectix';

const VECTIX_URL = `${CORE_URL}/vectix`;

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

