
# Mingle App Test Plan

## Key User Flows
- [ ] Sign-up → Onboarding → Profile Creation
- [ ] Venue Discovery and Check-in
- [ ] Viewing Other Users at a Venue
- [ ] Using Invisible Mode
- [ ] Expressing Interest / Sending Likes (including 3-like limit)
- [ ] Matching with Another User
- [ ] Contact Information Sharing
- [ ] Match Expiry (3-hour window)
- [ ] User Verification Flow

## Device Testing Matrix
| Device Type | OS | Browser | Tester | Status |
|------------|-----|---------|--------|--------|
| iPhone 13 | iOS 15 | Safari | | |
| Pixel 6 | Android 12 | Chrome | | |
| iPad | iPadOS 15 | Safari | | |
| MacBook | macOS | Chrome | | |
| Windows Laptop | Windows 11 | Edge | | |

## Issues Found
* Issue 1: [Description] - Priority: [High/Medium/Low]

## Detailed Test Cases

### 1. Sign-up → Onboarding → Profile Creation
- [ ] User can view onboarding carousel
- [ ] User can skip or complete onboarding
- [ ] User can sign up with email and password
- [ ] User can upload profile photos
- [ ] User can enter personal details (name, age)
- [ ] User can set interests
- [ ] Profile creation validation works correctly

### 2. Venue Discovery and Check-in
- [ ] User can view nearby venues in list
- [ ] Venue cards display correct information
- [ ] User can check in to a venue
- [ ] Check-in timer works correctly
- [ ] User can check out from a venue
- [ ] User can view venue details

### 3. Viewing Other Users at a Venue
- [ ] User can see other checked-in users
- [ ] User profiles display correctly
- [ ] User count is accurate
- [ ] User list refreshes correctly

### 4. Using Invisible Mode
- [ ] User can toggle visibility status
- [ ] Invisible mode prevents user from being seen by others
- [ ] Toggle state persists across sessions
- [ ] Visual indicators for invisible mode work correctly

### 5. Expressing Interest / Sending Likes
- [ ] User can like other users at venue
- [ ] Like limit (3 per venue) is enforced
- [ ] Like button is disabled after using all likes
- [ ] Like counter updates correctly
- [ ] Liked status is visually indicated

### 6. Matching with Another User
- [ ] Match is created when mutual interest occurs
- [ ] Match notification appears
- [ ] New match appears in matches tab
- [ ] Match details are displayed correctly

### 7. Contact Information Sharing
- [ ] User can share different types of contact info
- [ ] Contact info form validation works
- [ ] Shared contact info displays correctly for recipient
- [ ] Contact info persists after app restart

### 8. Match Expiry
- [ ] Match timer counts down correctly
- [ ] Expiry warning is displayed
- [ ] Match moves to expired section after timeout
- [ ] Reconnect request functionality works (if implemented)

### 9. User Verification Flow
- [ ] User can initiate verification
- [ ] Selfie upload works correctly
- [ ] Verification status displays correctly
- [ ] Verification persists across sessions

## Performance Testing
- [ ] App load time under 3 seconds
- [ ] Smooth transitions between screens
- [ ] No lag when scrolling through lists
- [ ] Battery usage is reasonable

## Security Testing
- [ ] Authentication works correctly
- [ ] User data is properly protected
- [ ] Session management works correctly
- [ ] Invalid inputs are properly handled

## Accessibility Testing
- [ ] Text meets minimum contrast requirements
- [ ] Touch targets are appropriately sized
- [ ] Screen reader compatibility
- [ ] Keyboard navigation works correctly (for web)
