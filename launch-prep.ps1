# Love2Match Quick Launch Script (PowerShell)
# This script helps you quickly verify and prepare for launch

Write-Host "🚀 Love2Match Launch Preparation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Print-Status {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Warning {
    param($message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

function Print-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Print-Error "package.json not found. Please run this script from the project root."
    exit 1
}

Print-Status "Found package.json"

# Check Node.js version
try {
    $nodeVersion = node -v
    Print-Status "Node.js version: $nodeVersion"
} catch {
    Print-Error "Node.js not found. Please install Node.js first."
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Print-Warning "node_modules not found. Installing dependencies..."
    npm install
} else {
    Print-Status "Dependencies already installed"
}

# Check for .env file
if (-not (Test-Path ".env")) {
    Print-Warning ".env file not found. Creating template..."
    @"
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Add other environment variables here
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Print-Warning "Please update .env with your Supabase credentials"
} else {
    Print-Status ".env file exists"
}

# Check for SQL files
Write-Host ""
Write-Host "📊 Database Setup Files:" -ForegroundColor Cyan
if (Test-Path "FINAL_COMPLETE_FIX.sql") {
    Print-Status "FINAL_COMPLETE_FIX.sql found"
} else {
    Print-Error "FINAL_COMPLETE_FIX.sql not found"
}

if (Test-Path "SETUP_ADMIN_USER.sql") {
    Print-Status "SETUP_ADMIN_USER.sql found"
} else {
    Print-Error "SETUP_ADMIN_USER.sql not found"
}

# Check for branding files
Write-Host ""
Write-Host "🎨 Branding Files:" -ForegroundColor Cyan
if (Test-Path "public/favicon.ico") {
    Print-Status "favicon.ico found"
} else {
    Print-Warning "favicon.ico not found in public/"
}

if (Test-Path "public/logo.png") {
    Print-Status "logo.png found"
} else {
    Print-Warning "logo.png not found in public/"
}

# Run linter
Write-Host ""
Write-Host "🔍 Running code quality checks..." -ForegroundColor Cyan
try {
    $lintResult = npm run lint 2>&1 | Select-Object -First 20
    if ($LASTEXITCODE -eq 0) {
        Print-Status "Linting passed"
    } else {
        Print-Warning "Linting found issues (see above)"
    }
} catch {
    Print-Warning "Could not run linter"
}

# Try to build
Write-Host ""
Write-Host "🏗️  Testing production build..." -ForegroundColor Cyan
try {
    $buildResult = npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Print-Status "Production build successful"
        Print-Status "Build output in dist/ directory"
    } else {
        Print-Error "Production build failed. Run 'npm run build' for details"
    }
} catch {
    Print-Error "Production build failed. Run 'npm run build' for details"
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 Launch Readiness Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update .env with your Supabase credentials"
Write-Host "2. Run FINAL_COMPLETE_FIX.sql in Supabase SQL Editor"
Write-Host "3. Run SETUP_ADMIN_USER.sql with your email"
Write-Host "4. Update branding in index.html"
Write-Host "5. Replace favicon and logo in public/"
Write-Host "6. Run 'npm run dev' to test locally"
Write-Host "7. Run 'npm run build' for production"
Write-Host "8. Deploy to Vercel/Netlify"
Write-Host ""
Write-Host "📖 See LAUNCH_CHECKLIST.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
