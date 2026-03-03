'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  CreditCard,
  Bell,
  Users,
  ArrowRight,
  Star,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-mounted';
import { supabase } from '@/lib/supabase/client';

// Demo subscriptions
const DEMO_SUBSCRIPTIONS = [
  {
    id: '1',
    providerName: 'FX Pro Uganda',
    status: 'active',
    plan: 'monthly',
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    price: 100000,
  },
  {
    id: '2',
    providerName: 'Crypto Alpha Signals',
    status: 'active',
    plan: 'quarterly',
    endDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString(),
    price: 480000,
  },
];

// Demo signals
const DEMO_SIGNALS = [
  {
    id: '1',
    providerName: 'FX Pro Uganda',
    pair: 'EUR/USD',
    direction: 'BUY',
    entryPrice: 1.0850,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    providerName: 'Crypto Alpha Signals',
    pair: 'BTC/USD',
    direction: 'SELL',
    entryPrice: 42500,
    status: 'tp1_hit',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export default function SubscriberDashboard() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [becomingProvider, setBecomingProvider] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleBecomeProvider = async () => {
    if (!user) return;
    
    setBecomingProvider(true);
    try {
      // Update user role in database
      const { error } = await supabase
        .from('users')
        .update({ role: 'provider', updatedAt: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      // Create provider profile
      await supabase
        .from('providers')
        .insert({
          userId: user.id,
          displayName: user.name || user.email.split('@')[0],
          isActive: true,
          tier: 'new',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      // Update local state
      const updatedUser = { ...user, role: 'provider' as const };
      localStorage.setItem('piptray_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Redirect to provider dashboard
      router.push('/dashboard/provider');
    } catch (error) {
      console.error('Error becoming provider:', error);
      alert('Failed to become provider. Please try again.');
    } finally {
      setBecomingProvider(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(' ')[0] || 'Trader'}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your subscriptions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-3xl font-bold">{DEMO_SUBSCRIPTIONS.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Signals Received</p>
                  <p className="text-3xl font-bold">{DEMO_SIGNALS.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Spend</p>
                  <p className="text-3xl font-bold">
                    {formatPrice(DEMO_SUBSCRIPTIONS.reduce((a, s) => a + s.price, 0))}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Become a Provider CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="border-2 border-dashed border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Become a Signal Provider</h3>
                  <p className="text-muted-foreground">
                    Share your trading signals and earn money. Keep 93% of your revenue!
                  </p>
                </div>
              </div>
              <Button 
                size="lg" 
                className="btn-primary"
                onClick={handleBecomeProvider}
                disabled={becomingProvider}
              >
                {becomingProvider ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Start Providing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Subscriptions</CardTitle>
                <CardDescription>Active signal provider subscriptions</CardDescription>
              </div>
              <Link href="/providers">
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Find More
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DEMO_SUBSCRIPTIONS.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium">{sub.providerName}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires {formatDate(sub.endDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </Badge>
                      <p className="text-sm mt-1">{sub.plan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Signals</CardTitle>
                <CardDescription>Latest signals from your providers</CardDescription>
              </div>
              <Link href="/dashboard/signals">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DEMO_SIGNALS.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          signal.direction === 'BUY' ? 'signal-buy' : 'signal-sell'
                        }`}
                      >
                        <TrendingUp
                          className={`w-5 h-5 ${signal.direction === 'SELL' ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{signal.pair}</p>
                        <p className="text-sm text-muted-foreground">{signal.providerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          signal.status === 'active' ? 'secondary' : 'default'
                        }
                      >
                        {signal.status === 'active' ? 'Active' : 'TP1 Hit'}
                      </Badge>
                      <p className="text-xs mt-1 text-muted-foreground">
                        {signal.direction} @ {signal.entryPrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="hero-gradient-bold text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Discover More Providers</h3>
                <p className="text-white/80">
                  Find the best signal providers with verified track records
                </p>
              </div>
              <Link href="/providers">
                <Button variant="secondary" size="lg">
                  Browse Providers
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
