import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  try {
    const supabase = await createClient();

    // Exchange code for session
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      // Get the user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Get user error:', userError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=Failed to authenticate`
        );
      }

      // Try to create/update user record (ignore errors)
      try {
        // Check if user exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', user.id)
          .single();

        if (!existingUser) {
          // Create new user
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

          if (insertError) {
            console.error('User insert error:', insertError);
          }

          // Redirect new users to subscriber dashboard
          return NextResponse.redirect(`${requestUrl.origin}/dashboard/subscriber`);
        } else {
          // Update existing user
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

    // No code, redirect to login
    return NextResponse.redirect(`${requestUrl.origin}/login`);
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Authentication failed`
    );
  }
}
