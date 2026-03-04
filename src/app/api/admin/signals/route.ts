import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// GET - List all signals
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const outcome = searchParams.get('outcome') || '';
    const pair = searchParams.get('pair') || '';
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('signals')
      .select(`
        *,
        provider:providers(id, displayName, tier, user:users(email))
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (outcome) {
      query = query.eq('outcome', outcome);
    }

    if (pair) {
      query = query.ilike('pair', `%${pair}%`);
    }

    const { data: signals, count, error } = await query
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching signals:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get signal stats
    const { data: allSignals } = await supabase
      .from('signals')
      .select('status, outcome, resultPips');

    const stats = {
      total: allSignals?.length || 0,
      active: allSignals?.filter(s => s.status === 'active').length || 0,
      closed: allSignals?.filter(s => s.status !== 'active').length || 0,
      wins: allSignals?.filter(s => s.outcome === 'win').length || 0,
      losses: allSignals?.filter(s => s.outcome === 'loss').length || 0,
      totalPips: allSignals?.reduce((sum, s) => sum + (s.resultPips || 0), 0) || 0,
    };

    return NextResponse.json({
      success: true,
      data: signals,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin signals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete signal
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const signalId = searchParams.get('signalId');

    if (!signalId) {
      return NextResponse.json({ error: 'Signal ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('signals')
      .delete()
      .eq('id', signalId);

    if (error) {
      console.error('Error deleting signal:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin signal delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
