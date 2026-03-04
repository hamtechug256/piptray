import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/signals/[id] - Get single signal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('signals')
      .select(`
        *,
        provider:providers(
          id,
          display_name,
          tier,
          avatar,
          win_rate,
          user:users(id, name, avatar)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching signal:', error);
      return NextResponse.json(
        { success: false, error: 'Signal not found' },
        { status: 404 }
      );
    }

    // Increment views count
    await supabase
      .from('signals')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', id);

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

// PUT /api/signals/[id] - Update signal
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

    // Get signal and verify ownership
    const { data: signal, error: signalError } = await supabase
      .from('signals')
      .select('*, provider:providers(user_id)')
      .eq('id', id)
      .single();

    if (signalError || !signal) {
      return NextResponse.json(
        { success: false, error: 'Signal not found' },
        { status: 404 }
      );
    }

    // Check if user owns this signal
    const provider = signal.provider as { user_id: string };
    if (provider.user_id !== authUser.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedUpdates = [
      'pair', 'direction', 'timeframe', 'analysis', 'entry_price',
      'entry_zone_low', 'entry_zone_high', 'stop_loss',
      'take_profit_1', 'take_profit_2', 'take_profit_3',
      'risk', 'chart_image', 'status', 'outcome', 'result_pips', 'is_free'
    ];

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        // Convert snake_case for database
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updates[dbKey] = body[key];
      }
    }

    // If closing signal with outcome, set closed_at
    if (body.outcome && !signal.outcome) {
      updates.closed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('signals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating signal:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // If signal was closed with outcome, update provider stats
    if (body.outcome && !signal.outcome) {
      await updateProviderStats(supabase, signal.provider_id);
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

// DELETE /api/signals/[id] - Delete signal
export async function DELETE(
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

    // Get signal and verify ownership
    const { data: signal, error: signalError } = await supabase
      .from('signals')
      .select('*, provider:providers(user_id, total_signals)')
      .eq('id', id)
      .single();

    if (signalError || !signal) {
      return NextResponse.json(
        { success: false, error: 'Signal not found' },
        { status: 404 }
      );
    }

    // Check if user owns this signal (or is admin)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single();

    const provider = signal.provider as { user_id: string; total_signals: number };
    const isOwner = provider.user_id === authUser.id;
    const isAdmin = userData?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete signal
    const { error } = await supabase
      .from('signals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting signal:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Update provider's total signals count
    await supabase
      .from('providers')
      .update({
        total_signals: Math.max(0, (provider.total_signals || 1) - 1),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', provider.user_id);

    return NextResponse.json({
      success: true,
      message: 'Signal deleted successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update provider stats after signal outcome
async function updateProviderStats(supabase: any, providerId: string) {
  try {
    // Get all closed signals for this provider
    const { data: signals } = await supabase
      .from('signals')
      .select('outcome, result_pips')
      .eq('provider_id', providerId)
      .not('outcome', 'is', null);

    if (!signals || signals.length === 0) return;

    const totalClosed = signals.length;
    const wins = signals.filter((s: any) => s.outcome === 'win').length;
    const winRate = Math.round((wins / totalClosed) * 100);
    const totalPips = signals.reduce((sum: number, s: any) => sum + (s.result_pips || 0), 0);

    await supabase
      .from('providers')
      .update({
        win_rate: winRate,
        total_pips: totalPips,
        updated_at: new Date().toISOString(),
      })
      .eq('id', providerId);
  } catch (error) {
    console.error('Error updating provider stats:', error);
  }
}
