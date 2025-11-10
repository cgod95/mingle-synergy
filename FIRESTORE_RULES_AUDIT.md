# Firestore Security Rules Audit

**Date**: 2025-01-XX  
**Status**: ✅ Complete - Rules updated per spec requirements

## Audit Summary

The Firestore security rules have been audited and updated to match the functional specification requirements (Section 6.3).

## Changes Made

### ✅ Added Rules for Missing Collections

1. **Onboarding Collection** (`/onboarding/{userId}`)
   - Users can read/write their own onboarding progress
   - Required for Firebase-backed onboarding sync

2. **Messages Collection** (`/messages/{messageId}`)
   - Read: Only participants of the match can read messages
   - Create: Only sender who is also a match participant can create
   - Update/Delete: Not allowed (messages are immutable)
   - Validates match exists and user is participant

3. **Reconnect Requests** (`/reconnectRequests/{requestId}`)
   - Authenticated users can read/write
   - Per spec section 4.6

4. **Reports Collection** (`/reports/{reportId}`)
   - Write: Authenticated users can create reports
   - Read: Disabled (admin-only, per spec)
   - Per spec section 7.6

5. **Likes/Interests Collections**
   - Read: Users can read their own likes (where they are sender or receiver)
   - Create: Users can create likes where they are the sender
   - Update/Delete: Not allowed (likes are immutable)

### ✅ Enhanced Existing Rules

1. **Matches Collection**
   - Improved participant validation
   - Added create validation (user must be participant)
   - Delete disabled (matches are soft-deleted)

2. **Users Collection**
   - Already compliant with spec
   - Users can read/write their own profile

3. **Venues Collection**
   - Read: Authenticated users can read
   - Write: Disabled (admin-only, to be implemented)

## Spec Compliance

### ✅ Section 6.3 Requirements Met

- ✅ Users can read/write their own user document
- ✅ Only read matches where request.auth.uid is userId1 or userId2
- ✅ Only read/write messages where user is a participant in the match
- ✅ Message writes validate senderId == auth.uid
- ✅ Match existence validated before message creation

### ⚠️ Message Limit Enforcement

Per spec: "Writes to messages enforce per-user cap with a Cloud Function (or client-side + rules check via counters/aggregation). For MVP, initial enforcement can be client + occasional server prune"

**Current Implementation**: Client-side enforcement via `messageService.ts`  
**Future Enhancement**: Add Cloud Function for server-side validation

## Security Considerations

1. **Match Validation**: Messages require match existence check via `get()` call
2. **Participant Verification**: Both read and write operations verify user is match participant
3. **Immutability**: Messages and likes cannot be updated/deleted (immutable)
4. **Admin Access**: Reports collection read access disabled until admin system implemented

## Testing Recommendations

1. Test match participant validation (userId1 and userId2)
2. Test message creation with invalid matchId
3. Test message creation by non-participant
4. Test onboarding progress access (own vs others)
5. Test report creation and read access

## Next Steps

1. ✅ Rules updated per spec
2. ⚠️ Deploy rules to Firebase project
3. ⚠️ Test rules with Firebase emulator
4. ⚠️ Add Cloud Function for message limit enforcement (future)
5. ⚠️ Implement admin system for reports access (future)

