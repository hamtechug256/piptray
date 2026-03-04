'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  User,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-mounted';

interface Subscription {
  id: string;
  providerId: string;
  provider: {
    displayName: string;
    avatar: string | null;
    winRate: number;
    totalSignals: number;
  };
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  amount: number;
}

export default function SubscriptionsPage() {
  const { user } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/subscriptions', {
          headers: { 'Authorization': `Bearer ${user.id}` },
        });
        const data = await response.json();
        
        if (data.success) {
          setSubscriptions(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage your signal provider subscriptions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
                <p className="text-muted-foreground">Active Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {subscriptions.reduce((sum, s) => sum + (s.status === 'active' ? s.amount : 0), 0).toLocaleString()}
                </p>
                <p className="text-muted-foreground">UGX Monthly Spend</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
                <p className="text-muted-foreground">Total Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium text-lg mb-2">No subscriptions yet</h3>
            <p className="text-muted-foreground mb-6">
              Browse our signal providers and subscribe to start receiving signals
            </p>
            <Link href="/providers">
              <Button className="btn-primary">
                Browse Providers
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((subscription) => (
            <motion.div
              key={subscription.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={subscription.status === 'active' ? 'border-green-200 dark:border-green-800' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={subscription.provider.avatar || undefined} />
                        <AvatarFallback>
                          {subscription.provider.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{subscription.provider.displayName}</h3>
                          {getStatusBadge(subscription.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="capitalize">{subscription.plan} plan</span>
                          <span>•</span>
                          <span>{subscription.provider.winRate}% win rate</span>
                          <span>•</span>
                          <span>{subscription.provider.totalSignals} signals</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatPrice(subscription.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.status === 'active' ? (
                          <>Expires {new Date(subscription.endDate).toLocaleDateString()}</>
                        ) : (
                          <>Ended {new Date(subscription.endDate).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
