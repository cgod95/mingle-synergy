1) Reduce Fast Refresh warnings
- Goal: Eliminate only-export-components warnings in hotspots
- Files: src/components/ui/OptimizedImage.tsx; src/components/BrandIdentity.tsx; src/components/ui/button.tsx
- Approach: Move non-component exports to sibling util files; keep component-only files hot-reloadable
- Acceptance: CLI: pnpm lint → warning count drops; Manual: hot-reload works for edited components

2) Fix missing React hook dependencies
- Goal: Resolve react-hooks/exhaustive-deps warnings without behavior change
- Files: src/components/ui/EnhancedLoadingStates.tsx; src/hooks/useRequireOnboarding.ts; src/pages/ActiveVenue.tsx
- Approach: Wrap handlers in useCallback and include in deps; where safe, suppress with inline rationale
- Acceptance: CLI: pnpm lint clean for these lines; Manual: flows still function (loading states, onboarding redirect, venue load)

3) Stabilize message read receipts typing
- Goal: Formalize optional readBy typing end-to-end
- Files: src/types/match.ts; src/services/messageService.ts; src/pages/MessagesPage.tsx
- Approach: Define Message type with optional readBy: string[]; refactor service and usage to rely on this
- Acceptance: CLI: pnpm exec tsc --noEmit passes; Manual: unread badge counts correct in Messages

4) Trim bundle size warnings
- Goal: Reduce >500 kB chunk warning
- Files: src/App.tsx; src/pages/SettingsPage.tsx; src/pages/MatchesPage.tsx
- Approach: Lazy-load heavy routes/components; consider manualChunks for vendor splits
- Acceptance: CLI: pnpm build with fewer/smaller chunk warnings; Manual: routes still load correctly

5) Fix PWA fonts/assets resolution
- Goal: Remove unresolved font path logs in build
- Files: public/ (fonts/); src/index.css
- Approach: Place fonts under public/fonts and reference via /fonts/*; verify vite-plugin-pwa includes them
- Acceptance: CLI: pnpm build has no unresolved font messages; Manual: offline works and fonts render

6) CI typecheck gate
- Goal: Ensure type safety in CI before build
- Files: .github/workflows/deploy.yml
- Approach: Add pnpm exec tsc --noEmit step before build
- Acceptance: CLI: gh workflow run (or on push) shows tsc step green; Manual: PRs blocked on TS failures

7) Verify Cloud Function scheduling for expiry
- Goal: Confirm `expireOldMessages` runs on schedule
- Files: functions/src/expireOldMessages.ts; functions/src/index.ts
- Approach: Check exported scheduler; run emulator: firebase emulators:start and observe logs
- Acceptance: CLI: logs show deletions for expired messages; Manual: no runtime errors

8) Smoke E2E for core path
- Goal: Guard Onboarding → Match → Message happy path
- Files: tests/e2e/onboarding.spec.ts; e2e/venue-checkin-flow.test.ts
- Approach: Ensure minimal green-path assertions; stabilize selectors; skip flaky branches
- Acceptance: CLI: pnpm test (or playwright) passes locally; Manual: spec covers the end-to-end path
