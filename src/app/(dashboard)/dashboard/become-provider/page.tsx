'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Shield,
  MessageSquare,
  FileText,
  Clock,
  Star,
  Info,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser } from '@/hooks/use-mounted';

// Step configuration
const STEPS = [
  { id: 1, title: 'Trading Background', icon: Briefcase, description: 'Your experience & qualifications' },
  { id: 2, title: 'Trading Style', icon: TrendingUp, description: 'Markets & strategies' },
  { id: 3, title: 'Performance', icon: Star, description: 'Track record & results' },
  { id: 4, title: 'Social Proof', icon: Shield, description: 'Verification & credibility' },
  { id: 5, title: 'Motivation', icon: MessageSquare, description: 'Why become a provider?' },
];

// Experience levels
const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-1 years)', description: 'New to trading, learning the basics' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)', description: 'Comfortable with analysis and strategies' },
  { value: 'advanced', label: 'Advanced (3-5 years)', description: 'Consistent profits, refined strategies' },
  { value: 'professional', label: 'Professional (5+ years)', description: 'Full-time trader with proven track record' },
];

// Trading styles
const TRADING_STYLES = [
  { value: 'scalping', label: 'Scalping', description: 'Quick trades, small profits, high frequency' },
  { value: 'day_trading', label: 'Day Trading', description: 'Intraday trades, no overnight positions' },
  { value: 'swing_trading', label: 'Swing Trading', description: 'Multi-day to week positions' },
  { value: 'position_trading', label: 'Position Trading', description: 'Long-term trades, weeks to months' },
];

// Markets
const MARKETS = [
  { value: 'forex', label: 'Forex', description: 'Currency pairs' },
  { value: 'crypto', label: 'Cryptocurrency', description: 'Bitcoin, Ethereum, Altcoins' },
  { value: 'stocks', label: 'Stocks', description: 'Equity markets' },
  { value: 'indices', label: 'Indices', description: 'S&P 500, NASDAQ, etc.' },
  { value: 'commodities', label: 'Commodities', description: 'Gold, Oil, Silver, etc.' },
];

// Average signals per month options
const SIGNAL_FREQUENCY = [
  { value: '5', label: '5-10 signals/month', description: 'Conservative approach' },
  { value: '15', label: '10-20 signals/month', description: 'Moderate frequency' },
  { value: '30', label: '20-40 signals/month', description: 'Active trading' },
  { value: '50', label: '40+ signals/month', description: 'High frequency' },
];

export default function BecomeProviderPage() {
  const router = useRouter();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Trading Background
    tradingExperience: '',
    experienceLevel: '',
    
    // Step 2: Trading Style
    tradingStyle: [] as string[],
    marketsTraded: [] as string[],
    
    // Step 3: Performance
    averageMonthlySignals: '15',
    estimatedWinRate: '',
    trackRecordDescription: '',
    
    // Step 4: Social Proof
    telegramChannel: '',
    twitterHandle: '',
    tradingViewProfile: '',
    otherSocialLinks: '',
    identityDocumentUrl: '',
    tradingStatementUrl: '',
    
    // Step 5: Motivation
    motivationStatement: '',
    agreedToTerms: false,
    agreedToAccuracy: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for existing application
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/provider-applications', {
          headers: {
            'Authorization': `Bearer ${user.id}`,
          },
        });
        
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          const pendingApp = data.data.find(
            (app: any) => app.status === 'pending' || app.status === 'under_review'
          );
          if (pendingApp) {
            setExistingApplication(pendingApp);
          }
        }
      } catch (error) {
        console.error('Error checking application:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingApplication();
  }, [user]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user updates field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleArrayValue = (field: string, value: string) => {
    setFormData(prev => {
      const current = prev[field as keyof typeof prev] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.tradingExperience) {
          newErrors.tradingExperience = 'Please enter your trading experience';
        }
        if (!formData.experienceLevel) {
          newErrors.experienceLevel = 'Please select your experience level';
        }
        break;

      case 2:
        if (formData.tradingStyle.length === 0) {
          newErrors.tradingStyle = 'Please select at least one trading style';
        }
        if (formData.marketsTraded.length === 0) {
          newErrors.marketsTraded = 'Please select at least one market';
        }
        break;

      case 3:
        if (!formData.averageMonthlySignals) {
          newErrors.averageMonthlySignals = 'Please select signal frequency';
        }
        break;

      case 4:
        // Social proof is optional but recommended
        break;

      case 5:
        if (!formData.motivationStatement || formData.motivationStatement.length < 50) {
          newErrors.motivationStatement = 'Please provide a detailed motivation (at least 50 characters)';
        }
        if (!formData.agreedToTerms) {
          newErrors.agreedToTerms = 'You must agree to the terms';
        }
        if (!formData.agreedToAccuracy) {
          newErrors.agreedToAccuracy = 'You must confirm the accuracy of your information';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep) || !user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/provider-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard/application-status?submitted=true');
      } else {
        setErrors({ submit: data.error || 'Failed to submit application' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show existing application status
  if (existingApplication) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Under Review</h2>
            <p className="text-muted-foreground mb-6">
              You already have a pending application submitted on{' '}
              {new Date(existingApplication.createdAt).toLocaleDateString()}.
              Our team is reviewing your application.
            </p>
            <Badge className="text-lg px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Status: {existingApplication.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="mt-6">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Become a Signal Provider</h1>
        <p className="text-muted-foreground">
          Join our community of trusted signal providers and earn by sharing your trading expertise.
          Complete the application below to get started.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Application Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="flex justify-between mb-8 overflow-x-auto pb-2">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div
              key={step.id}
              className={`flex flex-col items-center min-w-[80px] ${
                isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                    : 'bg-muted'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className="text-xs font-medium text-center hidden sm:block">{step.title}</span>
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {STEPS[currentStep - 1] && (
              <>
                {(() => {
                  const Icon = STEPS[currentStep - 1].icon;
                  return <Icon className="w-5 h-5" />;
                })()}
                {STEPS[currentStep - 1].title}
              </>
            )}
          </CardTitle>
          <CardDescription>{STEPS[currentStep - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Trading Background */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="tradingExperience" className="flex items-center gap-2">
                      Years of Trading Experience
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Enter the number of years you have been actively trading
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="tradingExperience"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="e.g., 3"
                      value={formData.tradingExperience}
                      onChange={(e) => updateFormData('tradingExperience', e.target.value)}
                      className={errors.tradingExperience ? 'border-red-500' : ''}
                    />
                    {errors.tradingExperience && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.tradingExperience}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Experience Level</Label>
                    <RadioGroup
                      value={formData.experienceLevel}
                      onValueChange={(value) => updateFormData('experienceLevel', value)}
                    >
                      {EXPERIENCE_LEVELS.map((level) => (
                        <div
                          key={level.value}
                          className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                            formData.experienceLevel === level.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => updateFormData('experienceLevel', level.value)}
                        >
                          <RadioGroupItem value={level.value} id={level.value} />
                          <div className="flex-1">
                            <Label htmlFor={level.value} className="font-medium cursor-pointer">
                              {level.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors.experienceLevel && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.experienceLevel}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Trading Style */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      Trading Style(s)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Select all trading styles you use
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {TRADING_STYLES.map((style) => (
                        <div
                          key={style.value}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            formData.tradingStyle.includes(style.value)
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleArrayValue('tradingStyle', style.value)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={formData.tradingStyle.includes(style.value)}
                              onCheckedChange={() => toggleArrayValue('tradingStyle', style.value)}
                            />
                            <div>
                              <p className="font-medium">{style.label}</p>
                              <p className="text-sm text-muted-foreground">{style.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.tradingStyle && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.tradingStyle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      Markets Traded
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Select all markets you trade in
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {MARKETS.map((market) => (
                        <div
                          key={market.value}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            formData.marketsTraded.includes(market.value)
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleArrayValue('marketsTraded', market.value)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={formData.marketsTraded.includes(market.value)}
                              onCheckedChange={() => toggleArrayValue('marketsTraded', market.value)}
                            />
                            <div>
                              <p className="font-medium">{market.label}</p>
                              <p className="text-sm text-muted-foreground">{market.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.marketsTraded && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.marketsTraded}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Performance */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Expected Signal Frequency</Label>
                    <RadioGroup
                      value={formData.averageMonthlySignals}
                      onValueChange={(value) => updateFormData('averageMonthlySignals', value)}
                    >
                      {SIGNAL_FREQUENCY.map((freq) => (
                        <div
                          key={freq.value}
                          className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                            formData.averageMonthlySignals === freq.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => updateFormData('averageMonthlySignals', freq.value)}
                        >
                          <RadioGroupItem value={freq.value} id={freq.value} />
                          <div className="flex-1">
                            <Label htmlFor={freq.value} className="font-medium cursor-pointer">
                              {freq.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{freq.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedWinRate" className="flex items-center gap-2">
                      Estimated Win Rate (%)
                      <span className="text-xs text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="estimatedWinRate"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 65"
                      value={formData.estimatedWinRate}
                      onChange={(e) => updateFormData('estimatedWinRate', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This is an estimate. Your actual performance will be tracked once you start providing signals.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trackRecordDescription" className="flex items-center gap-2">
                      Track Record Description
                      <span className="text-xs text-muted-foreground">(Optional but recommended)</span>
                    </Label>
                    <Textarea
                      id="trackRecordDescription"
                      placeholder="Describe your trading track record, notable achievements, or proof of past performance..."
                      rows={4}
                      value={formData.trackRecordDescription}
                      onChange={(e) => updateFormData('trackRecordDescription', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include any relevant details about your trading history, best trades, or verification sources.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Social Proof */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          Why Social Proof Matters
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Providing social proof helps build trust with potential subscribers and speeds up
                          your application review. While optional, verified providers get more visibility.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telegramChannel">Telegram Channel</Label>
                      <Input
                        id="telegramChannel"
                        placeholder="https://t.me/yourchannel"
                        value={formData.telegramChannel}
                        onChange={(e) => updateFormData('telegramChannel', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitterHandle">Twitter/X Handle</Label>
                      <Input
                        id="twitterHandle"
                        placeholder="@yourhandle"
                        value={formData.twitterHandle}
                        onChange={(e) => updateFormData('twitterHandle', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tradingViewProfile">TradingView Profile</Label>
                      <Input
                        id="tradingViewProfile"
                        placeholder="https://tradingview.com/u/yourprofile"
                        value={formData.tradingViewProfile}
                        onChange={(e) => updateFormData('tradingViewProfile', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otherSocialLinks">Other Social Links</Label>
                      <Input
                        id="otherSocialLinks"
                        placeholder="Instagram, Discord, etc."
                        value={formData.otherSocialLinks}
                        onChange={(e) => updateFormData('otherSocialLinks', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Identity Verification
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a government-issued ID or trading statement to get verified faster.
                      Verified providers get a badge and higher visibility.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="identityDocumentUrl">ID Document URL</Label>
                        <Input
                          id="identityDocumentUrl"
                          placeholder="https://... (Google Drive, Dropbox, etc.)"
                          value={formData.identityDocumentUrl}
                          onChange={(e) => updateFormData('identityDocumentUrl', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Upload to cloud storage and paste the link
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tradingStatementUrl">Trading Statement URL</Label>
                        <Input
                          id="tradingStatementUrl"
                          placeholder="https://... (Myfxbook, broker statement, etc.)"
                          value={formData.tradingStatementUrl}
                          onChange={(e) => updateFormData('tradingStatementUrl', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Link to verified trading history
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Motivation */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="motivationStatement">
                      Why do you want to become a signal provider?
                    </Label>
                    <Textarea
                      id="motivationStatement"
                      placeholder="Tell us about your motivation, what value you plan to provide to subscribers, and why you think you'd be a good fit..."
                      rows={6}
                      value={formData.motivationStatement}
                      onChange={(e) => updateFormData('motivationStatement', e.target.value)}
                      className={errors.motivationStatement ? 'border-red-500' : ''}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Minimum 50 characters</span>
                      <span>{formData.motivationStatement.length} characters</span>
                    </div>
                    {errors.motivationStatement && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.motivationStatement}
                      </p>
                    )}
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-4">Provider Agreement</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="agreedToTerms"
                          checked={formData.agreedToTerms}
                          onCheckedChange={(checked) => updateFormData('agreedToTerms', checked)}
                        />
                        <div className="flex-1">
                          <Label htmlFor="agreedToTerms" className="cursor-pointer">
                            I agree to the{' '}
                            <a href="/terms" className="text-primary hover:underline" target="_blank">
                              Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/provider-agreement" className="text-primary hover:underline" target="_blank">
                              Provider Agreement
                            </a>
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Including the 7% platform fee and signal quality requirements
                          </p>
                        </div>
                      </div>
                      {errors.agreedToTerms && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.agreedToTerms}
                        </p>
                      )}

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="agreedToAccuracy"
                          checked={formData.agreedToAccuracy}
                          onCheckedChange={(checked) => updateFormData('agreedToAccuracy', checked)}
                        />
                        <div className="flex-1">
                          <Label htmlFor="agreedToAccuracy" className="cursor-pointer">
                            I confirm that all information provided is accurate and truthful
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Providing false information may result in account suspension
                          </p>
                        </div>
                      </div>
                      {errors.agreedToAccuracy && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.agreedToAccuracy}
                        </p>
                      )}
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.submit}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} className="btn-primary">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Need Help?</p>
              <p className="text-sm text-muted-foreground">
                If you have questions about the application process,{' '}
                <a href="/support" className="text-primary hover:underline">
                  contact our support team
                </a>
                . We typically review applications within 24-48 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
