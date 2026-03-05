import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/providers - List providers with filters
// Database uses MIXED case: "displayName", "isActive", "userId" (camelCase with quotes)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const tier = searchParams.get('tier');
    const pair = searchParams.get('pair');
    const sortBy = searchParams.get('sortBy') || 'winRate';
    const search = searchParams.get('search');

    // Use ACTUAL database column names (camelCase in quotes for mixed case)
    let query = supabase
      .from('providers')
      .select(`
        id,
        "userId",
        "displayName",
        bio,
        avatar,
        tier,
        "winRate",
        "totalSignals",
        "totalPips",
        "monthlyPrice",
        average_rating,
        total_reviews,
        pairs,
        subscribers,
        "isVerified",
        "isActive",
        "createdAt",
        user:users(id, name, email, avatar)
      `)
      .eq('"isActive"', true);

    // Apply filters
    if (tier) {
      query = query.eq('tier', tier);
    }

    if (pair) {
      query = query.contains('pairs', [pair]);
    }

    if (search) {
      query = query.ilike('"displayName"', `%${search}%`);
    }

    // Apply sorting
    const sortColumn = sortBy === 'subscribers' ? 'subscribers' : 
                       sortBy === 'rating' ? 'average_rating' : 
                       sortBy === 'pips' ? '"totalPips"' : '"winRate"';
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

    // Transform to camelCase for frontend (already camelCase from DB mostly)
    const transformedData = (data || []).map(p => ({
      id: p.id,
      userId: p.userId,
      displayName: p.displayName,
      bio: p.bio,
      avatar: p.avatar,
      tier: p.tier,
      winRate: p.winRate || 0,
      totalSignals: p.totalSignals || 0,
      totalPips: p.totalPips || 0,
      monthlyPrice: p.monthlyPrice || 0,
      averageRating: p.average_rating || 0,
      totalReviews: p.total_reviews || 0,
      pairs: p.pairs || [],
      subscribers: p.subscribers || 0,
      isVerified: p.isVerified || false,
      isActive: p.isActive || false,
      createdAt: p.createdAt,
      user: p.user,
    }));

    // Get total count for pagination
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('"isActive"', true);

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
      displayName,
      bio,
      pairs = [],
      timeframes = [],
      monthlyPrice = 0,
      weeklyprice = 0,
      quarterlyprice = 0,
      yearlyprice = 0,
      binancewallet,
      ethereumwallet,
      mtnmomonumber,
      airtelmoneynumber,
    } = body;

    // Check if provider profile already exists
    const { data: existingProvider } = await supabase
      .from('providers')
      .select('*')
      .eq('"userId"', authUser.id)
      .single();

    if (existingProvider) {
      return NextResponse.json(
        { success: false, error: 'Provider profile already exists' },
        { status: 400 }
      );
    }

    // Create provider profile with correct column names
    const { data, error } = await supabase
      .from('providers')
      .insert({
        "userId": authUser.id,
        "displayName": displayName,
        bio,
        pairs,
        timeframes,
        "monthlyPrice": monthlyPrice,
        weeklyprice,
        quarterlyprice,
        yearlyprice,
        binancewallet,
        ethereumwallet,
        mtnmomonumber,
        airtelmoneynumber,
        tier: 'new',
        "isActive": false, // Requires admin approval
        "isVerified": false,
        "winRate": 0,
        "totalSignals": 0,
        "totalPips": 0,
        "avgRR": 0,
        average_rating: 0,
        total_reviews: 0,
        subscribers: 0,
        "createdAt": new Date().toISOString(),
        "updatedAt": new Date().toISOString(),
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
