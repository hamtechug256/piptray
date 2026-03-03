'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import SubscriberDashboard from './subscriber/page';
import ProviderDashboard from './provider/page';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'subscriber' | 'provider' | 'admin';
  avatar: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        // Get session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setLoading(false);
            router.push('/login');
          }
          return;
        }

        if (!session?.user) {
          // No session, check localStorage fallback
          const storedUser = typeof window !== 'undefined' 
            ? localStorage.getItem('piptray_user') 
            : null;
          
          if (storedUser && mounted) {
            setUser(JSON.parse(storedUser));
            setLoading(false);
          } else if (mounted) {
            setLoading(false);
            router.push('/login');
          }
          return;
        }

        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile error:', profileError);
        }

        if (mounted) {
          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role || 'subscriber',
              avatar: profile.avatar,
            });
          } else {
            // User exists in auth but not in users table
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
              role: 'subscriber',
              avatar: session.user.user_metadata?.avatar_url || null,
            });
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        if (mounted) {
          setLoading(false);
          router.push('/login');
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            router.push('/login');
          }
        } else if (session?.user && mounted) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role || 'subscriber',
              avatar: profile.avatar,
            });
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
              role: 'subscriber',
              avatar: session.user.user_metadata?.avatar_url || null,
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // No user after loading
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  // Render dashboard based on role
  if (user.role === 'provider' || user.role === 'admin') {
    return <ProviderDashboard />;
  }

  return <SubscriberDashboard />;
}
