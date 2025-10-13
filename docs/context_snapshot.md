Stack: React + Vite + Firebase
Flows: Onboarding → Profile → Check-In → Likes/Matches → Messaging
Rules: 3h match expiry; 3 msgs/user/match; chat only within 3h
Routing/Guards: src/App.tsx + src/components/ProtectedRoute.tsx (Auth), src/context/AuthContext.tsx
Status:
- Lint clean of no-explicit-any; ~31 warnings remain
- Typecheck passes; build succeeds (vite)
- PWA/service worker present; unresolved font paths at build logs
- Cloud Function `functions/src/expireOldMessages.ts` exists
- E2E specs present (onboarding/check-in); CI workflow in repo
Next:
- Reduce lint warnings (Fast Refresh, exhaustive-deps)
- Fix font/PWA asset resolution
- Add CI typecheck gate; watch bundle size
