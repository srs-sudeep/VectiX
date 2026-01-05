/**
 * Group Expense Hooks - Splitwise
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupExpensesApi } from '@/api/vectix';
import type { GroupExpenseCreate, GroupExpenseUpdate } from '@/types/vectix';

export function useGroupExpenses(groupId: string, params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['group-expenses', groupId, params],
    queryFn: () => groupExpensesApi.getByGroup(groupId, params),
    enabled: !!groupId,
  });
}

export function useGroupExpense(id: string) {
  return useQuery({
    queryKey: ['group-expenses', id],
    queryFn: () => groupExpensesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateGroupExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GroupExpenseCreate) => groupExpensesApi.create(payload),
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses', group_id] });
      queryClient.invalidateQueries({ queryKey: ['groups', group_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateGroupExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GroupExpenseUpdate }) =>
      groupExpensesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useDeleteGroupExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupExpensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

