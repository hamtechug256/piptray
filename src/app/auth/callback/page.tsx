'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('=== CLIENT AUTH CALLBACK ===');
        console.log('Full URL:', window.location.href);
        console.log('Hash:', window.location.hash);

        setStatus('Checking session...');

        // Supabase automatically handles the hash fragment on page load
        // Just get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('Session:', session);
        console.log('Session error:', sessionError);

        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('Session error: ' + sessionError.message);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        if (!session) {
          console.log('No session, checking URL hash...');
          
          // Try to exchange the code if present
          const params = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          console.log('Access token present:', !!accessToken);
          console.log('Refresh token present:', !!refreshToken);

          if (accessToken && refreshToken) {
            // Set the session manually
            const { error: setError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setError) {
              console.error('Set session error:', setError);
              setStatus('Failed to set session');
              setTimeout(() => router.push('/login'), 2000);
              return;
            }
          } else {
            setStatus('No tokens found in URL');
            setTimeout(() => router.push('/login'), 2000);
            return;
          }
        }

        // Get the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error('User error:', userError);
          setStatus('Failed to get user');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        console.log('User authenticated:', user.email);
        setStatus('User found: ' + user.email);

        // Create or update user in database
        try {
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', user.id)
            .single();

          console.log('Existing user:', existingUser);
          console.log('Fetch error:', fetchError);

          if (!existingUser) {
            // Create new user
            setStatus('Creating user profile...');
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
              // Continue anyway - the auth user exists
            }

            setStatus('Redirecting to dashboard...');
            router.push('/dashboard/subscriber');
            return;
          }

          // Update existing user
          setStatus('Updating profile...');
          console.log('Updating existing user...');
          
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
          setStatus('Redirecting to dashboard...');
          console.log('Redirecting with role:', role);
          
          if (role === 'admin') {
            router.push('/dashboard/admin');
          } else if (role === 'provider') {
            router.push('/dashboard/provider');
          } else {
            router.push('/dashboard/subscriber');
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Still redirect - the auth session is valid
          router.push('/dashboard/subscriber');
        }
      } catch (err) {
        console.error('Callback exception:', err);
        setStatus('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      <p className="text-muted-foreground">{status}</p>
      <p className="text-xs text-muted-foreground">Check browser console for details</p>
    </div>
  );
}
