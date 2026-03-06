import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Flutterwave API configuration
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

/**
 * POST /api/payments/flutterwave
 * Initialize a Flutterwave payment
 */
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
      .select('name, phone')
      .eq('id', authUser.id)
      .single();

    const body = await request.json();
    const { 
      payment_id, 
      amount, 
      currency = 'UGX',
      provider_name,
      plan,
      payment_type = 'card', // card, mobilemoneyuganda, mobilemoneyrwanda, mobilemoneykenya, etc.
    } = body;

    // Validate required fields
    if (!payment_id || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing payment_id or amount' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Demo mode - when Flutterwave keys are not configured
    if (!FLUTTERWAVE_SECRET_KEY) {
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

      // Update subscription if exists
      const { data: payment } = await supabase
        .from('payments')
        .select('subscription_id')
        .eq('id', payment_id)
        .single();

      if (payment?.subscription_id) {
        await supabase
          .from('subscriptions')
          .update({ 
            payment_status: 'confirmed',
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.subscription_id);
      }

      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Demo payment successful',
        redirect_url: `/dashboard?payment=success`,
      });
    }

    // Production mode - Initialize Flutterwave payment
    const txRef = `piptray_${payment_id}_${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://piptray.vercel.app';

    // Build payment payload based on payment type
    const payload: Record<string, unknown> = {
      tx_ref: txRef,
      amount,
      currency,
      redirect_url: `${baseUrl}/api/payments/flutterwave/callback`,
      customer: {
        email: authUser.email,
        name: profile?.name || authUser.email?.split('@')[0] || 'Customer',
        phonenumber: profile?.phone || '',
      },
      customizations: {
        title: 'PipTray Subscription',
        description: `${plan || 'Subscription'} - ${provider_name || 'Signal Provider'}`,
        logo: `${baseUrl}/icons/icon-192.png`,
      },
      meta: {
        payment_id,
        user_id: authUser.id,
        plan_name: plan,
        provider_name,
      },
    };

    // Add payment type specific options
    if (payment_type === 'mobilemoneyuganda') {
      payload.payment_options = 'mobilemoneyuganda';
    } else if (payment_type === 'mobilemoneyrwanda') {
      payload.payment_options = 'mobilemoneyrwanda';
    } else if (payment_type === 'mobilemoneykenya') {
      payload.payment_options = 'mobilemoneykenya';
    } else if (payment_type === 'mobilemoneyghana') {
      payload.payment_options = 'mobilemoneyghana';
    } else if (payment_type === 'mpesa') {
      payload.payment_options = 'mpesa';
    } else {
      // Default: allow all payment methods
      payload.payment_options = 'card,mobilemoneyuganda,mobilemoneyrwanda,mobilemoneykenya,mobilemoneyghana,mpesa';
    }

    // Call Flutterwave API
    const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
        public_key: FLUTTERWAVE_PUBLIC_KEY,
      },
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/flutterwave
 * Get Flutterwave configuration status
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    configured: !!FLUTTERWAVE_SECRET_KEY,
    public_key: FLUTTERWAVE_PUBLIC_KEY || null,
    supported_methods: [
      { id: 'card', name: 'Card Payment', currencies: ['UGX', 'USD', 'KES', 'RWF', 'GHS', 'NGN', 'ZAR'] },
      { id: 'mobilemoneyuganda', name: 'MTN/Airtel Money (Uganda)', currencies: ['UGX'] },
      { id: 'mobilemoneykenya', name: 'M-Pesa (Kenya)', currencies: ['KES'] },
      { id: 'mobilemoneyrwanda', name: 'MTN/Airtel Money (Rwanda)', currencies: ['RWF'] },
      { id: 'mobilemoneyghana', name: 'MTN/Vodafone/AirtelTigo (Ghana)', currencies: ['GHS'] },
      { id: 'mpesa', name: 'M-Pesa (Kenya)', currencies: ['KES'] },
    ],
  });
}
