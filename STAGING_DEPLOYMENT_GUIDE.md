# Staging Deployment Guide - January 2025

**Purpose:** Step-by-step guide for deploying to staging before beta launch  
**Status:** Ready for Deployment  
**Last Updated:** January 2025

---

## 🎯 Overview

This guide covers deploying Mingle to a staging environment (Vercel, Netlify, or Firebase Hosting) for beta testing.

---

## 📋 Prerequisites

- [ ] Git repository pushed to GitHub
- [ ] Account on deployment platform (Vercel/Netlify/Firebase)
- [ ] Firebase project configured
- [ ] Environment variables documented

---

## 🚀 Option 1: Vercel Deployment (Recommended)

### Step 1: Connect Repository
1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub: `cgod95/mingle-synergy`
4. Select branch: `feature/backend-parity-merge`

### Step 2: Configure Build Settings
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Environment Variables
Add all variables from `.env`:

**Required:**
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=mingle-a12a2
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ENVIRONMENT=staging
VITE_ENABLE_SENTRY=true
```

**Demo Mode (Optional):**
```
VITE_DEMO_MODE=true
VITE_FREE_ACCESS_WINDOW_DAYS=7
```

**Feature Flags:**
```
VITE_LIMIT_MESSAGES_PER_USER=true
VITE_MESSAGE_LIMIT_PER_MATCH=3
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment URL works
4. Test all core flows

### Step 5: Configure Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add custom domain: `beta.mingle.app` (or similar)
3. Update DNS records
4. Wait for SSL certificate

---

## 🌐 Option 2: Netlify Deployment

### Step 1: Connect Repository
1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub: `cgod95/mingle-synergy`
4. Select branch: `feature/backend-parity-merge`

### Step 2: Configure Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Base directory:** (leave empty)

### Step 3: Environment Variables
Same as Vercel (see above)

### Step 4: Deploy
1. Click "Deploy site"
2. Wait for build
3. Test deployment

---

## 🔥 Option 3: Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Firebase Hosting
```bash
firebase init hosting
```
- Select existing project: `mingle-a12a2`
- Public directory: `dist`
- Configure as single-page app: Yes
- Set up automatic builds: Yes

### Step 3: Configure `firebase.json`
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### Step 4: Deploy
```bash
npm run build
firebase deploy --only hosting
```

---

## ✅ Post-Deployment Verification

### 1. Basic Checks
- [ ] App loads at staging URL
- [ ] No console errors
- [ ] All routes work
- [ ] Images load correctly

### 2. Core Flows
- [ ] Sign up works
- [ ] Sign in works
- [ ] Demo mode works
- [ ] Check-in works
- [ ] Matching works
- [ ] Messaging works

### 3. Mobile Testing
- [ ] App works on mobile browser
- [ ] PWA install works
- [ ] Touch interactions work
- [ ] Location permission requests work

### 4. Performance
- [ ] Page loads quickly
- [ ] No blocking resources
- [ ] Images load progressively
- [ ] Smooth navigation

---

## 🔧 Troubleshooting

### Build Fails
- Check build logs for errors
- Verify Node version (should be 18+)
- Check environment variables are set
- Verify `package.json` scripts

### Routes Don't Work
- Verify SPA rewrite rules
- Check `index.html` is in dist
- Verify base path configuration

### Environment Variables Not Working
- Check variable names (must start with `VITE_`)
- Verify values are correct
- Rebuild after adding variables

### Firebase Errors
- Verify Firebase config is correct
- Check Firebase project is active
- Verify Firestore rules allow access

---

## 📊 Monitoring Setup

### 1. Sentry
- Verify Sentry DSN is set
- Check errors appear in Sentry dashboard
- Set up alerts (see `SENTRY_ALERTS_SETUP.md`)

### 2. Analytics
- Verify Firebase Analytics is working
- Check events are firing
- Set up custom dashboards

### 3. Performance
- Run Lighthouse audit
- Check Core Web Vitals
- Monitor bundle sizes

---

## 🔄 Continuous Deployment

### GitHub Actions (Already Configured)
- Automatically builds on push
- Runs tests
- Can deploy to staging automatically

### Manual Deployment
- Push to `feature/backend-parity-merge`
- Trigger deployment manually
- Or set up auto-deploy on push

---

## 📝 Pre-Launch Checklist

- [ ] Staging URL works
- [ ] All environment variables set
- [ ] Firebase configured correctly
- [ ] Sentry tracking works
- [ ] Analytics events firing
- [ ] All core flows tested
- [ ] Mobile experience tested
- [ ] Performance verified
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active

---

## 🚀 Next Steps After Deployment

1. **Share Staging URL** with team
2. **Run Final Testing** using `FINAL_TESTING_CHECKLIST.md`
3. **Set Up Monitoring** (Sentry alerts, analytics)
4. **Prepare Beta Invites** (see `BETA_TESTER_QUICK_START.md`)
5. **Launch Beta!**

---

**Status:** Ready for deployment  
**Estimated Time:** 30-60 minutes  
**Platform Recommendation:** Vercel (easiest setup)



