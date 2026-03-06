'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  MoreVertical,
  Eye,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/use-mounted';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  providerId: string;
  providerName: string;
  amount: number;
  platformFee: number;
  providerEarnings: number;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
}

export default function PaymentsAdminPage() {
  const { user: currentUser } = useUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      if (!currentUser) return;
      
      try {
        const response = await fetch('/api/admin/payments', {
          headers: { 'Authorization': `Bearer ${currentUser.id}` },
        });
        const data = await response.json();
        
        if (data.success) {
          setPayments(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentUser]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-700">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.userName.toLowerCase().includes(search.toLowerCase()) ||
      payment.providerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payments.length,
    totalVolume: payments.reduce((sum, p) => sum + p.amount, 0),
    totalFees: payments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + p.platformFee, 0),
    pending: payments.filter(p => p.status === 'pending').length,
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
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          View and manage all platform transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ArrowUpFromLine className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(stats.totalVolume)}</p>
                <p className="text-sm text-muted-foreground">Total Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(stats.totalFees)}</p>
                <p className="text-sm text-muted-foreground">Platform Fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
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
                  placeholder="Search by user or provider..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">Transaction</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Provider</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Platform Fee</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.map((payment) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{payment.userName}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {payment.paymentMethod}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p>{payment.providerName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{formatPrice(payment.amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(payment.platformFee)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {payment.status === 'pending' && (
                            <DropdownMenuItem>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {payment.status === 'confirmed' && (
                            <DropdownMenuItem>
                              <ArrowDownToLine className="w-4 h-4 mr-2" />
                              Refund
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
