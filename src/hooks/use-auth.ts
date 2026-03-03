'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/lib/supabase/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
  role: 'subscriber' | 'provider';
}

interface AuthResponse {
  user: User | null;
  error: string | null;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, login, logout, setLoading } = useAuthStore();

  // Get current user
  const { refetch: refetchUser } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async (): Promise<AuthResponse> => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        return res.json();
      } catch {
        return { user: null, error: 'Not authenticated' };
      }
    },
    enabled: false, // Don't auto-fetch
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Login failed');
        }
        return data;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      if (data.user) {
        login(data.user);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<AuthResponse> => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.error || 'Registration failed');
        }
        return responseData;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      if (data.user) {
        login(data.user);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    refetchUser,
  };
}
