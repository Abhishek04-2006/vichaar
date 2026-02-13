-- Migration: Add cover_url column to users table
-- Run this in Supabase SQL Editor to update your existing database

-- Add cover_url column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Verify the column was added
-- You can check by running: SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
