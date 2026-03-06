'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Search,
  Star,
  Users,
  BarChart3,
  CheckCircle,
  XCircle,
  Shield,
  MoreHorizontal,
  Eye,
  Ban,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Provider {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatar: string | null;
  tier: string;
  winRate: number;
  totalSignals: number;
  totalPips: number;
  subscribers: number;
  monthlyPrice: number;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  pairs: string[];
  createdAt: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

export default function AdminProvidersPage() {
  const { user: adminUser } = useUser();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchProviders = async () => {
    if (!adminUser || adminUser.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/providers', {
        headers: { 'Authorization': `Bearer ${adminUser.id}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setProviders(data.data || []);
      } else {
        toast.error('Failed to load providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [adminUser]);

  const handleUpdateStatus = async (providerId: string, updates: Partial<Provider>) => {
    if (!adminUser) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminUser.id}`,
        },
        body: JSON.stringify({ 
          providerId: providerId,
          isActive: updates.isActive,
          isVerified: updates.isVerified 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProviders(providers.map(p => 
          p.id === providerId ? { ...p, ...updates } : p
        ));
        if (selectedProvider?.id === providerId) {
          setSelectedProvider({ ...selectedProvider, ...updates });
        }
        
        // Show success toast
        if (updates.isVerified !== undefined) {
          toast.success(updates.isVerified ? 'Provider verified successfully' : 'Verification removed');
        }
        if (updates.isActive !== undefined) {
          toast.success(updates.isActive ? 'Provider activated successfully' : 'Provider suspended');
        }
      } else {
        toast.error(data.error || 'Failed to update provider');
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      toast.error('An error occurred while updating');
    } finally {
      setUpdating(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const tierConfig: Record<string, { className: string; icon: string }> = {
      new: { className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: '🔰' },
      registered: { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '📝' },
      verified: { className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '✅' },
      top: { className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '🏆' },
      elite: { className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: '💎' },
    };
    const config = tierConfig[tier] || tierConfig.new;
    return (
      <Badge className={config.className}>
        {config.icon} {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  const filteredProviders = providers.filter(p => {
    const matchesSearch = 
      p.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || p.tier === tierFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'suspended' && !p.isActive) ||
      (statusFilter === 'verified' && p.isVerified);
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Provider Management</h1>
        <p className="text-muted-foreground">Manage signal providers</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Providers</p>
            <p className="text-2xl font-bold">{providers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {providers.filter(p => p.isActive).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-blue-600">
              {providers.filter(p => p.isVerified).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Suspended</p>
            <p className="text-2xl font-bold text-red-600">
              {providers.filter(p => !p.isActive).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search providers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Providers List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No providers found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredProviders.map((provider) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={provider.avatar || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {provider.displayName?.charAt(0).toUpperCase() || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{provider.displayName}</p>
                        {provider.isVerified && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                        {!provider.isActive && (
                          <Badge variant="destructive" className="text-xs">Suspended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{provider.user?.email}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          {provider.averageRating.toFixed(1)} ({provider.totalReviews})
                        </span>
                        <span>{provider.totalSignals} signals</span>
                        <span>{provider.subscribers} subs</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="font-bold text-green-600">{provider.winRate}%</p>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                    </div>
                    {getTierBadge(provider.tier)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedProvider(provider);
                          setDetailsModalOpen(true);
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(provider.id, { isVerified: !provider.isVerified })}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {provider.isVerified ? 'Remove Verification' : 'Verify'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(provider.id, { isActive: !provider.isActive })}
                          className="text-destructive"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {provider.isActive ? 'Suspend' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          
          {selectedProvider && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedProvider.avatar || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {selectedProvider.displayName?.charAt(0).toUpperCase() || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedProvider.displayName}</h3>
                  <p className="text-muted-foreground">{selectedProvider.user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-xl font-bold text-green-600">{selectedProvider.winRate}%</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Pips</p>
                  <p className="text-xl font-bold">{selectedProvider.totalPips?.toLocaleString() || 0}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Subscribers</p>
                  <p className="text-xl font-bold">{selectedProvider.subscribers}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-xl font-bold flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    {selectedProvider.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Trading Pairs</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.pairs?.map(pair => (
                    <Badge key={pair} variant="outline">{pair}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Bio</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {selectedProvider.bio || 'No bio provided'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                handleUpdateStatus(selectedProvider!.id, { isActive: !selectedProvider!.isActive });
                setDetailsModalOpen(false);
              }}
              variant={selectedProvider?.isActive ? 'destructive' : 'default'}
            >
              {selectedProvider?.isActive ? 'Suspend Provider' : 'Activate Provider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
