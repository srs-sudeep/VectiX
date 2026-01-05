/**
 * Attachment Hooks - Personal Finance
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsApi } from '@/api/vectix';
import type { AttachmentCreate } from '@/types/vectix';

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

