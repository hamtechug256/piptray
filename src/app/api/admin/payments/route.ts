import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// GET - List all payments
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
    const method = searchParams.get('method') || '';
    const type = searchParams.get('type') || '';
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('payments')
      .select(`
        *,
        user:users(id, email, name),
        provider:providers(id, displayName)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (method) {
      query = query.eq('paymentMethod', method);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: payments, count, error } = await query
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get summary stats
    const { data: statsData } = await supabase
      .from('payments')
      .select('amount, status, type');

    const stats = {
      total: statsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      confirmed: statsData?.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      pending: statsData?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      failed: statsData?.filter(p => p.status === 'failed').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      count: statsData?.length || 0,
    };

    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Admin payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update payment status
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
    const { paymentId, status } = body;

    if (!paymentId || !status) {
      return NextResponse.json({ error: 'Payment ID and status are required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'confirmed') {
      updateData.confirmedAt = new Date().toISOString();
    }

    const { error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId);

    if (error) {
      console.error('Error updating payment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If confirming a subscription payment, activate the subscription
    if (status === 'confirmed') {
      const { data: payment } = await supabase
        .from('payments')
        .select('subscriptionId')
        .eq('id', paymentId)
        .single();

      if (payment?.subscriptionId) {
        await supabase
          .from('subscriptions')
          .update({ paymentStatus: 'confirmed' })
          .eq('id', payment.subscriptionId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin payment update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
