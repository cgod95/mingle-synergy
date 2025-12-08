# Venue & Auth Setup Summary

## 🍺 Adding Scarlet Weasel Venue (Manual - Fastest Method)

Since the script needs real Firebase credentials, **add the venue manually**:

1. **Go to Firebase Console**: https://console.firebase.google.com/project/mingle-a12a2/firestore
2. **Click "Start collection"** (if `venues` doesn't exist)
3. **Collection ID**: `venues`
4. **Add document** with ID: `scarlet-weasel-redfern`
5. **Add fields** (copy from `scripts/add-scarlet-weasel-manual.md`)

**OR** use this JSON structure in Firebase Console:

```json
{
  "id": "scarlet-weasel-redfern",
  "name": "Scarlet Weasel",
  "type": "bar",
  "address": "88 Regent St",
  "city": "Redfern",
  "state": "NSW",
  "postcode": "2016",
  "country": "Australia",
  "latitude": -33.8925,
  "longitude": 151.2044,
  "image": "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop",
  "checkInCount": 0,
  "expiryTime": 120,
  "zones": ["main", "outdoor", "back"],
  "checkedInUsers": [],
  "specials": [
    {"title": "Happy Hour", "description": "5-7pm Daily"},
    {"title": "Live Music", "description": "Fridays & Saturdays"}
  ],
  "description": "A cozy bar in the heart of Redfern"
}
```

---

## ✅ Firebase Sign-In/Sign-Up Verification

### Current Setup Status:

#### ✅ **Auth Service** (`src/services/firebase/authService.ts`)
- ✅ Uses Firebase Auth (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`)
- ✅ Creates user profile in Firestore after sign-up
- ✅ Creates user profile if missing during sign-in
- ✅ Proper error handling with user-friendly messages
- ✅ Checks if email exists before sign-up/sign-in

#### ✅ **Auth Context** (`src/context/AuthContext.tsx`)
- ✅ `signUpUser` function calls `authService.signUp`
- ✅ `signInUser` function calls `authService.signIn`
- ✅ Properly handles Firebase mode vs Demo mode
- ✅ Sets `onboardingComplete` to false after sign-up
- ✅ Firebase auth state listener for non-demo mode

#### ✅ **Firestore Security Rules** (`firestore.rules`)
- ✅ Users can create their own user document: `allow create: if isSelf(uid)`
- ✅ Users can read their own user document: `allow read: if isSelf(uid)`
- ✅ Onboarding collection allows read/write: `allow read, write: if isSelf(userId)`

#### ✅ **Firebase Config** (`src/firebase/config.ts`)
- ✅ Properly initializes Firebase when not in demo mode
- ✅ Uses config from environment variables
- ✅ Exports `auth` and `firestore` for use in services

### 🔍 **Potential Issues to Check:**

1. **Firebase Auth Enabled?**
   - Go to Firebase Console → Authentication → Sign-in method
   - Ensure "Email/Password" is enabled

2. **Firestore Rules Deployed?**
   - Run: `firebase deploy --only firestore:rules`
   - Or deploy via Firebase Console

3. **Environment Variables in Vercel?**
   - Ensure `VITE_DEMO_MODE=false` (or not set)
   - All Firebase config vars are set correctly

4. **User Profile Creation**
   - Sign-up creates user in `/users/{uid}` collection
   - Required fields: `email`, `id`, `createdAt`, `photos`, `isCheckedIn`, `isVisible`, `interests`

### 🧪 **Testing Sign-Up/Sign-In:**

1. **Test Sign-Up:**
   - Go to `/signup`
   - Enter email and password (min 6 chars)
   - Should create Firebase Auth user
   - Should create Firestore user document
   - Should navigate to `/create-profile`

2. **Test Sign-In:**
   - Go to `/signin`
   - Enter same email/password
   - Should authenticate successfully
   - Should navigate to `/checkin`

3. **Check Firebase Console:**
   - Authentication → Users: Should see new user
   - Firestore → users: Should see user document

---

## 📝 Next Steps:

1. ✅ Add venue manually via Firebase Console (2 minutes)
2. ✅ Verify Firebase Auth is enabled (Email/Password)
3. ✅ Deploy Firestore rules: `firebase deploy --only firestore:rules`
4. ✅ Ensure `VITE_DEMO_MODE=false` in Vercel
5. ✅ Redeploy from `main` branch
6. ✅ Test sign-up flow
7. ✅ Test sign-in flow

---

## 🐛 If Sign-Up/Sign-In Fails:

**Common Issues:**
- Firebase Auth not enabled → Enable Email/Password in Firebase Console
- Firestore rules too restrictive → Check rules allow user creation
- Missing environment variables → Check Vercel env vars
- Demo mode still active → Ensure `VITE_DEMO_MODE=false`

**Debug Steps:**
1. Check browser console for errors
2. Check Firebase Console → Authentication → Users
3. Check Firebase Console → Firestore → users collection
4. Verify Firestore rules are deployed













