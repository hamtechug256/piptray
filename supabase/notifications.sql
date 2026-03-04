-- Create notifications table
-- Run this in your Supabase SQL Editor

-- Drop existing table if needed (be careful in production!)
-- DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    "data" JSONB DEFAULT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "readAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications("createdAt" DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

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
