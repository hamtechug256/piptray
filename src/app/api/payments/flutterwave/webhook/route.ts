import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Flutterwave configuration
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_WEBHOOK_SECRET = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

/**
 * Verify Flutterwave webhook signature
 */
function verifyWebhookSignature(signature: string | null, body: string): boolean {
  if (!FLUTTERWAVE_WEBHOOK_SECRET) {
    console.warn('FLUTTERWAVE_WEBHOOK_SECRET not configured - skipping verification');
    return true;
  }
  
  if (!signature) {
    console.error('Missing webhook signature');
    return false;
  }
  
  // Flutterwave uses the verification hash directly
  return signature === FLUTTERWAVE_WEBHOOK_SECRET;
}

/**
 * POST /api/payments/flutterwave/webhook
 * Handles Flutterwave webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    console.log('Flutterwave webhook received:', JSON.stringify(body, null, 2));
    
    // Verify signature
    const signature = request.headers.get('verif-hash');
    if (!verifyWebhookSignature(signature, rawBody)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { event, data } = body;

    // Handle successful charge
    if (event === 'charge.completed' && data?.status === 'successful') {
      return await handleSuccessfulPayment(data);
    }

    // Handle failed charge
    if (event === 'charge.completed' && data?.status === 'failed') {
      return await handleFailedPayment(data);
    }

    // Handle transfer events (for withdrawals)
    if (event === 'transfer.completed') {
      return await handleTransferComplete(data);
    }

    // Acknowledge other events
    return NextResponse.json({ status: 'success', message: 'Event received' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(data: Record<string, unknown>) {
  const txRef = data.tx_ref as string;
  const paymentId = txRef?.split('_')[1];

  if (!paymentId) {
    console.error('Could not extract payment ID from tx_ref:', txRef);
    return NextResponse.json({ error: 'Invalid transaction reference' }, { status: 400 });
  }

  const supabase = await createClient();

  // Get payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (paymentError || !payment) {
    console.error('Payment not found:', paymentId);
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  // Skip if already confirmed
  if (payment.status === 'confirmed') {
    return NextResponse.json({ status: 'success', message: 'Already processed' });
  }

  // Calculate fees
  const platformFeePercent = 10; // 10% platform fee
  const platformFee = payment.amount * (platformFeePercent / 100);
  const providerAmount = payment.amount - platformFee;

  // Update payment status
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'confirmed',
      transaction_id: data.id?.toString(),
      momo_reference: data.flw_ref as string,
      platform_fee: platformFee,
      provider_amount: providerAmount,
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId);

  if (updateError) {
    console.error('Error updating payment:', updateError);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }

  // Update subscription if exists
  if (payment.subscription_id) {
    await supabase
      .from('subscriptions')
      .update({
        payment_status: 'confirmed',
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.subscription_id);
  }

  // Create notification for user
  await supabase.from('notifications').insert({
    user_id: payment.user_id,
    type: 'payment_confirmed',
    title: 'Payment Confirmed!',
    message: `Your payment of ${payment.currency} ${payment.amount.toLocaleString()} has been confirmed.`,
    created_at: new Date().toISOString(),
  });

  // Create notification for provider
  if (payment.provider_id) {
    const { data: provider } = await supabase
      .from('providers')
      .select('user_id')
      .eq('id', payment.provider_id)
      .single();

    if (provider) {
      await supabase.from('notifications').insert({
        user_id: provider.user_id,
        type: 'new_subscriber',
        title: 'New Subscriber!',
        message: `You have a new subscriber! ${providerAmount.toLocaleString()} ${payment.currency} will be credited to your wallet.`,
        created_at: new Date().toISOString(),
      });

      // Increment subscriber count
      await supabase.rpc('increment_subscribers', { provider_id: payment.provider_id });
    }
  }

  console.log('Payment confirmed successfully:', paymentId);
  return NextResponse.json({ status: 'success', message: 'Payment confirmed' });
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(data: Record<string, unknown>) {
  const txRef = data.tx_ref as string;
  const paymentId = txRef?.split('_')[1];

  if (!paymentId) {
    return NextResponse.json({ error: 'Invalid transaction reference' }, { status: 400 });
  }

  const supabase = await createClient();

  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      transaction_id: data.id?.toString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId);

  // Get payment for notification
  const { data: payment } = await supabase
    .from('payments')
    .select('user_id, currency, amount')
    .eq('id', paymentId)
    .single();

  if (payment) {
    // Notify user
    await supabase.from('notifications').insert({
      user_id: payment.user_id,
      type: 'system',
      title: 'Payment Failed',
      message: `Your payment of ${payment.currency} ${payment.amount.toLocaleString()} failed. Please try again.`,
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ status: 'success', message: 'Payment failure recorded' });
}

/**
 * Handle transfer complete (for provider withdrawals)
 */
async function handleTransferComplete(data: Record<string, unknown>) {
  console.log('Transfer completed:', data);
  // Implement withdrawal handling if needed
  return NextResponse.json({ status: 'success' });
}
