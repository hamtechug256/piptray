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
        
        setStatus('Getting session...');

        // Get the session - Supabase automatically handles the hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('Session error: ' + sessionError.message);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        if (!session?.user) {
          setStatus('No session found');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        const user = session.user;
        console.log('User authenticated:', user.email);
        setStatus('User found: ' + user.email);

        // Try to find user by ID first
        let { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id, role, email')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // No user found by ID, try to find by email
          console.log('No user by ID, checking by email...');
          const { data: userByEmail, error: emailError } = await supabase
            .from('users')
            .select('id, role, email')
            .eq('email', user.email)
            .single();

          if (userByEmail) {
            // Found user by email - update their ID to match auth user
            console.log('Found user by email, updating ID...');
            existingUser = userByEmail;
            
            // Update the existing user's ID to match the auth ID
            const { error: updateError } = await supabase
              .from('users')
              .update({
                id: user.id,
                emailVerified: true,
                emailVerifiedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .eq('email', user.email);

            if (updateError) {
              console.error('Update error:', updateError);
              // If update fails due to RLS, try to just proceed
            }
          }
        }

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
            // Continue anyway - the auth session is valid
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
      } catch (err) {
        console.error('Callback exception:', err);
        setStatus('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
        // Still try to redirect to dashboard
        router.push('/dashboard/subscriber');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      <p className="text-muted-foreground">{status}</p>
    </div>
  );
}
