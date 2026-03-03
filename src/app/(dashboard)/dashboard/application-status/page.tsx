'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  FileText,
  Shield,
  Star,
  Bell,
  TrendingUp,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/hooks/use-mounted';

// Status configuration
const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'amber',
    title: 'Application Submitted',
    description: 'Your application is in the queue for review.',
    steps: [
      { title: 'Application Submitted', completed: true },
      { title: 'Initial Review', completed: false },
      { title: 'Verification Check', completed: false },
      { title: 'Final Decision', completed: false },
    ],
  },
  under_review: {
    icon: AlertCircle,
    color: 'blue',
    title: 'Under Review',
    description: 'Our team is currently reviewing your application.',
    steps: [
      { title: 'Application Submitted', completed: true },
      { title: 'Initial Review', completed: true },
      { title: 'Verification Check', completed: false },
      { title: 'Final Decision', completed: false },
    ],
  },
  approved: {
    icon: CheckCircle,
    color: 'green',
    title: 'Congratulations! Approved',
    description: 'Your application has been approved. You can now start providing signals!',
    steps: [
      { title: 'Application Submitted', completed: true },
      { title: 'Initial Review', completed: true },
      { title: 'Verification Check', completed: true },
      { title: 'Final Decision', completed: true },
    ],
  },
  rejected: {
    icon: XCircle,
    color: 'red',
    title: 'Application Not Approved',
    description: 'Unfortunately, your application was not approved at this time.',
    steps: [
      { title: 'Application Submitted', completed: true },
      { title: 'Initial Review', completed: true },
      { title: 'Verification Check', completed: true },
      { title: 'Final Decision', completed: true },
    ],
  },
};

// Timeline component
function Timeline({ steps }: { steps: { title: string; completed: boolean }[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step.completed
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {step.completed ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${step.completed ? '' : 'text-muted-foreground'}`}>
              {step.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ApplicationStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const justSubmitted = searchParams.get('submitted') === 'true';

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/provider-applications', {
          headers: {
            'Authorization': `Bearer ${user.id}`,
          },
        });

        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          // Get the most recent application
          const latestApp = data.data.sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          setApplication(latestApp);
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // No application found
  if (!application) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Application Found</h2>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t submitted a provider application yet.
            </p>
            <Button onClick={() => router.push('/dashboard/become-provider')} className="btn-primary">
              Apply to Become a Provider
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = application.status as keyof typeof STATUS_CONFIG;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  // Calculate progress
  const completedSteps = config.steps.filter(s => s.completed).length;
  const progress = (completedSteps / config.steps.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Banner (if just submitted) */}
      {justSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Application Submitted Successfully!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    We&apos;ll review your application and get back to you within 24-48 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Provider Application</CardTitle>
              <CardDescription>
                Submitted on {new Date(application.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardDescription>
            </div>
            <Badge
              className={`text-lg px-4 py-2 ${
                config.color === 'amber'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : config.color === 'blue'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : config.color === 'green'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Overview */}
          <div className="flex items-center gap-4 p-6 bg-muted/50 rounded-xl mb-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                config.color === 'amber'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  : config.color === 'blue'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : config.color === 'green'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{config.title}</h3>
              <p className="text-muted-foreground">{config.description}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Timeline */}
          <div className="border rounded-xl p-6">
            <h4 className="font-medium mb-4">Application Progress</h4>
            <Timeline steps={config.steps} />
          </div>

          {/* Rejection Reason */}
          {status === 'rejected' && application.rejectionReason && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-xl">
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                Reason for Rejection
              </h4>
              <p className="text-red-700 dark:text-red-300">{application.rejectionReason}</p>
            </div>
          )}

          {/* Admin Notes (if any) */}
          {application.adminNotes && status !== 'rejected' && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Notes from Review Team
              </h4>
              <p className="text-blue-700 dark:text-blue-300">{application.adminNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Trading Experience</p>
              <p className="font-medium">{application.tradingExperience} years</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Experience Level</p>
              <p className="font-medium capitalize">{application.experienceLevel?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trading Styles</p>
              <p className="font-medium capitalize">
                {application.tradingStyle?.map((s: string) => s.replace('_', ' ')).join(', ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Markets</p>
              <p className="font-medium capitalize">{application.marketsTraded?.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Signal Frequency</p>
              <p className="font-medium">{application.averageMonthlySignals} signals/month</p>
            </div>
            {application.estimatedWinRate && (
              <div>
                <p className="text-sm text-muted-foreground">Estimated Win Rate</p>
                <p className="font-medium">{application.estimatedWinRate}%</p>
              </div>
            )}
          </div>

          {application.motivationStatement && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-2">Motivation Statement</p>
              <p className="text-sm bg-muted/50 p-4 rounded-lg">{application.motivationStatement}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps (based on status) */}
      {status === 'approved' && (
        <Card className="border-2 border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Star className="w-5 h-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Your provider account is ready! Complete these steps to start earning:
              </p>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    1
                  </div>
                  <p className="flex-1">Set up your provider profile and pricing</p>
                  <Button size="sm" onClick={() => router.push('/dashboard/provider/settings')}>
                    Set Up
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    2
                  </div>
                  <p className="flex-1">Create your first signal to attract subscribers</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    3
                  </div>
                  <p className="flex-1">Share your provider page to gain followers</p>
                </div>
              </div>
              <Button
                className="w-full btn-primary mt-4"
                onClick={() => router.push('/dashboard/provider')}
              >
                Go to Provider Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'rejected' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You can reapply after addressing the feedback above. Please wait at least 7 days before submitting a new application.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/become-provider')}
              >
                Start New Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Questions about your application?</p>
              <p className="text-sm text-muted-foreground">
                Contact our support team at{' '}
                <a href="mailto:support@piptray.com" className="text-primary hover:underline">
                  support@piptray.com
                </a>
                . Typical response time is 24-48 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
