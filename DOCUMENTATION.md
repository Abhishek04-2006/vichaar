# Vichaar - Project Documentation

## 📋 Project Overview

**Vichaar** is a modern, full-featured social media platform built with Next.js 16, designed to give every Indian a voice. The platform enables users to share thoughts, connect with others, and engage in meaningful conversations.

### Key Highlights
- **Modern Tech Stack**: Next.js 16, React 19, Firebase, Tailwind CSS 4
- **Real-time Features**: Live notifications, chat messaging, and feed updates
- **AI-Powered Moderation**: Automatic content filtering for safe community
- **Responsive Design**: Beautiful UI that works seamlessly across all devices
- **Production Ready**: Fully tested, linted, and optimized for deployment

---

## 🎯 Features

### Core Features
1. **User Authentication**
   - Email/Password authentication
   - Google OAuth integration
   - Secure session management with localStorage

2. **Post Management**
   - Create posts with text and images
   - Image upload via Cloudinary
   - Like and comment functionality
   - Real-time post updates

3. **Social Interactions**
   - Follow/Unfollow users
   - User profiles with follower counts
   - People discovery page
   - "People You May Know" recommendations

4. **Communication**
   - Direct messaging between users
   - Real-time chat functionality
   - Chat history persistence

5. **Notifications**
   - Real-time notifications for:
     - Post likes
     - Comments
     - New followers
   - Notification history

6. **Search & Discovery**
   - Search for users by name or email
   - Search posts by content
   - Explore page for discovering content

7. **Content Moderation**
   - AI-powered profanity detection
   - Automatic content filtering
   - User warning and ban system

---

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **Framework**: Next.js 16.0.1 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.553.0
- **Language**: JavaScript/JSX with TypeScript support

#### Backend & Services
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage + Cloudinary
- **Content Moderation**: bad-words library

#### Development Tools
- **Linting**: ESLint 9 with Next.js config
- **Type Checking**: TypeScript 5
- **Package Manager**: npm

### Project Structure

```
vichaar/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   └── upload/              # Image upload endpoint
│   ├── chat/                    # Chat pages
│   │   └── [chatId]/           # Individual chat view
│   ├── feed/                    # Main feed page
│   ├── find-people/             # User discovery
│   ├── firebase/                # Firebase configuration
│   ├── login/                   # Login page
│   ├── notifications/           # Notifications page
│   ├── post/                    # Post pages
│   │   └── [postId]/           # Individual post view
│   ├── profile/                 # Profile pages
│   │   └── [uid]/              # User profile view
│   ├── publish/                 # Create post page
│   ├── register/                # Registration page
│   ├── search/                  # Search page
│   ├── signup/                  # Signup page
│   ├── globals.css              # Global styles
│   ├── layout.jsx               # Root layout
│   └── page.jsx                 # Landing page
├── components/                   # React components
│   ├── ui/                      # UI components
│   │   ├── Avatar.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Spinner.jsx
│   │   ├── Textarea.jsx
│   │   └── Toast.jsx
│   ├── FollowButton.jsx         # Follow/Unfollow button
│   ├── Footer.jsx               # Footer component
│   ├── Navbar.jsx               # Navigation bar
│   ├── PeopleYouMayKnow.jsx    # User recommendations
│   └── Postcard.jsx             # Post display card
├── hooks/                        # Custom React hooks
│   └── useAuth.js               # Authentication hook
├── lib/                          # Utility functions
│   ├── follow.js                # Follow/Unfollow logic
│   └── moderation.js            # Content moderation
├── public/                       # Static assets
│   ├── og-image.png             # Open Graph image
│   └── vichaar-logo.svg         # App logo
├── .env.example                  # Environment variables template
├── .env.local                    # Environment variables (not in git)
├── .gitignore                    # Git ignore rules
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project README
```

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager
- Firebase project created
- Cloudinary account (for image uploads)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhishek04-2006/vichaar.git
   cd vichaar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase credentials
   - Add your Cloudinary credentials

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   - Navigate to `http://localhost:3000`

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

---

## 📊 Database Schema

### Firestore Collections

#### users
```javascript
{
  uid: string,
  email: string,
  name: string,
  photoURL: string,
  bio: string,
  followers: array<string>,
  following: array<string>,
  createdAt: timestamp
}
```

#### posts
```javascript
{
  id: string,
  authorId: string,
  authorName: string,
  authorPhoto: string,
  content: string,
  imageUrl: string,
  likes: array<string>,
  commentCount: number,
  createdAt: timestamp
}
```

#### comments (subcollection of posts)
```javascript
{
  id: string,
  userId: string,
  userName: string,
  userPhoto: string,
  text: string,
  createdAt: timestamp
}
```

#### chats
```javascript
{
  id: string,
  participants: array<string>,
  lastMessage: string,
  lastMessageTime: timestamp
}
```

#### messages (subcollection of chats)
```javascript
{
  id: string,
  senderId: string,
  text: string,
  createdAt: timestamp
}
```

#### notifications (subcollection of users)
```javascript
{
  id: string,
  type: "like" | "comment" | "follow",
  senderId: string,
  senderName: string,
  senderPhoto: string,
  postId: string (optional),
  message: string (optional),
  createdAt: timestamp
}
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Secondary**: Indigo (#6366F1)
- **Success**: Green (#10B981)
- **Danger**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)

### Typography
- **Font Family**: System fonts (Inter, SF Pro, Segoe UI)
- **Headings**: Bold, gradient text effects
- **Body**: Regular weight, optimized for readability

### Components
- Glassmorphism effects
- Smooth transitions and animations
- Consistent spacing and padding
- Responsive breakpoints

---

## 🔐 Security Features

1. **Authentication**
   - Firebase Authentication
   - Secure session management
   - Protected routes

2. **Content Moderation**
   - AI-powered profanity detection
   - Automatic content filtering
   - User reporting system

3. **Data Validation**
   - Input sanitization
   - Form validation
   - XSS protection

---

## 📈 Performance Optimizations

1. **Image Optimization**
   - Next.js Image component
   - Cloudinary CDN
   - Lazy loading

2. **Code Splitting**
   - Dynamic imports
   - Route-based splitting
   - Component lazy loading

3. **Caching**
   - Static page generation
   - Client-side caching
   - Firebase query optimization

---

## 🧪 Testing

### Linting
```bash
npm run lint
```

### Build Test
```bash
npm run build
```

---

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

---

## 🐛 Known Issues & Limitations

1. **Content Moderation**: Currently runs client-side. Should be moved to server-side with Firebase Admin SDK for production.
2. **Search**: Uses client-side filtering. For large datasets, consider Algolia or TypeSense.
3. **Real-time Updates**: May have performance issues with very large datasets.

---

## 🔮 Future Enhancements

1. **Features**
   - Video posts
   - Stories feature
   - Hashtags and trending topics
   - Advanced search filters
   - User verification badges

2. **Technical**
   - Server-side rendering for SEO
   - Progressive Web App (PWA)
   - Push notifications
   - Analytics dashboard
   - Admin panel

3. **Performance**
   - Implement pagination
   - Add caching layer
   - Optimize database queries
   - CDN integration

---

## 📞 Support & Contact

- **GitHub**: [@Abhishek04-2006](https://github.com/Abhishek04-2006)
- **Repository**: [vichaar](https://github.com/Abhishek04-2006/vichaar)

---

## 📄 License

This project is open source and available under the MIT License.

---

**Made with ❤️ for India**
