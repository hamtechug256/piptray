'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Users,
  Target,
  Award,
  Activity,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';
import { useUser } from '@/hooks/use-mounted';

interface AnalyticsData {
  totalSignals: number;
  winRate: number;
  totalPips: number;
  avgRR: number;
  subscribers: number;
  monthlyRevenue: number;
  recentSignals: Array<{
    id: string;
    pair: string;
    direction: string;
    outcome: string | null;
    result_pips: number | null;
    created_at: string;
  }>;
  signalsByPair: Array<{ pair: string; count: number }>;
  signalsByOutcome: Array<{ outcome: string; count: number }>;
  monthlySignals: Array<{ month: string; signals: number; wins: number }>;
}

const COLORS = {
  win: '#22c55e',
  loss: '#ef4444',
  breakeven: '#eab308',
  active: '#3b82f6',
};

export default function AnalyticsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (user && user.role === 'provider') {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/providers/me/stats');
      const result = await response.json();

      if (result.success) {
        // Process signals data for charts
        const signals = result.data.recentSignals || [];
        
        // Signals by pair
        const pairCount: Record<string, number> = {};
        signals.forEach((s: any) => {
          pairCount[s.pair] = (pairCount[s.pair] || 0) + 1;
        });
        const signalsByPair = Object.entries(pairCount)
          .map(([pair, count]) => ({ pair, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        // Signals by outcome
        const outcomeCount: Record<string, number> = { win: 0, loss: 0, breakeven: 0, active: 0 };
        signals.forEach((s: any) => {
          if (s.outcome) {
            outcomeCount[s.outcome] = (outcomeCount[s.outcome] || 0) + 1;
          } else {
            outcomeCount.active++;
          }
        });
        const signalsByOutcome = Object.entries(outcomeCount)
          .filter(([_, count]) => count > 0)
          .map(([outcome, count]) => ({ outcome, count }));

        // Monthly signals (mock data for demo)
        const monthlySignals = [
          { month: 'Jan', signals: 12, wins: 8 },
          { month: 'Feb', signals: 15, wins: 11 },
          { month: 'Mar', signals: 18, wins: 14 },
          { month: 'Apr', signals: 14, wins: 10 },
          { month: 'May', signals: 20, wins: 16 },
          { month: 'Jun', signals: 22, wins: 18 },
        ];

        setData({
          totalSignals: result.data.totalSignals || 0,
          winRate: result.data.winRate || 0,
          totalPips: result.data.totalPips || 0,
          avgRR: result.data.avgRR || 0,
          subscribers: result.data.subscribers || 0,
          monthlyRevenue: result.data.monthlyRevenue || 0,
          recentSignals: signals,
          signalsByPair,
          signalsByOutcome,
          monthlySignals,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your performance and growth</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Signals</p>
                  <p className="text-3xl font-bold">{data.totalSignals}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-3xl font-bold text-green-600">{data.winRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pips</p>
                  <p className="text-3xl font-bold">{data.totalPips.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subscribers</p>
                  <p className="text-3xl font-bold">{data.subscribers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Signals Over Time</CardTitle>
            <CardDescription>Your signal activity for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlySignals}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="signals"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="wins"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Total Signals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Wins</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Signal Outcomes</CardTitle>
            <CardDescription>Distribution of your signal results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={data.signalsByOutcome}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="outcome"
                  >
                    {data.signalsByOutcome.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.outcome as keyof typeof COLORS] || '#8884d8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              {data.signalsByOutcome.map((entry) => (
                <div key={entry.outcome} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[entry.outcome as keyof typeof COLORS] }}
                  />
                  <span className="text-sm text-muted-foreground capitalize">{entry.outcome}</span>
                  <span className="text-sm font-medium">{entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Signals by Pair */}
        <Card>
          <CardHeader>
            <CardTitle>Signals by Trading Pair</CardTitle>
            <CardDescription>Most traded pairs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.signalsByPair} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="pair" type="category" className="text-xs" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Your key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Avg Risk/Reward</span>
                </div>
                <p className="text-2xl font-bold">1:{data.avgRR}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                </div>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-UG', {
                    style: 'currency',
                    currency: 'UGX',
                    minimumFractionDigits: 0,
                  }).format(data.monthlyRevenue)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Signals this month</span>
                <span className="font-medium">{data.monthlySignals[data.monthlySignals.length - 1]?.signals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Win streak</span>
                <Badge className="bg-green-100 text-green-700">Best: 12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg signals/week</span>
                <span className="font-medium">
                  {Math.round(data.totalSignals / 4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active subscribers</span>
                <span className="font-medium">{data.subscribers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
