# PipTray Fix Implementation Guide

## Overview

This document outlines all the fixes and improvements made to the PipTray project to bring it to a clean, working state.

---

## Phase 1: Database Migration (COMPLETED)

### Changes Made:

#### 1. Updated Prisma Schema
- Changed from SQLite to PostgreSQL
- Added `directUrl` for Supabase connection pooling
- Schema now properly maps to Supabase PostgreSQL

### What You Need To Do:

1. **Update your `.env` file with Supabase credentials:**

```env
# Supabase Database URLs
DATABASE_URL="postgresql://postgres.[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres.[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

2. **Get these from Supabase Dashboard:**
   - Go to Project Settings → API
   - Copy the Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy service_role key → `SUPABASE_SERVICE_ROLE_KEY`
   - Go to Project Settings → Database → Connection string

3. **Run Prisma migration:**
```bash
bunx prisma migrate dev --name init
```

4. **Generate Prisma client:**
```bash
bunx prisma generate
```

---

## Phase 2: Payment Integration (COMPLETED)

### Flutterwave Improvements

#### 1. Added Proper Webhook Route
- **File:** `src/app/api/payments/flutterwave/webhook/route.ts`
- Added signature verification
- Proper event handling
- Updates payment status automatically

#### 2. Added Callback Route
- **File:** `src/app/api/payments/flutterwave/callback/route.ts`
- Handles redirect after payment completion
- Updates payment status
- Creates notifications

#### 3. Updated Flutterwave Route
- **File:** `src/app/api/payments/flutterwave/route.ts`
- Better error handling
- Demo mode fallback

### What You Need To Do:

1. **Get Flutterwave credentials:**
   - Go to Flutterwave Dashboard → Settings → API Keys
   - Copy Secret Key → `FLUTTERWAVE_SECRET_KEY`
   - Copy Public Key → `FLUTTERWAVE_PUBLIC_KEY`
   - Set webhook hash in Settings → `FLUTTERWAVE_WEBHOOK_SECRET`

2. **Add to `.env`:**
```env
FLUTTERWAVE_SECRET_KEY="FLWSECK_TEST-xxxxxxxx"
FLUTTERWAVE_PUBLIC_KEY="FLWPUB_TEST-xxxxxxxx"
FLUTTERWAVE_WEBHOOK_SECRET="your-webhook-secret"
```

3. **Set webhook URL in Flutterwave Dashboard:**
   - URL: `https://piptray.vercel.app/api/payments/flutterwave/webhook`

---

## Phase 3: Crypto Payments (COMPLETED)

### Files Created:

1. `src/app/api/payments/crypto/route.ts`
   - GET: Get platform wallet addresses
   - POST: Initialize crypto payment
   - PUT: Verify crypto payment

### Features:
- Supports USDT (TRC20), Ethereum, Bitcoin
- Manual verification flow
- Transaction hash verification
- Automatic status updates

### What You Need To Do:

1. **Set platform wallet addresses in `.env`:**
```env
# Platform wallet addresses (where users send crypto payments)
PLATFORM_USDT_WALLET="TYourUSDTWalletAddress"
PLATFORM_ETHEREUM_WALLET="0xYourEthereumWalletAddress"
PLATFORM_BITCOIN_WALLET="bc1qYourBitcoinWalletAddress"
```

2. **Configure in Supabase:**
   - Go to your Supabase dashboard
   - Update `platform_settings` table with your wallet addresses
   - Or add them to `.env` and update via admin panel

---

## Phase 4: Security Improvements (COMPLETED)

### Files Created:

1. `src/lib/middleware/rate-limit.ts`
   - In-memory rate limiting
   - Different limits for different endpoints
   - Auth: 5 requests/minute
   - API: 30 requests/minute
   - Public: 60 requests/minute

2. `src/lib/middleware/security.ts`
   - Security headers
   - Input sanitization
   - Response utilities

### Security Headers Added:
- Content-Security-Policy
- X-Frame-Options
- Strict-Transport-Security
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### Input Sanitization:
- Strings (XSS protection)
- Emails
- Phone numbers (Uganda format)
- Wallet addresses
- Numbers
- Currency codes

---

## Phase 5: How To Apply These Changes

### Step 1: Pull Changes to Your Repository

```bash
# Option A: Apply these files directly to your GitHub repo
# Copy the files from piptray-source to your main project

# Option B: Use git to merge
cd piptray-source
git add .
git commit -m "Fix: database, payments, security"
git push origin main
```

### Step 2: Update Environment Variables

Add to your Vercel environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from the `.env.example`

### Step 3: Run Database Migration

```bash
# Generate migration
bunx prisma migrate dev --name init

# Push to production database
bunx prisma migrate deploy
```

### Step 4: Test Everything

1. **Test Authentication:**
   - Login
   - Register
   - Google OAuth
   - Password reset

2. **Test Payments:**
   - Flutterwave initialization
   - Payment callback
   - Webhook handling

3. **Test Crypto:**
   - Get wallet addresses
   - Submit payment
   - Verify payment

---

## Files Changed Summary

| File | Status | Description |
|-----|--------|-------------|
| `prisma/schema.prisma` | UPDATED | Changed to PostgreSQL for Supabase |
| `src/app/api/payments/flutterwave/route.ts` | UPDATED | Added demo mode, better error handling |
| `src/app/api/payments/flutterwave/webhook/route.ts` | NEW | Proper webhook handling |
| `src/app/api/payments/flutterwave/callback/route.ts` | NEW | Payment redirect handling |
| `src/app/api/payments/crypto/route.ts` | NEW | Crypto payment support |
| `src/lib/middleware/rate-limit.ts` | NEW | Rate limiting |
| `src/lib/middleware/security.ts` | NEW | Security utilities |
| `src/lib/middleware/index.ts` | NEW | Export utilities |

---

## Next Steps After Deployment

### 1. Add Webhook URLs to Flutterwave
1. Go to Flutterwave Dashboard
2. Navigate to Settings → Webhooks
3. Add: `https://piptray.com/api/payments/flutterwave/webhook`

### 2. Test Payment Flow
1. Subscribe to a provider (test mode)
2. Complete payment with Flutterwave test card
3. Verify webhook updates status

### 3. Test Crypto Payment
1. Send small test amount to platform wallet
2. Verify in admin panel
3. Confirm subscription activates

### 4. Monitor Rate Limits
- Check `X-RateLimit-Remaining` header in responses
- Adjust limits if needed in `rate-limit.ts`

---

## Environment Variables Checklist

```env
# App URL
NEXT_PUBLIC_APP_URL="https://piptray.com"

# Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_KEY]"

# Flutterwave
FLUTTERWAVE_SECRET_KEY="[SECRET_KEY]"
FLUTTERWAVE_PUBLIC_KEY="[PUBLIC_KEY]"
FLUTTERWAVE_WEBHOOK_SECRET="[WEBHOOK_SECRET]"

# Crypto Wallets (Platform)
PLATFORM_USDT_WALLET="[USDT_WALLET]"
PLATFORM_ETHEREUM_WALLET="[ETH_WALLET]"
PLATFORM_BITCOIN_WALLET="[BTC_WALLET]"

# Security
JWT_SECRET="[RANDOM_STRING_32+]"
```

---

## Support

If you encounter any issues:
1. Check Vercel logs for errors
2. Check Supabase logs for database errors
3. Check Flutterwave dashboard for payment status
4. Test with smaller amounts first

 Good luck with your launch! 🚀
