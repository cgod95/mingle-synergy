# CLAUDE.md — Mingle Project Memory

Permanent context for AI assistants working on this codebase. **When docs conflict, trust the code and this file over `README.md` or older docs in `docs/`.**

---

## Project Overview

**Mingle** is a venue-based dating app: users check in at a real-world location (bar, café, park), see other checked-in people in a **grid**, tap a profile, like (optionally with a short message), match, and chat briefly before meeting in person.

**Product philosophy (authoritative):** Mingle is an **anti-tech dating app** — minimal friction, **not text-heavy**, **no social proof** (no crowd counts, popularity badges, or “X matches made” copy). The goal is smooth UI/UX and a fast path from check-in to in-person connection, **not** feature parity with Tinder/Hinge.

**Core user loop:**

```
Sign up → name + age → one photo → check in at venue → grid of people →
tap profile → like (message optional) → match modal → chat (10 msgs / 24h) → meet
```

**Production web URL:** https://mingle-synergy.vercel.app  
**Firebase project ID:** `mingle-a12a2`  
**Capacitor app ID:** `com.mingleapp.app`  
**Node version:** `v22.14.0` (see `.nvmrc`)

---

## Tech Stack (pinned / primary versions)

| Layer | Technology | Version |
| --- | --- | --- |
| Runtime | Node.js | 22.14.0 |
| UI | React | 18.3.1 |
| Language | TypeScript | 5.5.x |
| Build | Vite | 7.2.x |
| Styling | Tailwind CSS | 3.4.x |
| Components | Radix UI + shadcn-style primitives | various |
| Routing | react-router-dom | 6.26.x |
| Server state | TanStack React Query | 5.56.x |
| Animation | Framer Motion | 12.23.24 |
| Forms | react-hook-form + zod | 7.53 / 3.23 |
| Backend | Firebase (Auth, Firestore, Storage, Functions) | 12.6.x |
| Native shell | Capacitor | 8.x |
| i18n | i18next + react-i18next | 26.x / 17.x |
| Errors | Sentry (`@sentry/react`) | 7.91.x |
| Unit tests | Vitest + Testing Library | 3.x |
| E2E | Playwright | 1.56.x |
| Deploy (web) | Vercel | SPA rewrites in `vercel.json` |

Package name in `package.json` is still `vite_react_shadcn_ts` (legacy scaffold name).

---

## Architecture Overview

### High-level shape

```
┌─────────────────────────────────────────────────────────────┐
│  main.tsx → App.tsx (routes, providers, lazy pages)       │
├─────────────────────────────────────────────────────────────┤
│  Providers: QueryClient, Auth, User, Onboarding             │
├─────────────────────────────────────────────────────────────┤
│  AppShell (tabs: /checkin, /matches, /profile)              │
│    └── lazy tab pages + stack routes (/venues/:id, etc.)    │
├─────────────────────────────────────────────────────────────┤
│  Services layer (src/services/) — Firebase vs mock switch   │
├─────────────────────────────────────────────────────────────┤
│  Firebase SDK (src/firebase/config.ts)                      │
└─────────────────────────────────────────────────────────────┘
```

### Key directories

| Path | Purpose |
| --- | --- |
| `src/pages/` | Route-level screens (CheckIn, VenueDetails, Matches, ChatRoom, onboarding, settings) |
| `src/components/` | Shared UI, layout (`AppShell`, `BottomNav`, `Header`), media (`Photo`) |
| `src/features/` | Feature modules (chat, profile, billing). **Many are built but not wired into routes** — see below |
| `src/context/` | `AuthContext`, `UserContext`, `OnboardingContext` |
| `src/services/` | Service facade; switches Firebase ↔ mock via `DEMO_MODE` |
| `src/services/firebase/` | Firestore-backed implementations (user, venue, match, onboarding) |
| `src/services/mock/` | In-memory/demo implementations |
| `src/hooks/` | React hooks (queries, push, entitlements, sync state) |
| `src/lib/` | Cross-cutting utilities (`checkinStore`, `microcopy`, `billing`, `safety`, `flags`) |
| `src/design/` | Design tokens (`tokens.ts`) and motion constants (`motion.ts`) |
| `src/i18n/` | i18next setup + locale files (`en`, `es`) |
| `src/firebase/` | Firebase init (auth, firestore, storage) |
| `src/config.ts` | Central env-driven config object |
| `functions/src/` | Cloud Functions (message expiry, nudges, photo pipeline, moderation, daily picks) |
| `scripts/` | Build verification, bundle budget, smoke tests |
| `docs/` | Runbooks, beta guides, functional spec (**partially stale**) |

### Path alias

`@/` → `src/` (configured in `vite.config.ts` and `tsconfig`).

### Routing model

- **Public:** `/`, `/signin`, `/signup`, `/demo-welcome`
- **Onboarding (auth required):** `/welcome` → `/create-profile` → `/photo-upload` → `/checkin`
- **`/onboarding/personalize` redirects to `/checkin`** (personalization step removed)
- **App shell tabs:** `/checkin`, `/matches`, `/profile`
- **Stack inside shell:** `/venues/:id`, `/profile/:userId`, `/settings`, etc.
- **Chat (full screen, outside shell):** `/chat/:id` — `ChatRoomGuard` is **not lazy-loaded** (Router context timing)
- **Fallback:** `*` → `/checkin`

### Service layer pattern

`src/services/index.ts` exports singletons:

- `authService` — always Firebase
- `userService`, `venueService`, `matchService`, `interestService` — mock when `DEMO_MODE`, else Firebase
- `subscriptionService` — mock wrapper or real `SubscriptionService`

**Critical:** `DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'` only. Development mode does **not** auto-enable demo.

### State & data flow

- **Auth:** Firebase Auth + `AuthContext`; demo uses `UserContext` mock user
- **Onboarding:** `OnboardingContext` + `onboardingService` (Firestore steps: profile, photos)
- **Check-in:** `lib/checkinStore.ts` — localStorage + Firestore sync; **24h duration**
- **Venue people:** Realtime Firestore listeners in `VenueDetails`
- **Matches/chat:** `matchService` + Firestore; message limits via `lib/flags.ts`
- **Server cache:** TanStack Query in `hooks/queries/` (`useProfile`, `useVenues`, `useNearbyVenues`)

---

## Key Architectural Decisions

### 1. Anti-tech product surface

Deliberately stripped: bios, Hinge-style prompts, gender/preference filters, swipe decks, daily picks rails, venue/people count badges, marketing social-proof copy. **Do not re-add these without explicit user request.**

Kept: match modal, push notification hooks, rematch flow, photo zoom, pull-to-refresh, 10-message / 24h chat cap.

### 2. Grid-only venue discovery

People at a venue are shown in a **grid** (`VenueDetails.tsx`), not a swipe deck. `src/features/deck/` exists but is **not** the active UX.

### 3. Minimal onboarding

Profile creation = **name + age only** (`CreateProfile.tsx`). One photo required for visibility (`PhotoUpload.tsx` → `/checkin`). No bio, gender, or “interested in” fields.

### 4. Demo mode is explicit

Firebase initializes only when `VITE_DEMO_MODE !== 'true'` and Firebase env vars are present. This fixed beta testing where dev builds accidentally skipped Firebase. **Never assume `import.meta.env.DEV` implies demo.**

### 5. Single React instance (Vite)

`vite.config.ts` force-aliases `react`, `react-dom`, `framer-motion`, and bundles them into one `react-vendor` chunk. Multiple React copies caused hook errors (#300). Do not remove dedupe/alias without running `scripts/verify-react-instances.js`.

### 6. Firebase chunk splitting

Firebase is split into auth/firestore/storage chunks so landing/sign-in pages avoid loading Firestore until needed.

### 7. Firestore long polling on native

`experimentalForceLongPolling: true` in Firestore init for Capacitor/iOS WebKit reliability. Removing it may speed web but break iOS realtime listeners.

### 8. RevenueCat external on web

`@revenuecat/purchases-capacitor` is Rollup-**external** for web builds. Billing uses dynamic import with web fallback (`src/lib/billing.ts`).

### 9. Design system via tokens

Use `bg-surface-*`, brand violets, and motion from `src/design/tokens.ts` + `src/design/motion.ts`. Tailwind mirrors tokens in `tailwind.config.ts`. Prefer surface ramp over legacy `neutral-*` where updated.

### 10. Microcopy centralization

User-facing strings that repeat or need tone consistency live in `src/lib/microcopy.ts`. Tone: warm, specific, human — not system voice or marketing hype.

### 11. Perceived performance

- `DelayedShow` — hide spinners for loads under ~250ms
- Lazy routes with idle prefetch in `App.tsx`
- `PageTransition` + spring tab indicator in `BottomNav`
- Pull-to-refresh on `CheckInPage` and `Matches`

### 12. Optimistic likes

In `VenueDetails`, set `pendingLikeRef` **before** the async like call so mutual-like modals fire promptly on realtime updates.

---

## External Services & APIs

| Service | Usage |
| --- | --- |
| **Firebase Auth** | Email/social sign-in |
| **Cloud Firestore** | Users, venues, matches, messages, check-ins, onboarding |
| **Firebase Storage** | Profile photos; processed by `functions/src/photoPipeline.ts` |
| **Cloud Functions** | Message expiry, expiry nudges, daily picks, photo processing, message moderation |
| **Firebase Cloud Messaging** | Push notifications (Capacitor plugin; needs APNs/FCM setup) |
| **Vercel** | Web hosting + env vars for production |
| **Sentry** | Error reporting (production / when enabled) |
| **RevenueCat** | Native in-app purchases (iOS/Android via Capacitor) |
| **Stripe** | Web subscription flows (`VITE_STRIPE_PUBLISHABLE_KEY`) — optional |
| **Geolocation API** | Browser/device location for nearby venues |
| **html5-qrcode** | QR check-in scanning |

Legacy/unused in active path: microservice URLs in `src/services/microservices/`, WebSocket admin dashboard (`VITE_WS_URL`).

---

## Environment Variables (names only)

Copy `.env.example` → `.env.local`. **Never commit values.**

### Required for production Firebase

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### App mode

- `VITE_DEMO_MODE` — `'true'` enables full mock stack, skips Firebase init
- `VITE_USE_MOCK` — secondary mock flag (see `config.ts`; prefer `VITE_DEMO_MODE`)
- `VITE_ENVIRONMENT` — `development` | `staging` | `production`

### Firebase emulators (local)

- `VITE_USE_FIREBASE_EMULATOR`
- `VITE_FIREBASE_EMULATOR_AUTH_HOST`
- `VITE_FIREBASE_EMULATOR_AUTH_PORT`
- `VITE_FIRESTORE_EMULATOR_HOST`
- `VITE_FIRESTORE_EMULATOR_PORT`

### Feature flags (`src/lib/flags.ts`, `src/config.ts`)

- `VITE_UNLOCK_FULL_CHAT_ON_COLOCATION`
- `VITE_ALLOW_REMOTE_RECONNECT_CHAT`
- `VITE_LIMIT_MESSAGES_PER_USER`
- `VITE_BLUR_PHOTOS_UNTIL_MATCH`
- `VITE_STRICT_PHOTO_REQUIRED_FOR_CHECKIN`
- `VITE_RECONNECT_FLOW_ENABLED`
- `VITE_PUSH_NOTIFICATIONS_ENABLED`
- `VITE_OFFLINE_MODE_ENABLED`
- `VITE_ENABLE_VERIFICATION`
- `VITE_ENABLE_RECONNECT`
- `VITE_ENABLE_PUSH_NOTIFICATIONS`
- `VITE_ENABLE_ANALYTICS`
- `VITE_ENABLE_PERFORMANCE_MONITORING`

### Monitoring & analytics

- `VITE_SENTRY_DSN`
- `VITE_ENABLE_SENTRY`
- `VITE_ANALYTICS_ID`
- `VITE_ANALYTICS_PROVIDER`
- `VITE_VERBOSE_LOGS`

### Push & billing

- `VITE_VAPID_PUBLIC_KEY`
- `VITE_REVENUECAT_PUBLIC_KEY_IOS`
- `VITE_REVENUECAT_PUBLIC_KEY_ANDROID`
- `VITE_STRIPE_PUBLISHABLE_KEY`

### Other

- `VITE_API_URL`
- `VITE_WS_URL`
- `VITE_STORAGE_KEY`
- `VITE_DEMO_FREE_ACCESS_UNTIL`
- `VITE_DEMO_FREE_ACCESS_DAYS`
- `VITE_AUTH_SERVICE_URL`
- `VITE_USER_SERVICE_URL`
- `VITE_MATCHING_SERVICE_URL`
- `VITE_MESSAGING_SERVICE_URL`

Full reference (may be stale on demo-mode behavior): `docs/ENV_VARIABLES.md`.

---

## Commands

```bash
npm run dev              # Vite dev server (port 5173)
npm run build            # tsc (non-blocking) + vite build
npm run build:check      # build + bundle budget (480 KB gzip default)
npm run typecheck        # tsc --noEmit (reliable local check)
npm run test             # vitest run
npm run test:e2e         # Playwright
npm run lint             # eslint (can be slow on loaded machines)
npm run emulators        # Firebase auth + firestore emulators
npm run dev:full         # emulators + dev concurrently
npm run ios:build        # web build + cap sync ios
```

Bundle budget: `scripts/check-bundle-budget.mjs` — default **480 KB** total gzip JS, **200 KB** max single chunk. Override with `BUDGET_KB`.

---

## Cloud Functions

Exported from `functions/src/index.ts`:

| Function | Role |
| --- | --- |
| `expireOldMessages` | TTL cleanup for chat messages |
| `expiryNudge` | Notify users before match/chat expiry |
| `dailyPicks` | Daily picks generation (**product deprioritized; code may remain**) |
| `onPhotoUploadProcess` | Photo pipeline on Storage upload |
| `moderateMessage` | Message moderation hook |

Deploy with Firebase CLI from project root (requires Firebase login and project config).

---

## Current State & Active Priorities

### Recently shipped (product reset + polish)

- Minimal profile: name + age only; photo-only profile views
- Onboarding personalize step removed; photo upload → check-in
- Social proof UI/copy removed (venue counts, “busiest”, active conversation counts)
- Like = one tap; optional message never required
- Grid discovery retained; match modal, PTR, photo zoom, chat limits kept
- Deploy fixes (`vercel.json` — no empty `env` object)
- Motion/spinner polish (`DelayedShow`, surface tokens, tab transitions)

### Known gaps / follow-ups

1. **Dead code cleanup** — `src/features/prompts/`, `filters/`, `picks/`, `deck/`, onboarding intent/prompts steps still in repo but off the user path
2. **Copy audit** — landing, settings, `microcopy.ts` may still reference picks/filters/prompts tone
3. **README.md is outdated** — still mentions AI matching, verification emphasis; contradicts anti-tech minimal philosophy
4. **docs/ENV_VARIABLES.md** — claims demo auto-enables in dev; **code does not** (only explicit `VITE_DEMO_MODE=true`)
5. **Perf** — lazy-load Firebase off landing (~110 KB savings noted in audits, not done)
6. **External blockers** — APNs/FCM for real push, RevenueCat products live, custom domain TBD
7. **Verification** — service removed from active flow; `/verification` route may still exist

### What NOT to build without explicit ask

- Swipe deck discovery
- Daily picks / rails
- Advanced filters (gender, age range, intent)
- Hinge-style prompts and bio-heavy profiles
- Social proof metrics (counts, popularity, “X matches”)
- Text-heavy onboarding steps

---

## Pitfalls for New Contributors

### Config & modes

- **`VITE_DEMO_MODE` must be exactly `'true'`** — string comparison, not truthy env
- **`config.DEMO_MODE` vs `services/DEMO_MODE`** — both read the same env; Firebase init uses `config.DEMO_MODE`
- Missing Firebase env vars in non-demo mode → Firebase skipped silently in dev (check console for `[Firebase] Skipped initialization`)

### Build & deploy

- **`vercel.json` must not have invalid empty objects** (e.g. `"env": {}` broke deploys)
- **RevenueCat** must stay external in Vite for web builds
- **`npm run build` runs tsc with `|| vite build`** — type errors may not block build; use `npm run typecheck` explicitly
- Local lint/test/build can hang on resource-constrained machines; **Vercel CI builds succeed**; prefer `typecheck` locally

### React & routing

- **Do not lazy-load `ChatRoomGuard`** — causes Router/`useNavigate` timing issues
- **Do not split React across chunks** without updating `manualChunks` and verifying single instance
- **`AppShell` keeps mounted tab routes** — tab switches fade; deeper routes push/pop

### Product & UX

- **Venue discovery = grid in `VenueDetails.tsx`**, not `features/deck/SwipeDeck`
- **Check-in expires in 24h** (`CHECKIN_DURATION_MS` in `checkinStore.ts`)
- **Chat limits:** 10 messages per user per match (configurable via `VITE_LIMIT_MESSAGES_PER_USER`); unlimited in demo mode
- **Mutual like modal** depends on setting `pendingLikeRef` before network completion

### Codebase cruft

- `.rescue/` — old snapshot; ignore for active development
- `src/services/microservices/` — aspirational architecture, not wired
- `OnboardingCarousel`, `Verification` pages — legacy routes may still be registered
- Git status may show many deleted files from prior refactors; verify file exists before importing

### Testing

- Smoke tests: `src/__smoke__/`
- Setup: `src/setupTests.ts`
- Playwright config at repo root; prior E2E failures stored under `test-results/` (often gitignored)

### i18n

- Infrastructure exists (`src/i18n/`) but most UI strings are still inline English; microcopy module is the preferred consolidation point for new copy

---

## File Quick Reference

| Concern | Primary files |
| --- | --- |
| Routes | `src/App.tsx` |
| Tab shell & notifications | `src/components/layout/AppShell.tsx` |
| Check-in | `src/pages/CheckInPage.tsx`, `src/lib/checkinStore.ts` |
| Venue grid & likes | `src/pages/VenueDetails.tsx` |
| Matches list | `src/pages/Matches.tsx` |
| Chat | `src/pages/ChatRoom.tsx`, `src/pages/ChatRoomGuard.tsx`, `src/features/chat/` |
| Profile views | `src/features/profile/ProfileDetail.tsx`, `src/pages/UserProfileView.tsx` |
| Onboarding | `src/pages/CreateProfile.tsx`, `src/pages/PhotoUpload.tsx`, `src/context/OnboardingContext.tsx` |
| Config | `src/config.ts`, `src/lib/flags.ts` |
| Firebase init | `src/firebase/config.ts` |
| Service switch | `src/services/index.ts` |
| Design tokens | `src/design/tokens.ts`, `tailwind.config.ts` |
| Error handling | `src/utils/errorHandler.ts` |
| Deploy | `vercel.json`, `capacitor.config.ts` |

---

## Assistant Workflow Notes

- **Minimize scope** — user prefers focused diffs; no drive-by refactors
- **Match existing conventions** — read surrounding code before editing
- **Do not commit** unless explicitly asked
- **Do not re-add removed product features** unless explicitly asked
- When changing user-facing copy, prefer `src/lib/microcopy.ts`
- When adding UI color/spacing, use design tokens / Tailwind surface utilities
- After substantive changes: `npm run typecheck`; use `npm run build:check` before release-sensitive work
- Trust this file and live code over `README.md`, `CLAUDE_STRATEGIST_CONTEXT.md`, and dated docs in `docs/`

---

*Last updated: May 2026 — reflects anti-tech product reset, Vercel production deploy, and minimal onboarding flow.*
