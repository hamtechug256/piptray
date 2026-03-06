import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Login error:', authError);
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 401 }
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { success: false, error: 'Login failed' },
        { status: 500 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: profile?.name || authData.user.user_metadata?.name,
          role: profile?.role || 'subscriber',
          avatar: profile?.avatar,
          emailVerified: authData.user.email_confirmed_at != null,
        },
        session: {
          accessToken: authData.session.access_token,
          expiresAt: authData.session.expires_at,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
