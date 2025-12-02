# Flicker/Re-render Diagnostic Notes

## Test Results

### 1. StrictMode Status
- **Status**: Already disabled in `src/main.tsx` (lines 30-35)
- **Observation**: [TO BE TESTED] - Test with StrictMode off and record results

### 2. Route Guards Bypassed
- **Status**: ✅ ProtectedRoute temporarily bypassed (AuthRoute restored by user)
- **Date**: 2025-01-XX
- **Observation**: [TO BE FILLED] - Test if flicker stops with ProtectedRoute bypassed

### 3. Production Build Test
- **Status**: [TO BE TESTED]
- **Command**: `npm run build && npm run preview`
- **Observation**: [TO BE FILLED] - Does preview build flicker?
- **Note**: If preview is stable but dev flickers → strongly suggests StrictMode / HMR / dev-only effect issues
- **Note**: If preview also flickers → the bug is in the core app logic (e.g. effects, routing, or context loops)

## Suspicious useEffect Patterns (Category B)

### Context Files - High Priority

1. **`src/context/UserContext.tsx:35`**
   - **Issue**: useEffect with `currentUser` dependency that updates `stableUser` state
   - **Risk**: Could cause cascading updates if `currentUser` object reference changes frequently
   - **Pattern**: `useEffect(() => { ... }, [currentUser])` - depends on object reference

2. **`src/context/OnboardingContext.tsx:116`**
   - **Issue**: useEffect saving to localStorage on every `onboardingProgress` change
   - **Risk**: Has `isInternalUpdate` guard but still runs on every change
   - **Pattern**: `useEffect(() => { ... }, [onboardingProgress, currentUser?.uid])`

3. **`src/context/OnboardingContext.tsx:187`**
   - **Issue**: useEffect checking `hasRequiredData` with `currentUser?.uid` dependency
   - **Risk**: Could trigger async operations on every user ID change
   - **Pattern**: `useEffect(() => { ... }, [currentUser?.uid, isLoading])`

4. **`src/context/AppStateContext.tsx:75`**
   - **Issue**: useEffect with `currentUser` dependency that calls `getInterests()`
   - **Risk**: Could trigger on every render if `currentUser` object reference changes
   - **Pattern**: `useEffect(() => { ... }, [currentUser])` - depends on object reference

5. **`src/context/AppStateContext.tsx:84`**
   - **Issue**: useEffect with `currentUser` dependency that calls `getMatches()`
   - **Risk**: Same as above - object reference dependency
   - **Pattern**: `useEffect(() => { ... }, [currentUser])` - depends on object reference

### Page Files

6. **`src/pages/Matches.tsx:42`**
   - **Issue**: useEffect with `currentUser` dependency, calls async functions and sets state
   - **Risk**: Has interval that runs every 30 seconds - could cause periodic re-renders
   - **Pattern**: `useEffect(() => { ... const interval = setInterval(fetchMatches, 30000); ... }, [currentUser])`

## Firebase Initialization Check

### Status: ✅ GOOD
- Firebase initialization is centralized in `src/firebase/config.ts`
- No component-level Firebase initialization found
- All Firebase services are imported from the config module
- **Action**: No changes needed

## Recommended Fixes (After Testing)

### Priority 1: Context Object Reference Dependencies
- Replace `[currentUser]` dependencies with `[currentUser?.id]` where possible
- Use refs to track previous values and only update when ID actually changes

### Priority 2: localStorage Save Loops
- Review `OnboardingContext` localStorage save logic
- Ensure storage event listeners don't trigger saves

### Priority 3: Interval Cleanup
- Review `Matches.tsx` interval - ensure it's properly cleaned up
- Consider disabling in demo mode if not needed

## Root Cause Identified: 5-Second Timer

### Issue Found
- **Location**: `src/services/performance.ts:205` and `src/services/performance.ts:248`
- **Problem**: Two `setInterval` calls (5 seconds and 10 seconds) were created without cleanup
- **Impact**: Intervals ran forever, causing periodic re-renders every 5 seconds
- **Auto-start**: Performance monitor auto-starts in development mode (line 513-514)

### Fix Applied
- ✅ Added `intervals: Set<number>` to track all interval IDs
- ✅ Store interval IDs when creating them (layout shift: 5s, memory: 10s)
- ✅ Clear all intervals in `stop()` method
- ✅ Proper cleanup prevents interval accumulation on HMR

### Status
- **Fixed**: Intervals now properly tracked and cleaned up
- **Test**: Should eliminate 5-second flicker pattern

## Quick Re-render Fix Applied

### Issue Found
- **Location**: `src/context/UserContext.tsx:35`
- **Problem**: `useEffect` depended on `[currentUser]` (whole object) instead of `[currentUser?.id]`
- **Impact**: Effect ran on every object reference change, causing rapid re-renders even when user ID was unchanged
- **Root Cause**: Complex `stableUser` state management was triggering unnecessary updates

### Fix Applied
- ✅ Simplified `UserContext` - removed complex `stableUser` state management
- ✅ Changed `useEffect` dependency from `[currentUser]` to `[currentUser?.id]`
- ✅ Changed `useMemo` dependency from `[stableUser, setCurrentUser]` to `[currentUser?.id, setCurrentUser]`
- ✅ Temporarily disabled performance monitor auto-start to rule it out

### Status
- **Fixed**: Context now only updates when user ID changes, not on object reference changes
- **Test**: Should eliminate rapid re-renders

## Next Steps
1. ✅ Bypass ProtectedRoute (done)
2. ✅ Fix 5-second timer in performance.ts (done)
3. ✅ Fix analytics 1-second interval (done)
4. ✅ Fix demo notification service interval (done)
5. ⏳ Test that flicker stops after all fixes

## Latest Fixes Applied (Global Re-render Loop)

### Analytics Service 1-Second Interval
- **Fixed**: Disabled in dev/demo mode, added cleanup method
- **Impact**: Eliminates most frequent interval (every 1 second)

### Demo Notification Service
- **Fixed**: Added interval tracking and cleanup method
- **Impact**: Prevents interval accumulation on HMR

### Diagnostic Logging
- **Added**: Console logs to track which contexts/components are re-rendering
- **Purpose**: Identify remaining sources of re-renders if any
4. ⏳ Run `npm run build && npm run preview` and test preview build
5. ⏳ Update this file with test results
6. ⏳ Apply fixes to Category B useEffect patterns if needed

