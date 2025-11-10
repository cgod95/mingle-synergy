# Bug Fixes & Next Steps Plan - January 2025

## 🐛 Issues Identified

### 1. ✅ Settings Page Not Working
**Problem:** Missing `isVisible` state variable causing runtime error
**Status:** FIXED
**Fix:** Added `const [isVisible, setIsVisible] = useState(true);` to SettingsPage.tsx

### 2. ✅ Select Component Error
**Problem:** SelectItem with empty string value causing Radix UI error
**Status:** FIXED
**Fix:** Changed empty string value to "none" and updated handling logic in VenueDetails.tsx

### 3. ⚠️ Some Venues Not Working
**Potential Issues:**
- Venue IDs mismatch between `venueService` mock data and `demoVenues`
- Async loading issues in `getVenue()` function
- Error handling not surfacing properly
- Missing venue data validation

## 🔍 Investigation Needed

### Venue Loading Flow:
1. `CheckInPage` calls `getVenues()` from `lib/api.ts`
2. `lib/api.ts` checks `config.DEMO_MODE`
3. If demo mode: imports `venueService.default.getVenues()`
4. Falls back to `demoVenues` if import fails
5. `VenueDetails` calls `getVenue(id)` similarly

### Potential Root Causes:
- **ID Mismatch**: `venueService` uses IDs '1'-'8', but `demoVenues` might use different IDs
- **Async Errors**: Errors in venueService import might be silently caught
- **Data Structure**: Venue objects might have different shapes
- **Missing Venues**: Some venue IDs might not exist in mock data

## 📋 Next Steps (Priority Order)

### Phase 1: Immediate Fixes (30 min)
1. ✅ **Fix Settings Page** - Add missing `isVisible` state
2. **Add Error Logging** - Log venue loading errors to console
3. **Verify Venue IDs** - Ensure all venue IDs match between services
4. **Add Error Boundaries** - Catch and display venue loading errors

### Phase 2: Venue Debugging (1-2 hours)
1. **Add Console Logging**
   - Log when venues are loaded
   - Log venue IDs and counts
   - Log any errors during loading

2. **Verify Data Consistency**
   - Check `venueService.ts` mockVenues array (should have 8 venues)
   - Check `demoVenues.ts` DEMO_VENUES array
   - Ensure IDs match: '1', '2', '3', '4', '5', '6', '7', '8'

3. **Test Venue Loading**
   - Test `getVenues()` returns all 8 venues
   - Test `getVenue(id)` for each ID '1'-'8'
   - Test error handling when venue doesn't exist

4. **Fix Venue Display**
   - Ensure venue cards render correctly
   - Check venue details page loads
   - Verify people at venue display correctly

### Phase 3: Error Handling Improvements (1 hour)
1. **Add User-Friendly Error Messages**
   - Show toast notifications for loading errors
   - Display fallback UI when venues fail to load
   - Add retry mechanisms

2. **Improve Error Boundaries**
   - Wrap venue components in error boundaries
   - Show helpful error messages instead of blank screens

### Phase 4: Testing & Validation (1 hour)
1. **Manual Testing**
   - Test Settings page functionality
   - Test all venue pages load correctly
   - Test venue check-in flow
   - Test venue details display

2. **Error Scenarios**
   - Test with invalid venue IDs
   - Test with network errors (if applicable)
   - Test with missing venue data

## 🔧 Code Changes Needed

### 1. SettingsPage.tsx ✅ DONE
```typescript
const [isVisible, setIsVisible] = useState(true);
```

### 2. lib/api.ts - Add Error Logging
```typescript
export async function getVenues() {
  if (config.DEMO_MODE) {
    try {
      const venueService = await import('@/services/firebase/venueService');
      const venues = await venueService.default.getVenues();
      console.log('[api] Loaded venues:', venues.length, venues.map(v => v.id));
      return venues;
    } catch (error) {
      console.error('[api] Error loading venues from venueService:', error);
      return getVenuesFromDemoVenues();
    }
  }
  return getVenuesFromDemoVenues();
}
```

### 3. CheckInPage.tsx - Add Error Handling
```typescript
useEffect(() => {
  getVenues()
    .then(venues => {
      console.log('[CheckInPage] Loaded venues:', venues.length);
      setVenues(venues);
    })
    .catch(error => {
      console.error('[CheckInPage] Error loading venues:', error);
      setVenues([]);
      // Show error toast
    });
}, []);
```

### 4. VenueDetails.tsx - Add Error Handling
```typescript
useEffect(() => {
  if (id) {
    getVenue(id)
      .then(venue => {
        console.log('[VenueDetails] Loaded venue:', id, venue);
        setVenue(venue);
      })
      .catch(error => {
        console.error('[VenueDetails] Error loading venue:', id, error);
        setVenue(null);
        // Show error toast or redirect
      });
  }
}, [id]);
```

## 📊 Success Criteria

- ✅ Settings page loads without errors
- ✅ All 8 venues display in CheckInPage
- ✅ Each venue details page loads correctly
- ✅ Error messages display when venues fail to load
- ✅ No console errors related to venues or settings

## 🚀 After Fixes

1. **Update Handover Documents**
   - Document fixes in CONTEXT_CONTINUITY.md
   - Update SESSION_SUMMARY_JAN_2025.md
   - Add to NEW_CHAT_TRANSFER.md

2. **Commit Changes**
   - Commit fixes with descriptive messages
   - Push to GitHub

3. **Test End-to-End**
   - Full user flow test
   - Verify all features work

---

**Created:** January 2025  
**Status:** Phase 1 in progress  
**Next:** Add error logging and verify venue data consistency

