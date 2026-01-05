/**
 * Subscriptions API - Personal Finance
 */

import { apiClient } from '@/core';
import { CORE_URL } from '@/core/moduleApi';
import type { Subscription, SubscriptionCreate, SubscriptionUpdate, UpcomingSubscription } from '@/types/vectix';

const VECTIX_URL = `${CORE_URL}/vectix`;

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

