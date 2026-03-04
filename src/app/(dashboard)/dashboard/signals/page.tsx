'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  AlertCircle,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/hooks/use-mounted';

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
  analysis?: string;
  createdAt: string;
  provider?: {
    displayName: string;
  };
}

export default function SignalsPage() {
  const { user } = useUser();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pairFilter, setPairFilter] = useState('all');

  useEffect(() => {
    const fetchSignals = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/signals', {
          headers: { 'Authorization': `Bearer ${user.id}` },
        });
        const data = await response.json();
        
        if (data.success) {
          setSignals(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching signals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [user]);

  const getStatusBadge = (status: string, outcome: string) => {
    if (status === 'active') {
      return <Badge className="bg-blue-100 text-blue-700">Active</Badge>;
    }
    if (outcome === 'win') {
      return <Badge className="bg-green-100 text-green-700">Win</Badge>;
    }
    if (outcome === 'loss') {
      return <Badge variant="destructive">Loss</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const filteredSignals = signals.filter(signal => {
    const matchesSearch = signal.pair.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || signal.status === statusFilter;
    const matchesPair = pairFilter === 'all' || signal.pair.includes(pairFilter);
    return matchesSearch && matchesStatus && matchesPair;
  });

  const uniquePairs = [...new Set(signals.map(s => s.pair.split('/')[0]))];

  const stats = {
    total: signals.length,
    active: signals.filter(s => s.status === 'active').length,
    wins: signals.filter(s => s.outcome === 'win').length,
    losses: signals.filter(s => s.outcome === 'loss').length,
  };

  const isProvider = user?.role === 'provider';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Signals</h1>
          <p className="text-muted-foreground">
            {isProvider ? 'Manage your trading signals' : 'View signals from your subscriptions'}
          </p>
        </div>
        {isProvider && (
          <Link href="/dashboard/signals/new">
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Signal
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.wins}</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.losses}</p>
                <p className="text-sm text-muted-foreground">Losses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search signals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pairFilter} onValueChange={setPairFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Pair" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pairs</SelectItem>
                {uniquePairs.map(pair => (
                  <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Signals List */}
      {filteredSignals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium text-lg mb-2">No signals found</h3>
            <p className="text-muted-foreground">
              {isProvider 
                ? 'Create your first signal to start sharing your analysis'
                : 'Subscribe to a provider to receive signals'
              }
            </p>
            {isProvider && (
              <Link href="/dashboard/signals/new">
                <Button className="mt-4 btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Signal
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSignals.map((signal) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    {/* Direction */}
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 ${
                        signal.direction === 'BUY' ? 'signal-buy' : 'signal-sell'
                      }`}
                    >
                      <TrendingUp
                        className={`w-6 h-6 ${signal.direction === 'SELL' ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{signal.pair}</h3>
                        {getStatusBadge(signal.status, signal.outcome)}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>Entry: {signal.entryPrice}</span>
                        <span>SL: {signal.stopLoss}</span>
                        <span>TP1: {signal.takeProfit1}</span>
                        {signal.takeProfit2 && <span>TP2: {signal.takeProfit2}</span>}
                        {signal.takeProfit3 && <span>TP3: {signal.takeProfit3}</span>}
                      </div>
                      {!isProvider && signal.provider && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By {signal.provider.displayName}
                        </p>
                      )}
                    </div>

                    {/* Result */}
                    <div className="text-right ml-4 flex flex-col items-end gap-2">
                      {signal.outcome !== 'pending' && (
                        <p className={`text-lg font-bold ${
                          signal.outcome === 'win' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {signal.pips > 0 ? '+' : ''}{signal.pips} pips
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(signal.createdAt).toLocaleDateString()}
                      </p>
                      {isProvider && (
                        <Link href={`/dashboard/signals/${signal.id}`}>
                          <Button variant="outline" size="sm" className="mt-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Analysis */}
                  {signal.analysis && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        {signal.analysis}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
