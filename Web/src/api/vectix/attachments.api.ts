/**
 * Attachments API - Personal Finance (Bills/Receipts)
 */

import { apiClient } from '@/core';
import { CORE_URL } from '@/core/moduleApi';
import type { Attachment, AttachmentCreate, AttachmentUpdate } from '@/types/vectix';

const VECTIX_URL = `${CORE_URL}/vectix`;

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

