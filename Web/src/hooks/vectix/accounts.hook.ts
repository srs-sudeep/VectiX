/**
 * Account Hooks - Personal Finance
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/api/vectix';
import type { AccountCreate, AccountUpdate } from '@/types/vectix';

export function useAccounts(params?: { is_active?: boolean; account_type?: string }) {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => accountsApi.getAll(params),
  });
}

export function useAccountsSummary() {
  return useQuery({
    queryKey: ['accounts', 'summary'],
    queryFn: accountsApi.getSummary,
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountsApi.getById(id),
    enabled: !!id,
  });
}

export function useAccountTransactions(accountId: string, limit?: number) {
  return useQuery({
    queryKey: ['accounts', accountId, 'transactions', limit],
    queryFn: () => accountsApi.getTransactions(accountId, limit),
    enabled: !!accountId,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AccountCreate) => accountsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AccountUpdate }) =>
      accountsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

