'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Search,
  Star,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/use-mounted';

interface Provider {
  id: string;
  displayName: string;
  avatar: string | null;
  tier: string;
  winRate: number;
  totalSignals: number;
  subscribers: number;
  isVerified: boolean;
  isActive: boolean;
  averageRating: number;
  createdAt: string;
}

export default function ProvidersAdminPage() {
  const { user: currentUser } = useUser();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  useEffect(() => {
    const fetchProviders = async () => {
      if (!currentUser) return;
      
      try {
        const response = await fetch('/api/admin/providers', {
          headers: { 'Authorization': `Bearer ${currentUser.id}` },
        });
        const data = await response.json();
        
        if (data.success) {
          setProviders(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [currentUser]);

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      new: 'bg-gray-100 text-gray-700',
      registered: 'bg-blue-100 text-blue-700',
      verified: 'bg-green-100 text-green-700',
      top: 'bg-yellow-100 text-yellow-700',
      elite: 'bg-purple-100 text-purple-700',
    };
    return (
      <Badge className={colors[tier] || 'bg-gray-100'}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.displayName.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || provider.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const stats = {
    total: providers.length,
    verified: providers.filter(p => p.isVerified).length,
    active: providers.filter(p => p.isActive).length,
    totalSubscribers: providers.reduce((sum, p) => sum + p.subscribers, 0),
  };

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
      <div>
        <h1 className="text-3xl font-bold">Providers Management</h1>
        <p className="text-muted-foreground">
          Manage all signal providers on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Providers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
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
                  placeholder="Search providers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by tier" />
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
          </div>
        </CardContent>
      </Card>

      {/* Providers Grid */}
      <div className="grid gap-4">
        {filteredProviders.map((provider) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={provider.avatar || undefined} />
                      <AvatarFallback>
                        {provider.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{provider.displayName}</h3>
                        {provider.isVerified && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                        {!provider.isActive && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {getTierBadge(provider.tier)}
                        <span>{provider.winRate}% win rate</span>
                        <span>•</span>
                        <span>{provider.totalSignals} signals</span>
                        <span>•</span>
                        <span>{provider.subscribers} subscribers</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/provider/${provider.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          {provider.isVerified ? 'Remove Verification' : 'Verify Provider'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {provider.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredProviders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No providers found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
