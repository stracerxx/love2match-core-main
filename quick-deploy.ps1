# Love2Match - Quick Deploy Script
# Run this after database setup is complete

Write-Host "🚀 Love2Match - Quick Deploy Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\gamed\OneDrive\Documents\WORKBENCH\CLEGG JOB\Lovable Versions\love2match-core-main\love2match-core-main"
Set-Location $projectPath

Write-Host "📍 Current Directory: $projectPath" -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 1: Checking Git status..." -ForegroundColor Green
git status

Write-Host ""
$gitCommit = Read-Host "Do you want to commit all changes? (y/n)"

if ($gitCommit -eq "y") {
    Write-Host "📝 Committing changes..." -ForegroundColor Green
    git add .
    git commit -m "Ready for deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Write-Host "✅ Changes committed!" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping commit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Checking for GitHub remote..." -ForegroundColor Green
$remoteExists = git remote -v 2>$null

if ($remoteExists) {
    Write-Host "✅ GitHub remote found:" -ForegroundColor Green
    git remote -v
    Write-Host ""
    $pushToGithub = Read-Host "Push to GitHub? (y/n)"
    
    if ($pushToGithub -eq "y") {
        Write-Host "📤 Pushing to GitHub..." -ForegroundColor Green
        git push
        Write-Host "✅ Pushed to GitHub!" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  No GitHub remote configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To add GitHub remote:" -ForegroundColor Cyan
    Write-Host "1. Create a new repository on GitHub" -ForegroundColor White
    Write-Host "2. Run: git remote add origin https://github.com/YOUR_USERNAME/love2match.git" -ForegroundColor White
    Write-Host "3. Run: git branch -M main" -ForegroundColor White
    Write-Host "4. Run: git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "Step 3: Build verification..." -ForegroundColor Green
if (Test-Path "dist") {
    Write-Host "✅ Build folder exists (dist/)" -ForegroundColor Green
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   Size: $([math]::Round($distSize, 2)) MB" -ForegroundColor White
} else {
    Write-Host "⚠️  Build folder not found. Running build..." -ForegroundColor Yellow
    npm run build
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🎯 DEPLOYMENT OPTIONS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Deploy to Vercel (Recommended)" -ForegroundColor Green
Write-Host "   1. Go to: https://vercel.com/new" -ForegroundColor White
Write-Host "   2. Import your GitHub repository" -ForegroundColor White
Write-Host "   3. Add environment variables (see .env file)" -ForegroundColor White
Write-Host "   4. Click Deploy" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Deploy to Netlify" -ForegroundColor Green
Write-Host "   1. Go to: https://app.netlify.com/drop" -ForegroundColor White
Write-Host "   2. Drag the 'dist' folder" -ForegroundColor White
Write-Host "   3. Add environment variables in Site Settings" -ForegroundColor White
Write-Host ""
Write-Host "Option 3: Install Vercel CLI and deploy now" -ForegroundColor Green
Write-Host "   Run: npm install -g vercel" -ForegroundColor White
Write-Host "   Then: vercel --prod" -ForegroundColor White
Write-Host ""

$deployChoice = Read-Host "Install Vercel CLI and deploy now? (y/n)"

if ($deployChoice -eq "y") {
    Write-Host ""
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Green
    npm install -g vercel
    
    Write-Host ""
    Write-Host "🚀 Starting Vercel deployment..." -ForegroundColor Green
    Write-Host "⚠️  You'll need to:" -ForegroundColor Yellow
    Write-Host "   1. Log in to Vercel" -ForegroundColor White
    Write-Host "   2. Add environment variables when prompted" -ForegroundColor White
    Write-Host ""
    
    vercel --prod
} else {
    Write-Host ""
    Write-Host "✅ Script complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Complete database setup in Supabase" -ForegroundColor White
    Write-Host "2. Test locally: npm run dev" -ForegroundColor White
    Write-Host "3. Deploy using one of the options above" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - DEPLOYMENT_STATUS.md (just created!)" -ForegroundColor White
Write-Host "   - VERCEL_DEPLOYMENT.md" -ForegroundColor White
Write-Host "   - QUICK_START_LAUNCH.md" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Good luck with your launch!" -ForegroundColor Green
