'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-mounted';

// Demo stats
const DEMO_STATS = {
  totalUsers: 2847,
  totalProviders: 52,
  activeSubscriptions: 1893,
  monthlyRevenue: 15750000,
  pendingApprovals: 8,
};

// Demo pending providers
const DEMO_PENDING = [
  { id: '1', name: 'Forex Master UG', email: 'forex@example.com', appliedAt: new Date().toISOString() },
  { id: '2', name: 'Gold Signals Pro', email: 'gold@example.com', appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];

export default function AdminDashboard() {
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
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
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
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{DEMO_STATS.totalUsers.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                  <p className="text-sm text-muted-foreground">Providers</p>
                  <p className="text-3xl font-bold">{DEMO_STATS.totalProviders}</p>
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
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-3xl font-bold">{DEMO_STATS.activeSubscriptions.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Pending Approvals
                </CardTitle>
                <CardDescription>Provider applications awaiting review</CardDescription>
              </div>
              <Badge variant="secondary">{DEMO_STATS.pendingApprovals} pending</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DEMO_PENDING.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">{provider.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
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
              <CardDescription>Platform management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/users">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Users className="w-5 h-5 mr-3" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/dashboard/providers">
                <Button variant="outline" className="w-full justify-start h-12">
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Manage Providers
                </Button>
              </Link>
              <Link href="/dashboard/payments">
                <Button variant="outline" className="w-full justify-start h-12">
                  <DollarSign className="w-5 h-5 mr-3" />
                  View Payments
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full justify-start h-12">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Platform Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
