# 🎯 LOVE2MATCH - QUICK START GUIDE

## ⚡ 30-Minute Quick Launch

### 1️⃣ Database Setup (10 min)
```bash
# In Supabase SQL Editor:
1. Copy/paste FINAL_COMPLETE_FIX.sql → Execute
2. Edit SETUP_ADMIN_USER.sql with your email → Execute
3. Verify: SELECT * FROM public.users WHERE role = 'admin';
```

### 2️⃣ Environment Setup (5 min)
```bash
# Create .env file:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3️⃣ Install & Test (10 min)
```bash
npm install
npm run dev
# Open http://localhost:5173
# Test: Sign up → Sign in → Check admin dashboard
```

### 4️⃣ Build & Deploy (5 min)
```bash
npm run build
vercel --prod
# Or push to GitHub and connect to Vercel/Netlify
```

---

## 🔥 Critical Files to Update

### index.html (Line 6-7)
```html
<title>Love2Match - Find Your Perfect Match</title>
<meta name="description" content="Love2Match - Modern dating platform" />
```

### public/favicon.ico
Replace with your branded favicon

### public/logo.png
Replace with your branded logo (512x512 recommended)

---

## 🚨 Common Issues & Fixes

### Issue: "UUID/BIGINT error"
**Fix:** Run `FINAL_COMPLETE_FIX.sql` in Supabase

### Issue: "Admin dashboard not showing"
**Fix:** 
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```
Then sign out and sign back in.

### Issue: "Build fails"
**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: "Can't connect to Supabase"
**Fix:** Check `.env` file has correct credentials

---

## 📊 Pre-Launch Checklist

- [ ] Database scripts executed
- [ ] Admin user created
- [ ] Environment variables set
- [ ] App title updated
- [ ] Favicon replaced
- [ ] Logo replaced
- [ ] Test authentication flow
- [ ] Production build successful
- [ ] Deployed to hosting

---

## 🎯 Testing Priorities

### Must Test:
1. Sign up / Sign in
2. Profile creation
3. Admin dashboard access
4. Mobile responsiveness
5. Image uploads (if applicable)

### Should Test:
1. Password reset
2. All navigation links
3. Error messages
4. Loading states
5. Browser compatibility

---

## 🚀 Deployment Commands

### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Manual Build
```bash
npm run build
# Upload dist/ folder to your hosting
```

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev
- **React Router:** https://reactrouter.com
- **Vercel Docs:** https://vercel.com/docs

---

## 🎉 Launch Day Checklist

1. ✅ All tests passed
2. ✅ SSL certificate active
3. ✅ Error tracking enabled (Sentry)
4. ✅ Analytics configured
5. ✅ Backups enabled
6. ✅ Monitoring active
7. ✅ Social media ready
8. ✅ Support email set up

---

**Ready to launch? Run:** `npm run build && vercel --prod`

**Need help? Check:** `LAUNCH_CHECKLIST.md` for detailed guide
