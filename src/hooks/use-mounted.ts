'use client';

import { useSyncExternalStore, useState, useEffect, useCallback } from 'react';

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
  
  // Get initial value synchronously if possible
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

// Hook for getting user from localStorage
export function useUser() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const storedUser = window.localStorage.getItem('piptray_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('piptray_user');
    }
    setUser(null);
    window.location.href = '/';
  }, []);

  const login = useCallback((userData: { name: string; email: string; role: string }) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('piptray_user', JSON.stringify(userData));
    }
    setUser(userData);
  }, []);

  return { user, setUser, logout, login };
}
