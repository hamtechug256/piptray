import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/payments - List user's payments
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

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        provider:providers(id, display_name),
        subscription:subscriptions(id, plan)
      `)
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
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

// POST /api/payments - Verify payment (for Flutterwave callback)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { payment_id, transaction_id, status, tx_hash, momo_reference } = body;

    if (!payment_id) {
      return NextResponse.json(
        { success: false, error: 'Missing payment_id' },
        { status: 400 }
      );
    }

    // Get payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    const updateData: Record<string, unknown> = {
      status: status || 'confirmed',
      updated_at: new Date().toISOString(),
    };

    if (transaction_id) updateData.transaction_id = transaction_id;
    if (tx_hash) updateData.tx_hash = tx_hash;
    if (momo_reference) updateData.momo_reference = momo_reference;
    if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', payment_id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // If payment confirmed, update subscription
    if (status === 'confirmed' && payment.subscription_id) {
      await supabase
        .from('subscriptions')
        .update({ 
          payment_status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.subscription_id);

      // Create notification for user
      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
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
            message: `You have a new subscriber. ${payment.provider_amount?.toLocaleString()} ${payment.currency} will be credited to your wallet.`,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
