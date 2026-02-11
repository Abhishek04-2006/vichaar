# Vichaar 🇮🇳

**A democratic platform for the voice of India**

Vichaar is a modern social media platform built with Next.js, designed to give every Indian a voice. Share your thoughts, connect with others, and engage in meaningful conversations.

## ✨ Features

- **User Authentication**: Secure login and registration with Firebase Authentication
- **Post Creation & Sharing**: Share your thoughts with text and images
- **Real-time Feed**: Stay updated with posts from people you follow
- **Social Interactions**: Like, comment, and engage with posts
- **User Profiles**: Personalized profiles with follower/following system
- **People Discovery**: Find and connect with new people
- **Direct Messaging**: Chat with other users in real-time
- **Notifications**: Stay informed about interactions on your posts
- **Search Functionality**: Find posts and users easily
- **AI-Powered Moderation**: Automatic detection of abusive content
- **Responsive Design**: Beautiful UI that works on all devices

## 🚀 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: JavaScript/JSX
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Image Upload**: Cloudinary
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Content Moderation**: bad-words library

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Abhishek04-2006/vichaar.git
cd vichaar
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Firebase and Cloudinary credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
vichaar/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── chat/              # Chat functionality
│   ├── feed/              # Main feed page
│   ├── find-people/       # User discovery
│   ├── login/             # Login page
│   ├── notifications/     # Notifications page
│   ├── post/              # Individual post view
│   ├── profile/           # User profiles
│   ├── publish/           # Create new post
│   ├── register/          # Registration page
│   ├── search/            # Search functionality
│   └── signup/            # Signup page
├── components/            # Reusable React components
│   ├── ui/               # UI components
│   ├── Navbar.jsx        # Navigation bar
│   ├── Postcard.jsx      # Post display component
│   ├── FollowButton.jsx  # Follow/Unfollow button
│   └── PeopleYouMayKnow.jsx
├── lib/                   # Utility functions
├── public/               # Static assets
└── hooks/                # Custom React hooks
```

## 🎨 Key Features Explained

### AI-Powered Content Moderation
- Automatically detects and flags abusive language
- Warning system for first-time offenders
- Automatic ban for repeat offenders

### Real-time Updates
- Live notifications for likes, comments, and follows
- Real-time chat messaging
- Instant feed updates

### Responsive Design
- Mobile-first approach
- Beautiful dark theme
- Smooth animations and transitions

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Pages

- **/** - Landing page
- **/feed** - Main feed with posts from followed users
- **/profile** - User profile page
- **/publish** - Create new post
- **/find-people** - Discover new users
- **/chat** - Direct messaging
- **/notifications** - View all notifications
- **/search** - Search posts and users

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Abhishek**
- GitHub: [@Abhishek04-2006](https://github.com/Abhishek04-2006)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- Cloudinary for image management
- All contributors and users of Vichaar

---

**Made with ❤️ for India**
