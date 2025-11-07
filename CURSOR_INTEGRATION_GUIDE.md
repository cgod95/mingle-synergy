# Cursor Integration Guide - Mingle Functional Specification

## 📋 Document Status

**Status:** ✅ **ACTIVE BLUEPRINT FOR CURSOR AUTONOMOUS BUILD**

**Canonical Branch:** `rescue/bring-back-ui`

**Target:** Production-ready MVP with "golden" UI + unified backend

**Date:** 7 Nov 2025 (AEST)

---

## 🎯 Purpose

This document (`MINGLE_FUNCTIONAL_SPEC.md`) serves as the **complete functional specification** for Cursor's autonomous build of Mingle. Cursor will:

1. **Read this document as context** - Understanding the product vision, features, and technical requirements
2. **Examine current repo** - Review code + commits to understand existing implementation
3. **Merge forward intelligently** - Preserving all backend wiring, UI restoration, and existing logic
4. **Build from current state** - NOT overwrite or rebuild from scratch

---

## ⚠️ Critical Guardrails

### DO NOT:
- ❌ Start a new project root
- ❌ Overwrite existing UI files (`src/components/**`, `src/styles/**`, `src/index.css`, `tailwind.config.*`, `postcss.config.*`, `public/**`)
- ❌ Rebuild from scratch
- ❌ Throw away working progress (Firebase setup, routing, matches logic, etc.)

### DO:
- ✅ Merge backend logic from `main` into `rescue/bring-back-ui`
- ✅ Preserve all UI restoration work
- ✅ Unify and polish existing code
- ✅ Follow the implementation phases outlined in Section 18

---

## 📚 Key Documents Reference

1. **`MINGLE_FUNCTIONAL_SPEC.md`** (this file) - Complete functional specification
2. **`CURSOR_HANDOVER_REPORT.md`** - Technical handover and restoration history
3. **`COMPLETE_IMPROVEMENTS.md`** - Recent UI/UX improvements summary
4. **`UI_RESTORATION_COMPLETE.md`** - UI restoration status

---

## 🏗️ Current State Summary

### What's Working:
- ✅ Golden UI restored from commit `69e01a3`
- ✅ Light gradient color scheme throughout
- ✅ Chat functionality working
- ✅ Loading states and animations
- ✅ Toast notifications
- ✅ Professional UI components

### What Needs Integration:
- ⚠️ Backend logic from `main` branch needs merging
- ⚠️ Match expiry logic needs consolidation
- ⚠️ Message cap enforcement needs implementation
- ⚠️ Onboarding flow needs completion
- ⚠️ Route guards need hardening

---

## 🚀 Implementation Phases

See **Section 18** of `MINGLE_FUNCTIONAL_SPEC.md` for detailed phases:

1. **Phase 0** - Stabilize Base (verify current state)
2. **Phase 1** - Backend Parity Merge (merge logic, preserve UI)
3. **Phase 2** - Hardening (route guards, photo intercept, message caps)
4. **Phase 3** - Reconnect (request/accept flow)
5. **Phase 4** - Safety (block/report, visibility toggle)
6. **Phase 5** - Observability (Sentry, analytics)
7. **Phase 6** - CI/CD (GitHub Actions, Vercel)
8. **Phase 7** - QA Pass (tests, tag v0.9.0-mvp)

---

## 🔑 Key Technical Requirements

### Single Source of Truth:
- **Match Expiry:** `src/lib/matchesCompat.ts` - ALL components must use this
- **Message Limits:** Enforced in service layer + UI
- **Route Guards:** ProtectedRoute & AuthRoute with onboarding resume

### Performance Budgets:
- First paint JS ≤ 1.0 MB (gz)
- TTI ≤ 2s on mid-tier mobile
- Route chunks ≤ 250 KB each

### Accessibility:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Focus indicators
- ARIA labels

---

## 📝 Next Steps for Cursor

1. **Read** `MINGLE_FUNCTIONAL_SPEC.md` completely
2. **Review** current repo state (code + commits)
3. **Identify** what's implemented vs. what's needed
4. **Plan** merge strategy for backend logic
5. **Execute** phases systematically
6. **Test** each phase before moving forward
7. **Document** progress and decisions

---

## 🎨 Golden UI Standards (DO NOT REGRESS)

- Light gradient backgrounds: `bg-gradient-to-br from-indigo-50 via-white to-purple-50`
- Tailwind tokens: `bg-background`, `text-foreground`, `border-border`, etc.
- Framer Motion micro-interactions
- Shadcn UI components
- Consistent spacing and typography

---

## ✅ Acceptance Criteria

See **Section 11** and **Acceptance Criteria** section of `MINGLE_FUNCTIONAL_SPEC.md` for detailed checklists.

**Definition of Done:**
1. Backend parity merge complete
2. Match expiry working (single source of truth)
3. Message limits enforced
4. Routing guards working
5. Notifications stable
6. Performance budgets met
7. Tests green
8. CI/CD working
9. Preview deploy working
10. Documentation updated

---

## 📞 Questions?

Refer to:
- **Section 21** - Glossary
- **Section 19** - Risks & Mitigations
- **Section 20** - Developer Experience

---

**Remember:** Cursor should **merge forward intelligently**, preserving all working progress while building toward the MVP specification. The current repo has valuable work that must be preserved.

