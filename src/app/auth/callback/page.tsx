'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('=== CLIENT AUTH CALLBACK ===');
        console.log('URL hash:', window.location.hash);
        console.log('URL search:', window.location.search);

        // Let Supabase handle the hash fragment
        const { data, error: hashError } = await supabase.auth.getSessionFromUrl();

        if (hashError) {
          console.error('Hash error:', hashError);
          setError(hashError.message);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        console.log('Session data:', data);

        // Get the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error('User error:', userError);
          setError('Failed to get user');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        console.log('User:', user.email);

        // Create or update user in database
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', user.id)
          .single();

        if (!existingUser) {
          // Create new user
          console.log('Creating new user...');
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
              role: 'subscriber',
              avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              emailVerified: true,
              emailVerifiedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

          if (insertError) {
            console.error('Insert error:', insertError);
          }

          // Redirect to subscriber dashboard
          router.push('/dashboard/subscriber');
          return;
        }

        // Update existing user
        console.log('Updating user...');
        await supabase
          .from('users')
          .update({
            emailVerified: true,
            emailVerifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq('id', user.id);

        // Redirect based on role
        const role = existingUser.role || 'subscriber';
        if (role === 'admin') {
          router.push('/dashboard/admin');
        } else if (role === 'provider') {
          router.push('/dashboard/provider');
        } else {
          router.push('/dashboard/subscriber');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication failed');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
