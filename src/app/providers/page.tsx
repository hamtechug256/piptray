'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Search,
  Star,
  Users,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useMounted } from '@/hooks/use-mounted';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Provider {
  id: string;
  displayName: string;
  bio: string | null;
  avatar: string | null;
  tier: string;
  winRate: number;
  totalPips: number;
  totalSignals: number;
  monthlyPrice: number;
  averageRating: number;
  totalReviews: number;
  pairs: string[];
  subscribers: number;
  isVerified: boolean;
}

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
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'winRate' | 'subscribers' | 'averageRating'>('winRate');
  const [filterPair, setFilterPair] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/providers');
        const data = await response.json();
        
        if (data.success) {
          setProviders(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    let result = [...providers];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.displayName.toLowerCase().includes(searchLower) ||
          p.pairs?.some((pair) => pair.toLowerCase().includes(searchLower))
      );
    }

    // Pair filter
    if (filterPair !== 'all') {
      result = result.filter((p) => p.pairs?.includes(filterPair));
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
  }, [providers, search, sortBy, filterPair, filterTier]);

  // Get unique pairs from all providers
  const allPairs = useMemo(() => {
    return [...new Set(providers.flatMap((p) => p.pairs || []))].sort();
  }, [providers]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
        {filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No providers found</h3>
            <p className="text-muted-foreground text-sm">
              {providers.length === 0 
                ? 'Be the first to become a signal provider!'
                : 'Try adjusting your search or filters'
              }
            </p>
            {providers.length === 0 && (
              <Link href="/register?role=provider">
                <Button className="mt-4 btn-primary">
                  Apply as Provider
                </Button>
              </Link>
            )}
          </div>
        ) : (
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
                          <Badge className={tierColors[provider.tier] || 'badge-new'} variant="secondary">
                            {tierIcons[provider.tier] || '🔰'}{' '}
                            {provider.tier?.charAt(0).toUpperCase() + provider.tier?.slice(1) || 'New'}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {provider.bio || 'Professional signal provider'}
                      </p>

                      {/* Pairs */}
                      {provider.pairs && provider.pairs.length > 0 && (
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
                      )}
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
                        <div className="text-xl font-bold">{provider.totalPips?.toLocaleString() || 0}</div>
                        <div className="text-xs text-muted-foreground">Pips</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold">{provider.totalSignals || 0}</div>
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
                          <span className="font-medium">{provider.averageRating || 0}</span>
                          <span className="text-muted-foreground text-sm">
                            ({provider.totalReviews || 0})
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
        )}
      </div>

      <Footer />
    </div>
  );
}
