# Venue Loading Verification Guide

**Purpose:** Verify venue loading works correctly in demo mode  
**Status:** Needs Testing

---

## How Venue Loading Works

### Demo Mode
In demo mode, venues are loaded from `mockVenues` in `src/data/mock/venues.ts`. The `venueService.ts` returns mock data when `config.DEMO_MODE` is true.

### Production Mode
In production, venues are fetched from Firestore `venues` collection.

---

## Verification Steps

### 1. Check Demo Mode Configuration
```bash
# Check .env file
VITE_DEMO_MODE=true
```

### 2. Test Venue Loading
1. Start dev server: `npm run dev`
2. Navigate to check-in page (`/checkin`)
3. Verify you see 8 venues listed
4. Check browser console for errors
5. Click on each venue to verify details load

### 3. Expected Behavior
- **8 venues** should load immediately
- No console errors
- Venue cards display correctly
- Can check in to venues
- Venue details page loads

### 4. If Venues Don't Load

**Check:**
1. `src/services/firebase/venueService.ts` - `getVenues()` method
2. `src/data/mock/venues.ts` - Mock venues data
3. Browser console for errors
4. `config.DEMO_MODE` is true

**Common Issues:**
- Mock data not imported correctly
- Demo mode flag not set
- Service worker caching issues (clear cache)
- Firebase connection issues (shouldn't matter in demo mode)

---

## Code Locations

**Venue Service:**
- `src/services/firebase/venueService.ts` - Main venue service
- `src/lib/api.ts` - API facade (uses venueService in demo mode)

**Mock Data:**
- `src/data/mock/venues.ts` - Mock venues (8 venues)
- `src/data/mock/index.ts` - Exports mock data

**Pages:**
- `src/pages/CheckInPage.tsx` - Check-in page (lists venues)
- `src/pages/VenueList.tsx` - Venue list page
- `src/pages/VenueDetails.tsx` - Venue details page

---

## Testing Checklist

- [ ] 8 venues load on check-in page
- [ ] No console errors
- [ ] Venue cards display correctly
- [ ] Can click on venues
- [ ] Venue details page loads
- [ ] Can check in to venues
- [ ] Users at venue display correctly
- [ ] Check-out works

---

## Error Handling

If venues fail to load:
1. Check `venueService.ts` error handling
2. Verify fallback to cached data works
3. Check error logging (`logError` calls)
4. Verify user sees helpful error message

---

**Last Updated:** January 2025

