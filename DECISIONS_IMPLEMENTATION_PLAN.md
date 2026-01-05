# Decisions & Implementation Plan - January 2025

## ✅ Decisions Made

### 1. Location Permission Handling
- ✅ Users CAN browse venues without location
- ✅ Users CAN see venue details without location
- ❌ Users CANNOT see people at venues without location
- ❌ Users CANNOT check in without location (must be within 500m)
- **Action:** Implement graceful degradation with clear explanations

### 2. Push Notifications
- ✅ Toast notifications are enough for beta
- ✅ Events: New match, new message, match expiring
- ✅ No push notifications needed for beta
- **Action:** Verify in-app toasts work, ensure service worker works for PWA

### 3. Photo Verification
- ✅ Take photo when onboarded (required)
- ❌ No verification needed for beta
- ❌ Not necessary for beta
- **Action:** Keep photo requirement for check-in, remove verification requirement

### 4. Reconnect Flow (Non-Co-Located)
- ✅ Keep disabled for beta (per recommendation)
- **Action:** Ensure feature flag is off

### 5. Offline Support
- ✅ Basic offline support is enough
- **Action:** Verify service worker works, test offline viewing

### 6. Venue Zones
- ✅ All good, please test
- **Action:** Test zone selector functionality

### 7. Match Expiry Behavior
- ✅ Match expires after 24 hours
- ✅ Can send like again (must reactivate when user re-checks in to venue)
- ✅ Can read old messages
- ✅ Expired matches shown in matches list (faded out)
- **Action:** Implement expired match UI (faded), ensure old messages readable

### 8. Message Limits
- ✅ 10 messages per match (per user)
- ✅ Show message when limit reached
- ✅ Disable send button when limit reached
- ✅ Show upgrade prompt when limit reached
- ✅ Both matches stay matched for 24 hours after matching
- ✅ Automatic full chat unlock when both check in at same venue
- ✅ Manual reconnect available
- ✅ Unlimited messages for premium (but still expires)
- ✅ After 1 rematch, cannot rematch again
- **Action:** Implement all message limit UX, 24-hour match extension, rematch limit

### 9. Moderation
- ✅ Manual review via email/Slack
- **Action:** Set up feedback channel

### 10. Beta Success Criteria
- ✅ 20 beta testers
- ✅ 1 day/event (to be decided)
- **Action:** Define exact metrics

### 11. Network Effects
- ✅ Seed with demo users
- ✅ Both invite friends and marketing
- ❌ Not when actually testing
- **Action:** Strategy to be decided

---

## 🎯 Implementation Priority

### Critical (Before Beta)
1. **Location Permission Graceful Degradation** - HIGH PRIORITY
2. **Match Expiry UI** - Show faded expired matches
3. **Message Limit UX** - Show messages, disable button, upgrade prompt
4. **24-Hour Match Extension** - Keep matches active for 24h after matching
5. **Rematch Limit** - Only 1 rematch allowed

### Important (Before Beta)
6. **Venue Zones Testing** - Verify functionality
7. **Toast Notifications** - Verify all events fire
8. **Service Worker Verification** - For PWA install

### Nice-to-Have (Post-Beta)
9. Push notifications
10. Selfie verification
11. Full offline support

---

## 📋 Implementation Checklist

- [ ] Location permission graceful degradation
- [ ] Match expiry UI (faded matches)
- [ ] Message limit UX (messages, disabled button, upgrade prompt)
- [ ] 24-hour match extension logic
- [ ] Rematch limit (max 1 rematch)
- [ ] Venue zones testing
- [ ] Toast notifications verification
- [ ] Service worker verification
- [ ] Beta operations setup

---

**Status:** Ready to implement  
**Next:** Start with location permission graceful degradation




