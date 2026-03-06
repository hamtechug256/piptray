import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/providers/me/stats - Get current provider's statistics
export async function GET(request: NextRequest) {
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

    // Get signals count and stats
    const { data: signals, error: signalsError } = await supabase
      .from('signals')
      .select('id, outcome, result_pips, status')
      .eq('provider_id', provider.id);

    if (signalsError) {
      console.error('Error fetching signals:', signalsError);
    }

    // Calculate signal stats
    const totalSignals = signals?.length || 0;
    const closedSignals = signals?.filter(s => s.outcome) || [];
    const winSignals = closedSignals.filter(s => s.outcome === 'win');
    const winRate = closedSignals.length > 0 
      ? Math.round((winSignals.length / closedSignals.length) * 100) 
      : 0;
    const totalPips = signals?.reduce((sum, s) => sum + (s.result_pips || 0), 0) || 0;

    // Get active subscribers count
    const { count: subscribersCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', provider.id)
      .eq('status', 'active');

    // Calculate monthly revenue
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: monthlyPayments } = await supabase
      .from('payments')
      .select('provider_amount')
      .eq('provider_id', provider.id)
      .eq('status', 'confirmed')
      .gte('created_at', firstDayOfMonth.toISOString());

    const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + (p.provider_amount || 0), 0) || 0;

    // Get reviews stats
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', provider.id);

    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 
      ? Number((reviews?.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    // Get recent signals for display
    const { data: recentSignals } = await supabase
      .from('signals')
      .select('id, pair, direction, entry_price, status, created_at, outcome')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get subscriber list
    const { data: subscribers } = await supabase
      .from('subscriptions')
      .select(`
        id,
        plan,
        amount,
        status,
        start_date,
        end_date,
        user:users(id, name, email, avatar)
      `)
      .eq('provider_id', provider.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        // Core stats
        totalSignals,
        winRate,
        totalPips,
        subscribers: subscribersCount || 0,
        monthlyRevenue,
        avgRR: provider.avg_rr || 0,
        rating: averageRating || provider.average_rating || 0,
        totalReviews,
        
        // Provider info
        id: provider.id,
        displayName: provider.display_name,
        tier: provider.tier,
        isVerified: provider.is_verified,
        isActive: provider.is_active,
        bio: provider.bio,
        pairs: provider.pairs,
        timeframes: provider.timeframes,
        
        // Payment info
        binanceWallet: provider.binance_wallet,
        ethereumWallet: provider.ethereum_wallet,
        mtnMomoNumber: provider.mtn_momo_number,
        airtelMoneyNumber: provider.airtel_money_number,
        
        // Recent data
        recentSignals: recentSignals || [],
        recentSubscribers: subscribers || [],
        
        // Revenue breakdown
        weeklyPrice: provider.weekly_price,
        monthlyPrice: provider.monthly_price,
        quarterlyPrice: provider.quarterly_price,
        yearlyPrice: provider.yearly_price,
        currency: provider.currency,
      },
    });
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
