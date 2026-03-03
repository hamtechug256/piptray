import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Provider } from '@/lib/supabase/types';

interface AuthState {
  user: User | null;
  provider: Provider | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProvider: (provider: Provider | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, provider?: Provider) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateProvider: (updates: Partial<Provider>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      provider: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setProvider: (provider) =>
        set({ provider }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      login: (user, provider) =>
        set({
          user,
          provider: provider ?? null,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          provider: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateProvider: (updates) =>
        set((state) => ({
          provider: state.provider ? { ...state.provider, ...updates } : null,
        })),
    }),
    {
      name: 'piptray-auth',
      partialize: (state) => ({
        user: state.user,
        provider: state.provider,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
