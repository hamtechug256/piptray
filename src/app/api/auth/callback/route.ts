import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Exchange code for session
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
        );
      }

      // Get user after exchange
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Get user error:', userError);
        return NextResponse.redirect(
          new URL('/login?error=Failed to get user', request.url)
        );
      }
      
      if (user) {
        // Check if user exists in users table
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = no rows found, which is fine for new users
          console.error('Fetch user error:', fetchError);
        }

        // Get role from user metadata or default to subscriber
        const userRole = user.user_metadata?.role || 'subscriber';

        if (!existingUser) {
          // Create new user record
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
              role: userRole,
              avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
              email_verified: true,
              email_verified_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error('Insert user error:', insertError);
            // Continue anyway - user can still access dashboard
          }

          // If user is a provider, create provider record
          if (userRole === 'provider') {
            await supabase
              .from('providers')
              .insert({
                user_id: user.id,
                display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
          }
        } else {
          // Update existing user - mark email as verified
          await supabase
            .from('users')
            .update({ 
              email_verified: true, 
              email_verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        }

        // Determine redirect based on role
        const redirectPath = existingUser?.role || userRole;
        
        if (redirectPath === 'admin') {
          return NextResponse.redirect(new URL('/dashboard/admin', request.url));
        } else if (redirectPath === 'provider') {
          return NextResponse.redirect(new URL('/dashboard/provider', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard/subscriber', request.url));
      }
    }

    // Default redirect
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/login?error=Authentication failed', request.url));
  }
}
