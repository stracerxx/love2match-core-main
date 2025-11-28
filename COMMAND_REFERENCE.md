# 🎯 LOVE2MATCH - COMMAND REFERENCE CARD

Quick reference for all deployment commands.

---

## 🚀 DEPLOYMENT COMMANDS

### Local Development
```powershell
npm run dev
```
Opens at: http://localhost:5173

### Production Build
```powershell
npm run build
```
Output: `dist/` folder

### Preview Production Build
```powershell
npm run preview
```

---

## 📦 GIT COMMANDS

### Initial Commit
```powershell
git add .
git commit -m "Initial commit - Love2Match ready for deployment"
```

### Connect to GitHub
```powershell
git remote add origin https://github.com/YOUR_USERNAME/love2match.git
git branch -M main
git push -u origin main
```

### Check Status
```powershell
git status
git log --oneline -5
```

---

## 🌐 DEPLOYMENT COMMANDS

### Vercel CLI
```powershell
npm install -g vercel
vercel login
vercel --prod
```

### Netlify CLI
```powershell
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## 🗄️ DATABASE COMMANDS

### Access Supabase SQL Editor
```
https://app.supabase.com/project/ctgqznazjyplpuwmehav/sql
```

### Verify Admin User
```sql
SELECT * FROM public.users WHERE role = 'admin';
```

### Check Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 🔍 TESTING COMMANDS

### Run Linter
```powershell
npm run lint
```

### Check Build Size
```powershell
npm run build
Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum
```

### Test Production Build Locally
```powershell
npm run build
npm run preview
```

---

## 📊 PROJECT INFO COMMANDS

### Check Node/NPM Version
```powershell
node --version
npm --version
```

### List Dependencies
```powershell
npm list --depth=0
```

### Check for Updates
```powershell
npm outdated
```

---

## 🛠️ TROUBLESHOOTING COMMANDS

### Clear Node Modules & Reinstall
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Clear Build Cache
```powershell
Remove-Item -Recurse -Force dist
npm run build
```

### Check Environment Variables
```powershell
Get-Content .env
```

---

## 🚀 AUTOMATED SCRIPTS

### Quick Deploy Script
```powershell
.\quick-deploy.ps1
```

### Launch Prep Script
```powershell
.\launch-prep.ps1
```

---

## 🔗 IMPORTANT URLS

**Supabase:**
- Dashboard: https://app.supabase.com/project/ctgqznazjyplpuwmehav
- SQL Editor: https://app.supabase.com/project/ctgqznazjyplpuwmehav/sql
- API Settings: https://app.supabase.com/project/ctgqznazjyplpuwmehav/settings/api

**Deployment:**
- Vercel: https://vercel.com/new
- Netlify: https://app.netlify.com/drop
- GitHub: https://github.com/new

**Local:**
- Dev Server: http://localhost:5173
- Preview Server: http://localhost:4173

---

## 📋 ENVIRONMENT VARIABLES

Copy these to your deployment platform:

```
VITE_SUPABASE_URL=https://ctgqznazjyplpuwmehav.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_1X_Wvf_zVo2w4ZW6jn3N5Q_6XSgl1nx
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_SOLANA_CLUSTER=mainnet-beta
```

---

## 🎯 QUICK LAUNCH SEQUENCE

```powershell
# 1. Database (do in Supabase SQL Editor)
# Run FINAL_COMPLETE_FIX.sql
# Run SETUP_ADMIN_USER.sql

# 2. Test locally
npm run dev

# 3. Commit to Git
git add .
git commit -m "Ready for deployment"

# 4. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/love2match.git
git branch -M main
git push -u origin main

# 5. Deploy to Vercel
# Go to https://vercel.com/new
# Import repository
# Add environment variables
# Deploy
```

---

**Print this card for quick reference during deployment!**
