# Changelog

All notable changes to the VICHAAR project will be documented in this file.

## [Phase 2] - 2026-02-13

### Added - Feature 1: Hashtag System 🏷️
- Automatic hashtag extraction from post content
- Clickable hashtag links in posts
- Dedicated hashtag feed pages (`/hashtag/[tag]`)
- Trending hashtags sidebar component
- Real-time trending updates via Supabase subscriptions
- Unicode support for regional language hashtags
- Database triggers for automatic hashtag counting
- `lib/hashtagUtils.js` - Comprehensive hashtag utilities
- `components/HashtagLink.jsx` - Clickable hashtag component
- `components/TrendingHashtags.jsx` - Trending sidebar
- `app/hashtag/[tag]/page.jsx` - Dynamic hashtag feed pages

### Added - Feature 2: Mentions & Tagging 👤
- @mention autocomplete with user suggestions
- Clickable mention links in posts
- User preview cards on mention hover
- Automatic notifications for mentioned users
- Keyboard navigation in autocomplete (↑↓ arrows, Enter, Esc)
- Combined hashtag + mention text parsing
- `lib/mentionUtils.js` - Mention utility functions
- `components/MentionLink.jsx` - Clickable mention with hover card
- `components/MentionAutocomplete.jsx` - Smart autocomplete dropdown

### Changed
- Enhanced `components/Postcard.jsx` to render both hashtags and mentions
- Upgraded `app/publish/page.jsx` with autocomplete and beautiful gradient UI
- Updated `app/feed/page.jsx` to include trending hashtags sidebar
- Added fade-in animation to `app/globals.css`

### Database
- Added `hashtags` column to `posts` table
- Added `mentions` column to `posts` table
- Created `hashtags` table for trending/discovery
- Added indexes for hashtag and mention queries
- Created triggers for automatic hashtag count management

---

## [Phase 1] - 2026-02-11

### Added - Core Social Features
- Double-tap to like posts (Instagram-style)
- Emoji reactions system (6 reactions: ❤️ 😂 😮 😢 😡 👍)
- Bookmark functionality
- Dark mode toggle with smooth transitions
- Share functionality (Web Share API + clipboard fallback)
- "People You May Know" recommendations
- Real-time reaction updates
- Reaction summary display on posts

### Changed
- Enhanced `components/Postcard.jsx` with reaction picker
- Added reaction animations (heart ping, bounce-in)
- Improved UI/UX with modern design patterns

### Database
- Added `reactions` column to `posts` table
- Added `bookmarks` column to `users` table
- Updated RLS policies for reactions and bookmarks

---

## [Migration to Supabase] - 2026-02-11

### Changed
- Migrated from Firebase to Supabase
- Replaced Firestore with PostgreSQL
- Replaced Firebase Auth with Supabase Auth
- Updated all database queries to use Supabase client
- Migrated real-time subscriptions to Supabase Realtime

### Added
- `supabase/schema.sql` - Complete database schema
- `supabase/auth_trigger.sql` - Auto-create user profiles
- `lib/supabase.js` - Supabase client configuration
- Row Level Security (RLS) policies for all tables

### Removed
- Firebase dependencies and configuration
- Firestore database code
- Firebase Auth code

### Fixed
- Cover photo upload functionality
- User profile creation on signup
- Real-time feed updates

---

## [Initial Release] - 2025-12-28

### Added
- User authentication (signup/login)
- Post creation with text and images
- Like and comment functionality
- User profiles with avatar
- Follow/unfollow system
- Main feed with posts from followed users
- Image upload to Cloudinary
- Responsive design with Tailwind CSS
- Dark mode support

### Database
- Created `users` table
- Created `posts` table
- Created `comments` table
- Set up basic RLS policies

---

## Future Releases

### Planned for Phase 2 (Remaining)
- [ ] Feature 3: Repost/Share functionality
- [ ] Feature 4: Comment threads (nested replies)

### Planned for Phase 3
- [ ] Notifications center
- [ ] Advanced search (users, posts, hashtags)
- [ ] Direct messaging
- [ ] User verification badges
- [ ] Post analytics
- [ ] Content moderation improvements

---

## Version History

- **Phase 2** (Current) - Hashtags & Mentions
- **Phase 1** - Social Interactions & Reactions
- **Migration** - Firebase to Supabase
- **v1.0** - Initial Release

---

*For detailed feature documentation, see the [docs](docs/) folder.*
