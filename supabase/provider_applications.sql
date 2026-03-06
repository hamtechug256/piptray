-- ============================================
-- PIPTRAY PROVIDER APPLICATIONS TABLE
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Create provider_applications table
CREATE TABLE IF NOT EXISTS provider_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  
  -- Trading Background
  trading_experience INTEGER NOT NULL DEFAULT 0,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
  trading_style TEXT[] NOT NULL DEFAULT '{}',
  markets_traded TEXT[] NOT NULL DEFAULT '{}',
  
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_trading_style CHECK (
    trading_style::text[] <@ ARRAY['scalping', 'day_trading', 'swing_trading', 'position_trading']::text[]
  ),
  CONSTRAINT valid_markets CHECK (
    markets_traded::text[] <@ ARRAY['forex', 'crypto', 'stocks', 'indices', 'commodities']::text[]
  )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_provider_applications_user_id ON provider_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_applications_status ON provider_applications(status);
CREATE INDEX IF NOT EXISTS idx_provider_applications_created_at ON provider_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE provider_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own applications
CREATE POLICY "Users can view own applications" ON provider_applications
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- RLS Policy: Users can insert their own applications
CREATE POLICY "Users can insert own applications" ON provider_applications
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- RLS Policy: Admins can view all applications
CREATE POLICY "Admins can view all applications" ON provider_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'admin'
    )
  );

-- RLS Policy: Admins can update all applications
CREATE POLICY "Admins can update all applications" ON provider_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'admin'
    )
  );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_provider_applications_updated_at
  BEFORE UPDATE ON provider_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to handle application approval
CREATE OR REPLACE FUNCTION handle_application_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When application is approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update user role to provider
    UPDATE users SET role = 'provider', updated_at = NOW() WHERE id = NEW.user_id;
    
    -- Create provider profile if not exists
    INSERT INTO providers (
      user_id,
      display_name,
      avatar,
      bio,
      pairs,
      timeframes,
      currency,
      monthly_price,
      weekly_price,
      quarterly_price,
      yearly_price,
      subscribers,
      is_verified,
      verified_at,
      is_active,
      total_signals,
      win_rate,
      total_pips,
      avg_rr,
      tier,
      average_rating,
      total_reviews,
      created_at,
      updated_at
    )
    SELECT 
      NEW.user_id,
      COALESCE(u.name, SPLIT_PART(u.email, '@', 1)),
      u.avatar,
      NULL,
      '{}',
      '{}',
      'UGX',
      0,
      0,
      0,
      0,
      0,
      false,
      NULL,
      true,
      0,
      0,
      0,
      0,
      'new',
      0,
      0,
      NOW(),
      NOW()
    FROM users u
    WHERE u.id = NEW.user_id
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for application approval
CREATE TRIGGER handle_application_approval_trigger
  AFTER UPDATE ON provider_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_application_approval();

-- ============================================
-- OPTIONAL: Add helpful comments
-- ============================================
COMMENT ON TABLE provider_applications IS 'Stores provider applications from users who want to become signal providers';
COMMENT ON COLUMN provider_applications.trading_experience IS 'Number of years of trading experience';
COMMENT ON COLUMN provider_applications.experience_level IS 'Self-assessed experience level: beginner, intermediate, advanced, professional';
COMMENT ON COLUMN provider_applications.trading_style IS 'Array of trading styles: scalping, day_trading, swing_trading, position_trading';
COMMENT ON COLUMN provider_applications.markets_traded IS 'Array of markets traded: forex, crypto, stocks, indices, commodities';
COMMENT ON COLUMN provider_applications.status IS 'Application status: pending, under_review, approved, rejected';

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify the table was created correctly
-- ============================================
-- SELECT * FROM provider_applications LIMIT 1;
