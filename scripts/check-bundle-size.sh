#!/bin/bash

# Bundle Size Check Script
# Checks build output sizes and reports findings

echo "🔍 Checking bundle sizes..."
echo ""

# Build the project
echo "Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "📊 Bundle Size Analysis:"
echo "========================"
echo ""

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found!"
    exit 1
fi

# Get total size
TOTAL_SIZE=$(du -sh dist | cut -f1)
echo "Total bundle size: $TOTAL_SIZE"
echo ""

# Get sizes of main files
echo "Main files:"
find dist -type f -name "*.js" -exec du -h {} \; | sort -rh | head -10
echo ""

# Get CSS size
echo "CSS files:"
find dist -type f -name "*.css" -exec du -h {} \;
echo ""

# Get asset sizes
echo "Assets:"
find dist/assets -type f 2>/dev/null | head -5 | xargs du -h 2>/dev/null || echo "No assets found"
echo ""

# Check for large files (>500KB)
echo "⚠️  Large files (>500KB):"
find dist -type f -size +500k -exec du -h {} \;
echo ""

# Summary
echo "✅ Bundle size check complete!"
echo ""
echo "Target: < 1MB total"
echo "Current: $TOTAL_SIZE"

