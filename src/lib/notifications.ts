// Notification helper functions
// Use these to create notifications from anywhere in the app

export type NotificationType = 
  | 'new_signal' 
  | 'tp_hit' 
  | 'subscription_expiring' 
  | 'payment_confirmed' 
  | 'new_subscriber' 
  | 'new_review' 
  | 'system';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Create a notification for a user
 * Call this from server-side code (API routes)
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: CreateNotificationParams): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return false;
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        userId,
        type,
        title,
        message,
        data: data || null,
        isRead: false,
        createdAt: new Date().toISOString(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Notification templates for common scenarios
 */
export const notificationTemplates = {
  newSignal: (providerName: string, pair: string) => ({
    type: 'new_signal' as NotificationType,
    title: 'New Signal Available',
    message: `${providerName} just posted a new ${pair} signal. Check it out!`,
  }),
  
  signalTpHit: (pair: string, tp: number) => ({
    type: 'tp_hit' as NotificationType,
    title: 'Take Profit Hit!',
    message: `Your ${pair} signal has hit TP${tp}! 🎉`,
  }),
  
  subscriptionExpiring: (providerName: string, daysLeft: number) => ({
    type: 'subscription_expiring' as NotificationType,
    title: 'Subscription Expiring Soon',
    message: `Your subscription to ${providerName} expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Renew now to continue receiving signals.`,
  }),
  
  paymentConfirmed: (amount: number, currency: string) => ({
    type: 'payment_confirmed' as NotificationType,
    title: 'Payment Confirmed',
    message: `Your payment of ${currency} ${amount.toLocaleString()} has been confirmed. Thank you!`,
  }),
  
  newSubscriber: (subscriberName: string, plan: string) => ({
    type: 'new_subscriber' as NotificationType,
    title: 'New Subscriber!',
    message: `${subscriberName} just subscribed to your ${plan} plan. Welcome them! 🎉`,
  }),
  
  newReview: (reviewerName: string, rating: number) => ({
    type: 'new_review' as NotificationType,
    title: 'New Review Received',
    message: `${reviewerName} left you a ${rating}-star review. Check it out!`,
  }),
};

/**
 * Send notification to multiple users
 */
export async function notifyUsers(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<void> {
  const promises = userIds.map(userId => 
    createNotification({ userId, type, title, message, data })
  );
  
  await Promise.allSettled(promises);
}
