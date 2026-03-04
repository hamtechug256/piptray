'use client';

import { useState, useEffect } from 'react';
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
  Shield,
  Award,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-mounted';

interface Subscription {
  id: string;
  providerId: string;
  provider: {
    displayName: string;
  };
  status: string;
  plan: string;
  endDate: string;
  amount: number;
}

interface Signal {
  id: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  status: string;
  provider: {
    displayName: string;
  };
  createdAt: string;
}

export default function SubscriberDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  // Check for existing provider application on mount
  useEffect(() => {
    const checkApplication = async () => {
      if (!user) return;
      
      setCheckingApplication(true);
      try {
        const response = await fetch('/api/provider-applications', {
          headers: {
            'Authorization': `Bearer ${user.id}`,
          },
        });
        
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          const pendingApp = data.data.find(
            (app: any) => app.status === 'pending' || app.status === 'under_review'
          );
          if (pendingApp) {
            setExistingApplication(pendingApp);
          }
        }
      } catch (error) {
        console.error('Error checking application:', error);
      } finally {
        setCheckingApplication(false);
      }
    };

    checkApplication();
  }, [user]);

  // Fetch subscriptions and signals
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch subscriptions
        const subResponse = await fetch('/api/subscriptions', {
          headers: { 'Authorization': `Bearer ${user.id}` },
        });
        const subData = await subResponse.json();
        if (subData.success) {
          setSubscriptions(subData.data || []);
        }

        // Fetch signals
        const signalsResponse = await fetch('/api/signals', {
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

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleBecomeProvider = () => {
    if (existingApplication) {
      router.push('/dashboard/application-status');
    } else {
      router.push('/dashboard/become-provider');
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const monthlySpend = activeSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);

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
                  <p className="text-3xl font-bold">{activeSubscriptions.length}</p>
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
                  <p className="text-3xl font-bold">{signals.length}</p>
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
                  <p className="text-3xl font-bold">{formatPrice(monthlySpend)}</p>
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
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Become a Signal Provider</h3>
                  <p className="text-muted-foreground">
                    {existingApplication 
                      ? 'Your application is being reviewed. Track your progress.'
                      : 'Share your trading signals and earn money. Keep 93% of your revenue!'
                    }
                  </p>
                </div>
              </div>
              {existingApplication ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Clock className="w-3 h-3 mr-1" />
                    Application Pending
                  </Badge>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleBecomeProvider}
                    disabled={checkingApplication}
                  >
                    View Status
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  className="btn-primary"
                  onClick={handleBecomeProvider}
                  disabled={checkingApplication}
                >
                  {checkingApplication ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-dashed">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Verified Providers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Quality Signals Only</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span>93% Revenue Share</span>
                </div>
              </div>
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
              {activeSubscriptions.length > 0 ? (
                <div className="space-y-4">
                  {activeSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium">{sub.provider?.displayName || 'Provider'}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires {formatDate(sub.endDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </Badge>
                        <p className="text-sm mt-1 capitalize">{sub.plan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No active subscriptions</p>
                  <Link href="/providers">
                    <Button className="mt-4" variant="outline">
                      Browse Providers
                    </Button>
                  </Link>
                </div>
              )}
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
              {signals.length > 0 ? (
                <div className="space-y-4">
                  {signals.slice(0, 5).map((signal) => (
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
                            {signal.provider?.displayName || 'Provider'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={signal.status === 'active' ? 'secondary' : 'default'}>
                          {signal.status}
                        </Badge>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {signal.direction} @ {signal.entryPrice}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No signals yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Subscribe to a provider to receive signals
                  </p>
                </div>
              )}
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
