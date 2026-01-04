# Mingle — Purpose, Features & Functional Specification (Autonomous Build Blueprint)

Version: 1.0

Date: 7 Nov 2025 (AEST)

Canonical Branch: rescue/bring-back-ui

Target: Production-ready MVP with "golden" UI + unified backend

⸻

0) Executive Intent (Why Mingle exists)

Mingle is the anti–infinite swipe social app for real-world connection in venues. It deliberately rejects the "endless attention" mechanics of legacy dating apps. You meet people in the same place, at the same time, with tight constraints that nudge you off your phone and into actual conversation.

Core values:

	1.	Ephemeral proximity, not parasocial infinity. Matches form only when both people are checked in to the same venue. Matches auto-expire after 3 hours. Messaging is severely limited (≈ 10 sends per person) unless you're co-located again.

	2.	Low social proof, high intent. Minimal photos, minimal bios, minimal preferences. No follows, no DMs outside of matches, no public popularity loops.

	3.	Place unlocks people. You unlock the people at a venue by checking in. Your social context is the venue and time box—not a global feed.

	4.	Privacy and safety by default. Venue-gated visibility, conservative permissions, transparent controls, clear abuse paths.

	5.	Fridge-cold reliability. Production-grade build quality: stable routing, clean state, predictable UX, tight error handling, and "it just works" performance.

⸻

1) High-level Outcomes (what the product must achieve)

	•	Outcome A (Connection Quality): ≥ 60% of venue check-ins result in at least one match view; ≥ 30% of matches produce at least one message.

	•	Outcome B (Time-to-Interaction): < 30 seconds from venue check-in to seeing the first possible match card if someone compatible is present.

	•	Outcome C (Respect for Time): Users spend < 6 minutes per session on average; the app actively aims to reduce on-screen time.

	•	Outcome D (Safety & Control): 100% of sensitive actions (report, block, reveal photo) are reversible or clearly explained with explicit user control.

	•	Outcome E (Operational Stability): P95 cold-start < 2.5 s on LTE; P95 message send < 400 ms; zero runtime blocking errors in CI.

⸻

2) Personas & Core Jobs-to-be-Done

P1: The Venue-First Socializer (Callum)

	•	Wants to meet people at events, gigs, bars—without being trapped in chats for weeks.

	•	JTBD: "When I'm at a venue, I want to see who's here and meet them quickly without feeling awkward."

P2: The 'Minimalist' Dater (Bronte)

	•	Hates profile theater and long bios.

	•	JTBD: "Give me just enough to decide 'yes/no for a quick chat' and then let me get back to the actual event."

P3: The Safety-First Explorer

	•	Needs tight controls, clear choice, immediate block/report, transparent data handling.

	•	JTBD: "If anything feels off, I want control—hide me, limit visibility, or escalate."

⸻

3) Scope Summary (MVP Feature Set)

3.1 Must-Have (MVP)

	•	Account & Onboarding

	•	Landing page with philosophy; Sign up / Sign in.

	•	Onboarding order: Philosophy → Location perm → Notifications perm → Email sign-up → Create profile → Upload photos (skippable) → Preferences (age + gender only) → Go to Venues.

	•	Route protection & resume-where-you-left-off behavior.

	•	Venue Unlocking System

	•	Venue list + check-in flow (must have at least one photo to check in; otherwise redirect to Upload Photos).

	•	When checked in, unlock "People Here" (venue population UI).

	•	Leave venue = lose access to venue-specific people.

	•	Likes, Matches, and Expiry

	•	Like cards for people at current venue.

	•	Mutual like forms a match with 3-hour expiry.

	•	UI shows countdown timer on each match card.

	•	When expired, match is automatically removed (soft-deleted or archived).

	•	Limited messages (3 per person per match) until both are co-located (full chat unlock).

	•	Messaging (Limited)

	•	In a match, each person can send up to 3 messages during the active 3-hour window.

	•	If both users check back in at the same venue (or explicitly reconnect), unlock full messaging for that encounter session.

	•	Reconnect Flow (Lightweight)

	•	For an expired match: can request reconnection.

	•	Reconnect triggers a fresh match if both parties re-express interest (mini mutual-like) and are at the same venue again (preferred). If not co-located, allow a limited "5 messages each" window that still encourages IRL meetup (toggleable flag; default off for MVP if risky).

	•	Notifications

	•	Toasts for like received, match formed, message received (if in-app).

	•	Push notifications (PWA or native later) are planned; for MVP, in-app toasts and OS notifications if permitted.

	•	Minimal Profiles

	•	Display name, one primary photo and up to N extras (N=4).

	•	Minimal bio (optional), age (optional), gender (required), venue presence.

	•	No interests list (explicitly removed per product philosophy).

	•	Safety

	•	Block/report with minimal friction.

	•	Clear privacy settings: "Visible only at venues I'm at;" "Hide from ex/contacts" (basic phone contact hash—deferred if heavy).

	•	Basic rules page; transparency about expiry constraints.

	•	Golden UI/UX

	•	Shadcn UI, Tailwind tokens, Framer Motion micro-interactions.

	•	Clean Hinge-inspired visuals (but calmer, less content heavy).

3.2 Should-Have (Near-term)

	•	Venue Zones (optional): Identify sub-areas in big venues (bar, stage left) as context, not as filter.

	•	Verification (lightweight): Email and optional selfie, not public badges—just safety improvements.

	•	Basic analytics (Plausible or PostHog): anonymized.

3.3 Won't-Have (for MVP)

	•	Full interest graphs, discovery feeds, swiping beyond current venue, global matchmaking, long-form chat histories, social graph follow systems, public posting.

⸻

4) Detailed User Flows (step-by-step)

4.1 Landing & Auth

Landing → Sign up

	•	CTA: "Create Account" (primary), "Sign in" (secondary).

	•	Philosophy visible on landing (no gate).

	•	Sign up with email/password; optionally Apple/Google later.

	•	Successful auth → Onboarding.

Sign in

	•	Existing users bypass onboarding → either resume onboarding step or go to Venues (if profile complete).

4.2 Onboarding (strict order and routing)

	1.	Philosophy (static, scroll + CTA)

	2.	Location Permission

	•	If denied: show "Why we need this." Offer limited browsing of venues (no people) but you cannot unlock people.

	3.	Notifications Permission (soft request in app; OS prompt optional)

	4.	Email Sign-Up (if not already done)

	5.	Create Profile (display name, optional age, required gender; 1–5 photos)

	6.	Upload Photos

	•	User can skip, but cannot check in to venues without at least one photo; app intercepts and redirects to upload.

	7.	Preferences (age range + gender you'd like to see; no "interests")

→ Venues List

Resume logic: if user drops mid-flow, on return app resumes where they left off.

4.3 Venue Unlocking

VenueList → ActiveVenue

	•	List shows nearby venues (distance, open/active indicator).

	•	Tap a venue → detail page with "Check in" CTA.

	•	Check-in writes to Firestore: users/{uid}.currentVenue, isCheckedIn=true, lastActive=now().

Visibility

	•	Once checked in, user appears in the venue population list for others (filtered by preferences/gender/age range).

	•	Leaving venue (manual or inferred via geofence/timeouts) sets isCheckedIn=false, clears currentVenue.

4.4 People Here (discovery at venue)

	•	User sees a deck/grid of cards for people at this venue who match their filters.

	•	Each card shows: avatar (1 main photo only), display name, minimal metadata (distance hidden; we're in the same venue).

	•	Actions:

	•	Like (heart) → toasts on success; if mutual, show "It's a Match" modal with confetti micro-animation.

	•	Pass (soft dismiss) → don't show again this session; reset on next check-in.

4.5 Match & Messaging

Match formation

	•	When reciprocal likes occur, create matches/{id} with:

	•	userId1, userId2, venueId, timestamp=now, expiresAt=timestamp+3h.

	•	Both users see match card with countdown.

Messaging

	•	Open match → chat view:

	•	Per-user message cap: 3 messages during active match window.

	•	UI displays counter ("2 of 3 left").

	•	When both users check into the same venue again within the 3-hour window, temporarily unlock unlimited messages for the duration of that concurrent check-in (feature flag: UNLOCK_FULL_CHAT_ON_COLOCATION).

	•	When match expires:

	•	Chat disables send; match disappears from active list (moved to Archived/Expired, hidden by default).

4.6 Reconnect

	•	On an expired match, user can tap Reconnect:

	•	Sends request; shows as pending to the sender.

	•	If the other party taps "Accept Reconnect," create a fresh new match with a new 3-hour window. Prefer requiring co-location; if allowed remotely, cap messages at 5 each.

4.7 Safety & Control

	•	Block: Immediately removes the other user from all views and prevents future exposure.

	•	Report: Quick categories with optional note; store in reports collection.

	•	Visibility Toggle: "Hide me from venues for the next 24 hours" (cool-off) or "Only visible when I manually check in."

	•	Photo Privacy (MVP simple): Show blur previews until match? (feature flag; default OFF for MVP).

⸻

5) UI/UX Standards

5.1 Visual System

	•	Framework: React 18, Vite 5, Tailwind 3.4, Shadcn UI.

	•	Animation: Framer Motion (micro-interactions: hover/tap, entrance fades/slides; no heavy parallax).

	•	Tokens: Use bg-background, text-foreground, border-border, muted, accent, etc., registered via @layer utilities in src/index.css.

	•	Color & Contrast: WCAG 2.1 AA or better.

	•	Responsive: Mobile-first; supports up to desktop with centered column and breathing whitespace.

5.2 Components (Golden Baseline)

	•	Buttons, Cards, Inputs, Dialogs (shadcn/ui).

	•	MatchCard: avatar, name, countdown chip, CTA "Open Chat."

	•	Chat: sticky input bar, bubble list, unread marker, soft haptics (if supported later).

	•	Toasts: non-intrusive, stack at top, auto-dismiss in 4–5s.

	•	Bottom Nav: Matches, Venues, Chat, Profile (icons: lucide).

5.3 Motion Guidelines

	•	Duration: 120–220 ms for small interactions; 240–320 ms for modal/dialog transitions.

	•	Easing: easeOutQuad for entrance, easeInQuad for exit.

	•	Don't animate: destructive actions, form submissions beyond subtle progress.

	•	Keep FPS: > 55 on average device; avoid layout thrash.

⸻

6) Architecture & Data Model

6.1 Stack

	•	Client: React 18 + Vite 5 + Typescript + Tailwind + Framer Motion

	•	Backend: Firebase (Auth, Firestore, Storage, optionally Functions)

	•	Dev: Firebase Emulator Suite for local

	•	Build/Deploy: GitHub Actions + Vercel (SPA rewrites)

6.2 Firestore (MVP schema)

users/{uid}

{

  uid: string,

  email: string,

  displayName: string,

  photos: string[],          // URLs in Storage

  gender: "male"|"female"|"nonbinary"|"other",

  age?: number,

  isCheckedIn: boolean,

  currentVenue?: string,     // venueId

  currentZone?: string,

  preferences: { gender?: string[], ageRange?: {min:number, max:number} },

  lastActive: Timestamp,

  createdAt: Timestamp,

  flags?: { isVisible?: boolean, isVerified?: boolean }

}

venues/{venueId}

{

  name: string,

  address: string,

  location: GeoPoint,

  zones?: string[],

  photos?: string[],

  description?: string

}

matches/{matchId}

{

  userId1: string,

  userId2: string,

  venueId: string,

  timestamp: number,       // ms epoch

  expiresAt: number,       // ms epoch (timestamp + 3h)

  reconnected?: boolean,

  reconnectedAt?: number

}

messages/{messageId}

{

  matchId: string,

  senderId: string,

  text: string,

  createdAt: Timestamp

}

reconnectRequests/{requestId} (or subcollections: users/{uid}/reconnectRequests)

{

  matchId: string,

  fromUserId: string,

  toUserId: string,

  createdAt: Timestamp,

  status: "pending"|"accepted"|"declined"

}

reports/{reportId}

{

  reporterId: string,

  targetUserId: string,

  type: "harassment"|"fake"|"spam"|"other",

  details?: string,

  createdAt: Timestamp

}

6.3 Security Rules (starter)

	•	Users can read/write their own user document.

	•	Only read matches where request.auth.uid is userId1 or userId2.

	•	Only read/write messages where user is a participant in the match.

	•	Writes to messages enforce per-user cap with a Cloud Function (or client-side + rules check via counters/aggregation). For MVP, initial enforcement can be client + occasional server prune; ramp to rule+function.

6.4 Derived/Computed Utilities (single source of truth)

matchesCompat.ts

export type Match = {

  id: string;

  userId: string;

  partnerId: string;

  createdAt: number;

  expiresAt: number;

  lastMessageAt?: number;

};

export const MATCH_EXPIRY_MS = 3 * 60 * 60 * 1000;

export function isExpired(m: Match): boolean {

  return Date.now() >= m.expiresAt;

}

export function getRemainingSeconds(m: Match): number {

  return Math.max(0, Math.floor((m.expiresAt - Date.now()) / 1000));

}

export async function getActiveMatches(userId: string): Promise<Match[]> {

  // Query user matches and filter by !isExpired

  // (Server-side index suggested; client filter acceptable for MVP)

  return [];

}

All components/services must use these utilities to avoid divergent logic.

⸻

7) Feature Specifications (deep detail)

7.1 Onboarding & Routing

Goals: frictionless, progressive disclosure, no dead ends.

Requirements:

	•	Store onboarding progress in Firestore or localStorage and server mirror (users/{uid}.onboardingStep).

	•	Route guards:

	•	/ → Landing

	•	/signin, /signup → Auth routes

	•	/onboarding/* → only if not complete

	•	/venues, /matches, /chat/*, /profile* → require "profile complete"

	•	Resume: if user reloads at any point, they return to the last step.

Acceptance:

	•	Entering protected page without completion → redirect to the correct step.

	•	Skipping photo → allowed, but on "Check in" attempt user is redirected to Upload Photos.

7.2 Venue Unlock

Goals: quick check-in, instant feedback, no map fiddling.

Requirements:

	•	Nearby venue list (stubbed static for MVP or simple JSON); check-in toggles:

	•	isCheckedIn=true, currentVenue=venueId.

	•	One photo required for check-in; intercept if not met.

Acceptance:

	•	Check-in within 2 taps; visible "You're in" confirmation.

	•	Leaving venue resets isCheckedIn within 3 minutes of app background or "Leave" tap.

7.3 Likes & Matches

Goal: enable yes/no quickly, reveal matches, not lists of maybes.

Requirements:

	•	Card deck with Like/Pass.

	•	On mutual like: create match, show "It's a Match" modal with confetti micro-anim.

	•	Expiry timer displayed consistently (chips/timers in list and chat header).

Acceptance:

	•	Duplicate likes prevented in session.

	•	Timer accuracy ± 1 second jitter is fine; visually smooth.

7.4 Messaging

Goal: short, purposeful conversations that push IRL.

Requirements:

	•	Per-user 3 message cap until co-location resumes.

	•	When both users are checked in concurrently, allow unlimited messages for that co-located interval (feature flag).

	•	Message composer shows remaining count, and disables when at 0.

Acceptance:

	•	Send → stored → visible to both within 400 ms P95.

	•	At cap, composer disabled with small explainer.

	•	On expiry, chat view becomes read-only, badge shows "Expired."

7.5 Reconnect

Goal: provide a lightweight second chance without endless threads.

Requirements:

	•	Expired match card shows "Reconnect" button.

	•	Pending → Accept/Decline on receiver's side.

	•	On accept, create fresh match with new 3-hour window; prefer requiring co-location (configurable).

Acceptance:

	•	Works without errors; duplicate requests suppressed.

	•	Clear toasts: "Reconnect request sent" / "Reconnect accepted—new match started."

7.6 Notifications

Goal: inform, don't nag.

Requirements:

	•	In-app toasts for like/match/message.

	•	OS push (PWA) later; stub interfaces now.

Acceptance:

	•	Toast stacking capped to avoid overlay spam.

	•	Dismiss with swipe or auto after ~4s.

7.7 Safety

Goal: quick exits, clear control.

Requirements:

	•	Block/report anywhere you see a user (card, match, chat header).

	•	Confirm dialog on block; explain effect.

	•	Hide me toggle (visibility) at Profile → Settings.

Acceptance:

	•	Block instantly removes exposure both ways.

	•	Report stored with context; success toast shown.

⸻

8) Nonfunctional Requirements

	•	Performance:

	•	First paint < 1 MB gzipped; TTI < 2 s on mid-range phone.

	•	Minimize network calls; cache user/venue lists.

	•	Reliability:

	•	App resilient to flaky networks; queue message sends locally with retry.

	•	Background resume: restore last view state.

	•	Security:

	•	No secrets in client.

	•	Follow Firestore rules; validate ownership and membership for read/write.

	•	Accessibility:

	•	All interactive elements keyboard accessible; ARIA labels for icons.

	•	Color contrast AA; focus ring visible.

	•	Privacy:

	•	Default visibility is venue-limited; opt-in for anything broader (not MVP).

	•	User can delete account; we remove PII.

⸻

9) Telemetry & Observability

	•	Events:

	•	user_signed_up, user_checked_in, match_created, message_sent, match_expired, reconnect_requested, reconnect_accepted.

	•	KPIs:

	•	DAU, check-in → match rate, match → chat rate, avg time to first interaction, session time, churn after first week.

	•	Error tracking: Sentry with tracesSampleRate: 0.1.

⸻

10) Feature Flags (config-driven)

	•	UNLOCK_FULL_CHAT_ON_COLOCATION (default: ON for MVP if stable).

	•	ALLOW_REMOTE_RECONNECT_CHAT (default: OFF).

	•	BLUR_PHOTOS_UNTIL_MATCH (default: OFF).

	•	STRICT_PHOTO_REQUIRED_FOR_CHECKIN (default: ON).

	•	LIMIT_MESSAGES_PER_USER (default: 10).

All flags exposed via src/lib/flags.ts and read synchronously.

⸻

11) Acceptance Criteria by Page / Module

Landing

	•	Renders in < 200 ms after hydration; CTA visible on first viewport.

	•	"Create Account" and "Sign in" routes function.

Onboarding

	•	Each step persists progress; reload resumes correctly.

	•	Photo skip allowed, but check-in intercept works.

Venues

	•	Nearby list loads, at least stubbed data.

	•	Check-in toggles state; leaving resets.

People Here

	•	Cards render within 400 ms after check-in with stub or real data.

	•	Like/Pass works; mutual like triggers modal.

Matches

	•	Countdown accurate; expired auto-removes.

	•	Open chat route functional.

Chat

	•	Send messages; cap enforced; co-location unlock toggles if flag on.

	•	Toasts for incoming messages while in other views.

Profile

	•	Edit display name, add/remove photos; "Hide me" toggle persisted.

Safety

	•	Block/report always available where it should be; feedback to user.

⸻

12) Testing Strategy (what Cursor should implement)

	•	Unit (Vitest):

	•	matchesCompat utilities—edge timing, rounding down seconds.

	•	Services: userService, matchService, messageService (mock Firestore).

	•	Integration (Testing Library):

	•	Onboarding resume.

	•	Check-in intercept for missing photo.

	•	Like → Match → Chat send.

	•	Expiry UI switch to read-only.

	•	E2E (Playwright):

	•	Full happy path (sign up → check-in → match → message → expiry).

	•	Reconnect request + accept.

	•	Visual Regression:

	•	Snapshot 5 core routes against golden baseline.

⸻

13) CI/CD & Environments

	•	CI: GitHub Actions

	•	Jobs: install → lint → test → build.

	•	Cache ~/.npm and node_modules when safe.

	•	Preview: Vercel

	•	SPA rewrite to /index.html.

	•	Env vars injected via Vercel UI (no secrets in repo).

	•	Release:

	•	Tag v0.9.0-mvp after backend parity merge.

	•	Auto-preview on PRs; require green CI to merge.

⸻

14) Security & Data Protection

	•	Rules: lock down collections to owners/participants.

	•	PII: email, photos; no exact geolocation exposed to other users beyond "at this venue."

	•	Abuse: rate limit message send in Functions (if added); client-side throttle for MVP; add back-pressure UI.

	•	Deletion: implement account deletion path (soft for 30 days, then purge).

⸻

15) Accessibility Deep-Dive (quick wins)

	•	Command-palette style keyboard nav for core actions (later).

	•	Focus indicators on buttons and cards.

	•	Keyboard triggers for Like (e.g., L) and Pass (K) (later, behind flag).

	•	Alt text on images (computed "Profile photo of {name}").

⸻

16) Product Copy & Micro-copy (tone)

	•	Friendly, direct, time-respecting.

	•	Examples:

	•	Match modal: "You two are here now—go say hi!"

	•	Messaging cap reached: "You've used your 3 messages. Meet in person or reconnect later."

	•	Photo intercept: "Add one photo so people recognize you at the venue. It takes 10 seconds."

⸻

17) Performance Plan

	•	Code split heavy pages (Onboarding, ProfileEdit, ChatRoom).

	•	Lazy-load images (venue photos, profile photos beyond the first).

	•	Cache logged-in user, venue list in local storage with TTL.

	•	Avoid rerender storms: memoize card lists and chat bubbles.

⸻

18) Implementation Sequencing (Cursor Autonomous Plan)

Phase 0 – Stabilize Base (Done if green)

	•	Ensure rescue/bring-back-ui builds and routes.

	•	Verify Tailwind tokens and Framer Motion micro-interactions.

Phase 1 – Backend Parity Merge

	•	Merge main logic into src/lib, src/services, src/context, keeping UI files intact.

	•	Ensure matchesCompat is the single source of truth for expiry.

Phase 2 – Hardening

	•	Strict route guards; onboarding resume.

	•	Photo-required check-in intercept.

	•	Message cap enforcement (client + stubbed server check).

Phase 3 – Reconnect

	•	Implement request/accept; fresh match creation.

Phase 4 – Safety

	•	Block/report + visibility toggle; persist & verify.

Phase 5 – Observability

	•	Sentry init (dsn via env), minimal analytics events.

Phase 6 – CI/CD

	•	GitHub Actions, Vercel preview, env scaffolding.

Phase 7 – QA Pass

	•	Smoke + integration + E2E; fix regressions; tag v0.9.0-mvp.

⸻

19) Risks & Mitigations

	•	Divergent expiry logic → enforce matchesCompat import everywhere; lint rule (ban others).

	•	Network flakiness (npm) → .npmrc with retries & registry lock.

	•	State drift → consolidate contexts; avoid duplicate sources of truth.

	•	Scope creep → keep "interests" and global discovery out of MVP.

	•	PWA Push → treat as Phase-2; for MVP, in-app toasts only.

⸻

20) Developer Experience (DX) Expectations

	•	Named exports for components to avoid Fast Refresh warnings.

	•	ESLint zero-error policy on CI.

	•	scripts:

	•	dev, build, preview

	•	lint, lint:fix

	•	test, test:watch

	•	emulators, dev:full

	•	README includes quick start, env keys, flags, and troubleshooting.

⸻

21) Glossary

	•	Check-in: Action that makes you visible at a venue.

	•	Venue Unlock: Gaining access to see others at that venue.

	•	Match Expiry: 3-hour window after mutual like.

	•	Reconnect: Post-expiry re-interest handshake to form a fresh match.

	•	Cap: Per-user message limit during an active match (3).

⸻

22) Concrete UI Inventory (MVP)

	•	Pages

	•	Landing, SignIn, SignUp

	•	Onboarding/* (Philosophy, Location, Notifications, Profile, Photos, Preferences)

	•	VenueList, ActiveVenue

	•	PeopleHere (could be within ActiveVenue or a tab)

	•	Matches, ChatRoom

	•	Profile, ProfileEdit

	•	Safety, Privacy, Terms

	•	NotFound

	•	Components

	•	MatchCard, MatchTimer

	•	ChatView, ChatInput, ChatPreview

	•	VenueCard, VenueDetails

	•	BottomNav, Layout, Toaster

	•	Avatar, Button, Dialog, Toast, Skeleton

	•	Modals

	•	ItsAMatchModal, WeMetConfirmationModal (Ph2), BlockReportDialog

⸻

23) Data & Rules (outline excerpts)

Firestore Rules Pseudocode

rules_version = '2';

service cloud.firestore {

  match /databases/{db}/documents {

    function isSignedIn() { return request.auth != null }

    function isSelf(uid) { return isSignedIn() && request.auth.uid == uid }

    match /users/{uid} {

      allow read: if isSelf(uid);

      allow write: if isSelf(uid);

    }

    match /matches/{matchId} {

      allow read, write: if isSignedIn() &&

        (request.resource.data.userId1 == request.auth.uid ||

         request.resource.data.userId2 == request.auth.uid ||

         resource.data.userId1 == request.auth.uid ||

         resource.data.userId2 == request.auth.uid);

    }

    match /messages/{messageId} {

      allow read, write: if isSignedIn() &&

        exists(/databases/$(db)/documents/matches/$(request.resource.data.matchId))

        // For write, also confirm senderId == auth.uid

        && request.resource.data.senderId == request.auth.uid;

    }

    match /reconnectRequests/{id} {

      allow read, write: if isSignedIn();

    }

    match /reports/{id} {

      allow write: if isSignedIn();

      allow read: if false; // private to admins

    }

  }

}

(Refine with explicit get() checks for match membership as needed.)

⸻

Non-Negotiables & Guardrails

Branches

	•	Base: rescue/bring-back-ui (do not overwrite src/components/**, src/styles/**, src/index.css, tailwind.config.*, postcss.config.*, public/**)

	•	Merge in logic from: main → only src/lib/**, src/services/**, src/context/**, src/firebase/**

Coding standards

	•	TypeScript strict; no any unless justified in comments.

	•	Named exports for React components (Fast Refresh stability).

	•	No component-level side effects; use hooks/services.

Performance budgets

	•	First paint JS ≤ 1.0 MB (gz), TTI ≤ 2s on mid-tier mobile.

	•	Route JS chunks ≤ 250 KB each.

	•	Images lazy-loaded; prefer WebP/AVIF.

Accessibility

	•	WCAG 2.1 AA, keyboard nav, focus rings, aria-labels for icons.

	•	Color contrast ≥ 4.5:1 for body text.

Security & privacy

	•	Never commit .env*. Use .env.example.

	•	Follow Firestore rules; client validates message limits.

	•	Sanitize any user text rendered (bios/messages).

⸻

Environment Matrix

Mode	Firebase	Emulators	Analytics	Sentry

local	mingle-a12a2	✅	off	off

preview (PR)	staging project	❌	on	on

production	production project	❌	on	on

Files to keep:

	•	.nvmrc: v22.14.0

	•	.npmrc:

legacy-peer-deps=true

audit=false

fund=false

registry=https://registry.npmjs.org/

fetch-retries=5

fetch-timeout=60000

⸻

Browser/Device Support

	•	iOS Safari 16+, Chrome/Edge/Firefox last 2, macOS Safari 16+.

	•	Breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536.

⸻

Firebase Must-Haves

Indexes (add to firestore.indexes.json):

{

  "indexes": [

    { "collectionGroup": "messages", "queryScope": "COLLECTION", "fields": [

      { "fieldPath": "matchId", "order": "ASCENDING" },

      { "fieldPath": "createdAt", "order": "ASCENDING" }

    ]},

    { "collectionGroup": "matches", "queryScope": "COLLECTION", "fields": [

      { "fieldPath": "userId1", "order": "ASCENDING" },

      { "fieldPath": "timestamp", "order": "DESCENDING" }

    ]},

    { "collectionGroup": "matches", "queryScope": "COLLECTION", "fields": [

      { "fieldPath": "userId2", "order": "ASCENDING" },

      { "fieldPath": "timestamp", "order": "DESCENDING" }

    ]}

  ]

}

Rules (high level):

	•	Users can read/write their own doc.

	•	Read matches only if participant.

	•	Read/write messages only if participant of match.

	•	Enforce 10-message limit in security rules if feasible; otherwise verify in service.

⸻

Test Data & Accounts

Seed users (for local)

	•	alice@test.dev / bob@test.dev / charlie@test.dev (password password123)

	•	6 sample venues (with images), 4 seeded matches (2 active, 2 expired).

Seed script expectations

	•	Creates users, venues, and 4 matches with expiresAt mix.

	•	Places screenshots in /public/dev/ if needed.

⸻

Telemetry Plan

Analytics events

	•	user_signed_up, user_checked_in, match_created, message_sent, match_expired,

reconnect_requested, reconnect_accepted, push_permission_shown|accepted|denied.

Sentry

	•	Init in main.tsx; tracesSampleRate=0.1, tag env + commit SHA.

⸻

Feature Flags (toggles)

	•	ff_chat_message_limit (default: on)

	•	ff_match_expiry_ui (on)

	•	ff_push_notifs (on in preview/prod)

	•	ff_offline_mode (off by default)

	•	ff_reconnect_flow (on)

Implement via a simple env-driven config or tiny flag service.

⸻

Golden UI Tokens (do not regress)

	•	Tailwind tokens: bg-background, text-foreground, border-border, ring-ring,

primary, primary-foreground, muted, accent, destructive.

	•	Motion: card hover/press (whileHover, whileTap) and page transitions.

	•	Toasts: success, error, info with consistent spacing and z-index over modals.

⸻

Acceptance Criteria (Definition of Done)

	1.	Parity merge complete: backend/services/context from main integrated without changing UI files.

	2.	Match expiry: single source of truth (matchesCompat.ts) with unit tests.

	3.	Message limit: 3 messages/user/match enforced (UI + service), with toast copy.

	4.	Routing: ProtectedRoute & AuthRoute correct; onboarding resume logic works.

	5.	Notifications: New message → toast + badge; clear/read logic stable.

	6.	Performance & a11y: Budgets met; axe audit has no critical issues.

	7.	Tests: All smoke + key integration tests green (onboarding, match, chat).

	8.	CI: GitHub Actions runs lint, typecheck, test, build on PR.

	9.	Preview deploy: Vercel preview auto-builds on PR.

	10.	Docs: README quickstart updated; ENVIRONMENT.md + RELEASE_CHECKLIST.md.

⸻

Release Checklist (short)

	•	npm run lint && npm run typecheck && npm run test && npm run build

	•	Verify match expiry timer live and after refresh.

	•	Verify 3-message ceiling UX (disable + tooltip + toast).

	•	Manual pass on 5 pages: Landing, Onboarding, Venues, Matches, Chat.

	•	Tag v0.9.0-mvp after merge to main.

⸻

Known Risk Areas (watch list)

	•	Vite/Rollup native bindings on macOS ARM after clean install.

	•	Tailwind custom tokens: must keep @layer utilities declarations.

	•	Toast stacking over dialogs (z-index).

	•	Chat mobile keyboard overlaps input; needs safe-area & viewport units.

⸻

Out of Scope (for now)

	•	Full social sign-in, advanced analytics, heavy moderation tooling,

complex recommender, CMS for landing copy. Keep MVP tight.

⸻

That's the essential add-on. It keeps Cursor moving forward (not backward), locks visual standards, and defines exact acceptance criteria so we don't regress or re-fight the same fires.

⸻

Please enact this document once you have reviewed it and are happy with it. Go at the pace you need to.



