'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Bell,
  FileText,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalSubscribers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalSignals: number;
  pendingApplications: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  monthlyUsers: Array<{ month: string; count: number }>;
  planDistribution: Array<{ plan: string; count: number }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    user?: { email: string; name: string | null };
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || user.role !== 'admin') return;

      try {
        const response = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${user.id}` },
        });
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      href: '/dashboard/admin/users',
    },
    {
      title: 'Providers',
      value: stats?.totalProviders || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
      href: '/dashboard/admin/providers',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      href: '/dashboard/admin/payments',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      href: '/dashboard/admin/payments',
    },
    {
      title: 'Total Signals',
      value: stats?.totalSignals || 0,
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      href: '/dashboard/admin/signals',
    },
    {
      title: 'Pending Applications',
      value: stats?.pendingApplications || 0,
      icon: Clock,
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/30',
      highlight: (stats?.pendingApplications || 0) > 0,
      href: '/dashboard/admin/applications',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Admin Access
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={stat.href}>
              <Card className={cn(
                'hover:shadow-lg transition-all cursor-pointer',
                stat.highlight && 'border-2 border-red-500/50 animate-pulse'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                      <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.bg)}>
                      <stat.icon className={cn('w-5 h-5', stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Revenue</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                <div className="space-y-3">
                  {stats.monthlyRevenue.map((item, i) => {
                    const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                    const width = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={item.month} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-12">
                          {getMonthName(item.month)}
                        </span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          />
                        </div>
                        <span className="text-sm font-medium w-20 text-right">
                          {formatPrice(item.revenue)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground">
                  No revenue data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Growth</CardTitle>
              <CardDescription>New users per month</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.monthlyUsers && stats.monthlyUsers.length > 0 ? (
                <div className="space-y-3">
                  {stats.monthlyUsers.map((item, i) => {
                    const maxCount = Math.max(...stats.monthlyUsers.map(m => m.count));
                    const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div key={item.month} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-12">
                          {getMonthName(item.month)}
                        </span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">
                          {item.count} users
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground">
                  No user data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subscription Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.planDistribution?.map((item) => (
                  <div key={item.plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        item.plan === 'weekly' && 'bg-blue-500',
                        item.plan === 'monthly' && 'bg-green-500',
                        item.plan === 'quarterly' && 'bg-yellow-500',
                        item.plan === 'yearly' && 'bg-purple-500'
                      )} />
                      <span className="capitalize">{item.plan}</span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
                {(!stats?.planDistribution || stats.planDistribution.length === 0) && (
                  <p className="text-muted-foreground text-sm">No active subscriptions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Users</CardTitle>
              <Link href="/dashboard/admin/users">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentUsers?.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{u.name || u.email.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{u.role}</Badge>
                  </div>
                ))}
                {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                  <p className="text-muted-foreground text-sm">No recent users</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Payments</CardTitle>
              <Link href="/dashboard/admin/payments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentPayments?.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{formatPrice(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.user?.email || 'Unknown'}
                      </p>
                    </div>
                    <Badge variant={p.status === 'confirmed' ? 'default' : 'secondary'}>
                      {p.status}
                    </Badge>
                  </div>
                ))}
                {(!stats?.recentPayments || stats.recentPayments.length === 0) && (
                  <p className="text-muted-foreground text-sm">No recent payments</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <Link href="/dashboard/admin/applications">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <FileText className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Review Applications</p>
                    <p className="text-xs text-muted-foreground">{stats?.pendingApplications || 0} pending</p>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/admin/users">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Users className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Manage Users</p>
                    <p className="text-xs text-muted-foreground">View & edit users</p>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/admin/providers">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <TrendingUp className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Manage Providers</p>
                    <p className="text-xs text-muted-foreground">Verify & manage</p>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/admin/settings">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Platform Settings</p>
                    <p className="text-xs text-muted-foreground">Configure platform</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
