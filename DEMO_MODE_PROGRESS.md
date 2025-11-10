# Demo Mode Free Access & Population - Progress Tracker

## ✅ Completed Steps

### 1. Demo Data Population
- ✅ **20-25 demo users** - `src/lib/demoPeople.ts` has 26 users with Unsplash photos and realistic bios
- ✅ **6-8 venues** - `src/services/firebase/venueService.ts` has 8 mock venues with Unsplash images
- ✅ **10-15 matches** - `src/lib/chatStore.ts` seeds 15 matches with varied activity states
- ✅ **Realistic dialogue library** - `src/lib/demoDialogue.ts` emphasizes meeting up and serendipity
- ✅ **Varied activity timestamps** - `demoPeople.ts` includes activity states with timestamps and indicators
- ✅ **createDemoUser function** - `src/context/AuthContext.tsx` has `createDemoUser()` method

### 2. Free Access Window System
- ✅ **Free access utilities** - `src/utils/demoFree.ts` created with:
  - `isDemoFreeActive()` - Check if free access window is active
  - `getDemoFreeExpiry()` - Get expiry date (supports ISO date or days from now)
  - `getDemoFreeWindow()` - Get detailed window status with countdown
  - `formatDemoFreeRemaining()` - Format remaining time as human-readable string
- ✅ **Environment variable support**:
  - `VITE_DEMO_FREE_ACCESS_UNTIL` - ISO date string (e.g., "2025-12-31T23:59:59Z")
  - `VITE_DEMO_FREE_ACCESS_DAYS` - Number of days from now (e.g., "7")
  - Default: 7 days if no env var set

### 3. Seeding on Demo Entry
- ✅ **DemoWelcome seeding** - `src/pages/DemoWelcome.tsx` now seeds demo data when entering demo mode
- ✅ **Matches page safety** - `src/pages/Matches.tsx` ensures data is seeded if matches list is empty

### 4. Unified Venue People Source
- ✅ **API facade updated** - `src/lib/api.ts` now:
  - Uses `demoPeople.getPeopleAtVenue()` in demo mode for richer data
  - Uses `venueService.getVenues()` in demo mode for venues (8 venues with numeric IDs)
  - Falls back to `demoVenues` in production mode
- ✅ **Dynamic presence simulation** - `src/hooks/useDemoPresence.ts` created:
  - Randomly updates activity states every 60 seconds
  - 30% probability of activity change per user
  - Integrated in `VenueDetails.tsx` for live-feeling venues

### 5. Countdown Indicator
- ✅ **DemoModeIndicator enhanced** - `src/components/DemoModeIndicator.tsx`:
  - Shows countdown timer in badge when free access window is active
  - Displays expiry info in expanded card
  - Updates every minute
- ✅ **AppShell integration** - `src/components/layout/AppShell.tsx` renders indicator when in demo mode

### 6. Async Venue Loading
- ✅ **CheckInPage updated** - Now handles async `getVenues()` with `useEffect`
- ✅ **VenueDetails updated** - Now handles async `getVenue()` with `useEffect`

## 🔄 Next Steps (Remaining)

### 7. Post-Expiry Gating
- ⏳ **Premium upgrade modal** - Show `PremiumUpgradeModal` when free window expired
- ⏳ **Gate premium actions** - Check `isDemoFreeActive()` before allowing premium features
- ⏳ **Deep link to signup** - Redirect to signup when free access expires

### 8. Subscription Service Integration
- ⏳ **Update businessFeatures.ts** - Use `isDemoFreeActive()` instead of raw `DEMO_MODE`
- ⏳ **Update subscriptionService.ts** - Use `isDemoFreeActive()` for feature checks

### 9. Analytics Events
- ⏳ **Demo started event** - Track when user enters demo mode
- ⏳ **Demo expiry countdown** - Daily event showing days remaining
- ⏳ **Demo conversion attempt** - Track when user tries to convert after expiry
- ⏳ **Demo conversion success** - Track successful signup after demo

### 10. Documentation
- ⏳ **DEMO_MODE_PLAYBOOK.md** - Complete guide for demo mode configuration
- ⏳ **Update .env.example** - Add demo mode environment variables

## 📝 Notes

### Venue ID Mapping
- Demo mode uses numeric venue IDs ('1', '2', '3', etc.) from `venueService.ts`
- `demoPeople.ts` uses same numeric IDs for `currentVenue` field
- `demoVenues.ts` uses string IDs ('club-aurora', etc.) but is only used as fallback

### Data Seeding Strategy
- Seeding happens in three places:
  1. `main.tsx` - On app startup (global)
  2. `DemoWelcome.tsx` - When entering demo mode (per-session)
  3. `Matches.tsx` - Safety check if matches list is empty (recovery)

### Free Access Window Behavior
- If no env vars set: Defaults to 7 days from now
- If `VITE_DEMO_FREE_ACCESS_UNTIL` set: Uses that exact date
- If `VITE_DEMO_FREE_ACCESS_DAYS` set: Calculates from current date
- When expired: Falls back to actual plan limits (to be implemented)

## 🎯 Current Status

**Phase:** Free Access Window & Population Complete  
**Next:** Post-Expiry Gating & Analytics Integration

