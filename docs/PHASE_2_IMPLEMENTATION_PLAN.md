# 🚀 VICHAAR Phase 2 - Implementation Plan

## 📋 Overview

Phase 2 will transform VICHAAR into a more interactive and connected platform by adding:
- 🏷️ **Hashtag System** - Clickable hashtags in posts
- 👤 **Mentions & Tagging** - Tag users with @username  
- 🔄 **Repost/Share** - Share others' posts to your feed
- 💬 **Comment Threads** - Reply to specific comments

---

## 🎯 Feature 1: Hashtag System 🏷️

### What It Does:
- Users can add hashtags to posts using `#hashtag` syntax
- Hashtags are automatically detected and made clickable
- Clicking a hashtag shows all posts with that tag
- Trending hashtags section

### Implementation Steps:

#### 1.1 Database Schema Updates (Supabase)
```sql
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

-- Create index for hashtag search
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_hashtags_post_count ON hashtags(post_count DESC);
```

#### 1.2 Utility Functions
**File: `lib/hashtagUtils.js`**
- `extractHashtags(text)` - Extract hashtags from post content
- `renderHashtags(text)` - Convert hashtags to clickable links
- `getTrendingHashtags()` - Fetch trending hashtags

#### 1.3 Components to Create/Modify
- **`components/HashtagLink.jsx`** - Clickable hashtag component
- **`components/TrendingHashtags.jsx`** - Trending hashtags sidebar
- **`app/hashtag/[tag]/page.jsx`** - Hashtag feed page
- **Modify: `components/Postcard.jsx`** - Render hashtags as clickable
- **Modify: `app/publish/page.jsx`** - Extract hashtags on post creation

---

## 🎯 Feature 2: Mentions & Tagging 👤

### What It Does:
- Users can mention others using `@username` syntax
- Mentioned users receive notifications
- Clicking a mention navigates to user profile
- Auto-complete suggestions while typing

### Implementation Steps:

#### 2.1 Database Schema Updates
```sql
-- Add mentions column to posts and comments
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}';

-- Update notifications table to handle mentions
-- (Already exists, just need to add 'mention' type)
```

#### 2.2 Utility Functions
**File: `lib/mentionUtils.js`**
- `extractMentions(text)` - Extract @mentions from text
- `renderMentions(text)` - Convert mentions to clickable links
- `getUserSuggestions(query)` - Get user suggestions for autocomplete
- `notifyMentionedUsers(postId, mentions)` - Send notifications

#### 2.3 Components to Create/Modify
- **`components/MentionLink.jsx`** - Clickable mention component
- **`components/MentionAutocomplete.jsx`** - Autocomplete dropdown
- **Modify: `components/Postcard.jsx`** - Render mentions as clickable
- **Modify: `app/publish/page.jsx`** - Add mention autocomplete
- **Modify: `components/CommentSection.jsx`** - Support mentions in comments

---

## 🎯 Feature 3: Repost/Share 🔄

### What It Does:
- Users can repost others' content to their feed
- Shows original author with "Reposted by" indicator
- Option to add comment when reposting
- Track repost count

### Implementation Steps:

#### 3.1 Database Schema Updates
```sql
-- Add repost fields to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS original_post_id UUID REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_comment TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reposts TEXT[] DEFAULT '{}';

-- Create index for reposts
CREATE INDEX IF NOT EXISTS idx_posts_original_post_id ON posts(original_post_id);
```

#### 3.2 Components to Create/Modify
- **`components/RepostButton.jsx`** - Repost button with modal
- **`components/RepostModal.jsx`** - Modal for adding comment to repost
- **`components/RepostedPostCard.jsx`** - Display reposted content
- **Modify: `components/Postcard.jsx`** - Add repost button and display

#### 3.3 API Routes
- **`app/api/repost/route.js`** - Handle repost creation

---

## 🎯 Feature 4: Comment Threads 💬

### What It Does:
- Users can reply to specific comments
- Nested comment display (parent → child)
- Visual threading with indentation
- "View replies" toggle for nested comments

### Implementation Steps:

#### 4.1 Database Schema Updates
```sql
-- Add threading fields to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS thread_level INTEGER DEFAULT 0;

-- Create index for comment threads
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
```

#### 4.2 Components to Create/Modify
- **`components/CommentThread.jsx`** - Nested comment display
- **`components/ReplyButton.jsx`** - Reply to comment button
- **`components/CommentReplyForm.jsx`** - Reply input form
- **Modify: `components/CommentSection.jsx`** - Support threaded comments

---

## 📁 Files to Create

### New Files:
1. `lib/hashtagUtils.js`
2. `lib/mentionUtils.js`
3. `components/HashtagLink.jsx`
4. `components/TrendingHashtags.jsx`
5. `components/MentionLink.jsx`
6. `components/MentionAutocomplete.jsx`
7. `components/RepostButton.jsx`
8. `components/RepostModal.jsx`
9. `components/RepostedPostCard.jsx`
10. `components/CommentThread.jsx`
11. `components/ReplyButton.jsx`
12. `components/CommentReplyForm.jsx`
13. `app/hashtag/[tag]/page.jsx`
14. `app/api/repost/route.js`
15. `supabase/phase2_migration.sql`

### Files to Modify:
1. `components/Postcard.jsx`
2. `components/CommentSection.jsx`
3. `app/publish/page.jsx`
4. `app/feed/page.jsx`
5. `supabase/schema.sql`

---

## 🎨 UI/UX Enhancements

### Hashtag Display:
```
Post content with #trending and #vichaar hashtags
                    ↑ blue        ↑ blue
                    clickable     clickable
```

### Mention Display:
```
Great post @abhishek! Love your thoughts on this.
           ↑ blue, clickable, shows user card on hover
```

### Repost Display:
```
┌─────────────────────────────────────────────┐
│ 🔄 Reposted by @currentUser                 │
│ "Adding my thoughts on this!"               │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐ │
│  │ @originalAuthor • 2h ago              │ │
│  │ Original post content here...         │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Comment Thread Display:
```
┌─────────────────────────────────────────────┐
│ @user1: Great post!                         │
│   ↳ @user2: I agree!                        │
│      ↳ @user1: Thanks!                      │
│ @user3: Interesting perspective             │
│   ↳ @user4: Could you elaborate?            │
└─────────────────────────────────────────────┘
```

---

## 🔄 Implementation Order

### Week 1: Hashtags
1. Create database migration
2. Build hashtag utility functions
3. Create HashtagLink component
4. Update Postcard to render hashtags
5. Create hashtag feed page
6. Build TrendingHashtags sidebar

### Week 2: Mentions
1. Update database schema
2. Build mention utility functions
3. Create MentionLink component
4. Build autocomplete component
5. Update Postcard and publish page
6. Implement mention notifications

### Week 3: Reposts
1. Update database schema
2. Create repost components
3. Build repost API
4. Update Postcard with repost button
5. Implement repost display
6. Add repost analytics

### Week 4: Comment Threads
1. Update comments schema
2. Build CommentThread component
3. Create reply functionality
4. Update CommentSection
5. Add thread navigation
6. Polish and test

---

## 🧪 Testing Checklist

### Hashtags:
- [ ] Hashtags are extracted correctly from posts
- [ ] Hashtags are clickable
- [ ] Hashtag feed shows correct posts
- [ ] Trending hashtags update in real-time
- [ ] Multiple hashtags in one post work

### Mentions:
- [ ] Mentions are detected and highlighted
- [ ] Mentioned users receive notifications
- [ ] Autocomplete shows relevant users
- [ ] Clicking mention navigates to profile
- [ ] Multiple mentions work correctly

### Reposts:
- [ ] Repost creates new post correctly
- [ ] Original post is displayed properly
- [ ] Repost count updates
- [ ] Repost with comment works
- [ ] Delete repost works

### Comment Threads:
- [ ] Replies nest correctly
- [ ] Thread level limits work
- [ ] Reply count updates
- [ ] Navigation between threads works
- [ ] Delete cascades properly

---

## 🎯 Success Metrics

- Users can create posts with hashtags and mentions
- Hashtag discovery increases user engagement
- Reposts amplify content reach
- Comment threads enable deeper discussions
- All features work on mobile and desktop
- Performance remains smooth with new features

---

## 🚀 Ready to Start?

Phase 2 will significantly enhance VICHAAR's social features. Let's build it step by step!

**Next Step**: Run the Phase 2 database migration and start with hashtags! 🏷️
