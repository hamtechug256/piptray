'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Search,
  Filter,
  Star,
  Users,
  ChevronDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useMounted } from '@/hooks/use-mounted';
import { ALL_PAIRS, FOREX_MAJORS, COMMODITIES, CRYPTO, INDICES } from '@/lib/constants/pairs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Demo providers data
const DEMO_PROVIDERS = [
  {
    id: '1',
    displayName: 'FX Pro Uganda',
    bio: 'Professional forex trader with 5+ years experience. Specializing in EUR/USD and XAU/USD with a focus on technical analysis and price action.',
    avatar: null,
    tier: 'verified' as const,
    winRate: 72,
    totalPips: 2450,
    totalSignals: 156,
    monthlyPrice: 100000,
    weeklyPrice: 30000,
    quarterlyPrice: 270000,
    yearlyPrice: 900000,
    averageRating: 4.5,
    totalReviews: 38,
    pairs: ['EUR/USD', 'XAU/USD', 'GBP/USD'],
    timeframes: ['day', 'swing'],
    subscribers: 45,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    displayName: 'Crypto Alpha Signals',
    bio: 'Cryptocurrency trading expert. Technical analysis and on-chain data combined for high-probability setups in the volatile crypto market.',
    avatar: null,
    tier: 'top' as const,
    winRate: 78,
    totalPips: 3200,
    totalSignals: 89,
    monthlyPrice: 180000,
    weeklyPrice: 50000,
    quarterlyPrice: 480000,
    yearlyPrice: 1600000,
    averageRating: 4.8,
    totalReviews: 67,
    pairs: ['BTC/USD', 'ETH/USD', 'SOL/USD'],
    timeframes: ['swing', 'position'],
    subscribers: 82,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    displayName: 'Gold Rush Trading',
    bio: 'XAU/USD specialist. Pure price action analysis with key levels. Over 200 signals with consistent performance.',
    avatar: null,
    tier: 'verified' as const,
    winRate: 68,
    totalPips: 1890,
    totalSignals: 234,
    monthlyPrice: 85000,
    weeklyPrice: 25000,
    quarterlyPrice: 230000,
    yearlyPrice: 800000,
    averageRating: 4.3,
    totalReviews: 29,
    pairs: ['XAU/USD', 'XAG/USD'],
    timeframes: ['scalp', 'day'],
    subscribers: 38,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    displayName: 'Forex Mastery UG',
    bio: 'Comprehensive forex analysis covering major and cross pairs. Combining fundamental and technical analysis for consistent results.',
    avatar: null,
    tier: 'registered' as const,
    winRate: 65,
    totalPips: 1200,
    totalSignals: 78,
    monthlyPrice: 65000,
    weeklyPrice: 20000,
    quarterlyPrice: 175000,
    yearlyPrice: 600000,
    averageRating: 4.1,
    totalReviews: 15,
    pairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'],
    timeframes: ['day', 'swing'],
    subscribers: 22,
    isVerified: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    displayName: 'Index Hunter',
    bio: 'Specializing in US30, US500, and NAS100. Precision entries on major indices with clear risk management.',
    avatar: null,
    tier: 'verified' as const,
    winRate: 71,
    totalPips: 890,
    totalSignals: 45,
    monthlyPrice: 120000,
    weeklyPrice: 35000,
    quarterlyPrice: 320000,
    yearlyPrice: 1100000,
    averageRating: 4.6,
    totalReviews: 21,
    pairs: ['US30', 'US500', 'NAS100'],
    timeframes: ['day'],
    subscribers: 31,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    displayName: 'Swing Profit Pro',
    bio: 'Swing trading specialist capturing multi-day moves. Patient approach with high reward-to-risk ratios.',
    avatar: null,
    tier: 'new' as const,
    winRate: 62,
    totalPips: 560,
    totalSignals: 28,
    monthlyPrice: 50000,
    weeklyPrice: 15000,
    quarterlyPrice: 135000,
    yearlyPrice: 480000,
    averageRating: 3.9,
    totalReviews: 8,
    pairs: ['EUR/USD', 'GBP/JPY', 'XAU/USD'],
    timeframes: ['swing'],
    subscribers: 14,
    isVerified: false,
    createdAt: new Date().toISOString(),
  },
];

const tierColors: Record<string, string> = {
  new: 'badge-new',
  registered: 'badge-registered',
  verified: 'badge-verified',
  top: 'badge-top',
  elite: 'badge-elite',
};

const tierIcons: Record<string, string> = {
  new: '🔰',
  registered: '📝',
  verified: '✅',
  top: '🏆',
  elite: '💎',
};

export default function ProvidersPage() {
  const mounted = useMounted();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'winRate' | 'subscribers' | 'averageRating'>('winRate');
  const [filterPair, setFilterPair] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    let result = [...DEMO_PROVIDERS];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.displayName.toLowerCase().includes(searchLower) ||
          p.pairs.some((pair) => pair.toLowerCase().includes(searchLower))
      );
    }

    // Pair filter
    if (filterPair !== 'all') {
      result = result.filter((p) => p.pairs.includes(filterPair));
    }

    // Tier filter
    if (filterTier !== 'all') {
      result = result.filter((p) => p.tier === filterTier);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'winRate':
          return b.winRate - a.winRate;
        case 'subscribers':
          return b.subscribers - a.subscribers;
        case 'averageRating':
          return b.averageRating - a.averageRating;
        default:
          return 0;
      }
    });

    return result;
  }, [search, sortBy, filterPair, filterTier]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get unique pairs from all providers
  const allPairs = [...new Set(DEMO_PROVIDERS.flatMap((p) => p.pairs))].sort();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Signal Providers</h1>
          <p className="text-muted-foreground">
            Browse verified providers with real performance data
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-2xl p-4 mb-6 border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="Search providers or pairs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="winRate">Win Rate</SelectItem>
                  <SelectItem value="subscribers">Subscribers</SelectItem>
                  <SelectItem value="averageRating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(filterPair !== 'all' || filterTier !== 'all') && (
                <Badge variant="secondary" className="ml-1">
                  {(filterPair !== 'all' ? 1 : 0) + (filterTier !== 'all' ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Trading Pair</label>
                  <Select value={filterPair} onValueChange={setFilterPair}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Pairs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pairs</SelectItem>
                      {allPairs.map((pair) => (
                        <SelectItem key={pair} value={pair}>
                          {pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Provider Tier</label>
                  <Select value={filterTier} onValueChange={setFilterTier}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="verified">✅ Verified</SelectItem>
                      <SelectItem value="top">🏆 Top Provider</SelectItem>
                      <SelectItem value="elite">💎 Elite</SelectItem>
                      <SelectItem value="registered">📝 Registered</SelectItem>
                      <SelectItem value="new">🔰 New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredProviders.length}</span>{' '}
            providers
          </p>
          {(filterPair !== 'all' || filterTier !== 'all' || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterPair('all');
                setFilterTier('all');
                setSearch('');
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Providers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider, i) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full card-hover overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={provider.avatar || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {provider.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{provider.displayName}</h3>
                        <Badge className={tierColors[provider.tier]} variant="secondary">
                          {tierIcons[provider.tier]}{' '}
                          {provider.tier.charAt(0).toUpperCase() + provider.tier.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{provider.bio}</p>

                    {/* Pairs */}
                    <div className="flex flex-wrap gap-1">
                      {provider.pairs.slice(0, 4).map((pair) => (
                        <Badge key={pair} variant="outline" className="text-xs">
                          {pair}
                        </Badge>
                      ))}
                      {provider.pairs.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.pairs.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 border-t border-border">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {provider.winRate}%
                      </div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{provider.totalPips.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Pips</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{provider.totalSignals}</div>
                      <div className="text-xs text-muted-foreground">Signals</div>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold">{formatPrice(provider.monthlyPrice)}</span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{provider.averageRating}</span>
                        <span className="text-muted-foreground text-sm">
                          ({provider.totalReviews})
                        </span>
                      </div>
                    </div>
                    <Link href={`/provider/${provider.id}`}>
                      <Button className="w-full btn-primary">View Profile</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No providers found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
