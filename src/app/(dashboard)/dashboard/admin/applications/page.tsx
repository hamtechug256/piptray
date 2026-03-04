'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Briefcase,
  Star,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

interface Application {
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

export default function AdminApplicationsPage() {
  const { user: adminUser } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchApplications = async () => {
    if (!adminUser || adminUser.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/provider-applications', {
        headers: { 'Authorization': `Bearer ${adminUser.id}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [adminUser]);

  const openReviewModal = (app: Application) => {
    setSelectedApplication(app);
    setAdminNotes(app.adminNotes || '');
    setRejectionReason(app.rejectionReason || '');
    setReviewModalOpen(true);
  };

  const handleAction = async (action: 'approve' | 'reject' | 'review') => {
    if (!selectedApplication || !adminUser) return;
    
    setProcessing(true);
    try {
      const status = action === 'approve' 
        ? 'approved' 
        : action === 'reject' 
          ? 'rejected' 
          : 'under_review';
      
      const response = await fetch(`/api/provider-applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminUser.id}`,
        },
        body: JSON.stringify({
          status,
          adminNotes,
          rejectionReason: action === 'reject' ? rejectionReason : null,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setApplications(applications.map(app => 
          app.id === selectedApplication.id 
            ? { 
                ...app, 
                status, 
                adminNotes, 
                rejectionReason: action === 'reject' ? rejectionReason : null 
              }
            : app
        ));
        setReviewModalOpen(false);
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Pending' },
      under_review: { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Under Review' },
      approved: { className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Approved' },
      rejected: { className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Rejected' },
    };
    const v = variants[status] || { className: '', label: status };
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      app.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending' || a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Provider Applications</h1>
        <p className="text-muted-foreground">Review and manage provider applications</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600', highlight: stats.pending > 0 },
          { label: 'Approved', value: stats.approved, color: 'text-green-600' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label} className={cn(stat.highlight && 'border-amber-500/50')}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
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
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
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
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No applications found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {app.user?.name?.[0]?.toUpperCase() || app.user?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{app.user?.name || 'Unknown'}</p>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{app.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">{app.tradingExperience} years exp</p>
                      <p className="text-xs text-muted-foreground">{formatDate(app.createdAt)}</p>
                    </div>
                    <Button size="sm" onClick={() => openReviewModal(app)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review details and make a decision
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedApplication.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedApplication.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applied On</p>
                    <p className="font-medium">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Experience</p>
                    <p className="font-medium">{selectedApplication.tradingExperience} years</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Level</p>
                    <p className="font-medium capitalize">{selectedApplication.experienceLevel?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trading Styles</p>
                    <p className="font-medium capitalize">{selectedApplication.tradingStyle?.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Markets</p>
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Avg. Monthly Signals</p>
                    <p className="font-medium">{selectedApplication.averageMonthlySignals}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Est. Win Rate</p>
                    <p className="font-medium">
                      {selectedApplication.estimatedWinRate ? `${selectedApplication.estimatedWinRate}%` : 'Not provided'}
                    </p>
                  </div>
                </div>
                {selectedApplication.trackRecordDescription && (
                  <div className="mt-4">
                    <p className="text-muted-foreground text-sm">Track Record</p>
                    <p className="text-sm bg-background p-3 rounded border mt-1">
                      {selectedApplication.trackRecordDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Social Proof */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Social Proof
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedApplication.telegramChannel && (
                    <div>
                      <p className="text-muted-foreground">Telegram</p>
                      <a href={selectedApplication.telegramChannel} target="_blank" rel="noopener noreferrer" 
                        className="text-primary hover:underline flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {selectedApplication.twitterHandle && (
                    <div>
                      <p className="text-muted-foreground">Twitter</p>
                      <p className="font-medium">{selectedApplication.twitterHandle}</p>
                    </div>
                  )}
                  {selectedApplication.tradingViewProfile && (
                    <div>
                      <p className="text-muted-foreground">TradingView</p>
                      <a href={selectedApplication.tradingViewProfile} target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Motivation */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Motivation Statement
                </h4>
                <p className="text-sm bg-background p-3 rounded border">
                  {selectedApplication.motivationStatement}
                </p>
              </div>

              {/* Admin Actions */}
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    placeholder="Add notes about this application..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rejection Reason (required if rejecting)</Label>
                  <Textarea
                    placeholder="Explain why this application is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction('review')}
              disabled={processing || selectedApplication?.status !== 'pending'}
            >
              <Clock className="w-4 h-4 mr-2" />
              Mark Under Review
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction('reject')}
              disabled={processing || !rejectionReason}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleAction('approve')}
              disabled={processing}
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
