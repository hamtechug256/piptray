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
  AlertCircle,
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
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Signal {
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
}

interface Provider {
  id: string;
  displayName: string;
  bio: string | null;
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
  signals: Signal[];
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

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const mounted = useMounted();
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  // Fetch provider data from API
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await fetch(`/api/providers/${params.id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setProvider(data.data);
        } else {
          setError('Provider not found');
        }
      } catch (err) {
        console.error('Error fetching provider:', err);
        setError('Failed to load provider');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProvider();
    }
  }, [params.id]);

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!provider) return;
    
    setSubscribing(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          plan: selectedPlan,
          amount: getPlanPrice(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.paymentUrl) {
          // Redirect to payment
          window.location.href = data.paymentUrl;
        } else {
          // Free or direct subscription
          router.push('/dashboard/subscriber?subscribed=true');
        }
      } else {
        setError(data.error || 'Failed to create subscription');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Failed to process subscription');
    } finally {
      setSubscribing(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Provider Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'This provider does not exist or has been removed.'}</p>
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

                <p className="text-muted-foreground mb-6">{provider.bio || 'No bio provided.'}</p>

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
                    {provider.signals && provider.signals.length > 0 ? (
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
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="w-12 h-12 mx-auto mb-4" />
                        <p>No signals yet. Check back soon!</p>
                      </div>
                    )}
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
                        {provider.pairs && provider.pairs.length > 0 ? (
                          provider.pairs.map((pair) => (
                            <Badge key={pair} variant="outline">
                              {pair}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No pairs specified</span>
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Timeframes</h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.timeframes && provider.timeframes.length > 0 ? (
                          provider.timeframes.map((tf) => (
                            <Badge key={tf} variant="secondary">
                              {tf.charAt(0).toUpperCase() + tf.slice(1)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No timeframes specified</span>
                        )}
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
                <Button className="w-full btn-primary h-12" onClick={handleSubscribe} disabled={subscribing}>
                  {subscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
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
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
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
                  disabled={subscribing}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 btn-primary"
                  onClick={handleSubscribe}
                  disabled={subscribing}
                >
                  {subscribing ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
