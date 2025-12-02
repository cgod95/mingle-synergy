# Framer Motion "Invalid Hook Call" Fix

## Critical Issue
The app is showing "Invalid hook call" errors because framer-motion is creating a second React instance, causing conflicts.

## Root Cause
- Multiple files still use framer-motion (41 files found)
- framer-motion was excluded from `optimizeDeps`, causing it to bundle with its own React instance
- This creates two React instances in the app, breaking hooks

## Fixes Applied

### 1. Vite Config Changes
- **Added framer-motion to alias**: Forces it to use the same React instance
- **Added framer-motion to dedupe**: Ensures only one instance
- **Included framer-motion in optimizeDeps**: Pre-bundles it with the same React
- **Fixed HMR port config**: Removed hardcoded port to prevent `ws://localhost:undefined` errors

### 2. AnimatedCard Component
- **Disabled framer-motion**: Replaced `motion.div` with regular `div` and CSS animations
- This prevents the `MotionDOMComponent` error in card.tsx

### 3. Cache Cleared
- Removed `node_modules/.vite`, `.vite`, and `dist` directories
- Forces Vite to rebuild with new configuration

## Next Steps

1. **Restart dev server**: The cache clear requires a fresh start
2. **Test**: The "Invalid hook call" errors should be resolved
3. **If errors persist**: We may need to remove framer-motion from more components or completely uninstall it

## Files Still Using Framer Motion
Many files still import framer-motion but aren't actively used in the main app flow:
- LoadingStates.tsx
- MingleLogo.tsx
- Performance.tsx
- ThemeToggle.tsx
- etc.

These can be addressed later if they cause issues, but the main app flow should work now.




