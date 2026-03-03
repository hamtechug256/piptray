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
        
        setStatus('Getting session...');

        // Get the session - Supabase should have already parsed the hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('Session:', session ? 'found' : 'not found');
        console.log('Session error:', sessionError);

        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('Session error: ' + sessionError.message);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        if (!session?.user) {
          console.log('No session user');
          setStatus('No session found');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        const user = session.user;
        console.log('User authenticated:', user.email);
        setStatus('User: ' + user.email);

        // Try to find user in database
        let userProfile = null;
        let userRole = 'subscriber';

        try {
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id, role, email, name, avatar')
            .eq('id', user.id)
            .single();

          if (existingUser) {
            console.log('Found existing user:', existingUser);
            userProfile = existingUser;
            userRole = existingUser.role || 'subscriber';
            
            // Update user
            await supabase
              .from('users')
              .update({
                emailVerified: true,
                emailVerifiedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .eq('id', user.id);
          } else {
            // Try to find by email and update ID
            const { data: userByEmail } = await supabase
              .from('users')
              .select('id, role, email, name, avatar')
              .eq('email', user.email)
              .single();

            if (userByEmail) {
              console.log('Found user by email, updating...');
              userProfile = userByEmail;
              userRole = userByEmail.role || 'subscriber';
              
              await supabase
                .from('users')
                .update({
                  id: user.id,
                  emailVerified: true,
                  emailVerifiedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
                .eq('email', user.email);
            } else {
              // Create new user
              console.log('Creating new user...');
              const newUser = {
                id: user.id,
                email: user.email!,
                name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
                role: 'subscriber' as const,
                avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                emailVerified: true,
                emailVerifiedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              const { error: insertError } = await supabase
                .from('users')
                .insert(newUser);

              if (!insertError) {
                userProfile = newUser;
              }
            }
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
        }

        // Store user in localStorage as fallback
        const userData = {
          id: user.id,
          email: user.email!,
          name: userProfile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
          role: userRole,
          avatar: userProfile?.avatar || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        };
        
        localStorage.setItem('piptray_user', JSON.stringify(userData));
        console.log('Stored user in localStorage:', userData);

        // Clear the URL hash
        window.history.replaceState(null, '', window.location.pathname);

        // Redirect based on role - use window.location for immediate redirect
        setStatus('Redirecting...');
        console.log('Redirecting with role:', userRole);
        
        // Small delay to ensure localStorage is written
        await new Promise(r => setTimeout(r, 100));
        
        // Force page reload to dashboard
        window.location.replace('/dashboard');
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
    </div>
  );
}
