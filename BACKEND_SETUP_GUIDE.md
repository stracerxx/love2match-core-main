# Love2Match Backend Setup Guide

## 🎯 Quick Setup (5 Minutes)

Your `.env` file has been updated to use your hosted Supabase project. Now you just need to run 2 SQL scripts in your Supabase dashboard.

---

## Step 1: Access Supabase SQL Editor

1. Open your browser and go to: **https://supabase.com/dashboard/project/ctgqznazjyplpuwmehav/sql/new**
2. Log in to your Supabase account if prompted

---

## Step 2: Run Database Fix Script

### What it does:
- Fixes the UUID/BIGINT type conflict
- Creates all necessary tables (token_transactions, swap_requests, etc.)
- Sets up proper foreign key relationships
- Adds default configuration values

### How to run:
1. In the SQL Editor, **copy and paste** the entire contents of `FINAL_COMPLETE_FIX.sql`
2. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
3. Wait for the success message: "UUID/BIGINT error completely resolved!"

**File location:** `c:\Users\gamed\love2match-core-main\FINAL_COMPLETE_FIX.sql`

---

## Step 3: Set Up Admin Access

### What it does:
- Grants admin privileges to your user account
- Allows you to access the Admin Dashboard

### How to run:
1. **First, sign up for an account** in your app (http://localhost:8080/auth)
   - Use the email you want to be the admin (e.g., your personal email)
   - Complete the signup process

2. **Then**, go back to the Supabase SQL Editor
3. Open `SETUP_ADMIN_USER.sql` and **replace line 10** with your email:
   ```sql
   UPDATE public.users 
   SET role = 'admin' 
   WHERE email = 'YOUR_EMAIL_HERE@example.com';  -- Change this!
   ```

4. Copy the **modified** SQL and run it in the SQL Editor
5. Verify by running:
   ```sql
   SELECT id, email, role FROM public.users WHERE role = 'admin';
   ```

**File location:** `c:\Users\gamed\love2match-core-main\SETUP_ADMIN_USER.sql`

---

## Step 4: Restart Your Dev Server

The `.env` file has been updated, so you need to restart Vite:

1. In your terminal, press **Ctrl+C** to stop the current `npm run dev`
2. Run `npm run dev` again
3. The app will now connect to your hosted Supabase database

---

## Step 5: Test the App

1. Open **http://localhost:8080/** in your browser
2. Sign in with your admin account
3. You should now see:
   - ✅ No "Connection Refused" errors
   - ✅ Profile data loading correctly
   - ✅ A **Shield icon** in the navigation (admin access)
   - ✅ Ability to send gifts from Discover and Messages pages

---

## 🎉 You're Done!

Your Love2Match app is now fully functional with:
- ✅ Database connected and schema fixed
- ✅ Admin access configured
- ✅ Gifts system integrated
- ✅ All core features working

---

## Troubleshooting

### "Still seeing connection errors"
- Make sure you restarted the dev server after updating `.env`
- Check that the Supabase URL in `.env` matches your project

### "Can't see admin dashboard"
- Verify your user has `role = 'admin'` in the database
- Make sure you're logged in with that account
- Look for the Shield icon in the navigation bar

### "Tables don't exist"
- Make sure you ran `FINAL_COMPLETE_FIX.sql` successfully
- Check the Supabase SQL Editor for any error messages

---

## Next Steps

Once everything is working, you can:
1. **Update branding** (favicon, logo, app name)
2. **Add sample data** (events, users, content)
3. **Configure Solana wallet** (for LOVE token integration)
4. **Deploy to production** (Vercel, Netlify, etc.)

Need help? Check the other documentation files:
- `LAUNCH_CHECKLIST.md` - Full deployment guide
- `QUICK_START_LAUNCH.md` - 30-minute quick start
- `VERCEL_DEPLOYMENT.md` - Deploy to Vercel
