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
        console.log('Dashboard: Checking session...');
        
        // Small delay to ensure session is stored
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('Dashboard: Session result:', session ? 'found' : 'not found', sessionError);

        if (sessionError) {
          console.error('Dashboard: Session error:', sessionError);
        }

        if (session?.user) {
          console.log('Dashboard: User found in session:', session.user.email);
          
          // Try to get profile from database
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('Dashboard: Profile:', profile, profileError);

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
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email!.split('@')[0],
                role: 'subscriber',
                avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
              });
            }
            setLoading(false);
          }
          return;
        }

        // No Supabase session - check localStorage for user data
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('piptray_user');
          if (storedUser) {
            console.log('Dashboard: Found stored user');
            const parsedUser = JSON.parse(storedUser);
            if (mounted) {
              setUser(parsedUser);
              setLoading(false);
            }
            return;
          }
        }

        // No session at all
        console.log('Dashboard: No session, redirecting to login');
        if (mounted) {
          setLoading(false);
          router.push('/login');
        }
      } catch (err) {
        console.error('Dashboard: Auth check error:', err);
        if (mounted) {
          setLoading(false);
          router.push('/login');
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Dashboard: Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            router.push('/login');
          }
        } else if (session?.user && mounted) {
          supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
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
                  setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email!.split('@')[0],
                    role: 'subscriber',
                    avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
                  });
                }
              }
            });
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
