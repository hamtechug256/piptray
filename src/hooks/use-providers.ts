'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Provider } from '@/lib/supabase/types';

interface ProvidersFilters {
  search?: string;
  tier?: string;
  minWinRate?: number;
  pairs?: string[];
  sortBy?: 'winRate' | 'subscribers' | 'rating' | 'signals';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface ProvidersResponse {
  providers: Provider[];
  total: number;
}

interface ProviderCreateData {
  displayName: string;
  bio?: string;
  pairs: string[];
  timeframes: string[];
  currency: string;
  monthlyPrice: number;
  weeklyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  mtnMomoNumber?: string;
  airtelMoneyNumber?: string;
  binanceWallet?: string;
  ethereumWallet?: string;
}

interface ProviderUpdateData extends Partial<ProviderCreateData> {
  isActive?: boolean;
}

export function useProviders(filters?: ProvidersFilters) {
  const queryClient = useQueryClient();

  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tier) params.append('tier', filters.tier);
    if (filters?.minWinRate) params.append('minWinRate', filters.minWinRate.toString());
    if (filters?.pairs?.length) params.append('pairs', filters.pairs.join(','));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    return params.toString();
  };

  // Get all providers
  const { data, isLoading, error, refetch } = useQuery<ProvidersResponse>({
    queryKey: ['providers', filters],
    queryFn: async () => {
      const queryString = buildQueryString();
      const res = await fetch(`/api/providers${queryString ? `?${queryString}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch providers');
      return res.json();
    },
  });

  // Get single provider
  const useProvider = (id: string) => {
    return useQuery<Provider>({
      queryKey: ['providers', id],
      queryFn: async () => {
        const res = await fetch(`/api/providers/${id}`);
        if (!res.ok) throw new Error('Failed to fetch provider');
        return res.json();
      },
      enabled: !!id,
    });
  };

  // Create provider profile
  const createMutation = useMutation({
    mutationFn: async (data: ProviderCreateData): Promise<Provider> => {
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create provider profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });

  // Update provider profile
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProviderUpdateData }): Promise<Provider> => {
      const res = await fetch(`/api/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update provider profile');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['providers', variables.id] });
    },
  });

  // Get top providers
  const { data: topProviders, isLoading: isLoadingTop } = useQuery<Provider[]>({
    queryKey: ['providers', 'top'],
    queryFn: async () => {
      const res = await fetch('/api/providers?sortBy=subscribers&sortOrder=desc&limit=6');
      if (!res.ok) throw new Error('Failed to fetch top providers');
      const data = await res.json();
      return data.providers;
    },
  });

  return {
    providers: data?.providers ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
    useProvider,
    createProvider: createMutation.mutate,
    updateProvider: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    topProviders,
    isLoadingTop,
  };
}
