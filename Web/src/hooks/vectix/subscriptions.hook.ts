/**
 * Subscription Hooks - Personal Finance
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/api/vectix';
import type { SubscriptionCreate, SubscriptionUpdate } from '@/types/vectix';

export function useSubscriptions(is_active?: boolean) {
  return useQuery({
    queryKey: ['subscriptions', is_active],
    queryFn: () => subscriptionsApi.getAll(is_active),
  });
}

export function useUpcomingSubscriptions(days?: number) {
  return useQuery({
    queryKey: ['subscriptions', 'upcoming', days],
    queryFn: () => subscriptionsApi.getUpcoming(days),
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => subscriptionsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubscriptionCreate) => subscriptionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubscriptionUpdate }) =>
      subscriptionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useMarkSubscriptionPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

