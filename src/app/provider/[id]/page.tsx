'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Star,
  Users,
  Target,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Bell,
  CreditCard,
  Clock,
  Award,
  BarChart3,
  Wallet,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useMounted, useUser } from '@/hooks/use-mounted';
import { Separator } from '@/components/ui/separator';

// Demo provider data
const DEMO_PROVIDERS: Record<string, {
  id: string;
  displayName: string;
  bio: string;
  avatar: string | null;
  tier: 'new' | 'registered' | 'verified' | 'top' | 'elite';
  winRate: number;
  totalPips: number;
  totalSignals: number;
  monthlyPrice: number;
  weeklyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  averageRating: number;
  totalReviews: number;
  pairs: string[];
  timeframes: string[];
  subscribers: number;
  isVerified: boolean;
  signals: Array<{
    id: string;
    pair: string;
    direction: 'BUY' | 'SELL';
    entryPrice: number;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number | null;
    takeProfit3: number | null;
    status: string;
    outcome: 'win' | 'loss' | 'pending';
    pips: number;
    createdAt: string;
  }>;
}> = {
  '1': {
    id: '1',
    displayName: 'FX Pro Uganda',
    bio: 'Professional forex trader with 5+ years experience. Specializing in EUR/USD and XAU/USD with a focus on technical analysis and price action. I believe in quality over quantity - every signal is carefully analyzed before posting.',
    avatar: null,
    tier: 'verified',
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
    signals: [
      { id: 's1', pair: 'EUR/USD', direction: 'BUY', entryPrice: 1.0850, stopLoss: 1.0820, takeProfit1: 1.0890, takeProfit2: 1.0920, takeProfit3: null, status: 'closed', outcome: 'win', pips: 70, createdAt: '2024-01-15' },
      { id: 's2', pair: 'XAU/USD', direction: 'SELL', entryPrice: 2025.50, stopLoss: 2035.50, takeProfit1: 2010.00, takeProfit2: 1995.00, takeProfit3: null, status: 'closed', outcome: 'win', pips: 305, createdAt: '2024-01-14' },
      { id: 's3', pair: 'GBP/USD', direction: 'BUY', entryPrice: 1.2650, stopLoss: 1.2620, takeProfit1: 1.2710, takeProfit2: null, takeProfit3: null, status: 'active', outcome: 'pending', pips: 0, createdAt: '2024-01-16' },
    ],
  },
  '2': {
    id: '2',
    displayName: 'Crypto Alpha Signals',
    bio: 'Cryptocurrency trading expert. Technical analysis and on-chain data combined for high-probability setups in the volatile crypto market. Focused on BTC, ETH, and top altcoins.',
    avatar: null,
    tier: 'top',
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
    signals: [
      { id: 's1', pair: 'BTC/USD', direction: 'BUY', entryPrice: 42500, stopLoss: 41500, takeProfit1: 44500, takeProfit2: 46000, takeProfit3: null, status: 'closed', outcome: 'win', pips: 3500, createdAt: '2024-01-15' },
      { id: 's2', pair: 'ETH/USD', direction: 'SELL', entryPrice: 2550, stopLoss: 2600, takeProfit1: 2400, takeProfit2: null, takeProfit3: null, status: 'active', outcome: 'pending', pips: 0, createdAt: '2024-01-16' },
    ],
  },
  '3': {
    id: '3',
    displayName: 'Gold Rush Trading',
    bio: 'XAU/USD specialist. Pure price action analysis with key levels. Over 200 signals with consistent performance. I trade what I see, not what I think.',
    avatar: null,
    tier: 'verified',
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
    signals: [
      { id: 's1', pair: 'XAU/USD', direction: 'BUY', entryPrice: 2020.00, stopLoss: 2015.00, takeProfit1: 2030.00, takeProfit2: 2040.00, takeProfit3: null, status: 'closed', outcome: 'win', pips: 200, createdAt: '2024-01-15' },
    ],
  },
};

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

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const mounted = useMounted();
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const provider = DEMO_PROVIDERS[params.id as string];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Provider Not Found</h1>
          <p className="text-muted-foreground mb-6">This provider does not exist or has been removed.</p>
          <Link href="/providers">
            <Button>Browse Providers</Button>
          </Link>
        </div>
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

  const getPlanPrice = () => {
    switch (selectedPlan) {
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
  };

  const handleSubscribe = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowSubscribeModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/providers"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Providers
        </Link>

        {/* Provider Header */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Provider Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={provider.avatar || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {provider.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{provider.displayName}</h1>
                      {provider.isVerified && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Badge className={tierColors[provider.tier]} variant="secondary">
                      {tierIcons[provider.tier]}{' '}
                      {provider.tier.charAt(0).toUpperCase() + provider.tier.slice(1)} Provider
                    </Badge>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{provider.bio}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {provider.winRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{provider.totalPips.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Pips</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{provider.totalSignals}</div>
                    <div className="text-sm text-muted-foreground">Signals</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{provider.subscribers}</div>
                    <div className="text-sm text-muted-foreground">Subscribers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="signals" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signals">Recent Signals</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>

              {/* Signals Tab */}
              <TabsContent value="signals">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Signals</CardTitle>
                    <CardDescription>
                      Latest trading signals from this provider
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {provider.signals.map((signal) => (
                        <div
                          key={signal.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                signal.direction === 'BUY'
                                  ? 'signal-buy'
                                  : 'signal-sell'
                              }`}
                            >
                              {signal.direction === 'BUY' ? (
                                <TrendingUp className="w-5 h-5" />
                              ) : (
                                <TrendingUp className="w-5 h-5 rotate-180" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">{signal.pair}</div>
                              <div className="text-sm text-muted-foreground">
                                Entry: {signal.entryPrice} | SL: {signal.stopLoss} | TP: {signal.takeProfit1}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={signal.outcome === 'win' ? 'default' : signal.outcome === 'loss' ? 'destructive' : 'secondary'}
                            >
                              {signal.status === 'active' ? 'Active' : signal.outcome.toUpperCase()}
                            </Badge>
                            {signal.outcome !== 'pending' && (
                              <div className="text-sm mt-1">
                                <span className={signal.outcome === 'win' ? 'text-green-600' : 'text-red-600'}>
                                  {signal.pips} pips
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews ({provider.totalReviews})</CardTitle>
                    <CardDescription>
                      What subscribers say about this provider
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                      <p className="text-lg font-semibold text-foreground mb-2">
                        {provider.averageRating} out of 5
                      </p>
                      <p>Based on {provider.totalReviews} reviews</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Trading Pairs</h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.pairs.map((pair) => (
                          <Badge key={pair} variant="outline">
                            {pair}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Timeframes</h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.timeframes.map((tf) => (
                          <Badge key={tf} variant="secondary">
                            {tf.charAt(0).toUpperCase() + tf.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Subscription */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Subscribe</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-semibold ml-1">{provider.averageRating}</span>
                  </div>
                  <span className="text-muted-foreground">({provider.totalReviews} reviews)</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Selection */}
                <div className="grid grid-cols-2 gap-2">
                  {(['weekly', 'monthly', 'quarterly', 'yearly'] as const).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedPlan === plan
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-sm font-medium capitalize">{plan}</div>
                      <div className="font-bold">{formatPrice(getPlanPrice())}</div>
                    </button>
                  ))}
                </div>

                {/* Price Display */}
                <div className="text-center py-4">
                  <div className="text-3xl font-bold">{formatPrice(getPlanPrice())}</div>
                  <div className="text-muted-foreground">per {selectedPlan.replace('ly', '')}</div>
                </div>

                {/* Subscribe Button */}
                <Button className="w-full btn-primary h-12" onClick={handleSubscribe}>
                  <Bell className="w-4 h-4 mr-2" />
                  Subscribe Now
                </Button>

                {/* Features */}
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Access to all signals</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Real-time notifications</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>24-hour money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Wallet className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-sm">USDT/USDC</div>
                    <div className="text-xs text-muted-foreground">5% platform fee</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="font-medium text-sm">MTN Mobile Money</div>
                    <div className="text-xs text-muted-foreground">7% platform fee</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium text-sm">Airtel Money</div>
                    <div className="text-xs text-muted-foreground">7% platform fee</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Subscription</CardTitle>
              <CardDescription>
                You are about to subscribe to {provider.displayName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span>Plan</span>
                  <span className="font-medium capitalize">{selectedPlan}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Duration</span>
                  <span className="font-medium">
                    {selectedPlan === 'weekly' ? '7 days' : selectedPlan === 'monthly' ? '30 days' : selectedPlan === 'quarterly' ? '90 days' : '365 days'}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-bold">{formatPrice(getPlanPrice())}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSubscribeModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 btn-primary"
                  onClick={() => {
                    alert('Demo mode: Subscription confirmed!');
                    setShowSubscribeModal(false);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
