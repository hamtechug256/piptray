import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/providers - List providers with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const tier = searchParams.get('tier');
    const pair = searchParams.get('pair');
    const sortBy = searchParams.get('sortBy') || 'win_rate';
    const search = searchParams.get('search');

    // Use explicit column names with snake_case
    let query = supabase
      .from('providers')
      .select(`
        id,
        user_id,
        display_name,
        bio,
        avatar,
        tier,
        win_rate,
        total_signals,
        total_pips,
        monthly_price,
        average_rating,
        total_reviews,
        pairs,
        subscribers,
        is_verified,
        is_active,
        created_at,
        user:users(id, name, email, avatar)
      `)
      .eq('is_active', true);

    // Apply filters
    if (tier) {
      query = query.eq('tier', tier);
    }

    if (pair) {
      query = query.contains('pairs', [pair]);
    }

    if (search) {
      query = query.ilike('display_name', `%${search}%`);
    }

    // Apply sorting
    const sortColumn = sortBy === 'subscribers' ? 'subscribers' : 
                       sortBy === 'rating' ? 'average_rating' : 
                       sortBy === 'pips' ? 'total_pips' : 'win_rate';
    query = query.order(sortColumn, { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching providers:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Transform to camelCase for frontend
    const transformedData = (data || []).map(p => ({
      id: p.id,
      userId: p.user_id,
      displayName: p.display_name,
      bio: p.bio,
      avatar: p.avatar,
      tier: p.tier,
      winRate: p.win_rate || 0,
      totalSignals: p.total_signals || 0,
      totalPips: p.total_pips || 0,
      monthlyPrice: p.monthly_price || 0,
      averageRating: p.average_rating || 0,
      totalReviews: p.total_reviews || 0,
      pairs: p.pairs || [],
      subscribers: p.subscribers || 0,
      isVerified: p.is_verified || false,
      isActive: p.is_active || false,
      createdAt: p.created_at,
      user: p.user,
    }));

    // Get total count for pagination
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
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

// POST /api/providers - Create provider profile
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      display_name,
      bio,
      pairs = [],
      timeframes = [],
      monthly_price = 0,
      weekly_price = 0,
      quarterly_price = 0,
      yearly_price = 0,
      binance_wallet,
      ethereum_wallet,
      mtn_momo_number,
      airtel_money_number,
    } = body;

    // Check if provider profile already exists
    const { data: existingProvider } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (existingProvider) {
      return NextResponse.json(
        { success: false, error: 'Provider profile already exists' },
        { status: 400 }
      );
    }

    // Create provider profile
    const { data, error } = await supabase
      .from('providers')
      .insert({
        user_id: authUser.id,
        display_name,
        bio,
        pairs,
        timeframes,
        monthly_price,
        weekly_price,
        quarterly_price,
        yearly_price,
        binance_wallet,
        ethereum_wallet,
        mtn_momo_number,
        airtel_money_number,
        tier: 'new',
        is_active: false, // Requires admin approval
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating provider:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Update user role to provider
    await supabase
      .from('users')
      .update({ role: 'provider' })
      .eq('id', authUser.id);

    return NextResponse.json({
      success: true,
      data,
      message: 'Provider profile created! Waiting for admin approval.',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
