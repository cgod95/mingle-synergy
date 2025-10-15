# Cursor Kickoff Plan — Mingle Synergy (October 2025)

## Mission
Complete, stabilize, and polish the Mingle MVP so it can be safely deployed and maintained.  
Cursor acts as the autonomous executor. ChatGPT provides architectural and strategic guidance.

---

## Current Status (snapshot)
- ✅ Onboarding, profile creation, venue system, likes, matches, and 3-message/3-hour chat window implemented.
- ✅ Firestore + Auth + Storage integrated and tested through emulator.
- ✅ Expiry Cloud Function marks expired matches; cleaner deferred.
- ✅ TypeScript types consistent; build passes.
- ✅ ESLint mostly clear (only “only-export-components” warnings remain).
- ⚙️ CI, lint enforcement, and Playwright smoke tests pending final integration.

---

## Primary Goals
1. **Finalize stability**
   - Finish CI workflow (`lint + typecheck + build + e2e`).
   - Silence or split remaining ESLint warnings.
   - Verify expiry + message limits in emulator and prod.
2. **QA & Testing**
   - Unskip onboarding Playwright suite.
   - Add smoke tests for check-in, match, and chat.
3. **Deployment**
   - Confirm environment config for production.
   - Deploy Firebase functions and web app build.
   - Validate post-deploy runbook.
4. **Docs & Tracking**
   - Maintain `docs/TODO_EXPIRY.md` for deferred cleaner.
   - Generate a final `DEPLOY_README.md` for future hand-offs.

---

## Execution Loop
Cursor follows this daily rhythm:
1. **Morning (Kickoff)**
   - Parse this file.
   - Generate granular tasks with file paths and expected diffs.
   - Start executing autonomously.
2. **Midday (Progress Report)**
   - Summarize commits, passing/failing tests, lint state.
   - Propose next incremental batch.
3. **Evening (Validation)**
   - Run `pnpm lint && pnpm typecheck && pnpm build && pnpm test:e2e`.
   - Produce an E2E status report (✅/⚠️/❌).
   - Update a lightweight daily log in `/reports/YYYY-MM-DD.md`.

---

## Style & Rules
- Use single, copy-pasteable commits.
- Never modify package versions without confirmation.
- Prioritize working builds over perfect code style.
- Never add new features beyond MVP scope.
- ChatGPT provides architectural oversight; Cursor executes and reports.

---

## Success Criteria
- CI green on all pushes.
- Local emulator parity with prod.
- All MVP features (check-in → match → chat → expire) verified.
- 0 TypeScript errors; ≤ 5 non-critical lint warnings.

