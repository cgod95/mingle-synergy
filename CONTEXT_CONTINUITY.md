# Context Continuity Guide - Demo Mode Implementation

**Last Updated:** January 2025  
**Current Phase:** Demo Mode Free Access & Population - Complete  
**Next Phase:** Post-Expiry Gating & Closed Beta Preparation

## 🎯 Current Status

### ✅ Completed (Demo Mode Implementation)
1. **Free Access Window System** - `src/utils/demoFree.ts`
   - Time-bounded free access with countdown
   - Supports `VITE_DEMO_FREE_ACCESS_UNTIL` (ISO date) or `VITE_DEMO_FREE_ACCESS_DAYS` (days from now)
   - Default: 7 days if no env var set

2. **Demo Data Population**
   - 26 demo users with Unsplash photos (`src/lib/demoPeople.ts`)
   - 8 venues with Unsplash images (`src/services/firebase/venueService.ts`)
   - 15 seeded matches with realistic conversations (`src/lib/chatStore.ts`)
   - Realistic dialogue library emphasizing meeting up (`src/lib/demoDialogue.ts`)

3. **Seeding on Entry**
   - `DemoWelcome.tsx` seeds data when entering demo mode
   - `Matches.tsx` has safety check if matches list is empty

4. **Unified Venue People**
   - `api.ts` uses `demoPeople` in demo mode for richer data
   - Dynamic presence simulation (`useDemoPresence` hook)

5. **Countdown Indicator**
   - `DemoModeIndicator` shows remaining time
   - Integrated in `AppShell`

### 🔄 In Progress / Next Steps
1. Post-expiry gating (show upgrade modal)
2. Subscription service integration (`isDemoFreeActive()` checks)
3. Analytics events (demo usage tracking)
4. Documentation (playbook and `.env.example`)

## 📁 Key Files Modified

### New Files
- `src/utils/demoFree.ts` - Free access window utilities
- `src/hooks/useDemoPresence.ts` - Dynamic presence simulation
- `src/pages/DemoWelcome.tsx` - Demo entry page with seeding
- `DEMO_MODE_PROGRESS.md` - Progress tracker

### Modified Files
- `src/lib/api.ts` - Unified venue/people source for demo mode
- `src/components/DemoModeIndicator.tsx` - Added countdown
- `src/components/layout/AppShell.tsx` - Integrated indicator
- `src/pages/Matches.tsx` - Added safety seeding
- `src/pages/VenueDetails.tsx` - Added dynamic presence
- `src/pages/CheckInPage.tsx` - Async venue loading

## 🎨 Branding & Theme

### Current Theme System
- **Primary Colors:** Indigo/Purple gradient (`from-indigo-500 via-purple-500 to-pink-500`)
- **Background:** `bg-gradient-to-br from-indigo-50 via-white to-purple-50`
- **Brand Colors:** Multiple definitions exist (needs consolidation)
  - `tailwind.config.ts`: Coral theme (`#F0957D`)
  - `tailwind.config.cjs`: Hinge red-orange (`#F3643E`)
  - `src/styles/theme.css`: Hinge red-orange (`#F3643E`)
  - `src/index.css`: Shadcn HSL variables

### Action Required
- Consolidate brand colors to single source of truth
- Ensure all pages use consistent gradient/color scheme
- Update any hardcoded colors to use theme tokens

## 🗺️ Routing Structure

### Public Routes
- `/` - LandingPage
- `/demo-welcome` - DemoWelcome
- `/signin` - SignIn
- `/signup` - SignUp
- `/upload` - ProfileUpload (AuthRoute)

### Protected Routes (AppShell)
- `/checkin` - CheckInPage
- `/venues/:id` - VenueDetails
- `/matches` - Matches
- `/profile` - Profile
- `/profile/edit` - ProfileEdit
- `/settings` - SettingsPage
- `/privacy` - Privacy
- `/verification` - Verification
- `/billing` - Billing
- `/usage` - UsageStats
- `/help` - Help
- `/contact` - Contact
- `/about` - About
- `/debug` - Debug

### Special Routes
- `/chat/:id` - ChatRoomGuard (bypasses AppShell)

### Fallback
- `*` - Redirects to `/checkin`

## 🧪 Closed Beta Readiness

### ✅ Ready
- Core functionality complete
- Demo mode fully functional
- Safety features implemented
- Observability configured (Sentry + Analytics)
- CI/CD pipeline ready
- Tagged `v0.9.0-mvp`

### ⚠️ Needs Attention
- Branding/theme consistency (this session)
- Routing health check (this session)
- Post-expiry gating (next phase)
- Additional test coverage (incremental)

### 📋 Pre-Beta Checklist
- [ ] Branding/theme audit complete
- [ ] All routes tested and working
- [ ] Demo mode fully tested
- [ ] Environment variables documented
- [ ] Error tracking verified
- [ ] Analytics events verified

## 🔗 Quick Links

- **Demo Mode Progress:** `DEMO_MODE_PROGRESS.md`
- **MVP Status:** `MVP_COMPLETE.md`
- **Phase 7 Status:** `PHASE7_STATUS.md`
- **Functional Spec:** `MINGLE_FUNCTIONAL_SPEC.md`

## 💡 For New Chats

If context is lost, read this file first, then:
1. Check `DEMO_MODE_PROGRESS.md` for latest demo mode status
2. Review `PHASE7_STATUS.md` for QA/test status
3. Check `MVP_COMPLETE.md` for overall MVP completion status
4. Review recent git commits for what was last worked on

