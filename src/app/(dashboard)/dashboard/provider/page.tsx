'use client';

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

// Demo stats
const DEMO_STATS = {
  totalSignals: 156,
  winRate: 72,
  totalPips: 2450,
  subscribers: 45,
  monthlyRevenue: 4500000,
};

// Demo signals
const DEMO_SIGNALS = [
  {
    id: '1',
    pair: 'EUR/USD',
    direction: 'BUY',
    entryPrice: 1.0850,
    stopLoss: 1.0820,
    takeProfit1: 1.0890,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    pair: 'XAU/USD',
    direction: 'SELL',
    entryPrice: 2025.50,
    stopLoss: 2035.50,
    takeProfit1: 2010.00,
    status: 'tp1_hit',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    pair: 'GBP/USD',
    direction: 'BUY',
    entryPrice: 1.2650,
    stopLoss: 1.2620,
    takeProfit1: 1.2710,
    status: 'sl_hit',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export default function ProviderDashboard() {
  const { user } = useUser();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
                  <p className="text-3xl font-bold">{DEMO_STATS.totalSignals}</p>
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
                  <p className="text-3xl font-bold text-green-600">{DEMO_STATS.winRate}%</p>
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
                  <p className="text-3xl font-bold">{DEMO_STATS.subscribers}</p>
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
                    {formatPrice(DEMO_STATS.monthlyRevenue)}
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
                        <p className="text-sm text-muted-foreground">
                          {signal.direction} @ {signal.entryPrice}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        signal.status === 'active'
                          ? 'secondary'
                          : signal.status === 'tp1_hit'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {signal.status === 'active'
                        ? 'Active'
                        : signal.status === 'tp1_hit'
                        ? 'TP1 Hit'
                        : 'SL Hit'}
                    </Badge>
                  </div>
                ))}
              </div>
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
                  <span className="font-bold">{DEMO_STATS.totalPips.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg Risk/Reward</span>
                  <span className="font-bold">1:2.5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold">4.5</span>
                    <span className="text-muted-foreground">(38 reviews)</span>
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
