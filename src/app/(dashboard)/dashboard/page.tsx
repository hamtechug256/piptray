'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMounted, useUser } from '@/hooks/use-mounted';
import { SubscriberDashboard } from './subscriber/page';
import { ProviderDashboard } from './provider/page';

export default function DashboardPage() {
  const mounted = useMounted();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Render different dashboard based on role
  if (user.role === 'provider') {
    return <ProviderDashboard />;
  }

  if (user.role === 'admin') {
    return <ProviderDashboard />; // Simplified for now
  }

  return <SubscriberDashboard />;
}
