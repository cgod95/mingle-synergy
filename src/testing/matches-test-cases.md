
# Matches Feature Test Cases

## Match Creation
- [x] Match is created when two users express interest in each other
- [x] Match notification is displayed to both users
- [x] Match appears in the Matches tab for both users
- [x] Match details (user photo, name, venue) are correct

## Active Matches View
- [x] Active matches are displayed in the "Active Matches" section
- [x] Matches are sorted chronologically (newest first)
- [x] Timer showing match expiry is accurate
- [x] User photo and details are displayed correctly

## Contact Sharing
- [x] User can select contact type (phone, Instagram, Snapchat, custom)
- [x] Contact form validation works correctly
- [x] Contact information is successfully shared
- [x] Shared contact info is displayed to the other user
- [x] Status updates to show contact has been shared

## Match Expiry
- [x] Match expires after 24 hours if no contact is shared
- [x] Expiry warning is displayed when less than 1 hour remains
- [x] Expired match moves to "Past Matches" section
- [x] Expired match shows correct status

## Reconnect Flow (if implemented)
- [ ] User can request to reconnect with expired match
- [ ] Reconnect request is properly recorded
- [ ] Match is reactivated if both users request reconnect
- [ ] Reconnected match gets new expiry time

## "We Met" Confirmation (if implemented)
- [ ] User can confirm they met their match in person
- [ ] Confirmation is recorded correctly
- [ ] Other user is notified of the confirmation
- [ ] Match status updates accordingly

## Edge Cases
- [x] User remains visible in match even when they uninstall app
- [x] Match persists if user logs out and back in
- [x] Contact info is preserved across sessions
- [x] Proper error handling when network connection is lost
- [x] Match created just before venue check-out works correctly

