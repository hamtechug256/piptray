-- ============================================
-- FIX NOTIFICATIONS TABLE - Run in Supabase SQL Editor
-- This fixes the UUID/TEXT type mismatch error
-- ============================================

-- First, drop the existing notifications table if it has the wrong schema
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications table with correct schema (TEXT for userId to match users.id)
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    "data" JSONB DEFAULT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "readAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_notifications_user_id ON notifications("userId");
CREATE INDEX idx_notifications_is_read ON notifications("isRead");
CREATE INDEX idx_notifications_created ON notifications("createdAt" DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING ("userId" = auth.uid()::text);

CREATE POLICY "Service role can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can manage all notifications"
    ON notifications FOR ALL
    USING (true);

-- Verify the table was created
SELECT 'Notifications table created successfully!' as status;
