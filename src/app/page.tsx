'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  Shield,
  Users,
  Star,
  Bell,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Play,
  ChevronDown,
  X,
  Smartphone,
  Lock,
  Zap,
  Award,
  Globe,
  MessageCircle,
  BarChart3,
  Target,
  Wallet,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useMounted } from '@/hooks/use-mounted';

// Demo providers for the landing page
const demoProviders = [
  {
    id: '1',
    displayName: 'FX Pro Uganda',
    bio: 'Professional forex trader with 5+ years experience. Specializing in EUR/USD and XAU/USD.',
    avatar: null,
    tier: 'verified',
    winRate: 72,
    totalPips: 2450,
    totalSignals: 156,
    monthlyPrice: 100000,
    averageRating: 4.5,
    totalReviews: 38,
    pairs: ['EUR/USD', 'XAU/USD', 'GBP/USD'],
    subscribers: 45,
  },
  {
    id: '2',
    displayName: 'Crypto Alpha Signals',
    bio: 'Cryptocurrency trading expert. Technical analysis and on-chain data combined.',
    avatar: null,
    tier: 'top',
    winRate: 78,
    totalPips: 3200,
    totalSignals: 89,
    monthlyPrice: 180000,
    averageRating: 4.8,
    totalReviews: 67,
    pairs: ['BTC/USD', 'ETH/USD', 'SOL/USD'],
    subscribers: 82,
  },
  {
    id: '3',
    displayName: 'Gold Rush Trading',
    bio: 'XAU/USD specialist. Pure price action analysis with key levels.',
    avatar: null,
    tier: 'verified',
    winRate: 68,
    totalPips: 1890,
    totalSignals: 234,
    monthlyPrice: 85000,
    averageRating: 4.3,
    totalReviews: 29,
    pairs: ['XAU/USD', 'XAG/USD'],
    subscribers: 38,
  },
];

const stats = [
  { value: '50+', label: 'Verified Providers' },
  { value: '2,500+', label: 'Active Subscribers' },
  { value: '68%', label: 'Avg Win Rate' },
  { value: '15K+', label: 'Signals Posted' },
];

const features = [
  {
    icon: BarChart3,
    title: 'Verified Performance',
    description:
      'Win rates, pips, and ROI calculated from actual signal outcomes. No fake screenshots.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description:
      'Pay with crypto or mobile money. Platform holds funds until subscription confirmed.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: Bell,
    title: 'Instant Notifications',
    description:
      'Get alerts when new signals are posted, targets hit, or your subscription is expiring.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: Target,
    title: 'Multiple Take Profits',
    description:
      'Signals include TP1, TP2, TP3 for partial profit taking. Track each level.',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: Users,
    title: 'Provider Reviews',
    description:
      'Read real reviews from subscribers. Rate providers based on your experience.',
    color: 'text-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
  },
  {
    icon: Smartphone,
    title: 'Install as App',
    description:
      'Add to your home screen for quick access. Works like a native mobile app.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Browse Providers',
    description: 'Compare verified providers by win rate, price, and reviews',
    icon: Users,
  },
  {
    step: 2,
    title: 'Choose a Plan',
    description: 'Weekly, monthly, quarterly, or yearly subscriptions available',
    icon: CreditCard,
  },
  {
    step: 3,
    title: 'Pay Securely',
    description: 'Crypto or mobile money with instant verification',
    icon: Wallet,
  },
  {
    step: 4,
    title: 'Get Signals',
    description: 'Real-time notifications for every new signal',
    icon: Bell,
  },
];

const faqs = [
  {
    q: 'How do I know the performance stats are real?',
    a: 'Unlike Telegram screenshots, our stats are calculated automatically from actual signals. When a provider posts a signal, we track its outcome and calculate win rate from that data. It cannot be faked.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept USDT/USDC (crypto), MTN Mobile Money, and Airtel Money. Crypto payments are verified instantly via transaction hash. Mobile money is processed in real-time.',
  },
  {
    q: 'Can I get a refund if I\'m not satisfied?',
    a: 'We offer a 24-hour satisfaction guarantee. If you\'re not happy with a provider within the first 24 hours, contact support for a refund.',
  },
  {
    q: 'How much does it cost to become a provider?',
    a: 'Basic provider registration is FREE. Verification (which gives you a badge and more visibility) costs UGX 50,000 one-time. We take only 5-7% per transaction.',
  },
  {
    q: 'Can I install this as an app on my phone?',
    a: 'Yes! On Android, tap the menu button in your browser and select "Add to Home Screen". On iOS, tap the share button and select "Add to Home Screen". It works just like a native app.',
  },
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const mounted = useMounted();

  // Handle hydration gracefully
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-50 dark:from-blue-950/30" />

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-4 py-2 mb-8"
            >
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Verified Performance • No Fake Results
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Precision Trading.
              <br />
              <span className="gradient-text">Proven Results.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Stop risking your money on unverified Telegram signals. PipTray connects you with
              verified providers and real performance data before you subscribe.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link href="/register">
                <Button size="lg" className="btn-primary text-lg px-8 h-14">
                  Start Trading Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="text-lg px-8 h-14">
                  <Play className="mr-2 w-5 h-5" />
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 trust-strip">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Verified Providers</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Mobile Friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Made in Uganda 🇺🇬</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-20 bg-background" id="how-it-works">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Traders Trust Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We built this platform to solve the biggest problem in signal trading: lack of
              transparency.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-red-900 dark:text-red-100">
                  The Problem with Telegram
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  'No way to verify signal performance',
                  'Fake screenshots and manipulated results',
                  'No refunds when providers disappear',
                  'Your payment info exposed to strangers',
                  'No organization or signal history',
                  'Easy for scammers to operate',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-red-800 dark:text-red-200">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                  Our Solution
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Auto-calculated win rates from real signals',
                  'Transparent stats that cannot be faked',
                  'Escrow payments - platform holds funds',
                  'Your wallet info stays private',
                  'Organized dashboard with full history',
                  'Verified providers with badges',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-green-800 dark:text-green-200">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Providers */}
      <section className="py-20 bg-muted/20" id="providers">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="secondary">
              Top Performers
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Signal Providers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our top-rated providers with verified track records. See their real performance before
              you subscribe.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {demoProviders.map((provider, i) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProviderCard provider={provider} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/providers">
              <Button size="lg" variant="outline" className="gap-2">
                View All Providers
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background" id="features">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4" variant="secondary">
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built by traders, for traders. Every feature designed to help you succeed.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full card-hover">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4" variant="secondary">
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl hero-gradient-bold text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {i < 3 && (
                  <ChevronRight className="hidden md:block absolute top-6 -right-3 w-6 h-6 text-muted-foreground/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section className="py-20 hero-gradient-bold text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Award className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Are You a Signal Provider?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join our platform and earn from your trading skills. We charge lower fees than
                Telegram scams and give you professional tools to manage your subscribers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register?role=provider">
                  <Button size="lg" variant="secondary" className="text-lg px-8 h-14">
                    Apply as Provider
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/60 mt-4">
                First 50 providers get verified status FREE (worth UGX 50,000)
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background" id="faq">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="secondary">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Questions</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className="cursor-pointer transition-all"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold pr-4">{faq.q}</h3>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          activeFaq === i ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {activeFaq === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-muted-foreground text-sm mt-4">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Trade Smarter?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of East African traders who trust verified signals over Telegram
              screenshots.
            </p>
            <Link href="/register">
              <Button size="lg" className="btn-primary text-lg px-12 h-14">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Provider Card Component
function ProviderCard({
  provider,
}: {
  provider: {
    id: string;
    displayName: string;
    bio: string;
    avatar: string | null;
    tier: string;
    winRate: number;
    totalPips: number;
    totalSignals: number;
    monthlyPrice: number;
    averageRating: number;
    totalReviews: number;
    pairs: string[];
    subscribers: number;
  };
}) {
  const tierColors: Record<string, string> = {
    new: 'badge-new',
    registered: 'badge-registered',
    verified: 'badge-verified',
    top: 'badge-top',
    elite: 'badge-elite',
  };

  const tierIcons: Record<string, string> = {
    new: '🔰',
    registered: '📝',
    verified: '✅',
    top: '🏆',
    elite: '💎',
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="h-full card-hover overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={provider.avatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {provider.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{provider.displayName}</h3>
                <Badge className={tierColors[provider.tier]} variant="secondary">
                  {tierIcons[provider.tier]}{' '}
                  {provider.tier.charAt(0).toUpperCase() + provider.tier.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{provider.bio}</p>

          {/* Pairs */}
          <div className="flex flex-wrap gap-1 mb-4">
            {provider.pairs.slice(0, 3).map((pair) => (
              <Badge key={pair} variant="outline" className="text-xs">
                {pair}
              </Badge>
            ))}
            {provider.pairs.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{provider.pairs.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {provider.winRate}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{provider.totalPips.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Pips</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{provider.totalSignals}</div>
            <div className="text-xs text-muted-foreground">Signals</div>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold">{formatPrice(provider.monthlyPrice)}</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">{provider.averageRating}</span>
              <span className="text-muted-foreground text-sm">({provider.totalReviews})</span>
            </div>
          </div>
          <Link href={`/provider/${provider.id}`}>
            <Button className="w-full btn-primary">View Profile</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
