# Admin Access Troubleshooting Guide

## Issue
Your account shows "basic" and the admin page is blank, even though your database role is correctly set to "admin".

## Root Cause
The frontend application caches user profile data, including the role. When your role was updated from "basic" to "admin", the cached data wasn't automatically refreshed.

## Solution Steps

### Step 1: Sign Out and Back In
1. Go to the application: http://localhost:8080
2. Click on your profile or account settings
3. Find and click "Sign Out"
4. Sign back in with your email: `shane@thecyberdyne.com`

### Step 2: Clear Browser Cache (if Step 1 doesn't work)
1. **Chrome/Edge**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) for hard refresh
2. **Alternative**: Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
3. **Manual Clear**: 
   - Press `F12` to open Developer Tools
   - Right-click the refresh button and select "Empty Cache and Hard Reload"

### Step 3: Check Admin Access
1. After signing in, look for the admin shield icon (⚔️) in the navigation
2. Navigate to: http://localhost:8080/admin
3. You should see the admin dashboard with:
   - Platform analytics
   - User management
   - Token faucet
   - Pending exchanges

### Step 4: Verify Your Role
1. Check your profile - it should now show "admin" instead of "basic"
2. If it still shows "basic", there might be a different issue

## Database Verification
Your database role has been confirmed as "admin":
- ✅ User: `shane@thecyberdyne.com`
- ✅ Role: `admin`
- ✅ ID: `a8ba5cc9-df37-4980-a905-4b8c4d10139a`

## If Still Not Working
If you've tried all the above steps and still can't access the admin dashboard:

1. **Check Browser Console**:
   - Press `F12` and look for any JavaScript errors
   - Check the "Network" tab for failed API calls

2. **Alternative Access**:
   - Try accessing the admin login directly: http://localhost:8080/admin-login
   - Use the default admin password: `admin123`

3. **Contact Support**:
   - If the issue persists, there may be a deeper authentication issue

## Success Indicators
When everything is working correctly, you should see:
- Admin shield icon in navigation
- Access to admin dashboard at `/admin`
- Your profile showing "admin" role
- Ability to use the token faucet and manage users

The admin faucet is ready and waiting for you to distribute LOVE tokens to users!