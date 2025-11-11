# Recent Changes - January 2025

## Latest Updates

### Message Limit Increased: 3 → 5 Messages
**Date:** January 2025  
**Status:** ✅ Complete

**Changes Made:**
- Updated default message limit from 3 to 5 messages per user per match
- Updated feature flag default: `LIMIT_MESSAGES_PER_USER` now defaults to 5
- Updated all UI components to reflect 5-message limit
- Updated all user-facing text and placeholders
- Updated backend validation logic

**Files Modified:**
- `src/lib/flags.ts` - Default changed from 3 to 5
- `src/services/messageService.ts` - Uses feature flag (defaults to 5)
- `src/services/firebase/matchService.ts` - Updated validation logic
- `src/pages/Chat.tsx` - Updated UI and logic
- `src/pages/ChatRoom.tsx` - Updated UI text and limits
- `src/pages/Matches.tsx` - Updated help text
- `src/pages/CheckInPage.tsx` - Updated instructions
- `src/pages/VenueDetails.tsx` - Updated instructions
- `src/pages/LandingPage.tsx` - Updated instructions
- `src/components/MessageInput.tsx` - Updated limit tracking
- `src/components/ChatInput.tsx` - Updated UI text
- `src/components/ui/MessageLimitModal.tsx` - Updated modal text
- `src/components/Notices/MessageLimitNotice.tsx` - Updated notice text
- `src/utils/messageLimitTracking.ts` - Updated limit checks

**Configuration:**
- Can be overridden via environment variable: `VITE_LIMIT_MESSAGES_PER_USER=5`
- Demo mode: Unlimited messages (feature flag set to -1)
- Premium users: Unlimited messages (future feature)

---

### Code Quality Improvements
**Date:** January 2025  
**Status:** ✅ Complete

**Console.log Cleanup:**
- Replaced `console.log/error/warn` with centralized logger (`logError`/`logUserAction`)
- Updated 9+ user-facing components and pages
- Improved error tracking and context

**Error Boundaries:**
- Verified ErrorBoundary wraps entire app
- Fixed console statements in ErrorBoundary components
- Improved error handling throughout

**Loading States:**
- Verified loading states exist in major pages
- Suspense fallback implemented in App.tsx

---

### Match Rate Improvements
**Date:** January 2025  
**Status:** ✅ Complete

**Changes:**
- Increased seeded mutual likes from 8 to 15 people
- Added 60% probability-based matching for non-seeded likes
- Expected match rate: ~75-80% (15 seeded + 60% of remaining)

**Files Modified:**
- `src/lib/likesStore.ts` - Updated seeding and matching logic
- `src/lib/matchesCompat.ts` - Ensured matches sync correctly

---

### Settings Page Fixes
**Date:** January 2025  
**Status:** ✅ Complete

**Fixes:**
- Fixed analytics method call (`analytics.page` → `analytics.trackPageView`)
- Added comprehensive error handling
- Added null/type checks for all service interactions
- Removed unused imports and variables

---

## Missing Features (From Roadmap)

### Critical Missing Features:
1. **Push Notifications** - Not implemented - users miss matches/messages
2. **Location Permission Handling** - Needs graceful degradation when denied
3. **Offline Support** - Service worker exists but needs verification
4. **Photo Verification** - Mentioned in spec, not implemented
5. **Reconnect Flow (Non-Co-Located)** - Only co-located reconnect exists

### Strategic Gaps:
1. **Beta Tester Onboarding** - ✅ Guide created, need distribution
2. **Success Metrics** - Need to define and track
3. **Network Effects** - How to ensure enough users at venues?
4. **Moderation System** - How to handle reports?
5. **Legal/Compliance** - ToS, Privacy Policy updated?

---

## Next Steps

1. ✅ Message limit increased to 5
2. ✅ Code quality improvements completed
3. ⏳ Test core user flows end-to-end
4. ⏳ Verify venue loading
5. ⏳ Complete missing features (if needed for beta)

---

## Environment Variables

**Message Limit:**
```bash
VITE_LIMIT_MESSAGES_PER_USER=5  # Default: 5 (was 3)
```

**Demo Mode:**
```bash
VITE_DEMO_MODE=true  # Unlimited messages in demo mode
```

---

**Last Updated:** January 2025  
**Branch:** `feature/backend-parity-merge`

