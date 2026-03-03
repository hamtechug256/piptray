'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Signal } from '@/lib/supabase/types';

interface SignalsFilters {
  providerId?: string;
  status?: string;
  pair?: string;
  direction?: 'BUY' | 'SELL';
  isFree?: boolean;
  outcome?: 'win' | 'loss' | 'breakeven';
  sortBy?: 'createdAt' | 'winRate' | 'pips';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface SignalsResponse {
  signals: Signal[];
  total: number;
}

interface SignalCreateData {
  pair: string;
  direction: 'BUY' | 'SELL';
  timeframe: string;
  analysis?: string;
  entryPrice: number;
  entryZoneLow?: number;
  entryZoneHigh?: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  takeProfit3?: number;
  risk: 'low' | 'medium' | 'high';
  chartImage?: string;
  isFree?: boolean;
}

interface SignalUpdateData extends Partial<SignalCreateData> {
  status?: Signal['status'];
  outcome?: Signal['outcome'];
  resultPips?: number;
}

export function useSignals(filters?: SignalsFilters) {
  const queryClient = useQueryClient();

  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters?.providerId) params.append('providerId', filters.providerId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.pair) params.append('pair', filters.pair);
    if (filters?.direction) params.append('direction', filters.direction);
    if (filters?.isFree !== undefined) params.append('isFree', filters.isFree.toString());
    if (filters?.outcome) params.append('outcome', filters.outcome);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    return params.toString();
  };

  // Get signals
  const { data, isLoading, error, refetch } = useQuery<SignalsResponse>({
    queryKey: ['signals', filters],
    queryFn: async () => {
      const queryString = buildQueryString();
      const res = await fetch(`/api/signals${queryString ? `?${queryString}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch signals');
      return res.json();
    },
  });

  // Get single signal
  const useSignal = (id: string) => {
    return useQuery<Signal>({
      queryKey: ['signals', id],
      queryFn: async () => {
        const res = await fetch(`/api/signals/${id}`);
        if (!res.ok) throw new Error('Failed to fetch signal');
        return res.json();
      },
      enabled: !!id,
    });
  };

  // Create signal
  const createMutation = useMutation({
    mutationFn: async (data: SignalCreateData): Promise<Signal> => {
      const res = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create signal');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });

  // Update signal
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SignalUpdateData }): Promise<Signal> => {
      const res = await fetch(`/api/signals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update signal');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
      queryClient.invalidateQueries({ queryKey: ['signals', variables.id] });
    },
  });

  // Delete signal
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/signals/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete signal');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signals'] });
    },
  });

  // Get active signals
  const { data: activeSignals, isLoading: isLoadingActive } = useQuery<Signal[]>({
    queryKey: ['signals', 'active'],
    queryFn: async () => {
      const res = await fetch('/api/signals?status=active&limit=20');
      if (!res.ok) throw new Error('Failed to fetch active signals');
      const data = await res.json();
      return data.signals;
    },
  });

  // Get free signals
  const { data: freeSignals, isLoading: isLoadingFree } = useQuery<Signal[]>({
    queryKey: ['signals', 'free'],
    queryFn: async () => {
      const res = await fetch('/api/signals?isFree=true&limit=10');
      if (!res.ok) throw new Error('Failed to fetch free signals');
      const data = await res.json();
      return data.signals;
    },
  });

  return {
    signals: data?.signals ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
    useSignal,
    createSignal: createMutation.mutate,
    updateSignal: updateMutation.mutate,
    deleteSignal: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    activeSignals,
    isLoadingActive,
    freeSignals,
    isLoadingFree,
  };
}
