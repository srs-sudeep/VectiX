/**
 * Settlement Hooks - Splitwise
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementsApi } from '@/api/vectix';
import type { SettlementCreate } from '@/types/vectix';

export function useGroupSettlements(groupId: string, params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['settlements', groupId, params],
    queryFn: () => settlementsApi.getByGroup(groupId, params),
    enabled: !!groupId,
  });
}

export function useSettlementSuggestions(groupId: string) {
  return useQuery({
    queryKey: ['settlements', groupId, 'suggestions'],
    queryFn: () => settlementsApi.getSuggestions(groupId),
    enabled: !!groupId,
  });
}

export function useMySettlements(limit?: number) {
  return useQuery({
    queryKey: ['settlements', 'my', limit],
    queryFn: () => settlementsApi.getMy(limit),
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SettlementCreate) => settlementsApi.create(payload),
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: ['settlements', group_id] });
      queryClient.invalidateQueries({ queryKey: ['groups', group_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settlementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

