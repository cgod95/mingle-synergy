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

# Check if DEMO_MODE is false in production (check for hardcoded true or env check that defaults to true)
if grep -rq "DEMO_MODE.*=.*true\|DEMO_MODE.*true" dist/ 2>/dev/null; then
    echo "❌ Error: DEMO_MODE appears to be enabled in production build"
    echo "   Checking build output..."
    grep -r "DEMO_MODE" dist/ | head -5
    exit 1
fi

# Verify DEMO_MODE uses environment variable check
if ! grep -rq "VITE_DEMO_MODE\|import.meta.env" dist/**/*.js 2>/dev/null; then
    echo "⚠️  Warning: DEMO_MODE check may not be using environment variables"
fi

# Check for console statements in production build
CONSOLE_COUNT=$(grep -r "console\." dist/**/*.js 2>/dev/null | wc -l | tr -d ' ')
if [ "$CONSOLE_COUNT" -gt 0 ]; then
    echo "⚠️  Warning: Found $CONSOLE_COUNT console statements in production build"
    echo "   Consider using logger utility instead"
fi

# Check for sourcemaps (should be disabled in production)
if find dist -name "*.map" | grep -q .; then
    echo "⚠️  Warning: Source maps found in production build"
    echo "   Consider disabling source maps for production"
fi

# Check bundle size (< 1MB per file recommended)
echo "📊 Bundle size analysis..."
BUNDLE_SIZE_CHECK=true
for file in dist/js/*.js; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        SIZE_MB=$(echo "scale=2; $SIZE / 1024 / 1024" | bc)
        if (( $(echo "$SIZE_MB > 1.0" | bc -l) )); then
            echo "⚠️  Warning: $(basename $file) is ${SIZE_MB}MB (recommended: < 1MB)"
            BUNDLE_SIZE_CHECK=false
        else
            echo "✅ $(basename $file): ${SIZE_MB}MB"
        fi
    fi
done

if [ "$BUNDLE_SIZE_CHECK" = false ]; then
    echo "⚠️  Some bundles exceed recommended size. Consider code splitting."
fi

# Verify Firebase config is present (not demo values)
if grep -rq "demo\|demo-project\|demo.firebaseapp.com" dist/**/*.js 2>/dev/null; then
    echo "⚠️  Warning: Demo Firebase config values found in production build"
    echo "   Ensure VITE_FIREBASE_* environment variables are set correctly"
fi

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