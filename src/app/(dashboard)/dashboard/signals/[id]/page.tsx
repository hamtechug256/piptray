'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/hooks/use-mounted';
import { ALL_PAIRS, TIMEFRAMES } from '@/lib/constants/pairs';
import { toast } from 'sonner';

interface Signal {
  id: string;
  pair: string;
  direction: string;
  timeframe: string;
  analysis: string;
  entryPrice: number;
  entryZoneLow: number | null;
  entryZoneHigh: number | null;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number | null;
  takeProfit3: number | null;
  risk: string;
  status: string;
  outcome: string | null;
  resultPips: number | null;
  isFree: boolean;
  chartImage: string | null;
  createdAt: string;
}

const OUTCOMES = [
  { value: 'win', label: 'Win (TP Hit)', icon: CheckCircle, color: 'text-green-600' },
  { value: 'loss', label: 'Loss (SL Hit)', icon: XCircle, color: 'text-red-600' },
  { value: 'breakeven', label: 'Breakeven', icon: AlertTriangle, color: 'text-yellow-600' },
];

export default function EditSignalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signal, setSignal] = useState<Signal | null>(null);

  const [formData, setFormData] = useState({
    pair: '',
    direction: 'BUY',
    timeframe: 'day',
    entryPrice: '',
    entryZoneLow: '',
    entryZoneHigh: '',
    stopLoss: '',
    takeProfit1: '',
    takeProfit2: '',
    takeProfit3: '',
    analysis: '',
    risk: 'medium',
    status: 'active',
    outcome: '',
    resultPips: '',
    isFree: false,
  });

  useEffect(() => {
    if (user) {
      fetchSignal();
    }
  }, [user, resolvedParams.id]);

  const fetchSignal = async () => {
    try {
      const response = await fetch(`/api/signals/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        const s = data.data;
        setSignal(s);
        setFormData({
          pair: s.pair || '',
          direction: s.direction || 'BUY',
          timeframe: s.timeframe || 'day',
          entryPrice: s.entry_price?.toString() || '',
          entryZoneLow: s.entry_zone_low?.toString() || '',
          entryZoneHigh: s.entry_zone_high?.toString() || '',
          stopLoss: s.stop_loss?.toString() || '',
          takeProfit1: s.take_profit_1?.toString() || '',
          takeProfit2: s.take_profit_2?.toString() || '',
          takeProfit3: s.take_profit_3?.toString() || '',
          analysis: s.analysis || '',
          risk: s.risk || 'medium',
          status: s.status || 'active',
          outcome: s.outcome || '',
          resultPips: s.result_pips?.toString() || '',
          isFree: s.is_free || false,
        });
      } else {
        toast.error('Signal not found');
        router.push('/dashboard/signals');
      }
    } catch (error) {
      console.error('Error fetching signal:', error);
      toast.error('Failed to load signal');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!signal) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/signals/${signal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: formData.pair,
          direction: formData.direction,
          timeframe: formData.timeframe,
          entry_price: parseFloat(formData.entryPrice) || null,
          entry_zone_low: parseFloat(formData.entryZoneLow) || null,
          entry_zone_high: parseFloat(formData.entryZoneHigh) || null,
          stop_loss: parseFloat(formData.stopLoss) || null,
          take_profit_1: parseFloat(formData.takeProfit1) || null,
          take_profit_2: parseFloat(formData.takeProfit2) || null,
          take_profit_3: parseFloat(formData.takeProfit3) || null,
          analysis: formData.analysis,
          risk: formData.risk,
          status: formData.status,
          outcome: formData.outcome || null,
          result_pips: parseFloat(formData.resultPips) || null,
          is_free: formData.isFree,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Signal updated successfully!');
        fetchSignal();
      } else {
        toast.error(data.error || 'Failed to update signal');
      }
    } catch (error) {
      console.error('Error updating signal:', error);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!signal) return;

    try {
      const response = await fetch(`/api/signals/${signal.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Signal deleted successfully');
        router.push('/dashboard/signals');
      } else {
        toast.error(data.error || 'Failed to delete signal');
      }
    } catch (error) {
      console.error('Error deleting signal:', error);
      toast.error('An error occurred');
    }
  };

  const handleCloseSignal = async (outcome: string) => {
    if (!signal) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/signals/${signal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome,
          status: 'closed',
          result_pips: parseFloat(formData.resultPips) || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Signal marked as ${outcome}`);
        fetchSignal();
      } else {
        toast.error(data.error || 'Failed to close signal');
      }
    } catch (error) {
      console.error('Error closing signal:', error);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Signal not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/signals')}>
          Go Back
        </Button>
      </div>
    );
  }

  const isClosed = signal.outcome !== null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Edit Signal</h1>
            <Badge variant={signal.direction === 'BUY' ? 'default' : 'destructive'}>
              {signal.direction}
            </Badge>
            <Badge variant="outline">{signal.pair}</Badge>
            {isClosed && (
              <Badge variant={signal.outcome === 'win' ? 'default' : 'destructive'}>
                {signal.outcome?.toUpperCase()}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Created {new Date(signal.createdAt).toLocaleDateString()}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Signal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this signal? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Close Signal Card (if active) */}
      {!isClosed && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="text-lg">Close Signal</CardTitle>
            <CardDescription>Mark the outcome of this signal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {OUTCOMES.map((outcome) => (
                <Button
                  key={outcome.value}
                  variant="outline"
                  onClick={() => handleCloseSignal(outcome.value)}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <outcome.icon className={`w-4 h-4 ${outcome.color}`} />
                  {outcome.label}
                </Button>
              ))}
            </div>
            <div className="mt-4">
              <Label htmlFor="resultPips">Result Pips (optional)</Label>
              <Input
                id="resultPips"
                type="number"
                placeholder="e.g., 45 or -20"
                value={formData.resultPips}
                onChange={(e) => handleInputChange('resultPips', e.target.value)}
                className="max-w-48 mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Signal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Trading Pair</Label>
                  <Select
                    value={formData.pair}
                    onValueChange={(value) => handleInputChange('pair', value)}
                    disabled={isClosed}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_PAIRS.map((pair) => (
                        <SelectItem key={pair} value={pair}>
                          {pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Direction</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.direction === 'BUY' ? 'default' : 'outline'}
                      className={`flex-1 ${formData.direction === 'BUY' ? 'bg-green-600' : ''}`}
                      onClick={() => handleInputChange('direction', 'BUY')}
                      disabled={isClosed}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      BUY
                    </Button>
                    <Button
                      type="button"
                      variant={formData.direction === 'SELL' ? 'default' : 'outline'}
                      className={`flex-1 ${formData.direction === 'SELL' ? 'bg-red-600' : ''}`}
                      onClick={() => handleInputChange('direction', 'SELL')}
                      disabled={isClosed}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      SELL
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <Select
                    value={formData.timeframe}
                    onValueChange={(value) => handleInputChange('timeframe', value)}
                    disabled={isClosed}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEFRAMES.map((tf) => (
                        <SelectItem key={tf.id} value={tf.id}>
                          {tf.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Risk Level</Label>
                  <Select
                    value={formData.risk}
                    onValueChange={(value) => handleInputChange('risk', value)}
                    disabled={isClosed}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Entry Price</Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={formData.entryPrice}
                  onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                  disabled={isClosed}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Entry Zone Low</Label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={formData.entryZoneLow}
                    onChange={(e) => handleInputChange('entryZoneLow', e.target.value)}
                    disabled={isClosed}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Entry Zone High</Label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={formData.entryZoneHigh}
                    onChange={(e) => handleInputChange('entryZoneHigh', e.target.value)}
                    disabled={isClosed}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stop Loss</Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={formData.stopLoss}
                  onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                  disabled={isClosed}
                />
              </div>

              <div className="space-y-2">
                <Label>Take Profit 1</Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={formData.takeProfit1}
                  onChange={(e) => handleInputChange('takeProfit1', e.target.value)}
                  disabled={isClosed}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Take Profit 2</Label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={formData.takeProfit2}
                    onChange={(e) => handleInputChange('takeProfit2', e.target.value)}
                    disabled={isClosed}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Take Profit 3</Label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={formData.takeProfit3}
                    onChange={(e) => handleInputChange('takeProfit3', e.target.value)}
                    disabled={isClosed}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                value={formData.analysis}
                onChange={(e) => handleInputChange('analysis', e.target.value)}
                placeholder="Add your analysis..."
                disabled={isClosed}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Save Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleSave}
                disabled={saving || isClosed}
                className="w-full btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>

              {isClosed && (
                <p className="text-sm text-muted-foreground text-center">
                  This signal is closed and cannot be edited
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Signal Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={signal.status === 'active' ? 'default' : 'secondary'} className="w-full justify-center">
                {signal.status.toUpperCase()}
              </Badge>
              {isClosed && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outcome:</span>
                    <span className={signal.outcome === 'win' ? 'text-green-600' : signal.outcome === 'loss' ? 'text-red-600' : ''}>
                      {signal.outcome?.toUpperCase()}
                    </span>
                  </div>
                  {signal.resultPips && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Result:</span>
                      <span className={signal.resultPips > 0 ? 'text-green-600' : 'text-red-600'}>
                        {signal.resultPips > 0 ? '+' : ''}{signal.resultPips} pips
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
