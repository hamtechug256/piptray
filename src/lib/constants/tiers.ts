// ============================================
// PROVIDER TIERS
// ============================================

import type { ProviderTier } from '@/types/database';

export interface TierConfig {
  id: ProviderTier;
  name: string;
  icon: string;
  color: string;
  bgClass: string;
  textClass: string;
  description: string;
  requirements: {
    minSignals?: number;
    minWinRate?: number;
    minSubscribers?: number;
    verified?: boolean;
  };
  benefits: string[];
}

export const TIERS: TierConfig[] = [
  {
    id: 'new',
    name: 'New Provider',
    icon: '🔰',
    color: 'gray',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-700 dark:text-gray-300',
    description: 'Just getting started on PipTray',
    requirements: {},
    benefits: [
      'Create up to 10 signals per month',
      'Basic analytics',
      'Standard visibility',
    ],
  },
  {
    id: 'registered',
    name: 'Registered',
    icon: '📝',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
    description: 'Completed profile setup',
    requirements: {
      minSignals: 5,
    },
    benefits: [
      'Create up to 30 signals per month',
      'Basic analytics',
      'Improved visibility',
      'Set custom pricing',
    ],
  },
  {
    id: 'verified',
    name: 'Verified',
    icon: '✅',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
    description: 'Verified identity and track record',
    requirements: {
      minSignals: 50,
      minWinRate: 60,
      verified: true,
    },
    benefits: [
      'Unlimited signals',
      'Advanced analytics',
      'Priority visibility',
      'Verified badge',
      'Featured placement',
      'Lower platform fees (5%)',
    ],
  },
  {
    id: 'top',
    name: 'Top Provider',
    icon: '🏆',
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    description: 'Consistently excellent performance',
    requirements: {
      minSignals: 100,
      minWinRate: 70,
      minSubscribers: 20,
      verified: true,
    },
    benefits: [
      'Everything in Verified',
      'Top Provider badge',
      'Homepage featuring',
      'Newsletter mentions',
      'Platform promotions',
      'Priority support',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    icon: '💎',
    color: 'purple',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-300',
    description: 'The top 1% of signal providers',
    requirements: {
      minSignals: 200,
      minWinRate: 75,
      minSubscribers: 50,
      verified: true,
    },
    benefits: [
      'Everything in Top Provider',
      'Elite badge',
      'Dedicated account manager',
      'Custom pricing options',
      'API access',
      'White-label options',
      'Revenue share bonuses',
    ],
  },
];

export function getTierConfig(tier: ProviderTier): TierConfig {
  return TIERS.find(t => t.id === tier) || TIERS[0];
}

export function getTierBadge(tier: ProviderTier): { icon: string; name: string; bgClass: string; textClass: string } {
  const config = getTierConfig(tier);
  return {
    icon: config.icon,
    name: config.name,
    bgClass: config.bgClass,
    textClass: config.textClass,
  };
}

export function calculateTier(stats: {
  totalSignals: number;
  winRate: number;
  subscribers: number;
  isVerified: boolean;
}): ProviderTier {
  // Check from highest to lowest
  if (
    stats.totalSignals >= 200 &&
    stats.winRate >= 75 &&
    stats.subscribers >= 50 &&
    stats.isVerified
  ) {
    return 'elite';
  }

  if (
    stats.totalSignals >= 100 &&
    stats.winRate >= 70 &&
    stats.subscribers >= 20 &&
    stats.isVerified
  ) {
    return 'top';
  }

  if (
    stats.totalSignals >= 50 &&
    stats.winRate >= 60 &&
    stats.isVerified
  ) {
    return 'verified';
  }

  if (stats.totalSignals >= 5) {
    return 'registered';
  }

  return 'new';
}

// ============================================
// RISK LEVELS
// ============================================

export const RISK_LEVELS = [
  {
    id: 'low',
    name: 'Low Risk',
    description: 'Conservative trades with tight stop losses',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
  },
  {
    id: 'medium',
    name: 'Medium Risk',
    description: 'Balanced risk/reward ratio',
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-300',
  },
  {
    id: 'high',
    name: 'High Risk',
    description: 'Aggressive trades with wider stops',
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-300',
  },
] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number]['id'];

// ============================================
// SIGNAL STATUS
// ============================================

export const SIGNAL_STATUSES = [
  {
    id: 'active',
    name: 'Active',
    description: 'Signal is currently active',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  {
    id: 'tp1_hit',
    name: 'TP1 Hit',
    description: 'First take profit target reached',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
  },
  {
    id: 'tp2_hit',
    name: 'TP2 Hit',
    description: 'Second take profit target reached',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
  },
  {
    id: 'tp3_hit',
    name: 'TP3 Hit',
    description: 'Third take profit target reached',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
  },
  {
    id: 'sl_hit',
    name: 'SL Hit',
    description: 'Stop loss was triggered',
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-300',
  },
  {
    id: 'closed',
    name: 'Closed',
    description: 'Signal manually closed',
    color: 'gray',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-700 dark:text-gray-300',
  },
] as const;
