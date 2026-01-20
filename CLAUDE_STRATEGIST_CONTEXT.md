# Mingle - Strategic Context for Phase 2 Planning

## What is Mingle?

Mingle is a location-based dating app with a core differentiator: **you can only match with people who are at the same venue as you, right now.** The thesis is that dating apps have become endless swiping and texting with strangers who never meet. Mingle forces real-world interaction by design.

### How It Works
1. User checks into a bar/café/venue
2. They see other Mingle users checked in at that same venue
3. They can like/match with those people
4. Matches expire after 24 hours with a 10-message limit
5. This creates urgency to actually meet in person

### Brand Position
- Anti-swipe, anti-pen-pal
- "Just meet people"
- Targets 22-35 urban professionals tired of dating app fatigue
- Premium feel, dark theme, purple/pink accent colors

---

## Current Status (Phase 1 Complete)

### Tech Stack
- **Frontend:** React + Vite + TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Hosting:** Vercel (app), Firebase (functions)
- **Marketing Site:** Astro (separate repo: mingle-website)

### Features Built
✅ User auth (email/password, Google OAuth)
✅ Profile creation with photo uploads
✅ Venue discovery with check-in system
✅ User grid showing who's at each venue
✅ Like/match system with mutual matching
✅ Real-time chat between matches
✅ Match expiration (24hr timer, 10 message limit)
✅ Settings, help, about pages
✅ Dark theme UI throughout
✅ Demo mode for testing without Firebase

### Technical Health
- No critical vulnerabilities (recently patched protobufjs issue)
- Solid architectural foundations
- Minor tech debt (some lint warnings, could use more tests)
- Ready for real user testing

---

## Phase 2: Sydney Beta (Now → June 2025)

### Primary Goal
**Validate product-market fit with real users in Sydney before Berlin summer launch.**

### The Critical Mass Problem
This is the #1 strategic challenge. The app only works if multiple users are at the same venue simultaneously. Solutions being explored:

1. **Flexible Check-in (Implemented)**
   - Removed strict 500m location enforcement
   - Users can check in from anywhere (like Tinder Passport)
   - Reduces friction for early adopters
   - Can become premium feature later

2. **Venue Density Strategy**
   - Focus on 5-10 venues in one neighborhood initially
   - Partner with venues for cross-promotion
   - Consider "launch nights" at specific venues

3. **Activity Signals (Not yet built)**
   - Show venue activity levels
   - "X people here now" badges
   - Push notifications when venues get busy

### Beta Milestones
| Milestone | Target | Success Metric |
|-----------|--------|----------------|
| Friends & Family | Week 1-2 | 10-20 users, find UX bugs |
| Soft Launch | Week 3-4 | 50-100 users, 1-2 target venues |
| Neighborhood Beta | Month 2-3 | 200+ users, 5-10 venues, first organic matches |
| Pre-Berlin Review | Month 4-5 | Product refinements based on learnings |

### Distribution Channels
- **PWA:** Current web app, installable from browser
- **TestFlight:** iOS native wrapper via Capacitor (in progress)
- **Android:** Google Play internal testing track

---

## Phase 3: Berlin Launch (Summer 2025)

### Why Berlin?
- Large expat/international population open to new apps
- Strong nightlife culture aligned with venue-based dating
- European market entry point
- Founder will be physically present

### Success Criteria for Berlin
- 1,000+ active users in first month
- 20+ partner venues
- Organic user acquisition beginning
- Revenue model validated (premium features)

---

## Business Model (Planned)

### Free Tier
- Check into 1 venue at a time
- Basic matching and messaging
- Standard profile

### Premium Tier ($9.99-14.99/month)
- Check into multiple venues
- See who liked you
- Reconnect with expired matches
- Extended message limits
- Priority in user grid

---

## Key Strategic Questions for Phase 2

1. **Venue Partnerships:** Should we formalize relationships with bars/cafés? What's the value exchange?

2. **Growth Loops:** How do we get users to invite friends? Should we gamify referrals?

3. **Retention Mechanics:** What brings users back when they're not at a venue?

4. **Competition Response:** How do we differentiate if Hinge/Bumble copy the concept?

5. **Monetization Timing:** When to introduce premium? Too early kills growth, too late leaves money on table.

6. **Accelerators/Funding:** Should we pursue YC, Antler, or angel funding before Berlin?

---

## Team & Resources

- **Current:** Solo founder (technical background, can build but needs BD/marketing support)
- **Needed:** 
  - Marketing/growth co-founder or early hire
  - Design support for polish
  - Potential venue partnership person

---

## Links & Resources

- **App:** [Vercel deployment URL]
- **Marketing Site:** [Website URL]
- **Codebase:** mingle-synergy (app), mingle-website (marketing)
- **Firebase Console:** [Project dashboard]

---

*Last updated: January 2025*
*Context prepared for Claude strategic planning sessions*
