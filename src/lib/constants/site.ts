// ============================================
// SITE CONFIGURATION
// ============================================

export const siteConfig = {
  name: 'PipTray',
  description: 'Precision Trading. Proven Results.',
  tagline: 'The trusted signal marketplace for East African traders',
  url: 'https://piptray.com',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/hamcodz',
    github: 'https://github.com/hamtechug256/piptray',
    telegram: 'https://t.me/Hamcodz',
  },
  creator: 'HAMCODZ',
  location: 'Kampala, Uganda 🇺🇬',
};

export const navigation = {
  main: [
    { name: 'Providers', href: '/providers' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ],
  auth: [
    { name: 'Log In', href: '/login' },
    { name: 'Sign Up', href: '/register' },
  ],
  dashboard: {
    subscriber: [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'My Subscriptions', href: '/dashboard/subscriptions', icon: 'credit-card' },
      { name: 'Signals Feed', href: '/dashboard/signals', icon: 'signal' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
    ],
    provider: [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'My Signals', href: '/dashboard/signals', icon: 'signal' },
      { name: 'Subscribers', href: '/dashboard/subscribers', icon: 'users' },
      { name: 'Analytics', href: '/dashboard/analytics', icon: 'chart' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
    ],
    admin: [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'Users', href: '/dashboard/users', icon: 'users' },
      { name: 'Providers', href: '/dashboard/providers', icon: 'briefcase' },
      { name: 'Payments', href: '/dashboard/payments', icon: 'credit-card' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
    ],
  },
  footer: {
    platform: [
      { name: 'Browse Providers', href: '/providers' },
      { name: 'Become a Provider', href: '/apply' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'FAQ', href: '/faq' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Risk Disclaimer', href: '/risk' },
    ],
  },
};

export const plans = [
  {
    name: 'Weekly',
    duration: 7,
    durationUnit: 'days',
    discount: 0,
  },
  {
    name: 'Monthly',
    duration: 30,
    durationUnit: 'days',
    discount: 0,
    popular: true,
  },
  {
    name: 'Quarterly',
    duration: 90,
    durationUnit: 'days',
    discount: 10,
  },
  {
    name: 'Yearly',
    duration: 365,
    durationUnit: 'days',
    discount: 20,
  },
];

export const paymentMethods = [
  {
    id: 'crypto',
    name: 'USDT/USDC',
    description: 'Pay with cryptocurrency',
    fee: 5,
    icon: 'bitcoin',
  },
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    description: 'Pay with MTN MoMo',
    fee: 7,
    icon: 'phone',
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    description: 'Pay with Airtel Money',
    fee: 7,
    icon: 'phone',
  },
];

export const platformSettings = {
  cryptoFeePercent: 5,
  mobileMoneyFeePercent: 7,
  verificationFeeUGX: 50000,
  featuredListingFeeUGX: 30000,
  minSignalsForVerified: 50,
  minWinRateForVerified: 60,
};
