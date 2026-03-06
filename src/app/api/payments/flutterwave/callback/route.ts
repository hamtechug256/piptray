import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

/**
 * GET /api/payments/flutterwave/callback
 * Handles redirect after Flutterwave payment
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;
  
  const status = searchParams.get('status');
  const txRef = searchParams.get('tx_ref');
  const transactionId = searchParams.get('transaction_id');
  
  console.log('Flutterwave callback:', { status, txRef, transactionId });
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;
  
  // Extract payment ID from tx_ref
  const paymentId = txRef?.split('_')[1];
  
  if (!paymentId) {
    return NextResponse.redirect(`${baseUrl}/dashboard?payment=error&message=Invalid transaction`);
  }
  
  try {
    // Verify transaction with Flutterwave
    if (FLUTTERWAVE_SECRET_KEY && transactionId) {
      const verifyResponse = await fetch(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const verifyData = await verifyResponse.json();
      
      if (verifyData.status !== 'success' || verifyData.data?.status !== 'successful') {
        console.error('Transaction verification failed:', verifyData);
        return NextResponse.redirect(
          `${baseUrl}/dashboard?payment=failed&message=Transaction verification failed`
        );
      }
      
      // Transaction is successful - webhook will handle the rest
      console.log('Transaction verified successfully:', verifyData.data);
    }
    
    // Redirect based on status
    if (status === 'successful' || status === 'completed') {
      return NextResponse.redirect(
        `${baseUrl}/dashboard?payment=success&tx_ref=${txRef}`
      );
    } else if (status === 'cancelled') {
      return NextResponse.redirect(
        `${baseUrl}/dashboard?payment=cancelled&tx_ref=${txRef}`
      );
    } else {
      return NextResponse.redirect(
        `${baseUrl}/dashboard?payment=failed&tx_ref=${txRef}`
      );
    }
    
  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.redirect(
      `${baseUrl}/dashboard?payment=error&message=Processing error`
    );
  }
}
