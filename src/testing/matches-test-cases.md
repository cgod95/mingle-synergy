
# Matches Feature Test Cases

## Match Creation
- [ ] Match is created when two users express interest in each other
- [ ] Match notification is displayed to both users
- [ ] Match appears in the Matches tab for both users
- [ ] Match details (user photo, name, venue) are correct

## Active Matches View
- [ ] Active matches are displayed in the "Active Matches" section
- [ ] Matches are sorted chronologically (newest first)
- [ ] Timer showing match expiry is accurate
- [ ] User photo and details are displayed correctly

## Contact Sharing
- [ ] User can select contact type (phone, Instagram, Snapchat, custom)
- [ ] Contact form validation works correctly
- [ ] Contact information is successfully shared
- [ ] Shared contact info is displayed to the other user
- [ ] Status updates to show contact has been shared

## Match Expiry
- [ ] Match expires after 3 hours if no contact is shared
- [ ] Expiry warning is displayed when less than 1 hour remains
- [ ] Expired match moves to "Past Matches" section
- [ ] Expired match shows correct status

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
- [ ] User remains visible in match even when they uninstall app
- [ ] Match persists if user logs out and back in
- [ ] Contact info is preserved across sessions
- [ ] Proper error handling when network connection is lost
- [ ] Match created just before venue check-out works correctly
