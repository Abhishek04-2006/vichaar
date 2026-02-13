# 🌟 VICHAAR - A Modern Social Media Platform

> **Vichaar** (विचार) means "thoughts" in Hindi - A platform to share your thoughts with the world!

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A feature-rich social media platform built with modern web technologies, offering real-time interactions, content discovery, and seamless user experience.

## ✨ Features

### 🎯 Core Features
- **User Authentication** - Secure signup/login with Supabase Auth
- **Post Creation** - Share text and images with your followers
- **Social Interactions** - Like, comment, bookmark, and share posts
- **User Profiles** - Customizable profiles with avatar and cover photos
- **Follow System** - Follow users and build your network
- **Real-time Updates** - Live feed updates using Supabase subscriptions

### 🚀 Phase 1 Features
- **Double-Tap to Like** - Instagram-style double-tap on images
- **Emoji Reactions** - Express yourself with 6 different reactions (❤️ 😂 😮 😢 😡 👍)
- **Bookmarks** - Save posts for later viewing
- **Dark Mode** - Beautiful dark theme with smooth transitions
- **Share Functionality** - Share posts via Web Share API or copy link
- **People Discovery** - "People You May Know" recommendations

### 🏷️ Phase 2 Features (Current)
- **Hashtag System** (#hashtag)
  - Automatic hashtag extraction
  - Trending hashtags sidebar
  - Dedicated hashtag feed pages
  - Real-time trending updates
  - Unicode support for regional languages
  
- **Mentions & Tagging** (@username)
  - Smart autocomplete when typing @
  - Clickable mention links
  - User preview cards on hover
  - Automatic notifications for mentioned users
  - Keyboard navigation support

### 🔜 Coming Soon
- **Repost/Share** - Share others' posts to your feed
- **Comment Threads** - Nested replies to comments
- **Notifications Center** - Comprehensive notification system
- **Search** - Find users and posts
- **Direct Messages** - Private conversations

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Real-time**: Supabase Realtime
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Formatting**: [date-fns](https://date-fns.org/)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Cloudinary account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhishek04-2006/vichaar.git
   cd vichaar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Set up Supabase database**
   
   Run these SQL scripts in your Supabase SQL Editor (in order):
   ```bash
   1. supabase/schema.sql
   2. supabase/auth_trigger.sql
   3. supabase/add_cover_url_migration.sql
   4. supabase/phase2_migration.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/new)
3. Import your repository
4. Add environment variables
5. Deploy!

For detailed deployment instructions, see [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)

## 📁 Project Structure

```
vichaar/
├── app/                      # Next.js app directory
│   ├── feed/                # Main feed page
│   ├── profile/             # User profile page
│   ├── publish/             # Create post page
│   ├── hashtag/[tag]/       # Hashtag feed pages
│   ├── login/               # Authentication pages
│   └── ...
├── components/              # React components
│   ├── Postcard.jsx         # Post display component
│   ├── HashtagLink.jsx      # Clickable hashtag
│   ├── MentionLink.jsx      # Clickable mention
│   ├── TrendingHashtags.jsx # Trending sidebar
│   └── ...
├── lib/                     # Utility functions
│   ├── supabase.js          # Supabase client
│   ├── hashtagUtils.js      # Hashtag utilities
│   ├── mentionUtils.js      # Mention utilities
│   └── ...
├── hooks/                   # Custom React hooks
│   └── useAuth.js           # Authentication hook
├── supabase/                # Database scripts
│   ├── schema.sql           # Database schema
│   ├── phase2_migration.sql # Phase 2 migrations
│   └── ...
├── docs/                    # Documentation
│   ├── PHASE_1_COMPLETE.md
│   ├── PHASE_2_SUMMARY.md
│   └── ...
└── public/                  # Static assets
```

## 🎨 Key Features Explained

### Hashtags
Type `#vichaar` in your post and it automatically becomes a clickable link! Click any hashtag to see all posts with that tag. The trending sidebar shows what's popular right now.

### Mentions
Type `@username` to mention someone. As you type, you'll see autocomplete suggestions. Mentioned users receive notifications and can click to view the post.

### Reactions
Beyond simple likes, express yourself with emoji reactions. Hover over the like button to choose from 6 different reactions!

### Real-time Updates
Everything updates live! New posts appear automatically, trending hashtags update in real-time, and notifications arrive instantly.

## 📚 Documentation

- **[Phase 1 Features](docs/PHASE_1_COMPLETE.md)** - Complete Phase 1 feature documentation
- **[Phase 2 Summary](docs/PHASE_2_SUMMARY.md)** - Phase 2 features overview
- **[Deployment Guide](VERCEL_DEPLOYMENT_GUIDE.md)** - How to deploy to Vercel
- **[Technical Documentation](DOCUMENTATION.md)** - Detailed technical reference

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abhishek**
- GitHub: [@Abhishek04-2006](https://github.com/Abhishek04-2006)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Tailwind CSS for the styling system
- All open-source contributors

## 📧 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ in India**

*Vichaar - Share your thoughts, connect with others!*
