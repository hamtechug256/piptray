# 🚀 PipTray

**Precision Trading. Proven Results.**

The trusted signal marketplace for East African traders. Connect with verified signal providers, see real performance stats, and trade with confidence.

![PipTray Dashboard](https://piptray.com/og-image.png)

## ✨ Features

### For Traders (Subscribers)
- 🔍 **Browse Verified Providers** - Compare providers by win rate, price, and reviews
- 📊 **Transparent Performance** - Real stats calculated from actual signal outcomes
- 💳 **Multiple Payment Options** - Mobile Money (MTN/Airtel), Cards, Crypto
- 📱 **PWA Support** - Install as an app on your phone
- 🔔 **Instant Notifications** - Get alerts for new signals and subscription updates
- ⭐ **Reviews & Ratings** - Read real reviews from verified subscribers

### For Signal Providers
- 👤 **Provider Profile** - Showcase your trading expertise
- 📈 **Performance Tracking** - Automatic win rate and pip calculations
- 💰 **Flexible Pricing** - Weekly, monthly, quarterly, or yearly plans
- 👥 **Subscriber Management** - Track your subscribers and earnings
- 🔐 **Secure Payments** - Platform holds funds until confirmed

### Payment Integration
- **Flutterwave** - Cards, MTN Mobile Money, Airtel Money, M-Pesa
- **Crypto** - USDT (TRC20), Ethereum, Bitcoin
- **Secure Escrow** - Platform holds funds until subscription confirmed

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Payments**: Flutterwave + Crypto
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (dashboard)/       # Dashboard pages (subscriber, provider, admin)
│   ├── api/               # API routes
│   ├── providers/         # Public provider pages
│   └── auth/              # Auth callback handlers
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components (Navbar, Footer)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client configuration
│   ├── middleware/       # Security and rate limiting
│   └── constants/        # App constants
├── stores/               # Zustand stores
└── types/                # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Supabase account
- A Flutterwave account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hamtechug256/piptray.git
   cd piptray
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables (see Environment Variables section below)

4. **Run database migrations**
   ```bash
   bunx prisma generate
   bunx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Flutterwave
FLUTTERWAVE_SECRET_KEY="FLWSECK_TEST-..."
FLUTTERWAVE_PUBLIC_KEY="FLWPUB_TEST-..."
FLUTTERWAVE_WEBHOOK_SECRET="your-webhook-secret"

# Crypto Wallets (Platform)
PLATFORM_USDT_WALLET="TYourTRC20Address"
PLATFORM_ETHEREUM_WALLET="0xYourEthAddress"
PLATFORM_BITCOIN_WALLET="bc1qYourBtcAddress"

# Security
JWT_SECRET="your-random-secret-string"
```

## 📱 PWA Installation

PipTray can be installed as a Progressive Web App:

1. Visit the site in Chrome/Edge on mobile
2. Tap "Add to Home Screen" in the browser menu
3. The app will be available from your home screen

## 🔒 Security Features

- **Rate Limiting** - Prevents abuse on API endpoints
- **Input Sanitization** - XSS protection
- **CSRF Protection** - Built-in with Next.js
- **Secure Headers** - CSP, HSTS, X-Frame-Options
- **Password Hashing** - Handled by Supabase Auth

## 🌍 Supported Countries

Currently optimized for:
- 🇺🇬 Uganda (UGX, MTN/Airtel Money)
- 🇰🇪 Kenya (KES, M-Pesa)
- 🇷🇼 Rwanda (RWF, MTN/Airtel)
- 🇬🇭 Ghana (GHS, MTN/Vodafone)
- 🇳🇬 Nigeria (NGN)
- 🇿🇦 South Africa (ZAR)

More African countries coming soon!

## 📊 Database Schema

The application uses the following main tables:
- `users` - User accounts and profiles
- `providers` - Signal provider profiles
- `signals` - Trading signals
- `subscriptions` - User subscriptions to providers
- `payments` - Payment records
- `notifications` - User notifications
- `reviews` - Provider reviews

## 🧪 Testing

```bash
# Run linting
bun run lint

# Build for production
bun run build
```

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support, email support@piptray.com or join our Telegram channel.

---

Built with ❤️ in Uganda 🇺🇬
