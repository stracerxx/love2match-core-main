#!/bin/bash

# Love2Match Quick Launch Script
# This script helps you quickly verify and prepare for launch

echo "🚀 Love2Match Launch Preparation Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Found package.json"

# Check Node.js version
NODE_VERSION=$(node -v)
print_status "Node.js version: $NODE_VERSION"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
else
    print_status "Dependencies already installed"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating template..."
    cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Add other environment variables here
EOF
    print_warning "Please update .env with your Supabase credentials"
else
    print_status ".env file exists"
fi

# Check for SQL files
echo ""
echo "📊 Database Setup Files:"
if [ -f "FINAL_COMPLETE_FIX.sql" ]; then
    print_status "FINAL_COMPLETE_FIX.sql found"
else
    print_error "FINAL_COMPLETE_FIX.sql not found"
fi

if [ -f "SETUP_ADMIN_USER.sql" ]; then
    print_status "SETUP_ADMIN_USER.sql found"
else
    print_error "SETUP_ADMIN_USER.sql not found"
fi

# Check for branding files
echo ""
echo "🎨 Branding Files:"
if [ -f "public/favicon.ico" ]; then
    print_status "favicon.ico found"
else
    print_warning "favicon.ico not found in public/"
fi

if [ -f "public/logo.png" ]; then
    print_status "logo.png found"
else
    print_warning "logo.png not found in public/"
fi

# Run linter
echo ""
echo "🔍 Running code quality checks..."
npm run lint 2>&1 | head -n 20
if [ $? -eq 0 ]; then
    print_status "Linting passed"
else
    print_warning "Linting found issues (see above)"
fi

# Try to build
echo ""
echo "🏗️  Testing production build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Production build successful"
    print_status "Build output in dist/ directory"
else
    print_error "Production build failed. Run 'npm run build' for details"
fi

# Summary
echo ""
echo "========================================"
echo "📋 Launch Readiness Summary"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Update .env with your Supabase credentials"
echo "2. Run FINAL_COMPLETE_FIX.sql in Supabase SQL Editor"
echo "3. Run SETUP_ADMIN_USER.sql with your email"
echo "4. Update branding in index.html"
echo "5. Replace favicon and logo in public/"
echo "6. Run 'npm run dev' to test locally"
echo "7. Run 'npm run build' for production"
echo "8. Deploy to Vercel/Netlify"
echo ""
echo "📖 See LAUNCH_CHECKLIST.md for detailed instructions"
echo ""
