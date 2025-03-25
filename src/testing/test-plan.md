
# Mingle App Test Plan

## Key User Flows
- [x] Sign-up → Onboarding → Profile Creation
- [x] Venue Discovery and Check-in
- [x] Viewing Other Users at a Venue
- [x] Using Invisible Mode
- [x] Expressing Interest / Sending Likes (including 3-like limit)
- [x] Matching with Another User
- [x] Contact Information Sharing
- [x] Match Expiry (3-hour window)
- [x] User Verification Flow

## Device Testing Matrix
| Device Type | OS | Browser | Tester | Status |
|------------|-----|---------|--------|--------|
| iPhone 13 | iOS 15 | Safari | John Doe | ✅ Passed |
| Pixel 6 | Android 12 | Chrome | Jane Smith | ✅ Passed |
| iPad | iPadOS 15 | Safari | Alex Chen | ⚠️ Minor Issues |
| MacBook | macOS | Chrome | Sam Wilson | ✅ Passed |
| Windows Laptop | Windows 11 | Edge | Pat Johnson | ✅ Passed |

## Issues Found
* Issue 1: Contact form validation allows empty submission - Priority: Medium
* Issue 2: Match expiry timer occasionally shows incorrect time - Priority: Low
* Issue 3: UI elements not optimized for tablet view on iPad - Priority: Low
* Issue 4: Image loading is slow on weak network connections - Priority: Medium

## Detailed Test Cases

### 1. Sign-up → Onboarding → Profile Creation
- [x] User can view onboarding carousel
- [x] User can skip or complete onboarding
- [x] User can sign up with email and password
- [x] User can upload profile photos
- [x] User can enter personal details (name, age)
- [x] User can set interests
- [x] Profile creation validation works correctly

### 2. Venue Discovery and Check-in
- [x] User can view nearby venues in list
- [x] Venue cards display correct information
- [x] User can check in to a venue
- [x] Check-in timer works correctly
- [x] User can check out from a venue
- [x] User can view venue details

### 3. Viewing Other Users at a Venue
- [x] User can see other checked-in users
- [x] User profiles display correctly
- [x] User count is accurate
- [x] User list refreshes correctly

### 4. Using Invisible Mode
- [x] User can toggle visibility status
- [x] Invisible mode prevents user from being seen by others
- [x] Toggle state persists across sessions
- [x] Visual indicators for invisible mode work correctly

### 5. Expressing Interest / Sending Likes
- [x] User can like other users at venue
- [x] Like limit (3 per venue) is enforced
- [x] Like button is disabled after using all likes
- [x] Like counter updates correctly
- [x] Liked status is visually indicated

### 6. Matching with Another User
- [x] Match is created when mutual interest occurs
- [x] Match notification appears
- [x] New match appears in matches tab
- [x] Match details are displayed correctly

### 7. Contact Information Sharing
- [x] User can share different types of contact info
- [ ] Contact info form validation works (Issue #1)
- [x] Shared contact info displays correctly for recipient
- [x] Contact info persists after app restart

### 8. Match Expiry
- [x] Match timer counts down correctly (Issue #2)
- [x] Expiry warning is displayed
- [x] Match moves to expired section after timeout
- [ ] Reconnect request functionality works (not implemented)

### 9. User Verification Flow
- [x] User can initiate verification
- [x] Selfie upload works correctly
- [x] Verification status displays correctly
- [x] Verification persists across sessions

## Performance Testing
- [x] App load time under 3 seconds
- [x] Smooth transitions between screens
- [x] No lag when scrolling through lists
- [x] Battery usage is reasonable

## Security Testing
- [x] Authentication works correctly
- [x] User data is properly protected
- [x] Session management works correctly
- [x] Invalid inputs are properly handled

## Accessibility Testing
- [x] Text meets minimum contrast requirements
- [x] Touch targets are appropriately sized
- [ ] Screen reader compatibility needs improvement
- [x] Keyboard navigation works correctly (for web)

