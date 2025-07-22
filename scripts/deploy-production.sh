#!/bin/bash

# 🧠 Production Deployment Script
# This script handles production deployment with security and performance checks

set -e

echo "🚀 Starting production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if production environment variables are set
if [ -z "$VITE_FIREBASE_API_KEY" ]; then
    echo "❌ Error: VITE_FIREBASE_API_KEY not set"
    exit 1
fi

if [ -z "$VITE_FIREBASE_PROJECT_ID" ]; then
    echo "❌ Error: VITE_FIREBASE_PROJECT_ID not set"
    exit 1
fi

echo "✅ Environment variables validated"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level=moderate || {
    echo "⚠️  Security vulnerabilities found. Please review and fix before deployment."
    exit 1
}

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test

# Build for production
echo "🏗️  Building for production..."
npm run build

# Verify production build
echo "✅ Verifying production build..."

# Check if DEMO_MODE is false in production
if grep -q "DEMO_MODE.*true" dist/**/*.js; then
    echo "❌ Error: DEMO_MODE is still enabled in production build"
    exit 1
fi

# Check for console statements in production build
if grep -q "console\." dist/**/*.js; then
    echo "⚠️  Warning: Console statements found in production build"
fi

# Check bundle size
echo "📊 Bundle size analysis..."
du -sh dist/js/*.js | sort -hr

# Create deployment manifest
echo "📝 Creating deployment manifest..."
cat > dist/deployment-manifest.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "$(node -p "require('./package.json').version")",
  "environment": "production",
  "buildId": "$(date +%s)",
  "checks": {
    "securityAudit": "passed",
    "linting": "passed",
    "tests": "passed",
    "demoMode": "disabled",
    "bundleOptimized": "true"
  }
}
EOF

echo "✅ Production build verified"

# Deploy to Firebase (if configured)
if command -v firebase &> /dev/null; then
    echo "🔥 Deploying to Firebase..."
    firebase deploy --only hosting --project "$VITE_FIREBASE_PROJECT_ID"
else
    echo "⚠️  Firebase CLI not found. Please install and configure Firebase CLI for deployment."
fi

# Deploy to Vercel (if configured)
if [ -f "vercel.json" ]; then
    echo "🚀 Deploying to Vercel..."
    npx vercel --prod
else
    echo "⚠️  Vercel configuration not found. Please create vercel.json for Vercel deployment."
fi

echo "🎉 Production deployment completed successfully!"
echo "📊 Deployment manifest: dist/deployment-manifest.json"
echo "🔗 Monitor your deployment at your hosting platform's dashboard" 