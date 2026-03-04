'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ImagePlus,
  X,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUser } from '@/hooks/use-mounted';
import { ALL_PAIRS, TIMEFRAMES } from '@/lib/constants/pairs';
import { toast } from 'sonner';

interface ProviderData {
  id: string;
  displayName: string;
  tier: string;
  isActive: boolean;
}

export default function NewSignalPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [chartImage, setChartImage] = useState<string | null>(null);

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
    isFree: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetchProviderData();
    }
  }, [user]);

  const fetchProviderData = async () => {
    try {
      const response = await fetch('/api/providers/me/stats');
      const data = await response.json();
      if (data.success) {
        setProvider({
          id: data.data.id || 'unknown',
          displayName: data.data.displayName || 'Provider',
          tier: data.data.tier || 'new',
          isActive: data.data.isActive ?? true,
        });
        // New providers must post free signals
        if (data.data.tier === 'new') {
          setFormData(prev => ({ ...prev, isFree: true }));
        }
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setChartImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pair) newErrors.pair = 'Trading pair is required';
    if (!formData.entryPrice) newErrors.entryPrice = 'Entry price is required';
    if (!formData.stopLoss) newErrors.stopLoss = 'Stop loss is required';
    if (!formData.takeProfit1) newErrors.takeProfit1 = 'At least one take profit is required';

    // Validate prices
    if (formData.entryPrice && formData.stopLoss) {
      const entry = parseFloat(formData.entryPrice);
      const sl = parseFloat(formData.stopLoss);

      if (formData.direction === 'BUY' && sl >= entry) {
        newErrors.stopLoss = 'For BUY orders, stop loss must be below entry price';
      }
      if (formData.direction === 'SELL' && sl <= entry) {
        newErrors.stopLoss = 'For SELL orders, stop loss must be above entry price';
      }
    }

    if (formData.entryPrice && formData.takeProfit1) {
      const entry = parseFloat(formData.entryPrice);
      const tp1 = parseFloat(formData.takeProfit1);

      if (formData.direction === 'BUY' && tp1 <= entry) {
        newErrors.takeProfit1 = 'For BUY orders, take profit must be above entry price';
      }
      if (formData.direction === 'SELL' && tp1 >= entry) {
        newErrors.takeProfit1 = 'For SELL orders, take profit must be below entry price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: formData.pair,
          direction: formData.direction,
          timeframe: formData.timeframe,
          entry_price: parseFloat(formData.entryPrice),
          entry_zone_low: formData.entryZoneLow ? parseFloat(formData.entryZoneLow) : null,
          entry_zone_high: formData.entryZoneHigh ? parseFloat(formData.entryZoneHigh) : null,
          stop_loss: parseFloat(formData.stopLoss),
          take_profit_1: parseFloat(formData.takeProfit1),
          take_profit_2: formData.takeProfit2 ? parseFloat(formData.takeProfit2) : null,
          take_profit_3: formData.takeProfit3 ? parseFloat(formData.takeProfit3) : null,
          analysis: formData.analysis,
          risk: formData.risk,
          chart_image: chartImage,
          is_free: formData.isFree,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Signal created successfully!');
        router.push('/dashboard/signals');
      } else {
        toast.error(data.error || 'Failed to create signal');
      }
    } catch (error) {
      console.error('Error creating signal:', error);
      toast.error('An error occurred while creating the signal');
    } finally {
      setLoading(false);
    }
  };

  // Calculate risk/reward ratio
  const calculateRR = () => {
    if (!formData.entryPrice || !formData.stopLoss || !formData.takeProfit1) return null;

    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp1 = parseFloat(formData.takeProfit1);

    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp1 - entry);

    if (risk === 0) return null;
    return (reward / risk).toFixed(2);
  };

  const rr = calculateRR();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Signal</h1>
          <p className="text-muted-foreground">Publish a new trading signal for your subscribers</p>
        </div>
      </div>

      {/* New Provider Alert */}
      {provider?.tier === 'new' && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            As a new provider, your signals will be <strong>free</strong> until you reach verified status.
            This helps build trust with potential subscribers.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Signal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Signal Details</CardTitle>
                <CardDescription>Basic information about your trading signal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Trading Pair */}
                  <div className="space-y-2">
                    <Label htmlFor="pair">Trading Pair *</Label>
                    <Select
                      value={formData.pair}
                      onValueChange={(value) => handleInputChange('pair', value)}
                    >
                      <SelectTrigger className={errors.pair ? 'border-destructive' : ''}>
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
                    {errors.pair && <p className="text-sm text-destructive">{errors.pair}</p>}
                  </div>

                  {/* Direction */}
                  <div className="space-y-2">
                    <Label htmlFor="direction">Direction *</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formData.direction === 'BUY' ? 'default' : 'outline'}
                        className={`flex-1 ${formData.direction === 'BUY' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        onClick={() => handleInputChange('direction', 'BUY')}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        BUY
                      </Button>
                      <Button
                        type="button"
                        variant={formData.direction === 'SELL' ? 'default' : 'outline'}
                        className={`flex-1 ${formData.direction === 'SELL' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                        onClick={() => handleInputChange('direction', 'SELL')}
                      >
                        <TrendingDown className="w-4 h-4 mr-2" />
                        SELL
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Timeframe */}
                  <div className="space-y-2">
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Select
                      value={formData.timeframe}
                      onValueChange={(value) => handleInputChange('timeframe', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEFRAMES.map((tf) => (
                          <SelectItem key={tf.id} value={tf.id}>
                            {tf.name} - {tf.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Risk Level */}
                  <div className="space-y-2">
                    <Label htmlFor="risk">Risk Level</Label>
                    <Select
                      value={formData.risk}
                      onValueChange={(value) => handleInputChange('risk', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-100 text-green-700">Low</Badge>
                            <span className="text-muted-foreground">≤ 30 pips SL</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Medium</Badge>
                            <span className="text-muted-foreground">30-60 pips SL</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-red-100 text-red-700">High</Badge>
                            <span className="text-muted-foreground">&gt; 60 pips SL</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Free Signal Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Free Signal</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this signal visible to non-subscribers
                    </p>
                  </div>
                  <Switch
                    checked={formData.isFree}
                    onCheckedChange={(checked) => handleInputChange('isFree', checked)}
                    disabled={provider?.tier === 'new'}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Price Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Price Levels</CardTitle>
                <CardDescription>Entry, stop loss, and take profit levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Entry */}
                <div className="space-y-2">
                  <Label htmlFor="entryPrice">Entry Price *</Label>
                  <Input
                    id="entryPrice"
                    type="number"
                    step="0.00001"
                    placeholder="e.g., 1.08500"
                    value={formData.entryPrice}
                    onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                    className={errors.entryPrice ? 'border-destructive' : ''}
                  />
                  {errors.entryPrice && <p className="text-sm text-destructive">{errors.entryPrice}</p>}
                </div>

                {/* Entry Zone */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="entryZoneLow">Entry Zone Low (Optional)</Label>
                    <Input
                      id="entryZoneLow"
                      type="number"
                      step="0.00001"
                      placeholder="Lower bound"
                      value={formData.entryZoneLow}
                      onChange={(e) => handleInputChange('entryZoneLow', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entryZoneHigh">Entry Zone High (Optional)</Label>
                    <Input
                      id="entryZoneHigh"
                      type="number"
                      step="0.00001"
                      placeholder="Upper bound"
                      value={formData.entryZoneHigh}
                      onChange={(e) => handleInputChange('entryZoneHigh', e.target.value)}
                    />
                  </div>
                </div>

                {/* Stop Loss */}
                <div className="space-y-2">
                  <Label htmlFor="stopLoss">Stop Loss *</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    step="0.00001"
                    placeholder="e.g., 1.08300"
                    value={formData.stopLoss}
                    onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                    className={errors.stopLoss ? 'border-destructive' : ''}
                  />
                  {errors.stopLoss && <p className="text-sm text-destructive">{errors.stopLoss}</p>}
                </div>

                {/* Take Profits */}
                <div className="space-y-3">
                  <Label>Take Profit Levels</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-8 justify-center">TP1</Badge>
                      <Input
                        type="number"
                        step="0.00001"
                        placeholder="Required"
                        value={formData.takeProfit1}
                        onChange={(e) => handleInputChange('takeProfit1', e.target.value)}
                        className={errors.takeProfit1 ? 'border-destructive' : ''}
                      />
                    </div>
                    {errors.takeProfit1 && <p className="text-sm text-destructive ml-10">{errors.takeProfit1}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-8 justify-center">TP2</Badge>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="Optional"
                      value={formData.takeProfit2}
                      onChange={(e) => handleInputChange('takeProfit2', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-8 justify-center">TP3</Badge>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="Optional"
                      value={formData.takeProfit3}
                      onChange={(e) => handleInputChange('takeProfit3', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis & Notes</CardTitle>
                <CardDescription>Explain your reasoning for this trade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your analysis, key levels, market context, and any other relevant information..."
                  rows={6}
                  value={formData.analysis}
                  onChange={(e) => handleInputChange('analysis', e.target.value)}
                />

                {/* Chart Image Upload */}
                <div className="space-y-2">
                  <Label>Chart Image (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4">
                    {chartImage ? (
                      <div className="relative">
                        <img
                          src={chartImage}
                          alt="Chart preview"
                          className="max-h-48 mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setChartImage(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer py-4">
                        <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload chart image</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submit Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Publish Signal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Risk/Reward Display */}
                {rr && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Risk/Reward Ratio</p>
                    <p className="text-2xl font-bold text-green-600">1:{rr}</p>
                  </div>
                )}

                {/* Signal Preview */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Signal Preview</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.direction === 'BUY' ? 'default' : 'destructive'}>
                      {formData.direction || 'BUY'}
                    </Badge>
                    <span className="font-medium">{formData.pair || 'Pair'}</span>
                  </div>
                  {formData.entryPrice && (
                    <p className="text-sm text-muted-foreground">Entry: {formData.entryPrice}</p>
                  )}
                  {formData.takeProfit1 && (
                    <p className="text-sm text-muted-foreground">TP1: {formData.takeProfit1}</p>
                  )}
                  {formData.stopLoss && (
                    <p className="text-sm text-muted-foreground">SL: {formData.stopLoss}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Publish Signal'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your signal will be instantly visible to your subscribers
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tips for Better Signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Always include clear stop loss and take profit levels</p>
                <p>• Aim for at least 1:2 risk/reward ratio</p>
                <p>• Add analysis to help subscribers understand your reasoning</p>
                <p>• Include a chart image for better visualization</p>
                <p>• Use appropriate risk level based on market conditions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
