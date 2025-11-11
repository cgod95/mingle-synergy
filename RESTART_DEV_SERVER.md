# CRITICAL: Restart Dev Server to Fix React Errors

## The Problem
Vite has cached multiple React instances in separate chunks. The config changes won't take effect until you restart.

## Solution

### Step 1: Stop Current Dev Server
Press `Ctrl+C` in the terminal where `npm run dev` is running

### Step 2: Clear All Caches
```bash
rm -rf node_modules/.vite
rm -rf .vite
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

## What Changed
- Updated `vite.config.ts` to force framer-motion into the same chunk as React
- Added `force: true` to `optimizeDeps` to force re-optimization
- Updated manual chunks to keep React and framer-motion together

## Expected Result
After restart, you should see:
- ✅ No more "Invalid hook call" errors
- ✅ Single React instance loaded
- ✅ App works normally

## If Errors Persist
If you still see errors after restart, try:
```bash
rm -rf node_modules node_modules/.vite .vite
npm install
npm run dev
```


