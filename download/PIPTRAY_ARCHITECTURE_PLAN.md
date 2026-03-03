# 🚀 PipTray - Perfect Version Architecture Plan

## The Ultimate Signal Marketplace for East African Traders

---

## 📋 Executive Summary

**Goal**: Build the most professional, modern, and feature-complete signal marketplace ever created.

**Target Users**: 
- Signal Subscribers (Traders)
- Signal Providers
- Platform Administrators

**Markets**: Uganda, Kenya, Tanzania, Rwanda, East Africa

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                       │
│                    (Global CDN + Edge Functions)                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 15 APPLICATION                       │
│                    (App Router + React 19)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Pages     │  │ Components  │  │   Hooks     │              │
│  │  (App Dir)  │  │ (shadcn/ui) │  │ (Custom)    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ API Routes  │  │  Server     │  │   Utils     │              │
│  │ (Backend)   │  │  Actions    │  │  (Helpers)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE BACKEND                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ PostgreSQL  │  │    Auth     │  │   Storage   │              │
│  │  Database   │  │  (OAuth +   │  │  (Images +  │              │
│  │             │  │   Email)    │  │   Files)    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │ Realtime    │  │   Edge      │                               │
│  │ (WebSocket) │  │  Functions  │                               │
│  └─────────────┘  └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                         │
├─────────────────────────────────────────────────────────────────┤
│  • Resend (Email)        • Flutterwave (Payments)               │
│  • Crypto APIs           • MTN/Airtel MoMo APIs                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | App Router, SSR, API Routes |
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | Component Library |
| Framer Motion | 12.x | Animations |
| Zustand | 5.x | State Management |
| React Query | 5.x | Data Fetching |
| React Hook Form | 7.x | Form Handling |
| Zod | 4.x | Validation |

### Backend
| Technology | Purpose |
|------------|---------|
| Supabase PostgreSQL | Primary Database |
| Supabase Auth | Authentication |
| Supabase Storage | File Storage |
| Supabase Realtime | Live Updates |
| Resend | Email Service |

### Deployment
| Platform | Purpose |
|----------|---------|
| Vercel | Hosting + Edge Functions |
| Supabase Cloud | Database + Auth |

---

## 📁 Project Structure

```
piptray/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (dashboard)/              # Dashboard group routes
│   │   │   ├── dashboard/
│   │   │   │   ├── subscriber/
│   │   │   │   ├── provider/
│   │   │   │   └── admin/
│   │   │   ├── signals/
│   │   │   ├── subscriptions/
│   │   │   └── settings/
│   │   │
│   │   ├── (marketing)/              # Public marketing pages
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── providers/
│   │   │   ├── provider/[id]/
│   │   │   ├── pricing/
│   │   │   └── about/
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   ├── signals/
│   │   │   ├── providers/
│   │   │   ├── subscriptions/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   └── webhooks/
│   │   │
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/                   # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── auth/                     # Auth components
│   │   ├── dashboard/                # Dashboard components
│   │   ├── provider/                 # Provider components
│   │   ├── signal/                   # Signal components
│   │   ├── payment/                  # Payment components
│   │   └── shared/                   # Shared components
│   │
│   ├── lib/
│   │   ├── supabase/                 # Supabase client & helpers
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── admin.ts
│   │   │   └── middleware.ts
│   │   ├── validations/              # Zod schemas
│   │   ├── utils/                    # Utility functions
│   │   └── constants/                # App constants
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-provider.ts
│   │   ├── use-signals.ts
│   │   ├── use-subscriptions.ts
│   │   └── use-realtime.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── database.ts               # Supabase generated types
│   │   ├── models.ts                 # Domain models
│   │   └── api.ts                    # API types
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   └── notification-store.ts
│   │
│   └── config/                       # Configuration
│       ├── site.ts
│       ├── navigation.ts
│       └── payments.ts
│
├── public/
│   ├── icons/
│   ├── images/
│   └── manifest.json
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── components.json
└── package.json
```

---

## 🗄️ Database Schema (Supabase PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'subscriber',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Providers Table
```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  
  -- Trading Details
  pairs TEXT[] DEFAULT '{}',
  timeframes TEXT[] DEFAULT '{}',
  
  -- Stats (auto-calculated)
  total_signals INT DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  total_pips DECIMAL(10,2) DEFAULT 0,
  
  -- Pricing
  weekly_price DECIMAL(10,2) DEFAULT 25000,
  monthly_price DECIMAL(10,2) DEFAULT 75000,
  quarterly_price DECIMAL(10,2) DEFAULT 200000,
  yearly_price DECIMAL(10,2) DEFAULT 700000,
  currency VARCHAR(10) DEFAULT 'UGX',
  
  -- Verification
  tier VARCHAR(50) DEFAULT 'new',
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  active_subscribers INT DEFAULT 0,
  total_subscribers INT DEFAULT 0,
  
  -- Rating
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  
  -- Wallets
  binance_wallet VARCHAR(255),
  ethereum_wallet VARCHAR(255),
  mtn_momo_number VARCHAR(20),
  airtel_money_number VARCHAR(20),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Signals Table
```sql
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Signal Details
  pair VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  entry_zone_low DECIMAL(20,8),
  entry_zone_high DECIMAL(20,8),
  
  -- Targets
  stop_loss DECIMAL(20,8) NOT NULL,
  take_profit_1 DECIMAL(20,8) NOT NULL,
  take_profit_2 DECIMAL(20,8),
  take_profit_3 DECIMAL(20,8),
  
  -- Metadata
  timeframe VARCHAR(20) NOT NULL,
  risk VARCHAR(20) DEFAULT 'medium',
  analysis TEXT,
  chart_image_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  status_updated_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  closed_price DECIMAL(20,8),
  
  -- Performance
  pips DECIMAL(10,2),
  outcome VARCHAR(20),
  
  -- Visibility
  is_free BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  views_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Plan
  plan VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'UGX',
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  
  -- Dates
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  
  -- Payment
  payment_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(subscriber_id, provider_id)
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id),
  subscription_id UUID REFERENCES subscriptions(id),
  
  -- Amount
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  provider_amount DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'UGX',
  
  -- Method
  method VARCHAR(50) NOT NULL,
  
  -- Crypto Details
  tx_hash VARCHAR(255),
  wallet_address VARCHAR(255),
  
  -- Mobile Money Details
  phone_number VARCHAR(20),
  momo_reference VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(subscriber_id, provider_id)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Provider Applications Table
```sql
CREATE TABLE provider_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Application Details
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  experience TEXT,
  trading_style TEXT,
  pairs TEXT[] NOT NULL,
  timeframes TEXT[] NOT NULL,
  
  -- Pricing
  proposed_weekly_price DECIMAL(10,2),
  proposed_monthly_price DECIMAL(10,2),
  
  -- Wallets
  binance_wallet VARCHAR(255),
  ethereum_wallet VARCHAR(255),
  mtn_momo_number VARCHAR(20),
  airtel_money_number VARCHAR(20),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 Design System

### Colors (OKLCH)
```css
:root {
  /* Primary - Blue */
  --primary: oklch(0.55 0.2 200);
  --primary-foreground: oklch(1 0 0);
  
  /* Success - Green */
  --success: oklch(0.65 0.18 145);
  
  /* Warning - Yellow */
  --warning: oklch(0.75 0.15 85);
  
  /* Danger - Red */
  --danger: oklch(0.55 0.22 25);
  
  /* Signal Colors */
  --buy: oklch(0.65 0.18 145);
  --sell: oklch(0.55 0.22 25);
  
  /* Neutral */
  --background: oklch(0.99 0 0);
  --foreground: oklch(0.15 0 0);
  --muted: oklch(0.97 0.005 200);
  --border: oklch(0.9 0.01 200);
}
```

### Typography
- **Headings**: Inter/Geist Sans
- **Body**: Inter/Geist Sans
- **Mono**: JetBrains Mono (for numbers/prices)

### Component Patterns
- Cards with subtle shadows
- Rounded corners (0.75rem default)
- Smooth transitions (0.3s ease)
- Gradient buttons for CTAs
- Glass morphism for navigation

---

## 🔐 Authentication Flow

### Sign Up
1. User enters email + password
2. Supabase Auth creates account
3. Verification email sent (Resend)
4. User verifies email
5. Profile created in users table
6. Redirect to dashboard

### Sign In
1. Email/Password OR Google OAuth
2. Supabase Auth validates
3. Session created
4. Redirect to appropriate dashboard

### Role-Based Access
- **Subscriber**: Can browse providers, subscribe, view signals
- **Provider**: Can post signals, manage subscribers, view analytics
- **Admin**: Can approve providers, manage users, view platform stats

---

## 💳 Payment Integration

### Supported Methods
1. **Crypto (USDT/USDC)**
   - Binance Pay
   - Ethereum wallet
   - Instant verification via tx hash

2. **Mobile Money**
   - MTN Mobile Money (Uganda)
   - Airtel Money (Uganda)
   - Flutterwave integration

3. **Card Payments** (Future)
   - Via Flutterwave

### Fee Structure
- Crypto: 5% platform fee
- Mobile Money: 7% platform fee
- Provider keeps: 93-95%

---

## 📱 PWA Features

- Installable on mobile/desktop
- Offline signal viewing
- Push notifications for new signals
- Fast loading with service worker

---

## 🚀 Development Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Project setup with Next.js 15
- [ ] Supabase configuration
- [ ] Database schema creation
- [ ] Authentication setup
- [ ] Type generation

### Phase 2: Core UI (Days 3-4)
- [ ] Landing page
- [ ] Auth pages (login, register)
- [ ] Layout components
- [ ] Design system

### Phase 3: Provider System (Days 5-6)
- [ ] Provider listing
- [ ] Provider profiles
- [ ] Provider application
- [ ] Provider dashboard

### Phase 4: Signal System (Days 7-8)
- [ ] Signal creation
- [ ] Signal display
- [ ] Signal tracking
- [ ] Performance calculation

### Phase 5: Subscription & Payment (Days 9-10)
- [ ] Subscription flow
- [ ] Payment integration
- [ ] Payment verification
- [ ] Wallet management

### Phase 6: Admin & Polish (Days 11-12)
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Notifications
- [ ] Final testing

---

## 📊 Success Metrics

### Technical Metrics
- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

### Business Metrics
- User registration conversion: 15%+
- Provider application rate: 5%+
- Subscription conversion: 10%+

---

This architecture plan will create the most professional, scalable, and feature-complete signal marketplace ever built. Ready to start development! 🚀
