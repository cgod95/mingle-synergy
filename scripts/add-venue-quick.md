# Quick Guide: Add Scarlet Weasel Venue

## ✅ YES - Redeploy from main!

Your latest changes (React fixes, image fixes) are already on `main` and pushed to GitHub. Vercel should auto-deploy, but you can trigger a manual redeploy from the Vercel dashboard.

## 🎯 Easiest Way: Firebase Console (2 minutes)

Since automated scripts require authentication setup, the **fastest way** is to add the venue manually:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**
3. **Navigate to**: Firestore Database → Data
4. **Create collection** (if doesn't exist): `venues`
5. **Add document** with ID: `scarlet-weasel-redfern`

### Copy-paste this JSON:

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
  "description": "A cozy bar in the heart of Redfern",
  "createdAt": "2025-12-02T00:00:00Z",
  "updatedAt": "2025-12-02T00:00:00Z"
}
```

6. **Save** - Done! ✅

## 🔄 After Adding Venue

1. **Verify in Firebase Console** - You should see the venue document
2. **Check Vercel**: Ensure `VITE_DEMO_MODE=false` in environment variables
3. **Redeploy from main** (if not auto-deployed)
4. **Test**: Sign up → Check In → Should see only "Scarlet Weasel"

## 📝 Summary

- ✅ Code fixes are on `main` and pushed
- ✅ Redeploy from `main` branch
- ⏳ Add venue manually via Firebase Console (2 min)
- ✅ Test check-in flow

The manual method is actually faster than setting up scripts! 🚀


