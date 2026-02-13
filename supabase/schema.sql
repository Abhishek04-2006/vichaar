-- VICHAAR Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  photo_url TEXT,
  cover_url TEXT,
  bio TEXT,
  followers TEXT[] DEFAULT '{}',
  following TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT,
  author_email TEXT,
  author_photo TEXT,
  content TEXT NOT NULL,
  image TEXT,
  likes TEXT[] DEFAULT '{}',
  reactions JSONB DEFAULT '{}',
  user_reactions JSONB DEFAULT '{}',
  bookmarks TEXT[] DEFAULT '{}',
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT,
  user_photo TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  post_data JSONB,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participants TEXT[] NOT NULL,
  last_message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  sender_id TEXT,
  sender_name TEXT,
  sender_photo TEXT,
  post_id UUID,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_participants ON chats USING GIN(participants);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users are viewable by everyone" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own profile" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid()::text = id::text);

-- RLS Policies for Posts
CREATE POLICY "Posts are viewable by everyone" 
  ON posts FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON posts FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update any post" 
  ON posts FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own posts" 
  ON posts FOR DELETE 
  USING (auth.uid()::text = author_id::text);

-- RLS Policies for Comments
CREATE POLICY "Comments are viewable by everyone" 
  ON comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON comments FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own comments" 
  ON comments FOR DELETE 
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for Bookmarks
CREATE POLICY "Users can view own bookmarks" 
  ON bookmarks FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own bookmarks" 
  ON bookmarks FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own bookmarks" 
  ON bookmarks FOR DELETE 
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for Chats
CREATE POLICY "Users can view chats they're in" 
  ON chats FOR SELECT 
  USING (auth.uid()::text = ANY(participants));

CREATE POLICY "Users can create chats" 
  ON chats FOR INSERT 
  WITH CHECK (auth.uid()::text = ANY(participants));

CREATE POLICY "Users can update chats they're in" 
  ON chats FOR UPDATE 
  USING (auth.uid()::text = ANY(participants));

-- RLS Policies for Messages
CREATE POLICY "Users can view messages in their chats" 
  ON messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND auth.uid()::text = ANY(chats.participants)
    )
  );

CREATE POLICY "Users can create messages in their chats" 
  ON messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_id 
      AND auth.uid()::text = ANY(chats.participants)
    )
  );

-- RLS Policies for Notifications
CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Anyone can create notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own notifications" 
  ON notifications FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chats table
CREATE TRIGGER update_chats_updated_at 
  BEFORE UPDATE ON chats 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
