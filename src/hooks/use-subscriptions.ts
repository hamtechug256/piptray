'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Subscription } from '@/lib/supabase/types';

interface SubscriptionsFilters {
  status?: 'active' | 'expired' | 'cancelled';
  providerId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

interface SubscriptionsResponse {
  subscriptions: (Subscription & { provider?: { displayName: string; avatar: string | null } })[];
  total: number;
}

interface SubscriptionCreateData {
  providerId: string;
  plan: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  paymentMethod: string;
}

export function useSubscriptions(filters?: SubscriptionsFilters) {
  const queryClient = useQueryClient();

  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.providerId) params.append('providerId', filters.providerId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    return params.toString();
  };

  // Get subscriptions
  const { data, isLoading, error, refetch } = useQuery<SubscriptionsResponse>({
    queryKey: ['subscriptions', filters],
    queryFn: async () => {
      const queryString = buildQueryString();
      const res = await fetch(`/api/subscriptions${queryString ? `?${queryString}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      return res.json();
    },
  });

  // Get single subscription
  const useSubscription = (id: string) => {
    return useQuery<Subscription>({
      queryKey: ['subscriptions', id],
      queryFn: async () => {
        const res = await fetch(`/api/subscriptions/${id}`);
        if (!res.ok) throw new Error('Failed to fetch subscription');
        return res.json();
      },
      enabled: !!id,
    });
  };

  // Create subscription (subscribe to provider)
  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscriptionCreateData): Promise<Subscription> => {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create subscription');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });

  // Cancel subscription
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/subscriptions/${id}/cancel`, {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  // Get active subscriptions for current user
  const { data: activeSubscriptions, isLoading: isLoadingActive } = useQuery<SubscriptionsResponse>({
    queryKey: ['subscriptions', 'active'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions?status=active');
      if (!res.ok) throw new Error('Failed to fetch active subscriptions');
      return res.json();
    },
  });

  // Check if subscribed to a provider
  const checkSubscription = (providerId: string) => {
    return activeSubscriptions?.subscriptions.some(
      (sub) => sub.providerId === providerId && sub.status === 'active'
    ) ?? false;
  };

  return {
    subscriptions: data?.subscriptions ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
    useSubscription,
    subscribe: subscribeMutation.mutate,
    cancelSubscription: cancelMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    isCancelling: cancelMutation.isPending,
    subscribeError: subscribeMutation.error,
    cancelError: cancelMutation.error,
    activeSubscriptions: activeSubscriptions?.subscriptions ?? [],
    isLoadingActive,
    checkSubscription,
  };
}
