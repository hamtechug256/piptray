// ============================================
// PIPTRAY DATABASE TYPES
// Matches your Supabase database schema
// ============================================

// ============================================
// USER
// ============================================
export type UserRole = 'subscriber' | 'provider' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  role: UserRole;
  avatar: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  googleId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserInsert {
  id?: string;
  email: string;
  name?: string | null;
  password?: string | null;
  role?: UserRole;
  avatar?: string | null;
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  googleId?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserUpdate {
  email?: string;
  name?: string | null;
  password?: string | null;
  role?: UserRole;
  avatar?: string | null;
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  googleId?: string | null;
  lastLoginAt?: string | null;
  updatedAt?: string;
}

// ============================================
// PROVIDER
// ============================================
export type ProviderTier = 'new' | 'registered' | 'verified' | 'top' | 'elite';
export type ProviderStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface Provider {
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
  tier: ProviderTier;
  averageRating: number;
  totalReviews: number;
  binanceWallet: string | null;
  ethereumWallet: string | null;
  mtnMomoNumber: string | null;
  airtelMoneyNumber: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  user?: User;
}

export interface ProviderInsert {
  id?: string;
  userId: string;
  displayName: string;
  bio?: string | null;
  avatar?: string | null;
  pairs?: string[];
  timeframes?: string[];
  currency?: string;
  monthlyPrice?: number;
  weeklyPrice?: number;
  quarterlyPrice?: number;
  yearlyPrice?: number;
  subscribers?: number;
  isVerified?: boolean;
  verifiedAt?: string | null;
  isActive?: boolean;
  totalSignals?: number;
  winRate?: number;
  totalPips?: number;
  avgRR?: number;
  tier?: ProviderTier;
  averageRating?: number;
  totalReviews?: number;
  binanceWallet?: string | null;
  ethereumWallet?: string | null;
  mtnMomoNumber?: string | null;
  airtelMoneyNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderUpdate {
  displayName?: string;
  bio?: string | null;
  avatar?: string | null;
  pairs?: string[];
  timeframes?: string[];
  currency?: string;
  monthlyPrice?: number;
  weeklyPrice?: number;
  quarterlyPrice?: number;
  yearlyPrice?: number;
  subscribers?: number;
  isVerified?: boolean;
  verifiedAt?: string | null;
  isActive?: boolean;
  totalSignals?: number;
  winRate?: number;
  totalPips?: number;
  avgRR?: number;
  tier?: ProviderTier;
  averageRating?: number;
  totalReviews?: number;
  binanceWallet?: string | null;
  ethereumWallet?: string | null;
  mtnMomoNumber?: string | null;
  airtelMoneyNumber?: string | null;
  updatedAt?: string;
}

// ============================================
// SIGNAL
// ============================================
export type SignalDirection = 'BUY' | 'SELL';
export type SignalStatus = 'active' | 'tp1_hit' | 'tp2_hit' | 'tp3_hit' | 'sl_hit' | 'closed';
export type SignalTimeframe = 'scalp' | 'day' | 'swing' | 'position';
export type SignalRisk = 'low' | 'medium' | 'high';
export type SignalOutcome = 'win' | 'loss' | 'breakeven';

export interface Signal {
  id: string;
  providerId: string;
  pair: string;
  direction: SignalDirection;
  timeframe: string;
  analysis: string | null;
  status: SignalStatus;
  entryPrice: number;
  entryZoneLow: number | null;
  entryZoneHigh: number | null;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number | null;
  takeProfit3: number | null;
  risk: SignalRisk;
  chartImage: string | null;
  outcome: SignalOutcome | null;
  resultPips: number | null;
  isFree: boolean;
  isPublished: boolean;
  viewsCount: number;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  provider?: Provider;
}

export interface SignalInsert {
  id?: string;
  providerId: string;
  pair: string;
  direction: SignalDirection;
  timeframe: string;
  analysis?: string | null;
  status?: SignalStatus;
  entryPrice: number;
  entryZoneLow?: number | null;
  entryZoneHigh?: number | null;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number | null;
  takeProfit3?: number | null;
  risk?: SignalRisk;
  chartImage?: string | null;
  outcome?: SignalOutcome | null;
  resultPips?: number | null;
  isFree?: boolean;
  isPublished?: boolean;
  viewsCount?: number;
  closedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignalUpdate {
  pair?: string;
  direction?: SignalDirection;
  timeframe?: string;
  analysis?: string | null;
  status?: SignalStatus;
  entryPrice?: number;
  entryZoneLow?: number | null;
  entryZoneHigh?: number | null;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number | null;
  takeProfit3?: number | null;
  risk?: SignalRisk;
  chartImage?: string | null;
  outcome?: SignalOutcome | null;
  resultPips?: number | null;
  isFree?: boolean;
  isPublished?: boolean;
  viewsCount?: number;
  closedAt?: string | null;
  updatedAt?: string;
}

// ============================================
// SUBSCRIPTION
// ============================================
export type SubscriptionPlan = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface Subscription {
  id: string;
  userId: string;
  providerId: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
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
  
  // Joined data
  user?: User;
  provider?: Provider;
}

export interface SubscriptionInsert {
  id?: string;
  userId: string;
  providerId: string;
  status?: SubscriptionStatus;
  plan: SubscriptionPlan;
  amount: number;
  currency?: string;
  startDate?: string;
  endDate: string;
  paymentMethod?: string | null;
  paymentStatus?: string;
  paymentId?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionUpdate {
  status?: SubscriptionStatus;
  plan?: SubscriptionPlan;
  amount?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string | null;
  paymentStatus?: string;
  paymentId?: string | null;
  cancelledAt?: string | null;
  updatedAt?: string;
}

// ============================================
// PAYMENT
// ============================================
export type PaymentMethod = 'crypto' | 'mtn_momo' | 'airtel_money' | 'card';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';
export type PaymentType = 'subscription' | 'withdrawal';

export interface Payment {
  id: string;
  userId: string;
  providerId: string | null;
  subscriptionId: string | null;
  amount: number;
  platformFee: number;
  providerAmount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string | null;
  txHash: string | null;
  walletAddress: string | null;
  phoneNumber: string | null;
  momoReference: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  user?: User;
  provider?: Provider;
  subscription?: Subscription;
}

export interface PaymentInsert {
  id?: string;
  userId: string;
  providerId?: string | null;
  subscriptionId?: string | null;
  amount: number;
  platformFee?: number;
  providerAmount?: number;
  currency?: string;
  type: PaymentType;
  status?: PaymentStatus;
  paymentMethod: string;
  transactionId?: string | null;
  txHash?: string | null;
  walletAddress?: string | null;
  phoneNumber?: string | null;
  momoReference?: string | null;
  confirmedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// PROVIDER APPLICATION
// ============================================
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type TradingStyle = 'scalping' | 'day_trading' | 'swing_trading' | 'position_trading';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

export interface ProviderApplication {
  id: string;
  userId: string;
  status: ApplicationStatus;
  
  // Trading Background
  tradingExperience: number; // years
  experienceLevel: ExperienceLevel;
  tradingStyle: TradingStyle[];
  marketsTraded: string[]; // ['forex', 'crypto', 'stocks', 'indices', 'commodities']
  
  // Performance Info
  averageMonthlySignals: number;
  estimatedWinRate: number | null;
  trackRecordDescription: string | null;
  
  // Social Proof
  telegramChannel: string | null;
  twitterHandle: string | null;
  tradingViewProfile: string | null;
  otherSocialLinks: string | null;
  
  // Motivation
  motivationStatement: string;
  
  // Verification
  identityDocumentUrl: string | null;
  tradingStatementUrl: string | null;
  
  // Admin Review
  reviewedBy: string | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  user?: User;
  reviewer?: User;
}

export interface ProviderApplicationInsert {
  id?: string;
  userId: string;
  status?: ApplicationStatus;
  
  tradingExperience: number;
  experienceLevel: ExperienceLevel;
  tradingStyle: TradingStyle[];
  marketsTraded: string[];
  
  averageMonthlySignals?: number;
  estimatedWinRate?: number | null;
  trackRecordDescription?: string | null;
  
  telegramChannel?: string | null;
  twitterHandle?: string | null;
  tradingViewProfile?: string | null;
  otherSocialLinks?: string | null;
  
  motivationStatement: string;
  
  identityDocumentUrl?: string | null;
  tradingStatementUrl?: string | null;
  
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderApplicationUpdate {
  status?: ApplicationStatus;
  tradingExperience?: number;
  experienceLevel?: ExperienceLevel;
  tradingStyle?: TradingStyle[];
  marketsTraded?: string[];
  averageMonthlySignals?: number;
  estimatedWinRate?: number | null;
  trackRecordDescription?: string | null;
  telegramChannel?: string | null;
  twitterHandle?: string | null;
  tradingViewProfile?: string | null;
  otherSocialLinks?: string | null;
  motivationStatement?: string;
  identityDocumentUrl?: string | null;
  tradingStatementUrl?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  updatedAt?: string;
}

// ============================================
// NOTIFICATION
// ============================================
export type NotificationType = 'new_signal' | 'tp_hit' | 'subscription_expiring' | 'payment_confirmed' | 'new_subscriber' | 'new_review' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationInsert {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead?: boolean;
  readAt?: string | null;
  createdAt?: string;
}

// Empty object type for tables without Update types
export type EmptyObject = Record<string, never>;

// ============================================
// DATABASE TYPES
// ============================================
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      providers: {
        Row: Provider;
        Insert: ProviderInsert;
        Update: ProviderUpdate;
      };
      signals: {
        Row: Signal;
        Insert: SignalInsert;
        Update: SignalUpdate;
      };
      subscriptions: {
        Row: Subscription;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: never;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: never;
      };
      provider_applications: {
        Row: ProviderApplication;
        Insert: ProviderApplicationInsert;
        Update: ProviderApplicationUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// AUTH TYPES
// ============================================
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar: string | null;
  emailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
}
