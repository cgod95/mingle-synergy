# Cursor Kickoff Plan — Mingle Synergy (Oct 2025)

## Mission
Ship the Mingle MVP: onboarding → venue check-in → match → chat (3 msgs / 3h window) → expiry. Cursor is the executor; ChatGPT is the architect. Priorities: stability, CI, E2E, deploy.

## Current Status
- ✅ Auth + onboarding + profile + photos
- ✅ Venues list + active venue + check-in
- ✅ Likes → mutual match flow
- ✅ Messaging with 3-message cap per user per match
- ✅ 3-hour match window enforced client/service
- ✅ Expiry function marks old matches (dev endpoint OK)
- ✅ Lint errors cleared; typecheck/build pass
- ✅ Basic Playwright smoke scaffold
- ⚙️ Remaining: notifications wiring, read-receipts UI, cleaner job polish, CI + E2E finalization, deploy runbook

## Remaining MVP Features (must-complete)
1) Notifications (FCM)
   - Store device token after permission grant
   - Cloud Function trigger to send push on mutual match + message receipts (stub OK)
   - Basic in-app handling (foreground)
2) Read Receipts
   - Persist `readBy` / `readAt` in Firestore on view
   - Show small “Seen” indicator for latest outbound message
3) Expiry Cleaner Job
   - Delete subcollection `messages` for expired matches (scheduled)
4) CI + Tests
   - CI: lint + typecheck + build + e2e
   - Unskip onboarding test; add match/chat limits spec
5) Deploy
   - Verify prod env, deploy Functions + Hosting, smoke in prod

## Guardrails
- No new features beyond MVP scope
- No dep bumps without an explicit subtask
- Small, atomic PRs with clear subjects
- Keep build green at every step

## Execution Loop (daily)
Morning:
- Parse this plan; propose a batch of 3–6 atomic tasks with exact file paths and expected diffs
- Run tasks in order, stopping on first red build
Midday:
- Report: commits, lint/typecheck/build/e2e status, next deltas
Evening:
- Run: `pnpm lint && pnpm typecheck && pnpm build && pnpm test:e2e`
- Write `/reports/YYYY-MM-DD.md` with pass/fail and follow-ups

## Acceptance Criteria
- All MVP flows verified by E2E against local preview + emulator
- CI green on push and PR
- 0 TS errors; ≤5 non-critical lint warnings
- Prod deploy complete; smoke tested

## Backlog (priority order)
P1: CI finalize; fix onboarding e2e; add match→3 msgs→blocked / 3h expiry spec  
P1: Read receipts: persist + UI chip on latest outbound  
P1: Expiry cleaner: scheduled function deletes subcollection for expired matches  
P2: Notifications: token capture + function stub + foreground handler  
P2: Trim remaining `only-export-components` warnings (split helpers/constants)  
P2: Bundle: optional finer vendor/manualChunks  
P3: Docs: DEPLOY_README.md; update TODO_EXPIRY.md as we defer pieces

## Reporting Format (Cursor must output)
- “Morning Plan”: checklist with files + diffs summary
- “Midday Status”: ✅/⚠️ for lint/typecheck/build/e2e + commit SHAs
- “Evening Validation”: command logs condensed + next actions

