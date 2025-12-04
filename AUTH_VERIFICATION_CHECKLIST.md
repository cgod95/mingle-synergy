# Firebase Auth Verification Checklist

## ✅ Code Review - Sign-In/Sign-Up Setup

### **Sign-Up Flow** ✅
1. ✅ `SignUp.tsx` → calls `signUpUser(email, password)` from `AuthContext`
2. ✅ `AuthContext.signUpUser` → calls `authService.signUp(email, password)`
3. ✅ `FirebaseAuthService.signUp` → uses `createUserWithEmailAndPassword(auth, email, password)`
4. ✅ After sign-up → creates user document in Firestore `/users/{uid}`
5. ✅ Navigates to `/create-profile` after successful sign-up
6. ✅ Sets `onboardingComplete: false` in localStorage

### **Sign-In Flow** ✅
1. ✅ `SignIn.tsx` → calls `signInUser(email, password)` from `AuthContext`
2. ✅ `AuthContext.signInUser` → calls `authService.signIn(email, password)`
3. ✅ `FirebaseAuthService.signIn` → uses `signInWithEmailAndPassword(auth, email, password)`
4. ✅ Checks if user profile exists, creates if missing
5. ✅ Navigates to `/checkin` after successful sign-in

### **Firestore Security Rules** ✅
```javascript
match /users/{uid} {
  allow read: if isSelf(uid);        // ✅ Users can read own profile
  allow create: if isSelf(uid);      // ✅ Users can create own profile
  allow update: if isSelf(uid);      // ✅ Users can update own profile
}
```

### **Firebase Config** ✅
- ✅ `authService` always uses Firebase (not mock)
- ✅ `DEMO_MODE` check: Only uses Firebase when `VITE_DEMO_MODE !== 'true'` AND `MODE !== 'development'`
- ✅ In production: Will use Firebase if `VITE_DEMO_MODE` is not set or is `false`

---

## 🔍 Things to Verify in Firebase Console

### 1. **Firebase Authentication**
- [ ] Go to: Firebase Console → Authentication → Sign-in method
- [ ] Ensure **Email/Password** is **Enabled**
- [ ] If not enabled, click "Email/Password" → Enable → Save

### 2. **Firestore Database**
- [ ] Go to: Firebase Console → Firestore Database
- [ ] Ensure database is created (Native mode)
- [ ] Check that rules are deployed (see Rules tab)

### 3. **Firestore Security Rules**
- [ ] Rules should allow user creation: `allow create: if isSelf(uid)`
- [ ] Deploy rules if needed: `firebase deploy --only firestore:rules`

### 4. **Environment Variables (Vercel)**
- [ ] `VITE_DEMO_MODE` should be `false` or not set
- [ ] All Firebase config vars should be set:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

---

## 🧪 Testing Steps

### Test Sign-Up:
1. Go to deployed app → `/signup`
2. Enter email: `test@example.com`
3. Enter password: `test1234` (min 6 chars)
4. Click "Create account"
5. **Expected:**
   - ✅ No errors
   - ✅ Navigates to `/create-profile`
   - ✅ Firebase Console → Authentication → Users: Shows new user
   - ✅ Firebase Console → Firestore → users: Shows user document

### Test Sign-In:
1. Go to deployed app → `/signin`
2. Enter same email/password
3. Click "Sign In"
4. **Expected:**
   - ✅ No errors
   - ✅ Navigates to `/checkin`
   - ✅ User is authenticated

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to sign up" / "Failed to sign in"
**Fix:**
- Check Firebase Auth is enabled (Email/Password)
- Check Firestore rules are deployed
- Check environment variables in Vercel

### Issue: "Permission denied" when creating user
**Fix:**
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Verify rules allow: `allow create: if isSelf(uid)`

### Issue: Still using demo mode
**Fix:**
- Set `VITE_DEMO_MODE=false` in Vercel
- Redeploy

### Issue: User created in Auth but not in Firestore
**Fix:**
- Check `authService.signUp` creates user document (line 100-108)
- Check Firestore rules allow write
- Check browser console for errors

---

## ✅ Summary

**Code is correctly set up for Firebase Auth!** 

The sign-up and sign-in flows are properly implemented:
- ✅ Uses Firebase Authentication
- ✅ Creates user profiles in Firestore
- ✅ Proper error handling
- ✅ Security rules allow user creation

**Just need to verify:**
1. Firebase Auth is enabled (Email/Password)
2. Firestore rules are deployed
3. `VITE_DEMO_MODE=false` in Vercel
4. All Firebase env vars are set in Vercel







