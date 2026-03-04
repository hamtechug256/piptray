'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  DollarSign,
  Wallet,
  Save,
  Loader2,
  ArrowLeft,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/use-mounted';
import { ALL_PAIRS, TIMEFRAMES } from '@/lib/constants/pairs';
import { toast } from 'sonner';

interface ProviderSettings {
  id: string;
  displayName: string;
  bio: string;
  pairs: string[];
  timeframes: string[];
  weeklyPrice: number;
  monthlyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  currency: string;
  binanceWallet: string;
  ethereumWallet: string;
  mtnMomoNumber: string;
  airtelMoneyNumber: string;
  tier: string;
  isVerified: boolean;
  isActive: boolean;
}

const CURRENCIES = ['UGX', 'USD', 'KES', 'RWF', 'TZS', 'GHS', 'NGN'];

export default function ProviderSettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProviderSettings>({
    id: '',
    displayName: '',
    bio: '',
    pairs: [],
    timeframes: [],
    weeklyPrice: 0,
    monthlyPrice: 0,
    quarterlyPrice: 0,
    yearlyPrice: 0,
    currency: 'UGX',
    binanceWallet: '',
    ethereumWallet: '',
    mtnMomoNumber: '',
    airtelMoneyNumber: '',
    tier: 'new',
    isVerified: false,
    isActive: false,
  });

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
        setProviderId(data.data.id);
        setProfile({
          id: data.data.id || '',
          displayName: data.data.displayName || '',
          bio: data.data.bio || '',
          pairs: data.data.pairs || [],
          timeframes: data.data.timeframes || [],
          weeklyPrice: data.data.weeklyPrice || 0,
          monthlyPrice: data.data.monthlyPrice || 0,
          quarterlyPrice: data.data.quarterlyPrice || 0,
          yearlyPrice: data.data.yearlyPrice || 0,
          currency: data.data.currency || 'UGX',
          binanceWallet: data.data.binanceWallet || '',
          ethereumWallet: data.data.ethereumWallet || '',
          mtnMomoNumber: data.data.mtnMomoNumber || '',
          airtelMoneyNumber: data.data.airtelMoneyNumber || '',
          tier: data.data.tier || 'new',
          isVerified: data.data.isVerified || false,
          isActive: data.data.isActive || false,
        });
      } else {
        toast.error('Failed to load provider settings');
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
      toast.error('An error occurred while loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!providerId) {
      toast.error('Provider profile not found');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/providers/${providerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: profile.displayName,
          bio: profile.bio,
          pairs: profile.pairs,
          timeframes: profile.timeframes,
          weekly_price: profile.weeklyPrice,
          monthly_price: profile.monthlyPrice,
          quarterly_price: profile.quarterlyPrice,
          yearly_price: profile.yearlyPrice,
          currency: profile.currency,
          binance_wallet: profile.binanceWallet,
          ethereum_wallet: profile.ethereumWallet,
          mtn_momo_number: profile.mtnMomoNumber,
          airtel_money_number: profile.airtelMoneyNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const togglePair = (pair: string) => {
    setProfile(prev => ({
      ...prev,
      pairs: prev.pairs.includes(pair)
        ? prev.pairs.filter(p => p !== pair)
        : [...prev.pairs, pair],
    }));
  };

  const toggleTimeframe = (timeframe: string) => {
    setProfile(prev => ({
      ...prev,
      timeframes: prev.timeframes.includes(timeframe)
        ? prev.timeframes.filter(t => t !== timeframe)
        : [...prev.timeframes, timeframe],
    }));
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'bg-purple-500';
      case 'top': return 'bg-yellow-500';
      case 'verified': return 'bg-blue-500';
      case 'registered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Provider Settings</h1>
          <p className="text-muted-foreground">Manage your profile, pricing, and payment settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getTierBadgeColor(profile.tier)}>
            {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
          </Badge>
          {profile.isVerified && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Check className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>
                  This information will be visible to potential subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Your trading name"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell subscribers about your trading style and experience..."
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Pairs</CardTitle>
                <CardDescription>
                  Select the currency pairs you trade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ALL_PAIRS.map((pair) => (
                    <Badge
                      key={pair}
                      variant={profile.pairs.includes(pair) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => togglePair(pair)}
                    >
                      {pair}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Timeframes</CardTitle>
                <CardDescription>
                  Select your preferred trading timeframes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {TIMEFRAMES.map((tf) => (
                    <Badge
                      key={tf.id}
                      variant={profile.timeframes.includes(tf.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTimeframe(tf.id)}
                    >
                      {tf.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Subscription Pricing</CardTitle>
                <CardDescription>
                  Set your subscription prices for different plans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={profile.currency}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weeklyPrice">Weekly Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {profile.currency}
                      </span>
                      <Input
                        id="weeklyPrice"
                        type="number"
                        placeholder="0"
                        value={profile.weeklyPrice || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, weeklyPrice: parseFloat(e.target.value) || 0 }))}
                        className="pl-16"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyPrice">Monthly Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {profile.currency}
                      </span>
                      <Input
                        id="monthlyPrice"
                        type="number"
                        placeholder="0"
                        value={profile.monthlyPrice || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                        className="pl-16"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quarterlyPrice">Quarterly Price (3 months)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {profile.currency}
                      </span>
                      <Input
                        id="quarterlyPrice"
                        type="number"
                        placeholder="0"
                        value={profile.quarterlyPrice || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, quarterlyPrice: parseFloat(e.target.value) || 0 }))}
                        className="pl-16"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearlyPrice">Yearly Price (12 months)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {profile.currency}
                      </span>
                      <Input
                        id="yearlyPrice"
                        type="number"
                        placeholder="0"
                        value={profile.yearlyPrice || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, yearlyPrice: parseFloat(e.target.value) || 0 }))}
                        className="pl-16"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Consider offering discounts for longer subscription periods</p>
                <p>• Quarterly plans typically offer ~10% discount vs monthly</p>
                <p>• Yearly plans typically offer ~20% discount vs monthly</p>
                <p>• Price competitively based on your performance and experience</p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Cryptocurrency Wallets</CardTitle>
                <CardDescription>
                  Add your wallet addresses to receive crypto payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="binanceWallet">Binance Wallet (BEP20)</Label>
                  <Input
                    id="binanceWallet"
                    placeholder="0x..."
                    value={profile.binanceWallet}
                    onChange={(e) => setProfile(prev => ({ ...prev, binanceWallet: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ethereumWallet">Ethereum Wallet (ERC20)</Label>
                  <Input
                    id="ethereumWallet"
                    placeholder="0x..."
                    value={profile.ethereumWallet}
                    onChange={(e) => setProfile(prev => ({ ...prev, ethereumWallet: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mobile Money</CardTitle>
                <CardDescription>
                  Add your mobile money numbers for local payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mtnMomo">MTN Mobile Money</Label>
                  <Input
                    id="mtnMomo"
                    placeholder="e.g., +256 7XX XXX XXX"
                    value={profile.mtnMomoNumber}
                    onChange={(e) => setProfile(prev => ({ ...prev, mtnMomoNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="airtelMoney">Airtel Money</Label>
                  <Input
                    id="airtelMoney"
                    placeholder="e.g., +256 7XX XXX XXX"
                    value={profile.airtelMoneyNumber}
                    onChange={(e) => setProfile(prev => ({ ...prev, airtelMoneyNumber: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Platform fee: 10% of each subscription payment</p>
                <p>• Payments are processed within 24-48 hours</p>
                <p>• Minimum withdrawal: 50,000 UGX or equivalent</p>
                <p>• Ensure wallet addresses and phone numbers are correct</p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="btn-primary">
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
      </div>
    </div>
  );
}
