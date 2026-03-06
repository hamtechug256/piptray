import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user from auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // If user is a provider, get provider data
    let providerData = null;
    if (profile?.role === 'provider') {
      const { data: provider } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
      
      providerData = provider;
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authUser.id,
          email: authUser.email,
          name: profile?.name || authUser.user_metadata?.name,
          role: profile?.role || 'subscriber',
          avatar: profile?.avatar,
          emailVerified: authUser.email_confirmed_at != null,
        },
        provider: providerData,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
