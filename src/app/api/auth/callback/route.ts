import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('=== AUTH CALLBACK ===');
  console.log('URL:', request.url);
  console.log('Code:', code ? 'present' : 'missing');
  console.log('Error:', error);
  console.log('Error Description:', errorDescription);

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth provider error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  try {
    const supabase = await createClient();

    // Exchange code for session
    if (code) {
      console.log('Exchanging code for session...');
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      // Get the user
      console.log('Getting user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Get user error:', userError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to get user: ' + userError.message)}`
        );
      }

      if (!user) {
        console.error('No user returned');
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('No user found')}`
        );
      }

      console.log('User found:', user.email);

      // Try to create/update user record
      try {
        // ALWAYS fetch fresh role from database
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id, role, email, name, avatar')
          .eq('id', user.id)
          .single();

        console.log('Existing user check:', existingUser, fetchError?.message);

        if (!existingUser) {
          // Create new user
          console.log('Creating new user record...');
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
            console.error('User insert error:', insertError);
            // Continue anyway - the auth user exists
          }
          
          console.log('Redirecting to subscriber dashboard');
          return NextResponse.redirect(`${requestUrl.origin}/dashboard/subscriber`);
        } else {
          // Update existing user last login
          console.log('Updating existing user...');
          await supabase
            .from('users')
            .update({
              emailVerified: true,
              emailVerifiedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .eq('id', user.id);

          // Use the role from database (not cached)
          const role = existingUser.role || 'subscriber';
          console.log('Fresh role from DB:', role);
          
          if (role === 'admin') {
            return NextResponse.redirect(`${requestUrl.origin}/dashboard/admin`);
          } else if (role === 'provider') {
            return NextResponse.redirect(`${requestUrl.origin}/dashboard/provider`);
          }
          return NextResponse.redirect(`${requestUrl.origin}/dashboard/subscriber`);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Still redirect to dashboard even if DB fails
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
      }
    }

    // No code present
    console.log('No code in request, redirecting to login');
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('No authorization code received')}`);
  } catch (err) {
    console.error('Callback exception:', err);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent('Authentication failed: ' + (err instanceof Error ? err.message : 'Unknown error'))}`
    );
  }
}
