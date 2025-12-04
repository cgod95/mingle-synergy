# Closed Beta Firebase Setup Guide

**Purpose:** Complete guide to enable Firebase backend for closed beta  
**Status:** Ready for Implementation  
**Timeline:** 1-2 hours setup

---

## 🎯 Overview

This guide will help you switch from demo mode to Firebase backend for closed beta testing.

---

## 📋 Prerequisites

- [ ] Firebase project created
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Firestore Database enabled
- [ ] Firebase Storage enabled
- [ ] Firebase project billing enabled (Blaze plan required for external access)

---

## 🔧 Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "mingle-beta")
4. Enable Google Analytics (optional but recommended)
5. Create project

### 1.2 Enable Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Save

### 1.3 Enable Firestore
1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode** (we'll add security rules)
4. Choose location (closest to your users)
5. Enable

### 1.4 Enable Storage
1. Go to **Storage**
2. Click "Get started"
3. Start in **production mode** (we'll add security rules)
4. Use same location as Firestore
5. Enable

### 1.5 Get Firebase Config
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps"
3. Click **Web** icon (`</>`)
4. Register app (name: "Mingle Beta")
5. Copy the config values

---

## 🔐 Step 2: Environment Variables

Create `.env.production` file in project root:

```bash
# ============================================
# FIREBASE CONFIGURATION (Required)
# ============================================
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# MODE CONFIGURATION (Critical for Firebase)
# ============================================
# IMPORTANT: Set to false to enable Firebase backend
VITE_DEMO_MODE=false

# Set environment to production or staging
VITE_ENVIRONMENT=production

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_VERIFICATION=true
VITE_ENABLE_RECONNECT=true
VITE_LIMIT_MESSAGES_PER_USER=3
VITE_ENABLE_ANALYTICS=true

# ============================================
# ERROR TRACKING (Recommended)
# ============================================
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_ENABLE_SENTRY=true
VITE_SENTRY_ENVIRONMENT=beta

# ============================================
# OPTIONAL: Firebase Emulators (for local dev)
# ============================================
# Only set these for local development
# VITE_USE_FIREBASE_EMULATOR=false
# VITE_FIRESTORE_EMULATOR_PORT=8082
```

---

## 🛡️ Step 3: Security Rules

### 3.1 Firestore Security Rules

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create, update: if isOwner(userId);
      allow delete: if false;
    }
    
    // Venues
    match /venues/{venueId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
      allow delete: if false;
    }
    
    // Matches
    match /matches/{matchId} {
      allow read: if isSignedIn() && (
        resource.data.userId == request.auth.uid || 
        resource.data.matchedUserId == request.auth.uid
      );
      allow create: if isSignedIn();
      allow update: if isSignedIn() && (
        resource.data.userId == request.auth.uid || 
        resource.data.matchedUserId == request.auth.uid
      );
      allow delete: if false;
    }
    
    // Interests/Likes
    match /interests/{interestId} {
      allow read: if isSignedIn() && (
        resource.data.fromUserId == request.auth.uid || 
        resource.data.toUserId == request.auth.uid
      );
      allow create: if isSignedIn() && 
        request.resource.data.fromUserId == request.auth.uid;
      allow update, delete: if false;
    }
    
    // Reconnect requests
    match /reconnectRequests/{requestId} {
      allow read: if isSignedIn() && (
        resource.data.fromUserId == request.auth.uid ||
        resource.data.toUserId == request.auth.uid
      );
      allow create: if isSignedIn() && 
        request.resource.data.fromUserId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### 3.2 Storage Security Rules

Update `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile photos
    match /profile-photos/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Verification photos
    match /users/{userId}/verification/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only storage
```

---

## 🗂️ Step 4: Firestore Indexes

Deploy indexes from `firestore.indexes.json`:

```bash
firebase deploy --only firestore:indexes
```

---

## ✅ Step 5: Verify Setup

### 5.1 Build Test
```bash
# Build with production mode
npm run build

# Check build output for errors
# Verify DEMO_MODE is false in build
```

### 5.2 Local Test (Optional)
```bash
# Start Firebase emulators
npm run emulators

# In another terminal, start dev server with emulator config
VITE_USE_FIREBASE_EMULATOR=true npm run dev
```

### 5.3 Production Test
1. Deploy to staging/production
2. Test sign-up flow
3. Test check-in flow
4. Test matching flow
5. Test messaging flow
6. Verify data appears in Firestore console

---

## 🚨 Critical Checks

Before going live, verify:

- [ ] `VITE_DEMO_MODE=false` (or unset) in production env
- [ ] `MODE=production` (not development)
- [ ] All Firebase env vars are set
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Indexes deployed
- [ ] Authentication enabled
- [ ] Billing enabled (Blaze plan)
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured

---

## 🔄 Switching Back to Demo Mode

If you need to switch back to demo mode:

```bash
# In .env.production
VITE_DEMO_MODE=true

# Or unset VITE_DEMO_MODE and set MODE=development
MODE=development
```

---

## 📊 Monitoring

After deployment, monitor:

1. **Firebase Console**
   - Authentication → Users
   - Firestore → Data
   - Storage → Files
   - Usage & Billing

2. **Sentry**
   - Error rates
   - Error types
   - User impact

3. **Analytics**
   - User sign-ups
   - Check-ins
   - Matches
   - Messages

---

## 🆘 Troubleshooting

### Issue: Still using demo mode
**Solution:** Check that `VITE_DEMO_MODE` is not set to `true` and `MODE` is not `development`

### Issue: Firebase not initializing
**Solution:** Verify all Firebase env vars are set correctly

### Issue: Authentication errors
**Solution:** Check Firebase Auth is enabled and rules are correct

### Issue: Permission denied errors
**Solution:** Verify Firestore/Storage rules are deployed correctly

---

## 📝 Next Steps

After Firebase setup:
1. Test all core flows end-to-end
2. Seed initial venue data
3. Test with real users
4. Monitor error rates
5. Collect feedback

---

**Status:** Ready for Firebase Setup  
**Next Action:** Follow steps 1-5 above





