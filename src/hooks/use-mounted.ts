'use client';

import { useSyncExternalStore, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

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

// Hook for getting user - prioritize localStorage for reliability
export function useUser() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useMounted();
  const isLoggingOut = useRef(false);

  useEffect(() => {
    if (!mounted) return;

    const checkSession = async () => {
      // Skip if we're in the process of logging out
      if (isLoggingOut.current) {
        console.log('useUser: Skipping session check - logging out');
        return;
      }

      console.log('useUser: Checking session...');
      
      // First check localStorage (set by auth callback)
      try {
        const storedUser = window.localStorage.getItem('piptray_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as AuthUser;
          console.log('useUser: Found stored user:', parsedUser.email);
          setUser(parsedUser);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('useUser: Error reading localStorage:', e);
      }

      // Fallback: check Supabase session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Double-check logout flag after async operation
        if (isLoggingOut.current) {
          console.log('useUser: Abandoning session check - logout in progress');
          return;
        }

        if (session?.user) {
          console.log('useUser: Found Supabase session:', session.user.email);
          
          // Try to get profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userData: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
            role: profile?.role || 'subscriber',
            avatar: profile?.avatar || session.user.user_metadata?.avatar_url || null,
            emailVerified: !!session.user.email_confirmed_at,
          };

          // Store for future use
          window.localStorage.setItem('piptray_user', JSON.stringify(userData));
          setUser(userData);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('useUser: Supabase error:', e);
      }

      // No session found
      console.log('useUser: No session found');
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useUser: Auth state changed:', event);
        
        if (event === 'SIGNED_OUT' || isLoggingOut.current) {
          console.log('useUser: Clearing user data');
          window.localStorage.removeItem('piptray_user');
          setUser(null);
          setLoading(false);
          isLoggingOut.current = false;
        } else if (event === 'SIGNED_IN' && session?.user && !isLoggingOut.current) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userData: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || null,
            role: profile?.role || 'subscriber',
            avatar: profile?.avatar,
            emailVerified: !!session.user.email_confirmed_at,
          };

          window.localStorage.setItem('piptray_user', JSON.stringify(userData));
          setUser(userData);
        }
        // Ignore TOKEN_REFRESHED and other events during logout
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [mounted]);

  const login = useCallback((userData: AuthUser) => {
    console.log('useUser: Login called for:', userData.email);
    isLoggingOut.current = false;
    window.localStorage.setItem('piptray_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    console.log('useUser: Logout called');
    
    // Set flag immediately to prevent re-checking
    isLoggingOut.current = true;
    
    // Clear state and localStorage immediately
    setUser(null);
    window.localStorage.removeItem('piptray_user');
    setLoading(false);
    
    // Then sign out from Supabase (in background)
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('useUser: Supabase signOut complete');
    } catch (error) {
      console.error('Supabase logout error:', error);
    }
    
    // Reset flag after a short delay
    setTimeout(() => {
      isLoggingOut.current = false;
    }, 1000);
    
    // Navigate to home
    router.push('/');
    router.refresh();
  }, [router]);

  return { user, setUser, logout, login, loading };
}
