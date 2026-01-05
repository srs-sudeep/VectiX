/**
 * Groups API - Splitwise
 */

import { apiClient } from '@/core';
import { CORE_URL } from '@/core/moduleApi';
import type { Group, GroupCreate, GroupDetail, GroupMember, GroupSummary, GroupUpdate } from '@/types/vectix';

const VECTIX_URL = `${CORE_URL}/vectix`;

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

