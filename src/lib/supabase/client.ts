import { createBrowserClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

export const supabase = createBrowserClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// ============================================
// AUTH HELPERS
// ============================================

export async function signUp(email: string, password: string, name: string, role: 'subscriber' | 'provider' = 'subscriber') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ============================================
// USER HELPERS
// ============================================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Database['public']['Tables']['users']['Update']>) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updatedAt: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// PROVIDER HELPERS
// ============================================

export async function getProviders(options?: {
  limit?: number;
  offset?: number;
  tier?: string;
  pair?: string;
  sortBy?: 'winRate' | 'subscribers' | 'averageRating';
}) {
  let query = supabase
    .from('providers')
    .select('*, user:users(*)')
    .eq('isActive', true);

  if (options?.tier) {
    query = query.eq('tier', options.tier);
  }

  if (options?.pair) {
    query = query.contains('pairs', [options.pair]);
  }

  if (options?.sortBy) {
    query = query.order(options.sortBy, { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProvider(providerId: string) {
  const { data, error } = await supabase
    .from('providers')
    .select('*, user:users(*)')
    .eq('id', providerId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProviderByUserId(userId: string) {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('userId', userId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// SIGNAL HELPERS
// ============================================

export async function getSignals(options?: {
  providerId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('signals')
    .select('*, provider:providers(*, user:users(*))')
    .eq('isPublished', true)
    .order('createdAt', { ascending: false });

  if (options?.providerId) {
    query = query.eq('providerId', options.providerId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getSignal(signalId: string) {
  const { data, error } = await supabase
    .from('signals')
    .select('*, provider:providers(*, user:users(*))')
    .eq('id', signalId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// SUBSCRIPTION HELPERS
// ============================================

export async function getSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, provider:providers(*, user:users(*))')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getActiveSubscription(userId: string, providerId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('userId', userId)
    .eq('providerId', providerId)
    .eq('status', 'active')
    .gt('endDate', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ============================================
// NOTIFICATION HELPERS
// ============================================

export async function getNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ isRead: true, readAt: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ isRead: true, readAt: new Date().toISOString() })
    .eq('userId', userId)
    .eq('isRead', false);

  if (error) throw error;
}
