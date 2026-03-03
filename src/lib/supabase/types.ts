// Database types for PipTray

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Users table
export type User = {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  role: 'subscriber' | 'provider' | 'admin';
  avatar: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  googleId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Providers table
export type Provider = {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatar: string | null;
  pairs: string[];
  timeframes: string[];
  currency: string;
  monthlyPrice: number;
  weeklyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  subscribers: number;
  isVerified: boolean;
  verifiedAt: string | null;
  isActive: boolean;
  totalSignals: number;
  winRate: number;
  totalPips: number;
  avgRR: number;
  tier: 'new' | 'registered' | 'verified' | 'top' | 'elite';
  averageRating: number;
  totalReviews: number;
  binanceWallet: string | null;
  ethereumWallet: string | null;
  mtnMomoNumber: string | null;
  airtelMoneyNumber: string | null;
  createdAt: string;
  updatedAt: string;
};

// Signals table
export type Signal = {
  id: string;
  providerId: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  timeframe: string;
  analysis: string | null;
  status: 'active' | 'tp1_hit' | 'tp2_hit' | 'tp3_hit' | 'sl_hit' | 'closed';
  entryPrice: number;
  entryZoneLow: number | null;
  entryZoneHigh: number | null;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number | null;
  takeProfit3: number | null;
  risk: 'low' | 'medium' | 'high';
  chartImage: string | null;
  outcome: 'win' | 'loss' | 'breakeven' | null;
  resultPips: number | null;
  isFree: boolean;
  isPublished: boolean;
  viewsCount: number;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Subscriptions table
export type Subscription = {
  id: string;
  userId: string;
  providerId: string;
  status: 'active' | 'expired' | 'cancelled';
  plan: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  paymentMethod: string | null;
  paymentStatus: string;
  paymentId: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Payments table
export type Payment = {
  id: string;
  userId: string;
  providerId: string | null;
  subscriptionId: string | null;
  amount: number;
  platformFee: number;
  providerAmount: number;
  currency: string;
  type: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string | null;
  txHash: string | null;
  walletAddress: string | null;
  phoneNumber: string | null;
  momoReference: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Notifications table
export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

// Database schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      providers: {
        Row: Provider;
        Insert: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      signals: {
        Row: Signal;
        Insert: Omit<Signal, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Signal, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'createdAt'>;
        Update: Partial<Omit<Notification, 'id' | 'createdAt'>>;
      };
    };
  };
}
