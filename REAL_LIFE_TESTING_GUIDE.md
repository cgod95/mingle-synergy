# Real Life Testing Guide - Pre-Beta

**Purpose:** Guide for testing the app yourself in real life before closed beta  
**Status:** Ready for Testing  
**Timeline:** Complete before closed beta setup

---

## 🎯 What You're Testing

You're verifying that the **demo mode experience** works smoothly and feels polished before inviting beta testers.

---

## 🚀 Quick Start

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Access Demo Mode
- Open browser to `http://localhost:5173`
- Click **"Try Demo Mode"** on landing page
- Click **"Enter Demo Mode"** on demo welcome page
- You'll be redirected to check-in page

### 3. What You'll See
- **8 venues** with photos
- **26 demo users** across venues
- **15 seeded matches** with conversations
- **Full access** - unlimited likes, messages, matches

---

## ✅ Core Flows to Test

### Flow 1: Venue Discovery & Check-In
**Time:** 5 minutes

1. **Check-In Page**
   - [ ] See 8 venue cards with photos
   - [ ] Each venue shows name and address
   - [ ] Cards are clickable and responsive
   - [ ] No console errors

2. **Select a Venue**
   - [ ] Click any venue card
   - [ ] Venue details page loads
   - [ ] See venue hero image
   - [ ] See "Check In" button

3. **Check In**
   - [ ] Click "Check In" button
   - [ ] See success message
   - [ ] Button changes to "Checked In"
   - [ ] See people at venue appear

**Expected Result:** Smooth check-in flow, venue loads correctly, people appear

---

### Flow 2: Seeing People & Liking
**Time:** 5 minutes

1. **People at Venue**
   - [ ] See list of people at venue
   - [ ] Each person shows photo, name, bio
   - [ ] Activity indicators show (active now, active Xm ago)
   - [ ] Zone information displays

2. **Like Someone**
   - [ ] Click "Like" button on someone
   - [ ] See toast notification
   - [ ] Button changes to "Liked"
   - [ ] If mutual like, see "Matched" notification

**Expected Result:** People display correctly, liking works, matches create

---

### Flow 3: Matches & Conversations
**Time:** 10 minutes

1. **Matches Page**
   - [ ] Navigate to Matches (bottom nav)
   - [ ] See stats cards (Total, Active, Expired)
   - [ ] See filter buttons (All, Active, Expired)
   - [ ] See match cards with:
     - Avatar
     - Name
     - "Met at [venue name]" info
     - Last message preview
     - Time remaining badge

2. **Open a Match**
   - [ ] Click on a match card
   - [ ] Chat room opens
   - [ ] See conversation history
   - [ ] See message input at bottom

3. **Send Messages**
   - [ ] Type a message
   - [ ] See message limit counter (X messages remaining)
   - [ ] Send message
   - [ ] Message appears in chat
   - [ ] Counter decreases
   - [ ] When 1 remaining, see toast notification
   - [ ] When 0 remaining, button disabled, see modal

**Expected Result:** Matches display beautifully, chat works, message limits enforced

---

### Flow 4: Settings & Navigation
**Time:** 5 minutes

1. **Settings Page**
   - [ ] Navigate to Settings
   - [ ] See colorful, organized sections
   - [ ] Test Profile Settings link → goes to `/profile/edit`
   - [ ] Test Privacy Settings link → goes to `/privacy`
   - [ ] Test Verification link → goes to `/verification`
   - [ ] Test Send Feedback link → goes to `/feedback`
   - [ ] Test Location Sharing toggle → requests permission

2. **Profile Pages**
   - [ ] Profile page loads correctly
   - [ ] Profile Edit page works
   - [ ] Privacy page displays correctly
   - [ ] Verification page works

**Expected Result:** All settings links work, pages load correctly

---

### Flow 5: Visual Polish Check
**Time:** 5 minutes

1. **Overall Look**
   - [ ] Colors are vibrant and consistent (indigo/purple/pink gradients)
   - [ ] Typography is clear and readable
   - [ ] Spacing feels good
   - [ ] Animations are smooth

2. **Specific Pages**
   - [ ] Landing page looks polished
   - [ ] Check-in page has venue photos
   - [ ] Matches page feels "sexy" (not empty)
   - [ ] Settings page is uniform and colorful
   - [ ] Chat room is clean and functional

**Expected Result:** App feels polished and professional

---

## 🐛 Things to Watch For

### Critical Issues
- [ ] Any page crashes or errors
- [ ] Venues don't load
- [ ] Matches don't appear
- [ ] Messages don't send
- [ ] Navigation breaks

### Polish Issues
- [ ] Inconsistent colors
- [ ] Broken layouts
- [ ] Missing images
- [ ] Slow loading
- [ ] Confusing UI

### UX Issues
- [ ] Unclear instructions
- [ ] Confusing flows
- [ ] Missing feedback
- [ ] Broken interactions

---

## 📝 Testing Checklist

**Date:** ___________  
**Duration:** ___________  
**Environment:** Local Dev / Staging

### Core Flows
- [ ] Venue Discovery & Check-In: ✅/❌
- [ ] Seeing People & Liking: ✅/❌
- [ ] Matches & Conversations: ✅/❌
- [ ] Settings & Navigation: ✅/❌
- [ ] Visual Polish: ✅/❌

### Issues Found
1. _______________________
2. _______________________
3. _______________________

### Overall Assessment
- **Demo Mode Quality:** ⭐⭐⭐⭐⭐ (1-5)
- **Ready for Beta:** Yes / No / Needs Work
- **Notes:** _______________________

---

## 🎯 Success Criteria

**Ready for Closed Beta If:**
- ✅ All core flows work smoothly
- ✅ No critical bugs
- ✅ UI feels polished and professional
- ✅ Demo mode provides good experience
- ✅ Navigation is intuitive

**Needs Work If:**
- ❌ Critical bugs found
- ❌ Major UX issues
- ❌ Broken flows
- ❌ Poor visual quality

---

## 📋 After Testing

### If All Good:
1. Document any minor issues found
2. Proceed to closed beta setup
3. Use `CLOSED_BETA_SETUP_GUIDE.md` (to be created)

### If Issues Found:
1. Document all issues clearly
2. Prioritize fixes (critical vs nice-to-have)
3. Fix critical issues before beta
4. Nice-to-haves can be post-beta

---

## 💡 Tips

- **Test on mobile** - Open in Safari/Chrome mobile browser
- **Test PWA install** - Try "Add to Home Screen"
- **Test offline** - Turn off WiFi, see what works
- **Test location** - Enable/disable location, see behavior
- **Test edge cases** - What happens with no matches? Expired matches?

---

**Next:** After testing, proceed to closed beta setup



