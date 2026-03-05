import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/subscriptions - List user's subscriptions
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        provider:providers(
          id,
          "displayName",
          tier,
          avatar,
          "winRate",
          user:users(id, name, avatar)
        )
      `)
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching subscriptions:', error);
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

// POST /api/subscriptions - Create new subscription
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

    const body = await request.json();
    const { provider_id, plan, payment_method } = body;

    if (!provider_id || !plan) {
      return NextResponse.json(
        { success: false, error: 'Missing provider_id or plan' },
        { status: 400 }
      );
    }

    // Get provider with ACTUAL column names
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, "displayName", currency, subscribers, "monthlyPrice", weeklyprice, quarterlyprice, yearlyprice, weekly_price, quarterly_price, yearly_price')
      .eq('id', provider_id)
      .single();

    if (providerError || !provider) {
      console.error('Provider error:', providerError);
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if user already has active subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', authUser.id)
      .eq('provider_id', provider_id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSub) {
      return NextResponse.json(
        { success: false, error: 'You already have an active subscription to this provider' },
        { status: 400 }
      );
    }

    // Calculate amount and duration based on plan
    // Try both naming conventions since DB has duplicates
    const planPrices: Record<string, { price: number; days: number }> = {
      weekly: { price: provider.weekly_price || provider.weeklyprice || 0, days: 7 },
      monthly: { price: provider.monthlyPrice || provider.monthly_price || 0, days: 30 },
      quarterly: { price: provider.quarterly_price || provider.quarterlyprice || 0, days: 90 },
      yearly: { price: provider.yearly_price || provider.yearlyprice || 0, days: 365 },
    };

    const selectedPlan = planPrices[plan];
    if (!selectedPlan) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Calculate platform fee (5%)
    const platformFee = Math.round(selectedPlan.price * 0.05);
    const providerAmount = selectedPlan.price - platformFee;

    // Create subscription
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + selectedPlan.days);

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: authUser.id,
        provider_id,
        plan,
        amount: selectedPlan.price,
        currency: provider.currency || 'UGX',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_method,
        payment_status: 'pending',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (subError) {
      console.error('Error creating subscription:', subError);
      return NextResponse.json(
        { success: false, error: subError.message },
        { status: 500 }
      );
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: authUser.id,
        provider_id,
        subscription_id: subscription.id,
        amount: selectedPlan.price,
        platform_fee: platformFee,
        provider_amount: providerAmount,
        currency: provider.currency || 'UGX',
        type: 'subscription',
        payment_method: payment_method || 'mtn_momo',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
    }

    // Update provider subscriber count
    await supabase
      .from('providers')
      .update({ 
        subscribers: (provider.subscribers || 0) + 1,
      })
      .eq('id', provider_id);

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        payment,
        amount: selectedPlan.price,
        currency: provider.currency || 'UGX',
      },
      message: 'Subscription created! Please complete payment.',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
