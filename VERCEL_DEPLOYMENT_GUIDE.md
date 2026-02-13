# 🚀 VICHAAR - Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Required

You'll need to add these environment variables in Vercel:

#### Supabase Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Cloudinary Variables:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your VICHAAR project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Get Your Cloudinary Credentials

1. Go to https://cloudinary.com/console
2. Copy from your dashboard:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## 🌐 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import your repository**: `Abhishek04-2006/vichaar`
5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)
6. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add all 5 variables listed above
7. **Click "Deploy"**
8. **Wait 2-3 minutes** for deployment to complete
9. **Visit your live site!**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? vichaar
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET

# Deploy to production
vercel --prod
```

---

## 🔧 Post-Deployment Steps

### 1. Run Database Migrations

**IMPORTANT**: After deployment, run the Phase 2 migration in Supabase:

1. Go to Supabase Dashboard
2. SQL Editor
3. Run `supabase/phase2_migration.sql`
4. Also run `supabase/add_cover_url_migration.sql` if not done yet

### 2. Test Your Deployment

Visit your Vercel URL and test:
- [ ] Sign up / Login works
- [ ] Create a post with #hashtags and @mentions
- [ ] Hashtags are clickable
- [ ] Mentions show autocomplete
- [ ] Trending hashtags appear
- [ ] Notifications work
- [ ] Image uploads work (Cloudinary)

### 3. Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

---

## 🐛 Troubleshooting

### Build Fails?
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs in Vercel dashboard

### Environment Variables Not Working?
- Make sure they're added in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Supabase Connection Issues?
- Verify SUPABASE_URL and ANON_KEY are correct
- Check Supabase project is active
- Ensure RLS policies are set up

### Images Not Uploading?
- Verify Cloudinary credentials
- Check API route `/api/upload` is working
- Ensure CLOUDINARY_API_SECRET is set (not NEXT_PUBLIC_)

---

## 📊 Deployment Info

### Build Settings:
- **Framework**: Next.js 15
- **Node Version**: 18.x or higher
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Performance:
- **Edge Functions**: Automatic
- **Image Optimization**: Enabled
- **Analytics**: Available in Vercel dashboard

---

## 🎉 Success!

Once deployed, your VICHAAR app will be live at:
- **Vercel URL**: `https://vichaar-[random].vercel.app`
- **Custom Domain**: (if configured)

Share your link and enjoy your deployed social media platform! 🚀

---

## 📝 Quick Reference

### Vercel Dashboard URLs:
- Dashboard: https://vercel.com/dashboard
- Project Settings: https://vercel.com/[your-username]/vichaar/settings
- Deployments: https://vercel.com/[your-username]/vichaar/deployments
- Environment Variables: https://vercel.com/[your-username]/vichaar/settings/environment-variables

### Useful Commands:
```bash
# Redeploy
vercel --prod

# View logs
vercel logs

# Check deployment status
vercel ls
```

---

**Made with ❤️ for VICHAAR**
