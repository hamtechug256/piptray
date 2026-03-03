'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  ChevronDown,
  MessageSquare,
  FileText,
  Shield,
  ExternalLink,
  Calendar,
  Briefcase,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/hooks/use-mounted';

// Application type
interface ProviderApplication {
  id: string;
  userId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  tradingExperience: number;
  experienceLevel: string;
  tradingStyle: string[];
  marketsTraded: string[];
  averageMonthlySignals: number;
  estimatedWinRate: number | null;
  trackRecordDescription: string | null;
  telegramChannel: string | null;
  twitterHandle: string | null;
  tradingViewProfile: string | null;
  otherSocialLinks: string | null;
  motivationStatement: string;
  identityDocumentUrl: string | null;
  tradingStatementUrl: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
  };
}

// Stats
interface Stats {
  totalUsers: number;
  totalProviders: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  pendingApplications: number;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 2847,
    totalProviders: 52,
    activeSubscriptions: 1893,
    monthlyRevenue: 15750000,
    pendingApplications: 0,
  });
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ProviderApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch applications
  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      try {
        const response = await fetch('/api/provider-applications', {
          headers: {
            'Authorization': `Bearer ${user.id}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setApplications(data.data || []);
          setStats(prev => ({
            ...prev,
            pendingApplications: data.data?.filter(
              (app: ProviderApplication) => app.status === 'pending' || app.status === 'under_review'
            ).length || 0,
          }));
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Open review modal
  const openReviewModal = (application: ProviderApplication) => {
    setSelectedApplication(application);
    setAdminNotes(application.adminNotes || '');
    setRejectionReason(application.rejectionReason || '');
    setReviewModalOpen(true);
  };

  // Handle application action
  const handleApplicationAction = async (action: 'approve' | 'reject' | 'review') => {
    if (!selectedApplication || !user) return;

    setProcessingAction(true);
    try {
      const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'under_review';
      
      const response = await fetch(`/api/provider-applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          status,
          adminNotes,
          rejectionReason: action === 'reject' ? rejectionReason : null,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === selectedApplication.id 
              ? { ...app, status, adminNotes, rejectionReason: action === 'reject' ? rejectionReason : null }
              : app
          )
        );
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pendingApplications: applications.filter(
            app => (app.status === 'pending' || app.status === 'under_review') && app.id !== selectedApplication.id
          ).length,
          totalProviders: action === 'approve' ? prev.totalProviders + 1 : prev.totalProviders,
        }));
        
        setReviewModalOpen(false);
        setSelectedApplication(null);
      } else {
        alert(data.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('An error occurred');
    } finally {
      setProcessingAction(false);
    }
  };

  // Check admin access
  if (!loading && user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-red-500/50 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don&apos;t have permission to access this page.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Providers</p>
                  <p className="text-3xl font-bold">{stats.totalProviders}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subscriptions</p>
                  <p className="text-3xl font-bold">{stats.activeSubscriptions.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-3xl font-bold">{formatPrice(stats.monthlyRevenue)}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-amber-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Apps</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.pendingApplications}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Provider Applications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Provider Applications
                </CardTitle>
                <CardDescription>Review and manage signal provider applications</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No provider applications have been submitted yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {application.user?.name?.[0]?.toUpperCase() || application.user?.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{application.user?.name || 'Unknown'}</p>
                          {getStatusBadge(application.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{application.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{application.tradingExperience} years exp</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(application.createdAt)}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => openReviewModal(application)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/dashboard/users">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Manage Users</span>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Link href="/dashboard/providers">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium">Manage Providers</span>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/dashboard/payments">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">View Payments</span>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Link href="/dashboard/settings">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Platform Settings</span>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Provider Application</DialogTitle>
            <DialogDescription>
              Review the application details and make a decision
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedApplication.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedApplication.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applied On</p>
                    <p className="font-medium">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                </div>
              </div>

              {/* Trading Background */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Trading Background
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{selectedApplication.tradingExperience} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="font-medium capitalize">{selectedApplication.experienceLevel?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trading Styles</p>
                    <p className="font-medium capitalize">{selectedApplication.tradingStyle?.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Markets</p>
                    <p className="font-medium capitalize">{selectedApplication.marketsTraded?.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Performance Claims
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Monthly Signals</p>
                    <p className="font-medium">{selectedApplication.averageMonthlySignals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Win Rate</p>
                    <p className="font-medium">{selectedApplication.estimatedWinRate ? `${selectedApplication.estimatedWinRate}%` : 'Not provided'}</p>
                  </div>
                </div>
                {selectedApplication.trackRecordDescription && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">Track Record</p>
                    <p className="text-sm bg-background p-3 rounded border">{selectedApplication.trackRecordDescription}</p>
                  </div>
                )}
              </div>

              {/* Social Proof */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Social Proof & Verification
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedApplication.telegramChannel && (
                    <div>
                      <p className="text-sm text-muted-foreground">Telegram</p>
                      <a href={selectedApplication.telegramChannel} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        {selectedApplication.telegramChannel}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {selectedApplication.twitterHandle && (
                    <div>
                      <p className="text-sm text-muted-foreground">Twitter</p>
                      <p className="font-medium">{selectedApplication.twitterHandle}</p>
                    </div>
                  )}
                  {selectedApplication.tradingViewProfile && (
                    <div>
                      <p className="text-sm text-muted-foreground">TradingView</p>
                      <a href={selectedApplication.tradingViewProfile} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        View Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {selectedApplication.identityDocumentUrl && (
                    <div>
                      <p className="text-sm text-muted-foreground">ID Document</p>
                      <a href={selectedApplication.identityDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        View Document
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {selectedApplication.tradingStatementUrl && (
                    <div>
                      <p className="text-sm text-muted-foreground">Trading Statement</p>
                      <a href={selectedApplication.tradingStatementUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        View Statement
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
                {!selectedApplication.telegramChannel && !selectedApplication.twitterHandle && !selectedApplication.tradingViewProfile && (
                  <p className="text-sm text-muted-foreground">No social proof provided</p>
                )}
              </div>

              {/* Motivation */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Motivation Statement
                </h4>
                <p className="text-sm bg-background p-3 rounded border">{selectedApplication.motivationStatement}</p>
              </div>

              {/* Admin Actions */}
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Add notes about this application..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Rejection Reason (shown when rejecting) */}
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason (Required if rejecting)</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Explain why this application is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleApplicationAction('review')}
              disabled={processingAction || selectedApplication?.status !== 'pending'}
            >
              <Clock className="w-4 h-4 mr-2" />
              Mark Under Review
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleApplicationAction('reject')}
              disabled={processingAction || !rejectionReason}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleApplicationAction('approve')}
              disabled={processingAction}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
