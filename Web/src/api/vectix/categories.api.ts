/**
 * Categories API - Personal Finance
 */

import { apiClient } from '@/core';
import { CORE_URL } from '@/core/moduleApi';
import type { Category, CategoryCreate, CategoryUpdate, CategoryWithStats } from '@/types/vectix';

const VECTIX_URL = `${CORE_URL}/vectix`;

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

