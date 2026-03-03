import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// CLASS NAME UTILITY
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// FORMATTING UTILITIES
// ============================================

export function formatCurrency(amount: number, currency: string = 'UGX'): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

// ============================================
// SIGNAL UTILITIES
// ============================================

export function calculatePips(
  pair: string,
  direction: 'BUY' | 'SELL',
  entryPrice: number,
  exitPrice: number
): number {
  // JPY pairs have different pip calculation
  const isJpyPair = pair.includes('JPY');
  // Crypto pairs
  const isCrypto = pair.includes('BTC') || pair.includes('ETH');
  
  let multiplier = 10000; // Standard forex
  if (isJpyPair) multiplier = 100;
  if (isCrypto) multiplier = 1;
  
  const diff = direction === 'BUY' 
    ? exitPrice - entryPrice 
    : entryPrice - exitPrice;
  
  return Math.round(diff * multiplier);
}

export function getSignalOutcome(
  status: string
): 'win' | 'loss' | 'breakeven' | 'pending' {
  if (status === 'active') return 'pending';
  if (status.includes('tp')) return 'win';
  if (status === 'sl_hit') return 'loss';
  return 'breakeven';
}

export function getSignalPnL(
  direction: 'BUY' | 'SELL',
  entryPrice: number,
  exitPrice: number
): number {
  if (direction === 'BUY') {
    return exitPrice - entryPrice;
  }
  return entryPrice - exitPrice;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

// ============================================
// SUBSCRIPTION UTILITIES
// ============================================

export function calculateEndDate(
  plan: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
): Date {
  const now = new Date();
  
  switch (plan) {
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      now.setMonth(now.getMonth() + 3);
      break;
    case 'yearly':
      now.setFullYear(now.getFullYear() + 1);
      break;
  }
  
  return now;
}

export function getPlanPrice(
  provider: { weeklyPrice: number; monthlyPrice: number; quarterlyPrice: number; yearlyPrice: number },
  plan: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
): number {
  switch (plan) {
    case 'weekly':
      return provider.weeklyPrice;
    case 'monthly':
      return provider.monthlyPrice;
    case 'quarterly':
      return provider.quarterlyPrice;
    case 'yearly':
      return provider.yearlyPrice;
    default:
      return provider.monthlyPrice;
  }
}

export function calculatePlatformFee(amount: number, method: 'crypto' | 'mtn_momo' | 'airtel_money'): number {
  const feePercent = method === 'crypto' ? 5 : 7;
  return Math.round(amount * (feePercent / 100));
}

// ============================================
// GENERATION UTILITIES
// ============================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// TRADING UTILITIES
// ============================================

export const TRADING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

export function isMarketOpen(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getUTCHours();
  
  // Forex market is closed on weekends (Saturday = 6, Sunday = 0)
  // Market opens Sunday 21:00 UTC and closes Friday 21:00 UTC
  if (day === 6) return false; // Saturday
  if (day === 0 && hour < 21) return false; // Sunday before 21:00
  if (day === 5 && hour >= 21) return false; // Friday after 21:00
  
  return true;
}

export function getNextMarketOpen(): Date {
  const now = new Date();
  const day = now.getDay();
  
  if (day === 6) {
    // Saturday - market opens Sunday 21:00 UTC
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setUTCHours(21, 0, 0, 0);
    return next;
  }
  
  if (day === 0 && now.getUTCHours() < 21) {
    // Sunday before open
    const next = new Date(now);
    next.setUTCHours(21, 0, 0, 0);
    return next;
  }
  
  return now; // Market is open
}
