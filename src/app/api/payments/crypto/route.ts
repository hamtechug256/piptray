import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================
// CRYPTO PAYMENT ENDPOINTS
// Supports: USDT (TRC20), Ethereum, Bitcoin
// ============================================

// Platform wallet addresses from environment
const PLATFORM_WALLETS = {
  usdt: process.env.PLATFORM_USDT_WALLET || '',
  ethereum: process.env.PLATFORM_ETHEREUM_WALLET || '',
  bitcoin: process.env.PLATFORM_BITCOIN_WALLET || '',
};

// Network configurations
const NETWORK_CONFIG = {
  usdt: { 
    name: 'USDT (TRC20)', 
    chain: 'TRC20',
    confirmations: 20,
    minConfirmations: 1,
    explorerUrl: 'https://tronscan.org/#/transaction/',
  },
  ethereum: { 
    name: 'Ethereum (ERC20)', 
    chain: 'mainnet',
    confirmations: 12,
    minConfirmations: 3,
    explorerUrl: 'https://etherscan.io/tx/',
  },
  bitcoin: {
    name: 'Bitcoin',
    chain: 'mainnet',
    confirmations: 6,
    minConfirmations: 1,
    explorerUrl: 'https://blockstream.info/tx/',
  },
};

/**
 * GET /api/payments/crypto
 * Returns platform wallet addresses and network info
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get platform settings from database
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('binance_wallet_address, ethereum_wallet_address')
      .single();

    return NextResponse.json({
      success: true,
      wallets: {
        usdt: settings?.binance_wallet_address || PLATFORM_WALLETS.usdt || null,
        ethereum: settings?.ethereum_wallet_address || PLATFORM_WALLETS.ethereum || null,
        bitcoin: PLATFORM_WALLETS.bitcoin || null,
      },
      networks: NETWORK_CONFIG,
      instructions: {
        usdt: 'Send USDT via TRC20 network (Tron). Transaction will be confirmed after 20 network confirmations.',
        ethereum: 'Send ETH via Ethereum mainnet. Transaction will be confirmed after 12 network confirmations.',
        bitcoin: 'Send BTC via Bitcoin mainnet. Transaction will be confirmed after 6 network confirmations.',
      },
    });
  } catch (error) {
    console.error('Error fetching crypto settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet addresses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments/crypto
 * Submit a crypto payment for manual verification
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      payment_id, 
      currency,
      tx_hash,
      from_wallet,
      amount_sent,
    } = body;

    // Validate required fields
    if (!payment_id || !currency || !tx_hash) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: payment_id, currency, tx_hash' },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrency = currency.toLowerCase();
    if (!['usdt', 'ethereum', 'bitcoin'].includes(validCurrency)) {
      return NextResponse.json(
        { success: false, error: 'Invalid currency. Supported: usdt, ethereum, bitcoin' },
        { status: 400 }
      );
    }

    // Get payment record
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

    // Verify payment belongs to user
    if (payment.user_id !== authUser.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check payment is pending
    if (payment.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Payment already ${payment.status}` },
        { status: 400 }
      );
    }

    // Normalize transaction hash
    const normalizedTxHash = tx_hash.trim().toLowerCase();

    // Check for duplicate transaction hash
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('tx_hash', normalizedTxHash)
      .not('status', 'eq', 'failed')
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Transaction hash already used' },
        { status: 400 }
      );
    }

    // Update payment with crypto details
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'pending_verification',
        payment_method: validCurrency,
        tx_hash: normalizedTxHash,
        wallet_address: from_wallet || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment_id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to submit payment' },
        { status: 500 }
      );
    }

    // Create notification for admin
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'crypto_payment_pending',
        title: 'New Crypto Payment',
        message: `New ${validCurrency.toUpperCase()} payment pending verification. Payment ID: ${payment_id}`,
        created_at: new Date().toISOString(),
      }));

      await supabase.from('notifications').insert(notifications);
    }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: authUser.id,
      type: 'system',
      title: 'Payment Submitted',
      message: `Your ${validCurrency.toUpperCase()} payment has been submitted and is pending verification.`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Payment submitted successfully. It will be verified within 24 hours.',
      data: {
        payment_id,
        status: 'pending_verification',
        explorer_url: `${NETWORK_CONFIG[validCurrency as keyof typeof NETWORK_CONFIG].explorerUrl}${normalizedTxHash}`,
      },
    });

  } catch (error) {
    console.error('Crypto payment submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/payments/crypto
 * Admin: Verify and confirm a crypto payment
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { payment_id, action } = body; // action: 'confirm' or 'reject'

    if (!payment_id || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing payment_id or action' },
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

    if (payment.status !== 'pending_verification') {
      return NextResponse.json(
        { success: false, error: `Cannot ${action} payment with status: ${payment.status}` },
        { status: 400 }
      );
    }

    if (action === 'confirm') {
      // Calculate fees
      const platformFeePercent = 10;
      const platformFee = payment.amount * (platformFeePercent / 100);
      const providerAmount = payment.amount - platformFee;

      // Update payment to confirmed
      await supabase
        .from('payments')
        .update({
          status: 'confirmed',
          platform_fee: platformFee,
          provider_amount: providerAmount,
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment_id);

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

      // Notify user
      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        type: 'payment_confirmed',
        title: 'Payment Confirmed!',
        message: `Your crypto payment of ${payment.amount.toLocaleString()} has been confirmed.`,
        created_at: new Date().toISOString(),
      });

      // Notify provider
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
            message: `You have a new subscriber! ${providerAmount.toLocaleString()} will be credited to your wallet.`,
            created_at: new Date().toISOString(),
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed successfully',
      });

    } else if (action === 'reject') {
      // Update payment to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment_id);

      // Notify user
      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        type: 'system',
        title: 'Payment Verification Failed',
        message: 'Your crypto payment could not be verified. Please contact support.',
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Payment rejected',
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "confirm" or "reject"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Crypto verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
