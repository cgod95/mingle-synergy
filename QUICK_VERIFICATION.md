# Quick Verification Guide - Beta Prep

**Purpose:** Quick checks to verify critical functionality before beta  
**Time:** 15-30 minutes

---

## 🚀 Quick Start (5 minutes)

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Open Browser Console
- Press F12 or Cmd+Option+I
- Go to Console tab
- Look for any red errors

### 3. Check Demo Mode
- Navigate to landing page
- Click "Try Demo Mode"
- Verify demo-welcome page loads
- Click "Enter Demo Mode"
- Verify redirect to check-in page

---

## ✅ Critical Checks (10 minutes)

### Venue Loading
1. **Check Console Logs:**
   - Look for: `[CheckInPage] Loaded venues: 8`
   - Should see: `[api] Loaded venues from venueService: 8`
   - No red errors

2. **Visual Check:**
   - Should see 8 venue cards
   - Each card shows venue name and image
   - Cards are clickable

3. **Test Each Venue:**
   - Click venue 1 → Should load venue details
   - Check console: `[VenueDetails] Loaded venue: 1 [venue name]`
   - Repeat for venues 2-8

### Settings Page
1. Navigate to Settings (`/settings`)
2. Verify page loads without errors
3. Test feedback link (Settings → Send Feedback)
4. Verify feedback page loads

### Feedback System
1. Go to Settings → Send Feedback
2. Enter test feedback
3. Click Submit
4. Verify success message
5. Check "Previous feedback" section shows your feedback

---

## 🔍 Quick Error Check (5 minutes)

### Console Errors
- [ ] No red errors in console
- [ ] No warnings about missing modules
- [ ] No React errors

### Network Tab
- [ ] All requests return 200 OK
- [ ] No failed API calls
- [ ] Images load correctly

### Application Tab
- [ ] localStorage has demo data
- [ ] No corrupted data

---

## 📱 PWA Quick Check (5 minutes)

### Mobile Device
1. Open app in Safari (iOS) or Chrome (Android)
2. Look for "Add to Home Screen" prompt
3. Or use browser menu → "Add to Home Screen"
4. Verify app icon appears on home screen
5. Open from home screen
6. Verify app loads correctly

### Desktop
1. Open in Chrome
2. Check for install prompt (usually in address bar)
3. Or use menu → "Install Mingle"
4. Verify app opens in standalone window

---

## ✅ Success Criteria

**All Good If:**
- ✅ 8 venues load and display
- ✅ Settings page works
- ✅ Feedback system works
- ✅ No console errors
- ✅ PWA install works (mobile)

**Needs Attention If:**
- ❌ Venues don't load (check console logs)
- ❌ Settings page has errors
- ❌ Feedback doesn't save
- ❌ Console shows errors

---

## 🐛 If Issues Found

### Venue Loading Issues
1. Check console for `[api]` logs
2. Verify venue IDs match ('1' through '8')
3. Check `src/services/firebase/venueService.ts` mockVenues array
4. See `BUG_FIXES_PLAN.md` for detailed debugging

### Settings Issues
1. Check console for React errors
2. Verify `isVisible` state exists
3. Check for missing imports

### Feedback Issues
1. Check console for Firebase errors
2. Verify `feedbackRepo` import works
3. Check localStorage fallback

---

## 📝 Quick Test Results

**Date:** ___________  
**Tester:** ___________  
**Environment:** ___________  

**Results:**
- Venue Loading: ✅/❌
- Settings Page: ✅/❌
- Feedback System: ✅/❌
- PWA Install: ✅/❌
- Console Errors: ✅/❌

**Issues Found:**
1. _______________________
2. _______________________

---

**Next:** If all checks pass, proceed to full testing checklist (`TESTING_CHECKLIST.md`)



