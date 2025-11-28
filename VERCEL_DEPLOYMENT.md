# 🚀 VERCEL DEPLOYMENT GUIDE - LOVE2MATCH

## Why Vercel?
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN
- ✅ Automatic deployments from Git
- ✅ Zero configuration
- ✅ Free tier available
- ✅ Excellent performance

---

## 📋 Prerequisites

1. GitHub account (or GitLab/Bitbucket)
2. Vercel account (sign up at https://vercel.com)
3. Project built and tested locally
4. Supabase project set up

---

## 🎯 Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - ready for launch"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/love2match.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will auto-detect Vite configuration

### Step 3: Configure Environment Variables
In Vercel dashboard, add:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your app is live! 🎉

---

## 🎯 Method 2: Deploy via Vercel CLI (Faster)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
# From project root
cd "OneDrive/Documents/WORKBENCH/CLEGG JOB/Lovable Versions/love2match-core-main/love2match-core-main"

# First deployment (preview)
vercel

# Production deployment
vercel --prod
```

### Step 4: Set Environment Variables
```bash
# Add Supabase URL
vercel env add VITE_SUPABASE_URL production

# Add Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY production

# Redeploy with new env vars
vercel --prod
```

---

## ⚙️ Vercel Configuration (Optional)

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🔧 Post-Deployment Configuration

### 1. Custom Domain (Optional)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatic

### 2. Environment Variables
Vercel Dashboard → Your Project → Settings → Environment Variables

**Required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Optional:**
- `VITE_SENTRY_DSN` (if using Sentry)
- `VITE_GA_TRACKING_ID` (if using Google Analytics)

### 3. Build Settings
Vercel Dashboard → Your Project → Settings → General

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

---

## 🚀 Automatic Deployments

### Setup Git Integration
1. Every push to `main` branch = Production deployment
2. Every push to other branches = Preview deployment
3. Pull requests get unique preview URLs

### Deployment Workflow
```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys to production
# 4. Sends notification
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)
1. Go to Vercel Dashboard → Your Project → Analytics
2. View:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Performance Monitoring
1. Vercel Dashboard → Your Project → Speed Insights
2. Monitor:
   - Core Web Vitals
   - Lighthouse scores
   - Real user metrics

---

## 🔍 Debugging Deployments

### View Build Logs
1. Vercel Dashboard → Your Project → Deployments
2. Click on deployment
3. View "Building" tab for logs

### Common Issues

#### Build Fails
```bash
# Check build locally first
npm run build

# If local build works, check:
# 1. Environment variables in Vercel
# 2. Node version compatibility
# 3. Build logs in Vercel dashboard
```

#### Environment Variables Not Working
```bash
# Ensure variables start with VITE_
# Redeploy after adding variables:
vercel --prod
```

#### 404 on Routes
Add to `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🎯 Deployment Checklist

### Before Deployment
- [ ] All tests pass locally
- [ ] Production build works (`npm run build`)
- [ ] Environment variables documented
- [ ] Database migrations applied
- [ ] Admin user created

### During Deployment
- [ ] Environment variables added to Vercel
- [ ] Build completes successfully
- [ ] No errors in build logs

### After Deployment
- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Database connections work
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)

---

## 🔄 Rollback Procedure

If something goes wrong:

### Via Dashboard
1. Vercel Dashboard → Your Project → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Via CLI
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

---

## 📈 Performance Optimization

### Enable Compression
Vercel automatically enables:
- Gzip compression
- Brotli compression

### Edge Caching
Static assets automatically cached at edge locations

### Image Optimization
Consider using Vercel's Image Optimization:
```typescript
// Install @vercel/image
npm install @vercel/image

// Use in components
import Image from '@vercel/image'
```

---

## 💰 Pricing

### Free Tier Includes:
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Analytics

### Pro Tier ($20/month):
- 1 TB bandwidth
- Advanced analytics
- Team collaboration
- Priority support

---

## 🆘 Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Community:** https://github.com/vercel/vercel/discussions
- **Status:** https://vercel-status.com

---

## 🎉 Quick Deploy Commands

```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy to production
vercel --prod

# View deployment URL
vercel ls

# Open in browser
vercel open
```

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Site loads at Vercel URL
- ✅ HTTPS is active (green padlock)
- ✅ Authentication works
- ✅ Database queries succeed
- ✅ Images load correctly
- ✅ Mobile layout works
- ✅ No console errors
- ✅ Lighthouse score > 90

---

**Ready to deploy?**

```bash
vercel --prod
```

**Your app will be live in ~2 minutes!** 🚀
