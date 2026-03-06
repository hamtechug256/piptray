-- ============================================
-- PIPTRAY COMPLETE DATABASE MIGRATION
-- Run this entire script in Supabase SQL Editor
-- This will fix ALL table schema issues
-- ============================================

-- ============================================
-- STEP 1: FIX NOTIFICATIONS TABLE
-- ============================================
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (user_id = auth.uid()::text);

CREATE POLICY "Service role can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- ============================================
-- STEP 2: FIX PROVIDER_APPLICATIONS TABLE
-- ============================================
DROP TABLE IF EXISTS provider_applications CASCADE;

CREATE TABLE provider_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Trading Background
  trading_experience INTEGER NOT NULL DEFAULT 0,
  experience_level TEXT NOT NULL DEFAULT 'beginner',
  trading_style JSONB NOT NULL DEFAULT '[]',
  markets_traded JSONB NOT NULL DEFAULT '[]',
  
  -- Performance Info
  average_monthly_signals INTEGER DEFAULT 10,
  estimated_win_rate DECIMAL(5,2),
  track_record_description TEXT,
  
  -- Social Proof
  telegram_channel TEXT,
  twitter_handle TEXT,
  trading_view_profile TEXT,
  other_social_links TEXT,
  
  -- Motivation
  motivation_statement TEXT NOT NULL,
  
  -- Verification Documents
  identity_document_url TEXT,
  trading_statement_url TEXT,
  
  -- Admin Review
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_provider_applications_user_id ON provider_applications(user_id);
CREATE INDEX idx_provider_applications_status ON provider_applications(status);
CREATE INDEX idx_provider_applications_created_at ON provider_applications(created_at DESC);

ALTER TABLE provider_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON provider_applications
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own applications" ON provider_applications
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Admins can view all applications" ON provider_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all applications" ON provider_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'admin'
    )
  );

-- ============================================
-- STEP 3: FIX REVIEWS TABLE
-- ============================================
DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider_id, user_id)
);

CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone if public"
    ON reviews FOR SELECT
    USING (is_public = TRUE);

CREATE POLICY "Users can view their own reviews"
    ON reviews FOR SELECT
    USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own reviews"
    ON reviews FOR INSERT
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own reviews"
    ON reviews FOR DELETE
    USING (user_id = auth.uid()::text);

-- ============================================
-- STEP 4: ENSURE PROVIDERS TABLE EXISTS
-- ============================================
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  pairs JSONB DEFAULT '[]',
  timeframes JSONB DEFAULT '[]',
  currency TEXT DEFAULT 'UGX',
  monthly_price DECIMAL DEFAULT 0,
  weekly_price DECIMAL DEFAULT 0,
  quarterly_price DECIMAL DEFAULT 0,
  yearly_price DECIMAL DEFAULT 0,
  subscribers INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  total_signals INTEGER DEFAULT 0,
  win_rate DECIMAL DEFAULT 0,
  total_pips DECIMAL DEFAULT 0,
  avg_rr DECIMAL DEFAULT 0,
  tier TEXT DEFAULT 'new',
  average_rating DECIMAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  binance_wallet TEXT,
  ethereum_wallet TEXT,
  mtn_momo_number TEXT,
  airtel_money_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_is_active ON providers(is_active);
CREATE INDEX IF NOT EXISTS idx_providers_tier ON providers(tier);

-- ============================================
-- STEP 5: ENSURE SIGNALS TABLE EXISTS
-- ============================================
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  direction TEXT NOT NULL,
  timeframe TEXT,
  analysis TEXT,
  status TEXT DEFAULT 'active',
  entry_price DECIMAL NOT NULL,
  entry_zone_low DECIMAL,
  entry_zone_high DECIMAL,
  stop_loss DECIMAL NOT NULL,
  take_profit_1 DECIMAL NOT NULL,
  take_profit_2 DECIMAL,
  take_profit_3 DECIMAL,
  risk TEXT DEFAULT 'medium',
  chart_image TEXT,
  outcome TEXT,
  result_pips DECIMAL,
  is_free BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_provider_id ON signals(provider_id);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);

-- ============================================
-- STEP 6: ENSURE SUBSCRIPTIONS TABLE EXISTS
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  plan TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'UGX',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_id ON subscriptions(provider_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- STEP 7: ENSURE PAYMENTS TABLE EXISTS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id TEXT REFERENCES providers(id),
  subscription_id TEXT REFERENCES subscriptions(id),
  amount DECIMAL NOT NULL,
  platform_fee DECIMAL DEFAULT 0,
  provider_amount DECIMAL DEFAULT 0,
  currency TEXT DEFAULT 'UGX',
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  tx_hash TEXT,
  wallet_address TEXT,
  phone_number TEXT,
  momo_reference TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================
-- STEP 8: CREATE HELPFUL TRIGGERS
-- ============================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_provider_applications_updated_at ON provider_applications;
CREATE TRIGGER update_provider_applications_updated_at
  BEFORE UPDATE ON provider_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_signals_updated_at ON signals;
CREATE TRIGGER update_signals_updated_at
  BEFORE UPDATE ON signals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 9: TRIGGER FOR AUTO-APPROVAL
-- ============================================
CREATE OR REPLACE FUNCTION handle_application_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update user role to provider
    UPDATE users SET role = 'provider', updated_at = NOW() WHERE id = NEW.user_id;
    
    -- Create provider profile if not exists
    INSERT INTO providers (
      user_id, display_name, avatar, bio, pairs, timeframes,
      currency, monthly_price, weekly_price, quarterly_price, yearly_price,
      subscribers, is_verified, is_active, total_signals, win_rate,
      total_pips, avg_rr, tier, average_rating, total_reviews,
      created_at, updated_at
    )
    SELECT 
      NEW.user_id,
      COALESCE(u.name, SPLIT_PART(u.email, '@', 1)),
      u.avatar,
      NULL, '{}', '{}',
      'UGX', 0, 0, 0, 0,
      0, FALSE, TRUE, 0, 0,
      0, 0, 'new', 0, 0,
      NOW(), NOW()
    FROM users u
    WHERE u.id = NEW.user_id
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_application_approval_trigger ON provider_applications;
CREATE TRIGGER handle_application_approval_trigger
  AFTER UPDATE ON provider_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_application_approval();

-- ============================================
-- STEP 10: TRIGGER FOR PROVIDER RATING UPDATE
-- ============================================
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating FLOAT;
    review_count INTEGER;
BEGIN
    SELECT 
        AVG(rating)::FLOAT,
        COUNT(*)
    INTO avg_rating, review_count
    FROM reviews
    WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
    AND is_public = TRUE;
    
    UPDATE providers
    SET 
        average_rating = COALESCE(avg_rating, 0),
        total_reviews = COALESCE(review_count, 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_provider_rating_trigger ON reviews;
CREATE TRIGGER update_provider_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify everything is set up correctly
-- ============================================
SELECT 'Migrations completed successfully!' as status;

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'providers', 'signals', 'subscriptions', 'payments', 'notifications', 'provider_applications', 'reviews')
ORDER BY table_name;
