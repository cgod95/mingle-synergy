# Testing Checklist - Beta Preparation

**Purpose:** Comprehensive testing checklist before beta launch  
**Status:** Pre-Beta Testing  
**Last Updated:** January 2025

---

## 🎯 Critical Path Testing (Must Complete)

### 1. Venue Loading & Display ✅/⏳
- [ ] **CheckInPage** - All 8 venues load and display
  - [ ] Check browser console for `[CheckInPage] Loaded venues: 8`
  - [ ] Verify all venue cards render correctly
  - [ ] Test clicking each venue
  - [ ] Verify venue images load
  - [ ] Check for any console errors

- [ ] **VenueDetails** - Each venue details page loads
  - [ ] Test all 8 venue IDs ('1' through '8')
  - [ ] Check console for `[VenueDetails] Loaded venue: [id] [name]`
  - [ ] Verify venue information displays correctly
  - [ ] Test zone selector (no errors)
  - [ ] Verify people at venue display

### 2. Settings Page ✅
- [x] Settings page loads without errors
- [x] All toggles work correctly
- [ ] Test feedback link (Settings → Send Feedback)
- [ ] Test all navigation links
- [ ] Verify preferences save correctly

### 3. Feedback System ✅
- [x] Feedback page loads
- [x] Can submit feedback
- [x] Feedback saves to Firebase/localStorage
- [ ] Test feedback link from Settings
- [ ] Test feedback link from Help page
- [ ] Verify feedback displays in "Previous feedback" section

### 4. Core User Flows
- [ ] **Demo Mode Entry**
  - [ ] Click "Try Demo Mode" on landing page
  - [ ] Verify demo user created
  - [ ] Verify redirect to demo-welcome
  - [ ] Verify data seeding (likes, matches, threads)
  - [ ] Click "Enter Demo Mode"
  - [ ] Verify redirect to check-in page

- [ ] **Check-In Flow**
  - [ ] Select a venue
  - [ ] Verify check-in success
  - [ ] Verify redirect to venue details
  - [ ] Verify people at venue display
  - [ ] Test zone selection

- [ ] **Matching Flow**
  - [ ] Like a person at venue
  - [ ] Verify like saved
  - [ ] Get matched (if they like back)
  - [ ] Verify match appears in Matches page
  - [ ] Verify match expiry timer displays

- [ ] **Messaging Flow**
  - [ ] Open match conversation
  - [ ] Send message (within 3-message limit)
  - [ ] Verify message displays
  - [ ] Test message limit enforcement
  - [ ] Verify reconnect flow

- [ ] **Safety Features**
  - [ ] Test block user
  - [ ] Test report user
  - [ ] Test visibility toggle
  - [ ] Verify confirmation dialogs

---

## 🔍 Error Scenarios Testing

### Network Errors
- [ ] Test with network disconnected
- [ ] Test with slow network
- [ ] Verify error messages display
- [ ] Test retry mechanisms

### Invalid Data
- [ ] Test with invalid venue ID
- [ ] Test with missing user data
- [ ] Test with corrupted localStorage
- [ ] Verify graceful error handling

### Edge Cases
- [ ] Test with no venues available
- [ ] Test with no people at venue
- [ ] Test with expired match
- [ ] Test with multiple simultaneous check-ins

---

## 📱 Device & Browser Testing

### Mobile Devices
- [ ] **iOS Safari**
  - [ ] Test all core flows
  - [ ] Test PWA install ("Add to Home Screen")
  - [ ] Test touch interactions
  - [ ] Test keyboard handling

- [ ] **Android Chrome**
  - [ ] Test all core flows
  - [ ] Test PWA install
  - [ ] Test touch interactions
  - [ ] Test keyboard handling

### Desktop Browsers
- [ ] **Chrome** - Test all flows
- [ ] **Safari** - Test all flows
- [ ] **Firefox** - Test all flows
- [ ] **Edge** - Test all flows

---

## ⚡ Performance Testing

- [ ] **Page Load Times**
  - [ ] Landing page < 2s
  - [ ] Check-in page < 2s
  - [ ] Venue details < 2s
  - [ ] Matches page < 2s

- [ ] **Bundle Size**
  - [ ] Check bundle size (< 1MB first paint)
  - [ ] Verify lazy loading works
  - [ ] Check image optimization

- [ ] **Core Web Vitals**
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

---

## 🔒 Security Testing

- [ ] **Input Validation**
  - [ ] Test XSS attempts
  - [ ] Test SQL injection attempts
  - [ ] Test script injection
  - [ ] Verify sanitization

- [ ] **Authentication**
  - [ ] Test protected routes
  - [ ] Test unauthorized access
  - [ ] Test session expiry
  - [ ] Test logout

- [ ] **Data Privacy**
  - [ ] Verify user data not exposed
  - [ ] Test data deletion
  - [ ] Verify GDPR compliance

---

## 🎨 UI/UX Testing

- [ ] **Responsive Design**
  - [ ] Test mobile layout
  - [ ] Test tablet layout
  - [ ] Test desktop layout
  - [ ] Verify no horizontal scroll

- [ ] **Accessibility**
  - [ ] Test keyboard navigation
  - [ ] Test screen reader compatibility
  - [ ] Verify color contrast
  - [ ] Test focus states

- [ ] **Loading States**
  - [ ] Verify loading indicators
  - [ ] Test skeleton loaders
  - [ ] Verify no flash of unstyled content

- [ ] **Error States**
  - [ ] Verify error messages are clear
  - [ ] Test empty states
  - [ ] Test error recovery

---

## 📊 Analytics & Monitoring

- [ ] **Analytics Events**
  - [ ] Verify page views tracked
  - [ ] Verify user actions tracked
  - [ ] Check Sentry error tracking
  - [ ] Verify demo mode events

- [ ] **Error Tracking**
  - [ ] Test error boundary
  - [ ] Verify errors sent to Sentry
  - [ ] Check error alerts configured

---

## 🧪 Demo Mode Specific Testing

- [ ] **Demo Entry**
  - [ ] Demo mode indicator displays
  - [ ] Free access countdown works
  - [ ] All 8 venues available
  - [ ] 26+ users available
  - [ ] 15+ matches seeded

- [ ] **Demo Features**
  - [ ] Unlimited likes work
  - [ ] Unlimited messages work
  - [ ] Dynamic presence updates
  - [ ] Demo data persists

- [ ] **Free Access Window**
  - [ ] Countdown displays correctly
  - [ ] Expiry handling works
  - [ ] Default 7-day window works

---

## ✅ Testing Results Template

### Test Session: [Date]
**Tester:** [Name]  
**Environment:** [Development/Staging/Production]  
**Browser/Device:** [Details]

**Results:**
- Venue Loading: ✅/❌
- Settings Page: ✅/❌
- Feedback System: ✅/❌
- Core Flows: ✅/❌
- Error Handling: ✅/❌
- Performance: ✅/❌

**Issues Found:**
1. [Issue description]
2. [Issue description]

**Notes:**
[Additional notes]

---

## 🚀 Pre-Beta Sign-Off

- [ ] All critical path tests passed
- [ ] No blocking bugs found
- [ ] Performance acceptable
- [ ] Error handling verified
- [ ] Demo mode fully functional
- [ ] Feedback system working
- [ ] Ready for beta launch

**Sign-off Date:** ___________  
**Sign-off By:** ___________

---

**Status:** Ready for testing  
**Next:** Complete checklist before beta launch




