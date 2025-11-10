# Phase 1: Backend Parity Merge - Progress Report

## ✅ Completed

### Phase 0: Stabilize Base
- ✅ Consolidated match expiry logic to `matchesCompat.ts` as single source of truth
- ✅ Created `flags.ts` for feature flag management per spec
- ✅ Updated `matchService.ts` to use `MATCH_EXPIRY_MS` constant
- ✅ Updated `useRealtimeMatches.ts` to use consolidated expiry logic

### Phase 1: Backend Parity Merge (In Progress)

#### Match Expiry Consolidation
- ✅ All expiry logic now uses `matchesCompat.ts`
- ✅ `MATCH_EXPIRY_MS` constant exported and used throughout
- ✅ `matchService.ts` updated to use single source of truth

#### Message Limit Enforcement
- ✅ Updated `messageService.ts` to use `LIMIT_MESSAGES_PER_USER` feature flag
- ✅ `sendMessageWithLimit` now uses configurable limit
- ✅ `canSendMessage` uses feature flag
- ✅ `getRemainingMessages` uses feature flag
- ✅ `subscribeToMessageLimit` uses feature flag

## 🔄 In Progress

### Backend Logic Merge
- Reviewing differences between `main` and current branch
- Identifying services that need integration
- Preserving UI files while merging backend logic

## 📋 Next Steps

1. Complete backend service integration from `main`
2. Ensure all services use feature flags
3. Verify UI components remain untouched
4. Test message limit enforcement
5. Test match expiry logic

## 🎯 Key Principles

- ✅ Single source of truth for match expiry (`matchesCompat.ts`)
- ✅ Feature flags for all configurable limits
- ✅ UI files preserved (no changes to `src/components/**`, `src/styles/**`, etc.)
- ✅ Backend logic merged intelligently



