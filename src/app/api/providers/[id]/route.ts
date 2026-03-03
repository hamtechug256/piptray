import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/providers/[id] - Get single provider
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        user:users(id, name, email, avatar)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching provider:', error);
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Get recent signals for this provider
    const { data: signals } = await supabase
      .from('signals')
      .select('*')
      .eq('provider_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        *,
        user:users(id, name, avatar)
      `)
      .eq('provider_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        signals: signals || [],
        reviews: reviews || [],
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/providers/[id] - Update provider profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user owns this provider profile
    const { data: provider } = await supabase
      .from('providers')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!provider || provider.user_id !== authUser.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;
    delete updates.win_rate;
    delete updates.total_signals;
    delete updates.total_pips;

    const { data, error } = await supabase
      .from('providers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating provider:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
