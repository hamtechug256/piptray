-- Reviews Table Migration for PipTray
-- Run this SQL in your Supabase SQL Editor

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider_id, user_id) -- One review per user per provider
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Anyone can read public reviews
CREATE POLICY "Reviews are viewable by everyone if public"
    ON reviews FOR SELECT
    USING (is_public = TRUE);

-- Policy: Users can read their own reviews (even if not public)
CREATE POLICY "Users can view their own reviews"
    ON reviews FOR SELECT
    USING (auth.uid()::text = user_id OR auth.uid()::text = user_id);

-- Policy: Users can insert their own reviews
CREATE POLICY "Users can create their own reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
    ON reviews FOR DELETE
    USING (auth.uid()::text = user_id);

-- Function to automatically verify reviews from subscribers
CREATE OR REPLACE FUNCTION verify_review()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user has/had a subscription with this provider
    SELECT EXISTS (
        SELECT 1 FROM subscriptions
        WHERE user_id = NEW.user_id
        AND provider_id = NEW.provider_id
    ) INTO NEW.is_verified;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to verify reviews on insert/update
DROP TRIGGER IF EXISTS verify_review_trigger ON reviews;
CREATE TRIGGER verify_review_trigger
    BEFORE INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION verify_review();

-- Function to update provider rating after review changes
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating FLOAT;
    review_count INTEGER;
BEGIN
    -- Calculate new average rating
    SELECT 
        AVG(rating)::FLOAT,
        COUNT(*)
    INTO avg_rating, review_count
    FROM reviews
    WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
    AND is_public = TRUE;
    
    -- Update provider
    UPDATE providers
    SET 
        average_rating = COALESCE(avg_rating, 0),
        total_reviews = COALESCE(review_count, 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update provider rating after review changes
DROP TRIGGER IF EXISTS update_provider_rating_trigger ON reviews;
CREATE TRIGGER update_provider_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();

-- Grant permissions
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON reviews TO service_role;
