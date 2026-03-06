import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

    // Fetch all stats in parallel
    const [
      usersResult,
      providersResult,
      subscribersResult,
      subscriptionsResult,
      paymentsResult,
      signalsResult,
      applicationsResult,
      recentPaymentsResult,
      recentUsersResult,
    ] = await Promise.all([
      // Total users
      supabase.from('users').select('id', { count: 'exact', head: true }),
      // Total providers
      supabase.from('providers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      // Subscribers count
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'subscriber'),
      // Active subscriptions
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      // Total revenue
      supabase.from('payments').select('amount').eq('status', 'confirmed').eq('type', 'subscription'),
      // Total signals
      supabase.from('signals').select('id', { count: 'exact', head: true }),
      // Pending applications
      supabase.from('provider_applications').select('id', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
      // Recent payments
      supabase.from('payments').select('id, amount, currency, payment_method, status, created_at, user:users(email, name)').order('created_at', { ascending: false }).limit(5),
      // Recent users
      supabase.from('users').select('id, email, name, role, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    // Calculate total revenue
    const totalRevenue = paymentsResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Get monthly stats (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const { data: monthlyData } = await supabase
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'confirmed')
      .gte('created_at', sixMonthsAgo.toISOString());

    // Group by month
    const monthlyRevenue: Record<string, number> = {};
    const monthlyUsers: Record<string, number> = {};
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      monthlyRevenue[key] = 0;
      monthlyUsers[key] = 0;
    }

    monthlyData?.forEach(p => {
      const key = p.created_at?.slice(0, 7);
      if (key && monthlyRevenue[key] !== undefined) {
        monthlyRevenue[key] += p.amount || 0;
      }
    });

    const { data: monthlyUserData } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString());

    monthlyUserData?.forEach(u => {
      const key = u.created_at?.slice(0, 7);
      if (key && monthlyUsers[key] !== undefined) {
        monthlyUsers[key]++;
      }
    });

    // Subscription distribution
    const { data: subscriptionPlans } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('status', 'active');

    const planDistribution: Record<string, number> = {
      weekly: 0,
      monthly: 0,
      quarterly: 0,
      yearly: 0,
    };

    subscriptionPlans?.forEach(s => {
      if (s.plan && planDistribution[s.plan] !== undefined) {
        planDistribution[s.plan]++;
      }
    });

    const stats = {
      totalUsers: usersResult.count || 0,
      totalProviders: providersResult.count || 0,
      totalSubscribers: subscribersResult.count || 0,
      activeSubscriptions: subscriptionsResult.count || 0,
      totalRevenue,
      totalSignals: signalsResult.count || 0,
      pendingApplications: applicationsResult.count || 0,
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue,
      })),
      monthlyUsers: Object.entries(monthlyUsers).map(([month, count]) => ({
        month,
        count,
      })),
      planDistribution: Object.entries(planDistribution).map(([plan, count]) => ({
        plan,
        count,
      })),
      recentPayments: (recentPaymentsResult.data || []).map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        paymentMethod: p.payment_method,
        status: p.status,
        createdAt: p.created_at,
        user: p.user,
      })),
      recentUsers: (recentUsersResult.data || []).map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.created_at,
      })),
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
