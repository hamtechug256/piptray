import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// GET - List all providers (including inactive)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin role
    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get ALL providers (including inactive) - use ACTUAL database column names
    const { data: providers, error } = await supabase
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
        subscribers,
        "monthlyPrice",
        average_rating,
        total_reviews,
        "isVerified",
        "isActive",
        pairs,
        "createdAt",
        user:users(id, email, name, avatar)
      `)
      .order('"createdAt"', { ascending: false });

    if (error) {
      console.error('Error fetching providers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to camelCase for frontend
    const transformedProviders = (providers || []).map(p => ({
      id: p.id,
      userId: p.userId,
      displayName: p.displayName,
      bio: p.bio,
      avatar: p.avatar,
      tier: p.tier,
      winRate: p.winRate || 0,
      totalSignals: p.totalSignals || 0,
      totalPips: p.totalPips || 0,
      subscribers: p.subscribers || 0,
      monthlyPrice: p.monthlyPrice || 0,
      averageRating: p.average_rating || 0,
      totalReviews: p.total_reviews || 0,
      isVerified: p.isVerified || false,
      isActive: p.isActive || false,
      pairs: p.pairs || [],
      createdAt: p.createdAt,
      user: p.user,
    }));

    return NextResponse.json({
      success: true,
      data: transformedProviders,
    });
  } catch (error) {
    console.error('Admin providers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update provider status
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminId = authHeader?.replace('Bearer ', '');
    
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin role
    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { providerId, isActive, isVerified, tier } = body;

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    // Build update with ACTUAL database column names (camelCase with quotes)
    const updateData: Record<string, unknown> = { "updatedAt": new Date().toISOString() };
    
    if (isActive !== undefined) updateData["isActive"] = isActive;
    if (isVerified !== undefined) {
      updateData["isVerified"] = isVerified;
      if (isVerified) {
        updateData["verifiedAt"] = new Date().toISOString();
      }
    }
    if (tier) updateData.tier = tier;

    const { error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', providerId);

    if (error) {
      console.error('Error updating provider:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin provider update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
