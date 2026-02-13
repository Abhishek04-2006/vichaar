-- VICHAAR Phase 2 Database Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- FEATURE 1: HASHTAG SYSTEM
-- ============================================

-- Add hashtags column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}';

-- Create hashtags table for trending/discovery
CREATE TABLE IF NOT EXISTS hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for hashtag search
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_hashtags_post_count ON hashtags(post_count DESC);

-- ============================================
-- FEATURE 2: MENTIONS & TAGGING
-- ============================================

-- Add mentions column to posts and comments
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}';

-- Create index for mentions
CREATE INDEX IF NOT EXISTS idx_posts_mentions ON posts USING GIN(mentions);
CREATE INDEX IF NOT EXISTS idx_comments_mentions ON comments USING GIN(mentions);

-- ============================================
-- FEATURE 3: REPOST/SHARE
-- ============================================

-- Add repost fields to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_comment TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reposts TEXT[] DEFAULT '{}';

-- Create indexes for reposts
CREATE INDEX IF NOT EXISTS idx_posts_original_post_id ON posts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_repost ON posts(is_repost);

-- ============================================
-- FEATURE 4: COMMENT THREADS
-- ============================================

-- Add threading fields to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS thread_level INTEGER DEFAULT 0;

-- Create index for comment threads
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_thread_level ON comments(thread_level);

-- ============================================
-- RLS POLICIES FOR NEW FEATURES
-- ============================================

-- Hashtags table policies
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hashtags are viewable by everyone" 
  ON hashtags FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create hashtags" 
  ON hashtags FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update hashtags" 
  ON hashtags FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- FUNCTIONS FOR HASHTAG MANAGEMENT
-- ============================================

-- Function to increment hashtag post count
CREATE OR REPLACE FUNCTION increment_hashtag_count(tag_name TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO hashtags (tag, post_count, last_used)
  VALUES (LOWER(tag_name), 1, NOW())
  ON CONFLICT (tag) 
  DO UPDATE SET 
    post_count = hashtags.post_count + 1,
    last_used = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to decrement hashtag post count
CREATE OR REPLACE FUNCTION decrement_hashtag_count(tag_name TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE hashtags 
  SET post_count = GREATEST(post_count - 1, 0)
  WHERE tag = LOWER(tag_name);
  
  -- Delete hashtag if post_count reaches 0
  DELETE FROM hashtags 
  WHERE tag = LOWER(tag_name) AND post_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS FOR AUTOMATIC HASHTAG MANAGEMENT
-- ============================================

-- Trigger to update hashtag counts when post is created
CREATE OR REPLACE FUNCTION update_hashtags_on_post_insert()
RETURNS TRIGGER AS $$
DECLARE
  tag TEXT;
BEGIN
  -- Increment count for each hashtag
  FOREACH tag IN ARRAY NEW.hashtags
  LOOP
    PERFORM increment_hashtag_count(tag);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hashtags_on_insert
  AFTER INSERT ON posts
  FOR EACH ROW
  WHEN (NEW.hashtags IS NOT NULL AND array_length(NEW.hashtags, 1) > 0)
  EXECUTE FUNCTION update_hashtags_on_post_insert();

-- Trigger to update hashtag counts when post is deleted
CREATE OR REPLACE FUNCTION update_hashtags_on_post_delete()
RETURNS TRIGGER AS $$
DECLARE
  tag TEXT;
BEGIN
  -- Decrement count for each hashtag
  FOREACH tag IN ARRAY OLD.hashtags
  LOOP
    PERFORM decrement_hashtag_count(tag);
  END LOOP;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hashtags_on_delete
  AFTER DELETE ON posts
  FOR EACH ROW
  WHEN (OLD.hashtags IS NOT NULL AND array_length(OLD.hashtags, 1) > 0)
  EXECUTE FUNCTION update_hashtags_on_post_delete();

-- ============================================
-- FUNCTION TO UPDATE REPOST COUNT
-- ============================================

CREATE OR REPLACE FUNCTION update_repost_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_repost AND NEW.original_post_id IS NOT NULL THEN
    -- Increment repost count on original post
    UPDATE posts 
    SET repost_count = repost_count + 1,
        reposts = array_append(reposts, NEW.author_id::TEXT)
    WHERE id = NEW.original_post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_repost_count
  AFTER INSERT ON posts
  FOR EACH ROW
  WHEN (NEW.is_repost = TRUE)
  EXECUTE FUNCTION update_repost_count();

-- ============================================
-- FUNCTION TO UPDATE COMMENT REPLY COUNT
-- ============================================

CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_comment_id IS NOT NULL THEN
    -- Increment reply count on parent comment
    UPDATE comments 
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_reply_count
  AFTER INSERT ON comments
  FOR EACH ROW
  WHEN (NEW.parent_comment_id IS NOT NULL)
  EXECUTE FUNCTION update_comment_reply_count();

-- ============================================
-- ENABLE REALTIME FOR NEW FEATURES
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE hashtags;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify hashtags column was added
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'hashtags';

-- Verify hashtags table was created
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'hashtags';

-- Verify all indexes were created
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('posts', 'comments', 'hashtags');

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Phase 2 migration completed successfully!
-- All features are now ready for implementation.
