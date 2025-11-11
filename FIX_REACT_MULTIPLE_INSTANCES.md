# Fix for Multiple React Instances Error

## Problem
The app is experiencing "Invalid hook call" errors because multiple React instances are being loaded. This happens when:
- Vite bundles React in multiple chunks
- Different dependencies (like framer-motion) use different React instances
- Vite's dependency pre-bundling creates separate React instances

## Solution Applied

### 1. Updated `vite.config.ts`
- Added React aliases to force single instance
- Added `dedupe` in resolve
- Added `optimizeDeps` with deduplication
- Included framer-motion in optimizeDeps

### 2. Updated `package.json`
- Set resolutions to match dependencies (React 18.3.1)

### 3. Fixed WebSocket validation
- Added checks for invalid/placeholder URLs
- Prevents connection attempts with undefined URLs

## Next Steps

1. **Stop your dev server** (Ctrl+C)

2. **Clear all caches**:
   ```bash
   rm -rf node_modules/.vite
   rm -rf .vite
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

4. **If errors persist**, try:
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

## Expected Result
- Single React instance loaded
- No "Invalid hook call" errors
- WebSocket errors only for HMR (non-critical)
- App should work normally


