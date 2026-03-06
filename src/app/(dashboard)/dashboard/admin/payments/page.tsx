'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface Payment {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  createdAt: string;
  confirmedAt: string | null;
  user?: {
    email: string;
    name: string | null;
  };
  provider?: {
    displayName: string;
  };
}

interface PaymentStats {
  total: number;
  confirmed: number;
  pending: number;
  failed: number;
  count: number;
}

export default function AdminPaymentsPage() {
  const { user: adminUser } = useUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    failed: 0,
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [action, setAction] = useState<'confirm' | 'refund' | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchPayments = async () => {
    if (!adminUser || adminUser.role !== 'admin') return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(methodFilter && methodFilter !== 'all' && { method: methodFilter }),
      });
      
      const response = await fetch(`/api/admin/payments?${params}`, {
        headers: { 'Authorization': `Bearer ${adminUser.id}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [adminUser, page, statusFilter, methodFilter]);

  const handleAction = async () => {
    if (!selectedPayment || !action || !adminUser) return;
    
    setProcessing(true);
    try {
      const newStatus = action === 'confirm' ? 'confirmed' : 'refunded';
      
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminUser.id}`,
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          status: newStatus,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPayments(payments.map(p => 
          p.id === selectedPayment.id 
            ? { ...p, status: newStatus, confirmedAt: new Date().toISOString() }
            : p
        ));
        setActionModalOpen(false);
        setSelectedPayment(null);
        setAction(null);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (amount: number, currency: string = 'UGX') => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; icon: React.ReactNode }> = {
      pending: { 
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 
        icon: <Clock className="w-3 h-3" /> 
      },
      confirmed: { 
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      failed: { 
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', 
        icon: <XCircle className="w-3 h-3" /> 
      },
      refunded: { 
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', 
        icon: <RefreshCw className="w-3 h-3" /> 
      },
    };
    const c = config[status] || config.pending;
    return (
      <Badge className={cn('gap-1', c.className)}>
        {c.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'crypto':
        return '💰';
      case 'mtn_momo':
        return '📱';
      case 'airtel_money':
        return '📱';
      default:
        return '💳';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground">Manage all platform payments</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Volume', value: formatPrice(stats.total), icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Confirmed', value: formatPrice(stats.confirmed), icon: CheckCircle, color: 'text-green-600' },
          { label: 'Pending', value: formatPrice(stats.pending), icon: Clock, color: 'text-amber-600', highlight: stats.pending > 0 },
          { label: 'Total Transactions', value: stats.count, icon: DollarSign, color: 'text-purple-600' },
        ].map((stat) => (
          <Card key={stat.label} className={cn(stat.highlight && 'border-amber-500/50')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                </div>
                <stat.icon className={cn('w-8 h-8', stat.color, 'opacity-50')} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="crypto">Crypto (USDT)</SelectItem>
                <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                <SelectItem value="airtel_money">Airtel Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <div className="divide-y">
              {payments.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                      {getMethodIcon(payment.paymentMethod)}
                    </div>
                    <div>
                      <p className="font-semibold">{formatPrice(payment.amount, payment.currency)}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.user?.email || 'Unknown'}
                        {payment.provider && ` → ${payment.provider.displayName}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm">{payment.paymentMethod}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
                    </div>
                    {getStatusBadge(payment.status)}
                    {payment.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setAction('confirm');
                            setActionModalOpen(true);
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setAction('refund');
                            setActionModalOpen(true);
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'confirm' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Confirm Payment
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Refund Payment
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {action === 'confirm' 
                ? `Confirm payment of ${formatPrice(selectedPayment?.amount || 0, selectedPayment?.currency)} from ${selectedPayment?.user?.email}?`
                : `Refund payment of ${formatPrice(selectedPayment?.amount || 0, selectedPayment?.currency)} to ${selectedPayment?.user?.email}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={action === 'confirm' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={processing}
            >
              {processing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />}
              {action === 'confirm' ? 'Confirm' : 'Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
