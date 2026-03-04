'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  BarChart3,
  DollarSign,
  ArrowRight,
  Plus,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-mounted';

interface Signal {
  id: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  status: string;
  createdAt: string;
}

interface ProviderStats {
  totalSignals: number;
  winRate: number;
  totalPips: number;
  subscribers: number;
  monthlyRevenue: number;
  avgRR: number;
  rating: number;
  totalReviews: number;
}

export default function ProviderDashboard() {
  const { user } = useUser();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [stats, setStats] = useState<ProviderStats>({
    totalSignals: 0,
    winRate: 0,
    totalPips: 0,
    subscribers: 0,
    monthlyRevenue: 0,
    avgRR: 0,
    rating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch provider stats
        const statsResponse = await fetch('/api/providers/me/stats', {
          headers: { 'Authorization': `Bearer ${user.id}` },
        });
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data || stats);
        }

        // Fetch signals
        const signalsResponse = await fetch('/api/signals?limit=5', {
          headers: { 'Authorization': `Bearer ${user.id}` },
        });
        const signalsData = await signalsResponse.json();
        if (signalsData.success) {
          setSignals(signalsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(' ')[0] || 'Provider'}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your performance overview
          </p>
        </div>
        <Link href="/dashboard/signals/new">
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Signal
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Signals</p>
                  <p className="text-3xl font-bold">{stats.totalSignals}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-3xl font-bold text-green-600">{stats.winRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                  <p className="text-sm text-muted-foreground">Subscribers</p>
                  <p className="text-3xl font-bold">{stats.subscribers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-3xl font-bold">
                    {formatPrice(stats.monthlyRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
                <CardDescription>Your latest trading signals</CardDescription>
              </div>
              <Link href="/dashboard/signals">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {signals.length > 0 ? (
                <div className="space-y-4">
                  {signals.map((signal) => (
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
                          <p className="text-sm text-muted-foreground">
                            {signal.direction} @ {signal.entryPrice}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          signal.status === 'active'
                            ? 'secondary'
                            : signal.status.includes('tp')
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {signal.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No signals yet</p>
                  <Link href="/dashboard/signals/new">
                    <Button className="mt-4" variant="outline">
                      Create Your First Signal
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/signals/new">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Plus className="w-5 h-5 mr-3" />
                  Create New Signal
                </Button>
              </Link>
              <Link href="/dashboard/subscribers">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Users className="w-5 h-5 mr-3" />
                  Manage Subscribers
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-start h-12">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full justify-start h-12">
                  <DollarSign className="w-5 h-5 mr-3" />
                  Update Pricing
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Pips</span>
                  <span className="font-bold">{stats.totalPips.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg Risk/Reward</span>
                  <span className="font-bold">1:{stats.avgRR}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold">{stats.rating}</span>
                    <span className="text-muted-foreground">({stats.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
