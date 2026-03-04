'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  DollarSign,
  Bell,
  Shield,
  Save,
  Wallet,
  Percent,
  Globe,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

interface PlatformSettings {
  platformName: string;
  platformDescription: string;
  contactEmail: string;
  platformFeePercent: number;
  minWithdrawal: number;
  usdtWalletAddress: string;
  mtnMomoNumber: string;
  airtelMoneyNumber: string;
  emailNotifications: boolean;
  signalAlerts: boolean;
  paymentConfirmations: boolean;
}

export default function AdminSettingsPage() {
  const { user: adminUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'PipTray',
    platformDescription: 'Signal marketplace for East African traders',
    contactEmail: 'support@piptray.com',
    platformFeePercent: 5,
    minWithdrawal: 50000,
    usdtWalletAddress: '',
    mtnMomoNumber: '',
    airtelMoneyNumber: '',
    emailNotifications: true,
    signalAlerts: true,
    paymentConfirmations: true,
  });

  const handleSave = async () => {
    if (!adminUser) return;
    
    setSaving(true);
    try {
      // In a real app, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings</p>
        </div>
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Badge className="bg-green-500">Settings saved!</Badge>
          </motion.div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={settings.platformName}
                  onChange={(e) => updateSetting('platformName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformDescription">Platform Description</Label>
                <Textarea
                  id="platformDescription"
                  value={settings.platformDescription}
                  onChange={(e) => updateSetting('platformDescription', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSetting('contactEmail', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fee Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Fee Settings
              </CardTitle>
              <CardDescription>Platform fees and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformFee">Platform Fee (%)</Label>
                <div className="relative">
                  <Input
                    id="platformFee"
                    type="number"
                    value={settings.platformFeePercent}
                    onChange={(e) => updateSetting('platformFeePercent', Number(e.target.value))}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Fee charged on each subscription payment
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minWithdrawal">Minimum Withdrawal (UGX)</Label>
                <Input
                  id="minWithdrawal"
                  type="number"
                  value={settings.minWithdrawal}
                  onChange={(e) => updateSetting('minWithdrawal', Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Configure payment receiving addresses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usdtWallet">USDT Wallet Address (BSC/TRON)</Label>
                <Input
                  id="usdtWallet"
                  placeholder="0x..."
                  value={settings.usdtWalletAddress}
                  onChange={(e) => updateSetting('usdtWalletAddress', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Platform wallet for receiving USDT payments
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mtnMomo">MTN Mobile Money Number</Label>
                <Input
                  id="mtnMomo"
                  placeholder="+256 7XX XXX XXX"
                  value={settings.mtnMomoNumber}
                  onChange={(e) => updateSetting('mtnMomoNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="airtelMoney">Airtel Money Number</Label>
                <Input
                  id="airtelMoney"
                  placeholder="+256 7XX XXX XXX"
                  value={settings.airtelMoneyNumber}
                  onChange={(e) => updateSetting('airtelMoneyNumber', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Email and push notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications to users
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Signal Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Notify subscribers of new signals
                  </p>
                </div>
                <Switch
                  checked={settings.signalAlerts}
                  onCheckedChange={(checked) => updateSetting('signalAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Confirmations</p>
                  <p className="text-sm text-muted-foreground">
                    Send confirmation emails on payment
                  </p>
                </div>
                <Switch
                  checked={settings.paymentConfirmations}
                  onCheckedChange={(checked) => updateSetting('paymentConfirmations', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="px-8">
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
