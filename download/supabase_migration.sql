-- ============================================
-- PIPTRAY SUPABASE DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'provider', 'admin')),
    avatar TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    google_id VARCHAR(255),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'country') THEN
        ALTER TABLE users ADD COLUMN country VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'timezone') THEN
        ALTER TABLE users ADD COLUMN timezone VARCHAR(100) DEFAULT 'Africa/Kampala';
    END IF;
END $$;

-- ============================================
-- 2. PROVIDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar TEXT,
    pairs TEXT[] DEFAULT '{}',
    timeframes TEXT[] DEFAULT '{}',
    currency VARCHAR(10) DEFAULT 'UGX',
    monthly_price INTEGER DEFAULT 0,
    subscribers INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    total_signals INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    total_pips DECIMAL(10,2) DEFAULT 0,
    avg_rr DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns for providers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'tier') THEN
        ALTER TABLE providers ADD COLUMN tier VARCHAR(20) DEFAULT 'new' CHECK (tier IN ('new', 'registered', 'verified', 'top', 'elite'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'weekly_price') THEN
        ALTER TABLE providers ADD COLUMN weekly_price INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'quarterly_price') THEN
        ALTER TABLE providers ADD COLUMN quarterly_price INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'yearly_price') THEN
        ALTER TABLE providers ADD COLUMN yearly_price INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'average_rating') THEN
        ALTER TABLE providers ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'total_reviews') THEN
        ALTER TABLE providers ADD COLUMN total_reviews INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'binance_wallet') THEN
        ALTER TABLE providers ADD COLUMN binance_wallet VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'ethereum_wallet') THEN
        ALTER TABLE providers ADD COLUMN ethereum_wallet VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'mtn_momo_number') THEN
        ALTER TABLE providers ADD COLUMN mtn_momo_number VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'airtel_money_number') THEN
        ALTER TABLE providers ADD COLUMN airtel_money_number VARCHAR(50);
    END IF;
END $$;

-- ============================================
-- 3. SIGNALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    pair VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('BUY', 'SELL')),
    timeframe VARCHAR(20),
    analysis TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'tp1_hit', 'tp2_hit', 'tp3_hit', 'sl_hit', 'closed')),
    entry_price DECIMAL(20,8) NOT NULL,
    stop_loss DECIMAL(20,8) NOT NULL,
    take_profit_1 DECIMAL(20,8),
    take_profit_2 DECIMAL(20,8),
    take_profit_3 DECIMAL(20,8),
    result_pips DECIMAL(10,2),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns for signals
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signals' AND column_name = 'entry_zone_low') THEN
        ALTER TABLE signals ADD COLUMN entry_zone_low DECIMAL(20,8);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signals' AND column_name = 'entry_zone_high') THEN
        ALTER TABLE signals ADD COLUMN entry_zone_high DECIMAL(20,8);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signals' AND column_name = 'risk') THEN
        ALTER TABLE signals ADD COLUMN risk VARCHAR(10) DEFAULT 'medium' CHECK (risk IN ('low', 'medium', 'high'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signals' AND column_name = 'outcome') THEN
        ALTER TABLE signals ADD COLUMN outcome VARCHAR(20) CHECK (outcome IN ('win', 'loss', 'breakeven'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signals' AND column_name = 'chart_image') THEN
        ALTER TABLE signals ADD COLUMN chart_image TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signals' AND column_name = 'is_free') THEN
        ALTER TABLE signals ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signals' AND column_name = 'is_published') THEN
        ALTER TABLE signals ADD COLUMN is_published BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'signals' AND column_name = 'views_count') THEN
        ALTER TABLE signals ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- 4. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'UGX',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns for subscriptions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'plan') THEN
        ALTER TABLE subscriptions ADD COLUMN plan VARCHAR(20) DEFAULT 'monthly' CHECK (plan IN ('weekly', 'monthly', 'quarterly', 'yearly'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'payment_id') THEN
        ALTER TABLE subscriptions ADD COLUMN payment_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'cancelled_at') THEN
        ALTER TABLE subscriptions ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================
-- 5. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'UGX',
    type VARCHAR(20) NOT NULL CHECK (type IN ('subscription', 'withdrawal')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    payment_method VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns for payments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'provider_id') THEN
        ALTER TABLE payments ADD COLUMN provider_id UUID REFERENCES providers(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'subscription_id') THEN
        ALTER TABLE payments ADD COLUMN subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'platform_fee') THEN
        ALTER TABLE payments ADD COLUMN platform_fee INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'provider_amount') THEN
        ALTER TABLE payments ADD COLUMN provider_amount INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'tx_hash') THEN
        ALTER TABLE payments ADD COLUMN tx_hash VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'wallet_address') THEN
        ALTER TABLE payments ADD COLUMN wallet_address VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'phone_number') THEN
        ALTER TABLE payments ADD COLUMN phone_number VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'momo_reference') THEN
        ALTER TABLE payments ADD COLUMN momo_reference VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'confirmed_at') THEN
        ALTER TABLE payments ADD COLUMN confirmed_at TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================
-- 6. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns for notifications
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'data') THEN
        ALTER TABLE notifications ADD COLUMN data JSONB;
    END IF;
END $$;

-- ============================================
-- 7. REVIEWS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider_id)
);

-- ============================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_tier ON providers(tier);
CREATE INDEX IF NOT EXISTS idx_providers_is_active ON providers(is_active);
CREATE INDEX IF NOT EXISTS idx_providers_win_rate ON providers(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_signals_provider_id ON signals(provider_id);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_id ON subscriptions(provider_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);

-- ============================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. RLS POLICIES
-- ============================================

-- Users: can view own profile, admins can view all
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Providers: public can view active providers
CREATE POLICY "Anyone can view active providers" ON providers
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Providers can update own profile" ON providers
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Signals: subscribers can view signals from their providers
CREATE POLICY "Public can view free signals" ON signals
    FOR SELECT USING (is_free = TRUE);

CREATE POLICY "Providers can manage own signals" ON signals
    FOR ALL USING (
        provider_id IN (
            SELECT id FROM providers WHERE user_id::text = auth.uid()::text
        )
    );

-- Subscriptions: users can view own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Payments: users can view own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Notifications: users can manage own notifications
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Reviews: public can view reviews
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- ============================================
-- 11. FUNCTIONS AND TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_signals_updated_at ON signals;
CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON signals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate provider win rate
CREATE OR REPLACE FUNCTION calculate_provider_stats(provider_uuid UUID)
RETURNS void AS $$
DECLARE
    total_count INTEGER;
    win_count INTEGER;
    total_pips_val DECIMAL(10,2);
BEGIN
    -- Count total closed signals
    SELECT COUNT(*) INTO total_count
    FROM signals
    WHERE provider_id = provider_uuid AND status IN ('tp1_hit', 'tp2_hit', 'tp3_hit', 'sl_hit', 'closed');

    -- Count winning signals
    SELECT COUNT(*) INTO win_count
    FROM signals
    WHERE provider_id = provider_uuid AND outcome = 'win';

    -- Sum total pips
    SELECT COALESCE(SUM(result_pips), 0) INTO total_pips_val
    FROM signals
    WHERE provider_id = provider_uuid AND result_pips IS NOT NULL;

    -- Update provider
    UPDATE providers SET
        total_signals = (SELECT COUNT(*) FROM signals WHERE provider_id = provider_uuid),
        win_rate = CASE WHEN total_count > 0 THEN ROUND((win_count::DECIMAL / total_count) * 100, 2) ELSE 0 END,
        total_pips = total_pips_val,
        updated_at = NOW()
    WHERE id = provider_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update provider stats when signal is closed
CREATE OR REPLACE FUNCTION update_provider_stats_on_signal_close()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status <> OLD.status AND NEW.status IN ('tp1_hit', 'tp2_hit', 'tp3_hit', 'sl_hit', 'closed') THEN
        PERFORM calculate_provider_stats(NEW.provider_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_provider_stats ON signals;
CREATE TRIGGER trigger_update_provider_stats
    AFTER UPDATE ON signals
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_stats_on_signal_close();

-- ============================================
-- 12. INSERT DEFAULT ADMIN USER
-- ============================================
-- Note: In production, you'd use Supabase Auth for this
-- This is just for demo purposes
INSERT INTO users (email, name, role, email_verified)
VALUES ('admin@piptray.com', 'Admin User', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- DONE! Your database is ready.
-- ============================================
