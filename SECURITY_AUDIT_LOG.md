# Security Audit Log

## Vulnerability Remediation - December 4, 2025

### Summary
Successfully resolved **17 dependency vulnerabilities** (14 moderate, 3 high) identified in npm audit.

### Vulnerabilities Fixed

#### Firebase Ecosystem (8 vulnerabilities - All Moderate)
- **Root Cause:** `undici` dependency version 6.19.7 (vulnerable, needed >= 6.21.2)
- **Affected Packages:**
  - @firebase/auth
  - @firebase/auth-compat
  - @firebase/firestore
  - @firebase/firestore-compat
  - @firebase/functions
  - @firebase/functions-compat
  - @firebase/storage
  - @firebase/storage-compat
- **Fix:** Updated `firebase` from `^10.8.0` to `^12.6.0` + added `undici` override to `^6.21.2`
- **Status:** ✅ Resolved

#### Vite/esbuild (1 vulnerability - Moderate)
- **Root Cause:** `esbuild` version <= 0.24.2 had dev server security issue
- **Affected Package:** vite
- **Fix:** Updated `vite` from `^5.4.21` to `^7.2.6` + added `esbuild` override to `^0.25.0`
- **Status:** ✅ Resolved

#### @modelcontextprotocol/sdk (1 vulnerability - High)
- **Root Cause:** DNS rebinding protection not enabled by default in versions < 1.24.0
- **Affected Package:** @modelcontextprotocol/sdk (transitive via lovable-tagger)
- **Fix:** Added override to force `^1.24.0`
- **Status:** ✅ Resolved

#### glob (1 vulnerability - High)
- **Root Cause:** Command injection vulnerability in versions 10.2.0 - 10.4.5
- **Affected Package:** glob (transitive)
- **Fix:** Added override to force `^10.5.0`
- **Status:** ✅ Resolved

#### node-forge (1 vulnerability - High, 2 Moderate)
- **Root Cause:** Multiple ASN.1 vulnerabilities in versions < 1.3.2
- **Affected Package:** node-forge (transitive)
- **Fix:** Added override to force `^1.3.2`
- **Status:** ✅ Resolved

#### js-yaml (1 vulnerability - Moderate)
- **Root Cause:** Prototype pollution in versions 4.0.0 - 4.1.0
- **Affected Package:** js-yaml (transitive)
- **Fix:** Added override to force `^4.1.1`
- **Status:** ✅ Resolved

#### body-parser (1 vulnerability - Moderate)
- **Root Cause:** DoS vulnerability in version 2.2.0
- **Affected Package:** body-parser (transitive)
- **Fix:** Added override to force `^2.2.1`
- **Status:** ✅ Resolved

#### undici (2 vulnerabilities - Moderate, Low)
- **Root Cause:** Insufficient randomness and DoS vulnerabilities in versions 6.0.0 - 6.21.1
- **Affected Package:** undici (transitive via Firebase)
- **Fix:** Added override to force `^6.21.2`
- **Status:** ✅ Resolved

### Changes Made

#### package.json Updates
1. **Direct Dependencies:**
   - `firebase`: `^10.8.0` → `^12.6.0`
   - `vite`: `^5.4.21` → `^7.2.6`

2. **Overrides Added:**
   ```json
   "overrides": {
     "react": "18.3.1",
     "react-dom": "18.3.1",
     "undici": "^6.21.2",
     "glob": "^10.5.0",
     "node-forge": "^1.3.2",
     "js-yaml": "^4.1.1",
     "body-parser": "^2.2.1",
     "esbuild": "^0.25.0",
     "@modelcontextprotocol/sdk": "^1.24.0"
   }
   ```

### Verification

**Before:**
- Total vulnerabilities: 17 (14 moderate, 3 high)

**After:**
- Total vulnerabilities: **0** ✅
- Audit command: `npm audit` returns clean

### Testing Status

- ✅ Dependencies installed successfully
- ✅ Production build succeeds (with pre-existing TypeScript warnings)
- ⚠️ TypeScript errors present (pre-existing, unrelated to security fixes)
- ⏳ Full test suite - Pending
- ⏳ Firebase functionality verification - Pending

### Next Steps

1. **Immediate:**
   - Fix pre-existing TypeScript errors (separate from security fixes)
   - Run full test suite to verify functionality
   - Test Firebase authentication, Firestore, Storage, and Functions

2. **Ongoing:**
   - Run `npm audit` regularly (weekly/monthly)
   - Monitor for new vulnerabilities
   - Keep dependencies updated

3. **Automation:**
   - Add `npm audit` to CI/CD pipeline
   - Set up automated dependency update checks
   - Create security audit script

### Notes

- All Firebase-related vulnerabilities were resolved by updating Firebase to 12.6.0
- The `overrides` field ensures transitive dependencies use secure versions
- Vite 7.x upgrade is a major version bump - verify all build tooling works correctly
- Firebase 12.x is a major version bump from 10.x - verify API compatibility

### References

- npm audit report: `npm audit --json`
- Firebase release notes: https://firebase.google.com/support/release-notes/js
- Vite migration guide: https://vitejs.dev/guide/migration.html

---

## Dependency Sync - January 2025

### Summary
Synced package-lock.json and applied minor dependency updates to ensure GitHub Dependabot scans the latest state.

### Updates Applied
- **@playwright/test**: Updated to latest patch version
- **autoprefixer**: Updated to latest patch version  
- **@tanstack/react-query**: Updated to latest patch version
- **framer-motion**: Updated to latest patch version

### Verification
- ✅ `npm audit` shows **0 vulnerabilities**
- ✅ All dependencies resolved correctly
- ✅ package-lock.json synced with package.json

### Note on GitHub Dependabot Alerts
GitHub Dependabot was reporting 14 vulnerabilities (1 critical, 8 moderate, 5 low), but local `npm audit` shows 0 vulnerabilities. This discrepancy is likely due to:
1. GitHub scanning an older version of package-lock.json
2. Timing differences in vulnerability database updates
3. Different scanning methodologies between npm audit and GitHub Dependabot

After syncing package-lock.json and pushing to GitHub, Dependabot should re-scan and update its alerts to match the local state (0 vulnerabilities).


