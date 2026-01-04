# 🧭 Mingle Restoration + Continuation: Full Technical Handover for Cursor (Base: rescue/bring-back-ui)

---

## 1. Executive Summary

This document serves as a complete project handover and forensic analysis of Mingle's recent code history, technical state, and restoration process as of November 7, 2025.

It captures every major failure, rollback, and recovery event across the last seven days, explains the root causes, and defines Cursor's ongoing responsibilities.

**The current canonical branch is `rescue/bring-back-ui`**, a restored build that merges the visual "golden" snapshot from commit `69e01a3` (the last friend-demo-ready UI) with key functional commits for animations, notifications, and match expiry (`a7e8a00`, `b0db119`, `8c39ec2`).

Backend, routing, and authentication logic from `main` remain preserved and will be selectively merged forward.

**The goal now is to:**
- Consolidate backend + routing logic from `main`
- Preserve the restored UI/UX standard
- Normalize dependencies and configuration
- Achieve a clean, production-ready build that fully integrates both domains

---

## 2. Chronological Timeline (Past 7 Days)

### Phase 1 – Dependency Failure and Husky Lock (≈ Nov 1–3)

**Symptoms:**
- Local installs began freezing (`npm install` hanging at `@hookform/resolvers` fetch)
- Husky hooks and prepare scripts repeatedly blocked commits (UI-protected files are staged)
- Attempts to disable Husky via `npm pkg set scripts.prepare=""` failed due to syntax issues
- Several partial commits were made without `--no-verify`, causing half-staged UI files

**Root cause:**
Legacy Husky config was auto-executing during every `npm install`, spawning nested git processes on macOS ARM, which dead-locked local commits.

**Mitigation:**
Manually deleted `.husky` and `.git/hooks/*`, then rewrote `package.json` to remove the prepare script.

---

### Phase 2 – NPM Registry + Peer-Dependency Chaos (≈ Nov 3–5)

**Symptoms:**
- Local network timeouts hit `npmjs.org` repeatedly; switching to `npmmirror.com` worked briefly
- `vite`, `rollup`, `esbuild` all desynchronized: Vite 5 required Rollup 4 native bindings (`@rollup/rollup-darwin-arm64`) missing
- Node v22 + NPM 10 combination magnified optional-dependency bugs

**Error Messages:**
```
Error: Cannot find module '@rollup/rollup-darwin-arm64'
npm error code ETIMEDOUT
```

**Fix:**
```bash
npm config set registry https://registry.npmjs.org/
npm i -D rollup@^4 @rollup/rollup-darwin-arm64 vite@^5
```

→ Vite server successfully booted on `:5174`

---

### Phase 3 – UI/UX Regression Discovery

**Symptoms:**
- During rebuild, Tailwind `@apply` references (`bg-background`, `border-border`) broke
- The underlying CSS variable tokens existed, but Tailwind utilities hadn't been registered

**Root cause:**
`src/index.css` was missing explicit `@layer utilities` declarations that register custom tokens with Tailwind's JIT compiler.

**Outcome:**
Restoring `src/index.css` with explicit `@layer utilities` resolved all token references. Stable, themeable base with working dark/light modes and restored aesthetic parity with the July 2024 "golden" demo.

---

### Phase 4 – Strategic Restoration Decision (Nov 6)

At this point the repo had diverged:
- `main` → functionally strong, visually broken
- `rescue/bring-back-ui` → visually strong, functionally lagging

**Decision:** Make `rescue/bring-back-ui` the working base.

The branch was rebuilt from scratch:
1. Restored `69e01a3` UI snapshot
2. Cherry-picked 3 feature commits (animations, notifications, match expiry)
3. Preserved all backend/routing/auth code untouched
4. Created guardrails: `.gitattributes` + `CODEOWNERS` to protect UI paths
5. Verified with `npm run dev` → server live on `:5174`

---

### Phase 5 – Cursor Integration Prep (Nov 7)

- Build validated (vite ready)
- Tailwind config standardized
- 2 untracked files (`.npmrc`, `.nvmrc`) noted for environment control
- Identified safe merge plan for backend parity

---

## 3. Honest Analysis: What Went Wrong

1. **Unmanaged Local Hooks** – Husky scripts locked commits
2. **Dependency Drift** – Mix of legacy and modern Vite/React 18/Tailwind 3 configs
3. **Poor Registry Handling** – Network fallbacks never formalized
4. **Lack of Commit Hygiene** – Massive unverified checkpoints; confusing diff trees
5. **UI-Logic Drift** – Backend evolved while UI stagnated; no integration guardrails
6. **Insufficient Error Instrumentation** – Vite overlays masked real PostCSS stack traces
7. **Reactive > Proactive Fixing** – Fire-fighting rather than pipeline repair

---

## 4. Current Repository State

| Area | Status | Notes |
|------|--------|-------|
| Branch | `rescue/bring-back-ui` | Active, builds cleanly |
| Build Tooling | ✅ Vite 5 + Rollup 4 + Node 22 | Works via native ARM bindings |
| UI | ✅ Golden restored (shadcn tokens, colors, animations) | Matches friend-demo visual fidelity |
| Backend/Routing/Auth | ⚠️ Present but unsynced with latest main | Needs code-level diff merge |
| Husky | 🚫 Removed | Manual commits only |
| Tailwind | ✅ Token utilities restored | `@layer` shim + vars |
| Testing | 🧪 4 UI smoke tests | Add integration coverage |
| Env Files | `.npmrc`, `.nvmrc` untracked | Cursor to normalize |
| CI/CD | Missing | To be added after stabilization |

---

## 5. Immediate Objectives for Cursor

### 1. Merge backend logic forward from main

- Compare `/src/lib`, `/src/services`, `/src/context`, `/src/pages/Matches.tsx`, `/src/pages/Venues.tsx`
- Re-introduce only logic changes (Firestore paths, match services, auth contexts)
- **Do not overwrite any `src/components` or style files**

### 2. Dependency Normalization

Enforce consistent modern stack:

- React 18.x
- React Router 6.x
- Vite 5.x
- Rollup 4.x
- Tailwind 3.4.x
- Framer Motion 11.x
- Lucide React 0.468+
- React Hot Toast 2.x

Remove all legacy or duplicate packages.

### 3. Refactor & Lint

- Run `npm run lint -- --fix`
- Convert any default exports to named where Fast Refresh warnings exist
- Resolve "React Fast Refresh" warnings, not by disabling but by stable exports

### 4. Test Infrastructure

- Set up Vitest + React Testing Library
- Keep `/src/__smoke__` as minimal end-to-end smoke tests
- Add new tests: onboarding, match-expiry, notifications, venue-check-in

### 5. CI/CD Re-enable

- Add GitHub Actions for build + lint + test
- Deploy preview to Vercel (link environment to Firebase project `mingle-a12a2`)

### 6. Visual Verification

- Snapshot test each of: Landing, Onboarding, Venues, Matches, Chat
- Ensure motion animations trigger properly (`whileHover`, `whileTap`, `variants`)

### 7. Security / Environment

- Lock `.env.example` (Firebase keys redacted)
- Add `.npmrc` → `legacy-peer-deps=true`, `.nvmrc` → `v22.14.0`

---

## 6. Longer-Term Roadmap

### 1. Reintroduce Analytics + Error Tracking
Add lightweight Sentry (browser SDK) and user analytics toggle.

### 2. Offline Resilience
Migrate existing `/public/offline.html` to service-worker registration.

### 3. Performance Audit
- Use Vite's bundle analyzer
- Target < 1 MB first paint, < 2 s TTI

### 4. Design System Consolidation
Convert the ad-hoc tokens in `index.css` into a reusable `theme.ts`.

### 5. QA & UX Loop
After parity merge, capture regression screenshots, produce style guide PDF.

---

## 7. Code-Level To-Dos

- Merge `main` → `rescue/bring-back-ui` using `--no-commit` to manually resolve conflicts
- Keep `src/components`, `src/styles`, `src/index.css` from rescue branch
- Prefer logic from `main` in `src/lib`, `src/context`, `src/services`
- Ensure `matchesCompat.ts` exposes `isExpired`, `getRemainingSeconds`
- Confirm Firebase config (`firebase.ts`) unchanged
- Add `.eslintignore` for `dist`, `node_modules`, `*.config.*`
- Run `npx vite build` and verify `outDir` integrity
- Commit → `[stability] backend merge with golden UI`

---

## 8. Major Lessons & Failures (Brutal Honesty)

1. **Environment Drift** – Multiple Node versions; no `.nvmrc` until now
2. **Uncontrolled Feature Creep** – Too many UI experiments merged without version tagging
3. **Insufficient Branch Hygiene** – Critical commits (animations, notifications) never tagged
4. **Manual Patch Chaos** – Commands pasted in terminal without reproducibility
5. **No Automated Tests** – Visual regressions went unnoticed until total failure
6. **Dependency Ignorance** – Husky hooks and npm lockfiles unchecked into git
7. **Reactive Recovery** – Fixes done live instead of in branches
8. **Missing Continuous Integration** – No safety net between dev and prod

---

## 9. Architectural Snapshot

```
src/
  components/   →  Golden UI restored (Cards, Buttons, Nav, etc.)
  context/      →  AuthContext, OnboardingContext
  lib/          →  matchesCompat.ts (shim layer)
  pages/        →  Landing, Venues, Matches, Profile, Chat
  styles/       →  index.css (token-based theming)
  __smoke__/    →  UI sanity tests

public/
  offline.html, favicon.svg
```

**App entry:** `/src/main.tsx` → `App.tsx` → router (React Router 6)

Protected routes intact (`ProtectedRoute`, `AuthRoute`).

Firebase backend `mingle-a12a2` with Auth + Firestore.

Chat/match expiry logic uses Firestore timestamps and local expiry timer.

---

## 10. Dependencies (Working Set)

| Package | Purpose | Version |
|---------|---------|---------|
| react / react-dom | Core UI | 18.x |
| react-router-dom | Routing | 6.x |
| vite | Build Tool | 5.x |
| rollup | Bundler | 4.x |
| framer-motion | Animations | 11.x |
| lucide-react | Icons | 0.468+ |
| react-hot-toast | Notifications | 2.x |
| classnames | Utility | ^2 |
| tailwindcss | Styling | 3.4.x |
| postcss / autoprefixer | CSS pipeline | latest |
| firebase | Backend | 10.x |
| vitest / @testing-library/react | Testing | latest |

---

## 11. Testing Plan for Cursor

### 1. Smoke Run
- `npm run dev` → confirm no console errors
- Hard refresh UI pages

### 2. Backend Parity Tests
- Mock Firestore calls; ensure `getMatches()` returns identical structure to `main`
- Validate `isExpired` utility toggles expired matches

### 3. UI Interaction Tests
- Button presses, modals, toasts, page transitions
- Validate Framer Motion props (`whileHover`, `whileTap`)

### 4. Routing Tests
- Check redirects for unauthorized users
- Ensure onboarding resumes where left off

---

## 12. Deployment Checklist

- `npm run build` successful
- Preview deploy to Vercel (connect to GitHub repo `cgod95/mingle-synergy`)
- Set `VITE_FIREBASE_CONFIG` env vars
- Add fallback route `/index.html` for SPA
- Verify 404 → redirect to Landing
- Confirm service-worker offline HTML loads correctly

---

## 13. Merging Strategy Summary

| Step | Action |
|------|--------|
| 1 | Start from `rescue/bring-back-ui` |
| 2 | `git fetch origin main` |
| 3 | `git merge origin/main --no-commit` |
| 4 | Manually resolve conflicts; favor UI files from rescue |
| 5 | Test build |
| 6 | Commit: `[stability] merge backend into golden UI` |
| 7 | Push and create PR to `main` |
| 8 | Tag release → `v0.9.0-mvp` |

---

## 14. Environment and Network Stabilization

- Lock registry: `npm config set registry https://registry.npmjs.org/`
- For unreliable connections: `npm config set fetch-retries 5`, `fetch-timeout 60000`
- Add `.npmrc`:
  ```
  legacy-peer-deps=true
  audit=false
  fund=false
  registry=https://registry.npmjs.org/
  ```
- Add `.nvmrc`: `v22.14.0`

---

## 15. Cursor's Immediate Tasks (Top Priority)

1. ✅ Confirm local build of `rescue/bring-back-ui`
2. 🧩 Perform diff vs `main` on `/src/lib` and `/src/context`
3. 🔧 Integrate backend logic without touching `src/components` or `src/styles`
4. 🧹 Run `npm dedupe` and reinstall clean
5. 🧪 Run smoke tests, fix any import drift
6. 📦 Create PR: `feature/backend-parity-merge`
7. 🧭 Write summary report to ChatGPT for next coordination round

---

## 16. Known Bugs / Weak Spots

- `matchesCompat.ts` export mismatch (fixed but monitor)
- Minor Tailwind warnings if custom tokens referenced incorrectly
- Some notifications not clearing state when match expires
- Toast stacking occasionally over modal z-index
- No mobile keyboard handling in chat input yet

---

## 17. Success Criteria for Cursor

Mingle MVP is considered fully restored and ready for production when:

✅ Build succeeds with 0 lint errors  
✅ All routes navigate correctly (Landing → Onboarding → Venues → Matches → Chat)  
✅ UI visually matches July demo screenshots  
✅ Framer Motion animations render on Cards, Buttons, Nav  
✅ Notifications and match expiry logic work live  
✅ Firebase read/write verified  
✅ All smoke tests green  
✅ CI/CD build passes automatically on PR  

---

## 18. Closing Notes to Cursor

This repo has endured heavy manual surgery, dependency churn, and repeated network failures.

However, the core architecture is strong, the UI is now fully restored, and the team vision is crystal-clear.

**Cursor's mission now is not invention but stabilization:** make this thing production-solid, merge logic back in cleanly, and prepare for public launch.

When done, tag a `v0.9.0-mvp` release and report back with the diff summary, failing tests (if any), and screenshots of the five core pages.

---

## 19. Critical File Locations

### UI Files (DO NOT OVERWRITE)
- `src/components/**` - All component files
- `src/pages/**` - All page components
- `src/styles/**` - Style files
- `src/index.css` - Root CSS with Tailwind tokens
- `tailwind.config.*` - Tailwind configuration
- `postcss.config.*` - PostCSS configuration
- `public/**` - Static assets

### Backend Files (MERGE FROM MAIN)
- `src/lib/**` - Library utilities (merge logic only)
- `src/services/**` - Service layers (merge logic only)
- `src/context/**` - Context providers (merge logic only)
- `src/firebase/**` - Firebase initialization (preserve current)
- `src/App.tsx` - Routing (preserve current structure)

### Configuration Files (NORMALIZE)
- `.npmrc` - NPM configuration
- `.nvmrc` - Node version lock
- `.gitattributes` - Merge strategies (already set)
- `.github/CODEOWNERS` - Code ownership (already set)

---

## 20. Git Workflow Commands Reference

```bash
# Start from rescue branch
git checkout rescue/bring-back-ui
git pull origin rescue/bring-back-ui

# Fetch main for comparison
git fetch origin main

# Compare backend files
git diff origin/main -- src/lib src/services src/context

# Merge with no commit (manual conflict resolution)
git merge origin/main --no-commit

# After resolving conflicts, verify UI files unchanged
git status | grep -E "(components|styles|index.css|tailwind|postcss)"

# If UI files show conflicts, restore from rescue branch
git checkout --ours src/components src/styles src/index.css

# Test build
npm run build

# Commit merge
git add -A
git commit -m "[stability] merge backend into golden UI"

# Push and create PR
git push origin rescue/bring-back-ui
```

---

## 21. Firebase Configuration

**Project ID:** `mingle-a12a2`

**Current Setup:**
- Auth emulator: `localhost:9099` (when `VITE_USE_FIREBASE_EMULATOR=true`)
- Firestore emulator: `localhost:8080` (when `VITE_USE_FIREBASE_EMULATOR=true`)
- Production config in `src/firebase/config.ts` (reads from env vars)

**Environment Variables Required:**
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_USE_FIREBASE_EMULATOR (optional, for local dev)
```

**Do not commit:** `.env.local` or `.env` with real keys. Use `.env.example` with placeholders.

---

## 22. Component Architecture Notes

### Protected Routes
- `ProtectedRoute` - Wraps authenticated routes
- `AuthRoute` - Redirects authenticated users away from auth pages
- Current implementation bypasses auth checks (dev mode)

### State Management
- `AuthContext` - User authentication state (localStorage-backed currently)
- `AppStateContext` - Global app state (matches, interests, etc.)
- Firebase services handle backend state

### UI Component Patterns
- Shadcn/ui components in `src/components/ui/`
- Custom components in `src/components/`
- Page components in `src/pages/`
- All components use Tailwind utility classes
- Framer Motion for animations (`motion.div`, `whileHover`, etc.)

---

## 23. Build & Development Commands

```bash
# Development
npm run dev              # Start Vite dev server (port 5173)

# Build
npm run build            # Production build
npm run build:dev        # Development build

# Testing
npm run test             # Run Vitest tests
npm run test:watch       # Watch mode
npm run test:ui          # Playwright UI tests
npm run test:e2e         # End-to-end tests

# Linting
npm run lint             # ESLint check
npm run lint:fix          # Auto-fix linting issues

# Firebase Emulators
npm run emulators         # Start Firebase emulators
npm run dev:full          # Start emulators + dev server concurrently
```

---

## 24. Troubleshooting Common Issues

### Issue: Vite build fails with "Cannot find module"
**Solution:** Run `npm install --legacy-peer-deps` and ensure `@rollup/rollup-darwin-arm64` is installed

### Issue: Tailwind classes not applying
**Solution:** Check `tailwind.config.ts` includes all content paths, verify `src/index.css` has `@tailwind` directives

### Issue: Firebase emulator connection fails
**Solution:** Ensure `VITE_USE_FIREBASE_EMULATOR=true` and emulators are running (`npm run emulators`)

### Issue: Fast Refresh warnings
**Solution:** Convert default exports to named exports, ensure components are properly exported

### Issue: TypeScript errors in build
**Solution:** Run `npm run typecheck` to identify issues, fix incrementally (backend utils may have errors - document but don't block)

---

## 25. Final Checklist Before Production

- [ ] All smoke tests passing
- [ ] Build succeeds with 0 errors
- [ ] Lint passes with 0 errors
- [ ] TypeScript compiles (warnings acceptable in backend utils)
- [ ] Firebase connection verified (emulator + production)
- [ ] All routes tested manually
- [ ] UI matches golden snapshot visually
- [ ] Animations work on all interactive elements
- [ ] Notifications display and dismiss correctly
- [ ] Match expiry timer counts down accurately
- [ ] Chat input sends messages (10-message limit enforced)
- [ ] Protected routes redirect correctly
- [ ] Environment variables documented in `.env.example`
- [ ] CI/CD pipeline configured and passing
- [ ] Vercel preview deploy successful
- [ ] Performance audit completed (< 1MB first paint)
- [ ] Security audit completed (no exposed keys)
- [ ] Tagged release `v0.9.0-mvp`

---

**END OF HANDOVER — Base Branch: `rescue/bring-back-ui`**

**You can paste this whole text into Cursor's Composer Agent as a single prompt.**

**It will parse it as contextual instructions and continue the repo unification and stabilization process from here.**

---

*Document Version: 1.0*  
*Last Updated: November 7, 2025*  
*Base Commit: `69e01a3` (golden UI snapshot)*  
*Current Branch: `rescue/bring-back-ui`*  
*Target: Production-ready MVP with unified backend + golden UI*



