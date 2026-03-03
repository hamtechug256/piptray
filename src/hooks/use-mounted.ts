'use client';

import { useSyncExternalStore, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser, getSession } from '@/lib/supabase/client';

// Empty subscribe function for useSyncExternalStore
const emptySubscribe = () => () => {};

// Custom hook for hydration-safe mounting
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Custom hook for localStorage access (client-side only)
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const mounted = useMounted();
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Auth user type
interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: 'subscriber' | 'provider' | 'admin';
  avatar?: string | null;
  emailVerified?: boolean;
}

// Hook for getting user - uses Supabase with localStorage fallback for demo
export function useUser() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useMounted();

  // Check for existing session on mount
  useEffect(() => {
    if (!mounted) return;

    const checkSession = async () => {
      try {
        // First try Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get profile from users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name,
            role: profile?.role || 'subscriber',
            avatar: profile?.avatar,
            emailVerified: !!session.user.email_confirmed_at,
          });
        } else {
          // Fallback to localStorage for demo mode
          const storedUser = window.localStorage.getItem('piptray_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Fallback to localStorage
        const storedUser = window.localStorage.getItem('piptray_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          window.localStorage.removeItem('piptray_user');
        } else if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name,
            role: profile?.role || 'subscriber',
            avatar: profile?.avatar,
            emailVerified: !!session.user.email_confirmed_at,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [mounted]);

  const login = useCallback((userData: AuthUser) => {
    window.localStorage.setItem('piptray_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase logout error:', error);
    }
    window.localStorage.removeItem('piptray_user');
    setUser(null);
    router.push('/');
  }, [router]);

  return { user, setUser, logout, login, loading };
}
