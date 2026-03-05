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
        id,
        "userId",
        "displayName",
        bio,
        avatar,
        tier,
        "winRate",
        "totalSignals",
        "totalPips",
        "avgRR",
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
      .eq('"providerId"', id)
      .order('"createdAt"', { ascending: false })
      .limit(10);

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        comment,
        "isVerified",
        "isPublic",
        "helpfulCount",
        "createdAt",
        user:users(id, name, avatar)
      `)
      .eq('"providerId"', id)
      .eq('"isPublic"', true)
      .order('"createdAt"', { ascending: false })
      .limit(10);

    // Transform for frontend
    const transformedData = {
      id: data.id,
      userId: data.userId,
      displayName: data.displayName,
      bio: data.bio,
      avatar: data.avatar,
      tier: data.tier,
      winRate: data.winRate || 0,
      totalSignals: data.totalSignals || 0,
      totalPips: data.totalPips || 0,
      avgRR: data.avgRR || 0,
      monthlyPrice: data.monthlyPrice || 0,
      averageRating: data.average_rating || 0,
      totalReviews: data.total_reviews || 0,
      pairs: data.pairs || [],
      subscribers: data.subscribers || 0,
      isVerified: data.isVerified || false,
      isActive: data.isActive || false,
      createdAt: data.createdAt,
      user: data.user,
      signals: signals || [],
      reviews: reviews || [],
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
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
      .select('"userId"')
      .eq('id', id)
      .single();

    if (!provider || provider.userId !== authUser.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Build updates with correct column names
    const updates: Record<string, unknown> = {
      "updatedAt": new Date().toISOString(),
    };
    
    // Map frontend names to database column names
    if (body.displayName !== undefined) updates["displayName"] = body.displayName;
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.avatar !== undefined) updates.avatar = body.avatar;
    if (body.pairs !== undefined) updates.pairs = body.pairs;
    if (body.timeframes !== undefined) updates.timeframes = body.timeframes;
    if (body.monthlyPrice !== undefined) updates["monthlyPrice"] = body.monthlyPrice;
    if (body.weeklyPrice !== undefined) updates.weeklyprice = body.weeklyPrice;
    if (body.quarterlyPrice !== undefined) updates.quarterlyprice = body.quarterlyPrice;
    if (body.yearlyPrice !== undefined) updates.yearlyprice = body.yearlyPrice;

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
