'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import SubscriberDashboard from './subscriber/page';
import ProviderDashboard from './provider/page';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: 'subscriber' | 'provider' | 'admin';
  avatar: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      console.log('Dashboard: Loading user...');
      
      // Check localStorage first (fastest, set by callback)
      const storedUser = localStorage.getItem('piptray_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as UserData;
          console.log('Dashboard: Found stored user:', parsedUser);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Dashboard: Error parsing stored user:', e);
        }
      }

      // Fallback: Check Supabase session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Dashboard: Found Supabase session:', session.user.email);
          
          // Try to get profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userData: UserData = profile ? {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role || 'subscriber',
            avatar: profile.avatar,
          } : {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email!.split('@')[0],
            role: 'subscriber',
            avatar: session.user.user_metadata?.avatar_url || null,
          };

          // Store for future use
          localStorage.setItem('piptray_user', JSON.stringify(userData));
          setUser(userData);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Dashboard: Supabase error:', e);
      }

      // No user found
      console.log('Dashboard: No user, redirecting to login');
      router.push('/login');
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  console.log('Dashboard: Rendering with user role:', user.role);

  if (user.role === 'provider' || user.role === 'admin') {
    return <ProviderDashboard />;
  }

  return <SubscriberDashboard />;
}
