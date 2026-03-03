import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Flutterwave API configuration
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

// POST /api/payments/flutterwave - Initialize Flutterwave payment
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

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    const body = await request.json();
    const { 
      payment_id, 
      amount, 
      currency = 'UGX',
      provider_name,
      plan 
    } = body;

    if (!payment_id || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing payment_id or amount' },
        { status: 400 }
      );
    }

    if (!FLUTTERWAVE_SECRET_KEY) {
      // Demo mode - simulate successful payment
      console.log('Demo mode: Simulating Flutterwave payment');
      
      // Update payment as confirmed
      await supabase
        .from('payments')
        .update({ 
          status: 'confirmed',
          transaction_id: `demo_${Date.now()}`,
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment_id);

      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Demo payment successful',
        redirect_url: `/dashboard?payment=success`,
      });
    }

    // Generate unique transaction reference
    const txRef = `piptray_${payment_id}_${Date.now()}`;

    // Initialize Flutterwave payment
    const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/flutterwave/callback`,
        customer: {
          email: authUser.email,
          name: profile?.name || authUser.email?.split('@')[0],
          phonenumber: profile?.phone || '',
        },
        customizations: {
          title: 'PipTray Subscription',
          description: `Subscription to ${provider_name} - ${plan} plan`,
          logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.svg`,
        },
        meta: {
          payment_id,
          user_id: authUser.id,
        },
      }),
    });

    const data = await response.json();

    if (data.status !== 'success') {
      console.error('Flutterwave error:', data);
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to initialize payment' },
        { status: 400 }
      );
    }

    // Save transaction reference to payment
    await supabase
      .from('payments')
      .update({ 
        transaction_id: txRef,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment_id);

    return NextResponse.json({
      success: true,
      data: {
        link: data.data.link,
        tx_ref: txRef,
      },
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Webhook handler for Flutterwave
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (in production)
    // const signature = request.headers.get('verif-hash');
    // if (signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const { event, data } = body;

    if (event === 'charge.completed') {
      const { tx_ref, status } = data;
      
      // Extract payment_id from tx_ref
      const paymentId = tx_ref?.split('_')[1];

      if (!paymentId) {
        return NextResponse.json({ error: 'Invalid transaction reference' }, { status: 400 });
      }

      const supabase = await createClient();

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: status === 'successful' ? 'confirmed' : 'failed',
          transaction_id: data.id?.toString(),
          momo_reference: data.flw_ref,
          confirmed_at: status === 'successful' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      // If successful, update subscription
      if (status === 'successful') {
        const { data: payment } = await supabase
          .from('payments')
          .select('subscription_id, user_id, provider_id')
          .eq('id', paymentId)
          .single();

        if (payment?.subscription_id) {
          await supabase
            .from('subscriptions')
            .update({
              payment_status: 'confirmed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.subscription_id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
