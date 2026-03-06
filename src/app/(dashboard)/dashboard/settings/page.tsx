'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Wallet,
  CreditCard,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUser } from '@/hooks/use-mounted';

export default function SettingsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Profile settings
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [signalAlerts, setSignalAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Payment settings (for providers)
  const [btcAddress, setBtcAddress] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [usdtAddress, setUsdtAddress] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [airtelNumber, setAirtelNumber] = useState('');

  // Pricing settings (for providers)
  const [weeklyPrice, setWeeklyPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [quarterlyPrice, setQuarterlyPrice] = useState('');
  const [yearlyPrice, setYearlyPrice] = useState('');

  const isProvider = user?.role === 'provider';

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/users/me/settings', {
          headers: { 'Authorization': `Bearer ${user.id}` },
        });
        const data = await response.json();
        
        if (data.success && data.data) {
          const settings = data.data;
          setName(settings.name || '');
          setEmail(settings.email || '');
          setPhone(settings.phone || '');
          setBio(settings.bio || '');
          setEmailNotifications(settings.emailNotifications ?? true);
          setPushNotifications(settings.pushNotifications ?? true);
          setSignalAlerts(settings.signalAlerts ?? true);
          setMarketingEmails(settings.marketingEmails ?? false);
          
          if (isProvider) {
            setBtcAddress(settings.btcAddress || '');
            setEthAddress(settings.ethAddress || '');
            setUsdtAddress(settings.usdtAddress || '');
            setMomoNumber(settings.momoNumber || '');
            setAirtelNumber(settings.airtelNumber || '');
            setWeeklyPrice(settings.weeklyPrice?.toString() || '');
            setMonthlyPrice(settings.monthlyPrice?.toString() || '');
            setQuarterlyPrice(settings.quarterlyPrice?.toString() || '');
            setYearlyPrice(settings.yearlyPrice?.toString() || '');
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user, isProvider]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/me/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          name,
          phone,
          bio,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/me/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          emailNotifications,
          pushNotifications,
          signalAlerts,
          marketingEmails,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Notification preferences updated!');
      } else {
        setError(data.error || 'Failed to update preferences');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/providers/me/payment-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          btcAddress,
          ethAddress,
          usdtAddress,
          momoNumber,
          airtelNumber,
          weeklyPrice: weeklyPrice ? parseFloat(weeklyPrice) : null,
          monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
          quarterlyPrice: quarterlyPrice ? parseFloat(quarterlyPrice) : null,
          yearlyPrice: yearlyPrice ? parseFloat(yearlyPrice) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Payment settings updated!');
      } else {
        setError(data.error || 'Failed to update payment settings');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Alerts */}
      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          {isProvider && (
            <TabsTrigger value="payment">
              <Wallet className="w-4 h-4 mr-2" />
              Payment
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+256 7XX XXX XXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-muted-foreground">Your account type and verification status</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Signal Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when new signals are posted</p>
                </div>
                <Switch
                  checked={signalAlerts}
                  onCheckedChange={setSignalAlerts}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">Receive promotional offers and updates</p>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>

              <Button onClick={handleSaveNotifications} disabled={saving} className="btn-primary">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab (Providers Only) */}
        {isProvider && (
          <TabsContent value="payment">
            <div className="space-y-6">
              {/* Subscription Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Pricing</CardTitle>
                  <CardDescription>Set your prices for different subscription periods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="weeklyPrice">Weekly Price (UGX)</Label>
                      <Input
                        id="weeklyPrice"
                        type="number"
                        value={weeklyPrice}
                        onChange={(e) => setWeeklyPrice(e.target.value)}
                        placeholder="30000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyPrice">Monthly Price (UGX)</Label>
                      <Input
                        id="monthlyPrice"
                        type="number"
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(e.target.value)}
                        placeholder="100000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quarterlyPrice">Quarterly Price (UGX)</Label>
                      <Input
                        id="quarterlyPrice"
                        type="number"
                        value={quarterlyPrice}
                        onChange={(e) => setQuarterlyPrice(e.target.value)}
                        placeholder="270000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearlyPrice">Yearly Price (UGX)</Label>
                      <Input
                        id="yearlyPrice"
                        type="number"
                        value={yearlyPrice}
                        onChange={(e) => setYearlyPrice(e.target.value)}
                        placeholder="900000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Crypto Wallets */}
              <Card>
                <CardHeader>
                  <CardTitle>Crypto Wallets</CardTitle>
                  <CardDescription>Add your wallet addresses for receiving payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="btcAddress">BTC Address</Label>
                    <div className="relative">
                      <Input
                        id="btcAddress"
                        type={showApiKey ? 'text' : 'password'}
                        value={btcAddress}
                        onChange={(e) => setBtcAddress(e.target.value)}
                        placeholder="bc1..."
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ethAddress">ETH Address</Label>
                    <Input
                      id="ethAddress"
                      value={ethAddress}
                      onChange={(e) => setEthAddress(e.target.value)}
                      placeholder="0x..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usdtAddress">USDT Address (TRC20)</Label>
                    <Input
                      id="usdtAddress"
                      value={usdtAddress}
                      onChange={(e) => setUsdtAddress(e.target.value)}
                      placeholder="T..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Money */}
              <Card>
                <CardHeader>
                  <CardTitle>Mobile Money</CardTitle>
                  <CardDescription>Receive payments via MTN or Airtel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="momoNumber">MTN Mobile Money</Label>
                    <Input
                      id="momoNumber"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="+256 7XX XXX XXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="airtelNumber">Airtel Money</Label>
                    <Input
                      id="airtelNumber"
                      value={airtelNumber}
                      onChange={(e) => setAirtelNumber(e.target.value)}
                      placeholder="+256 7XX XXX XXX"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSavePayment} disabled={saving} className="btn-primary">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Payment Settings
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
