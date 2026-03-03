// ============================================
// CURRENCY PAIRS
// ============================================

export const FOREX_MAJORS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
] as const;

export const FOREX_CROSSES = [
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
  'AUD/JPY',
  'EUR/AUD',
  'GBP/AUD',
  'EUR/CHF',
  'GBP/CHF',
  'AUD/NZD',
  'EUR/NZD',
  'GBP/NZD',
] as const;

export const COMMODITIES = [
  'XAU/USD', // Gold
  'XAG/USD', // Silver
  'WTI/USD', // Crude Oil
  'BRENT/USD', // Brent Oil
  'NG/USD', // Natural Gas
] as const;

export const INDICES = [
  'US30', // Dow Jones
  'US500', // S&P 500
  'NAS100', // Nasdaq 100
  'UK100', // FTSE 100
  'GER40', // DAX 40
  'FRA40', // CAC 40
  'JPN225', // Nikkei 225
  'AUS200', // ASX 200
] as const;

export const CRYPTO = [
  'BTC/USD',
  'ETH/USD',
  'XRP/USD',
  'SOL/USD',
  'BNB/USD',
  'ADA/USD',
  'DOGE/USD',
  'DOT/USD',
  'MATIC/USD',
  'LINK/USD',
] as const;

export const ALL_PAIRS = [
  ...FOREX_MAJORS,
  ...FOREX_CROSSES,
  ...COMMODITIES,
  ...INDICES,
  ...CRYPTO,
] as const;

export type CurrencyPair = (typeof ALL_PAIRS)[number];

// Pair categories for filtering
export const PAIR_CATEGORIES = [
  { id: 'forex-majors', name: 'Forex Majors', pairs: FOREX_MAJORS },
  { id: 'forex-crosses', name: 'Forex Crosses', pairs: FOREX_CROSSES },
  { id: 'commodities', name: 'Commodities', pairs: COMMODITIES },
  { id: 'indices', name: 'Indices', pairs: INDICES },
  { id: 'crypto', name: 'Crypto', pairs: CRYPTO },
] as const;

// Helper function to get pip multiplier for a pair
export function getPipMultiplier(pair: string): number {
  if (pair.includes('JPY')) return 100;
  if (pair.includes('BTC') || pair.includes('ETH')) return 1;
  if (pair.startsWith('XAU') || pair.startsWith('XAG')) return 10;
  return 10000;
}

// Helper function to calculate pips
export function calculatePips(
  pair: string,
  direction: 'BUY' | 'SELL',
  entryPrice: number,
  exitPrice: number
): number {
  const multiplier = getPipMultiplier(pair);
  const diff = direction === 'BUY' 
    ? exitPrice - entryPrice 
    : entryPrice - exitPrice;
  return Math.round(diff * multiplier);
}

// Timeframes
export const TIMEFRAMES = [
  { id: 'scalp', name: 'Scalp', description: 'Minutes to hours' },
  { id: 'day', name: 'Day Trading', description: 'Hours to end of day' },
  { id: 'swing', name: 'Swing Trading', description: 'Days to weeks' },
  { id: 'position', name: 'Position Trading', description: 'Weeks to months' },
] as const;

export type Timeframe = (typeof TIMEFRAMES)[number]['id'];
