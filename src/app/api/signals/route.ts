import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/signals - List signals with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');
    const freeOnly = searchParams.get('free') === 'true';

    let query = supabase
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
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (freeOnly) {
      query = query.eq('is_free', true);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching signals:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/signals - Create new signal
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get provider profile
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { success: false, error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    if (!provider.is_active) {
      return NextResponse.json(
        { success: false, error: 'Provider profile not approved yet' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      pair,
      direction,
      timeframe,
      analysis,
      entry_price,
      entry_zone_low,
      entry_zone_high,
      stop_loss,
      take_profit_1,
      take_profit_2,
      take_profit_3,
      risk,
      chart_image,
      is_free = false,
    } = body;

    // Validate required fields
    if (!pair || !direction || !entry_price || !stop_loss) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: pair, direction, entry_price, stop_loss' },
        { status: 400 }
      );
    }

    // Calculate risk level if not provided
    let riskLevel = risk;
    if (!riskLevel) {
      const pipDistance = Math.abs(entry_price - stop_loss);
      const pipValue = pair.includes('JPY') ? 0.01 : 0.0001;
      const pips = pipDistance / pipValue;
      
      if (pips <= 30) riskLevel = 'low';
      else if (pips <= 60) riskLevel = 'medium';
      else riskLevel = 'high';
    }

    // Create signal
    const { data, error } = await supabase
      .from('signals')
      .insert({
        provider_id: provider.id,
        pair,
        direction: direction.toUpperCase(),
        timeframe,
        analysis,
        entry_price,
        entry_zone_low,
        entry_zone_high,
        stop_loss,
        take_profit_1,
        take_profit_2,
        take_profit_3,
        risk: riskLevel,
        chart_image,
        is_free: provider.tier === 'new' ? true : is_free, // New providers must post free signals
        is_published: true,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating signal:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Update provider's total signals count
    await supabase
      .from('providers')
      .update({ 
        total_signals: (provider.total_signals || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', provider.id);

    // Create notifications for subscribers
    const { data: subscribers } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('provider_id', provider.id)
      .eq('status', 'active');

    if (subscribers && subscribers.length > 0) {
      const notifications = subscribers.map(sub => ({
        user_id: sub.user_id,
        type: 'new_signal',
        title: `New Signal from ${provider.display_name}`,
        message: `${direction} ${pair} @ ${entry_price}`,
        data: { signal_id: data.id, provider_id: provider.id },
        created_at: new Date().toISOString(),
      }));

      await supabase.from('notifications').insert(notifications);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Signal created successfully!',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
