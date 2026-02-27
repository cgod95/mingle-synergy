# Firestore Indexes

This document describes the Firestore composite indexes required by Mingle Synergy and how to deploy and verify them.

## Required Indexes

All indexes are defined in [`firestore.indexes.json`](../firestore.indexes.json) at the project root.

### Users Collection

| Fields | Order | Used By |
|--------|-------|---------|
| `isCheckedIn`, `currentVenue` | ASC, ASC | Venue check-in queries |
| `currentVenue`, `isVisible` | ASC, ASC | People at venue (`usePeopleAtVenue`) |

### Matches Collection

| Fields | Order | Used By |
|--------|-------|---------|
| `userId1`, `timestamp` | ASC, DESC | User's matches (userId1) |
| `userId2`, `timestamp` | ASC, DESC | User's matches (userId2) |
| `userId1`, `userId2` | ASC, ASC | Match lookup |

### Messages Collection

| Fields | Order | Used By |
|--------|-------|---------|
| `matchId`, `createdAt` | ASC, ASC | Chat messages (`subscribeToMessages`, `loadOlderMessages`) |
| `matchId`, `createdAt` | ASC, DESC | Chat preview last message |
| `matchId`, `senderId` | ASC, ASC | Message limit check |
| `senderId`, `recipientId`, `timestamp` | ASC, ASC, DESC | Unread counts (if used) |
| `recipientId`, `timestamp` | ASC, DESC | Unread counts (if used) |

### Intro Messages Collection

| Fields | Order | Used By |
|--------|-------|---------|
| `toUserId` | ASC | Intro messages per user |

## Deploying Indexes

1. Ensure you have the Firebase CLI installed and are logged in:
   ```bash
   firebase login
   ```

2. Deploy only Firestore indexes (does not affect rules or data):
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. Wait for indexes to build. New indexes typically take **several minutes to a few hours** depending on collection size. Firebase will show status in the console.

## Verifying Index Status

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Indexes**
4. Check each index status:
   - **Enabled** – Ready to use
   - **Building** – Wait; queries may fail until complete
   - **Error** – Fix the error and redeploy

## Behavior When Index Is Building

- Queries that require the index will fail with a `failed-precondition` error
- The error message typically includes "The query requires an index" and a link to create it
- The app now surfaces this error to users with a "Messages couldn't load. Tap Retry" banner
- Automatic retry with backoff (2s, 4s, 6s) is built into `subscribeToMessages`
- Once the index is **Enabled**, retries or manual "Retry" will succeed

## Pre-Deploy Verification

Run the verification script before deploying to production:

```bash
node scripts/verify-firestore-indexes.js
```

This script checks that `firestore.indexes.json` exists and contains the expected index definitions. It does not verify that indexes are deployed to Firebase (that requires network access and credentials).
