# Closed Beta Setup Guide

**Purpose:** Step-by-step guide to set up closed beta environment  
**Status:** Ready After Real-Life Testing  
**Timeline:** 1-2 days setup

---

## 🎯 Overview

After you've tested demo mode yourself and confirmed it works, this guide will help you:
1. Deploy to staging/production
2. Set up beta operations
3. Invite beta testers
4. Monitor and iterate

---

## 📋 Prerequisites

**Before Starting:**
- [x] Real-life testing complete
- [x] Demo mode verified working
- [x] Critical bugs fixed
- [ ] Vercel account (or similar deployment platform)
- [ ] Firebase project configured
- [ ] Environment variables ready

---

## 🚀 Phase 1: Deployment Setup (Day 1)

### Step 1: Prepare Environment Variables

Create `.env.production` with:
```bash
# Firebase (Required)
VITE_FIREBASE_API_KEY=your-production-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Demo Mode (For Beta)
VITE_DEMO_MODE=true
VITE_DEMO_FREE_ACCESS_DAYS=30  # 30 days for beta testers

# Feature Flags
VITE_ENABLE_VERIFICATION=true
VITE_ENABLE_RECONNECT=true
VITE_LIMIT_MESSAGES_PER_USER=10

# Environment
VITE_ENVIRONMENT=production
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables
4. Deploy

**Option B: Via CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_FIREBASE_API_KEY
# ... repeat for each variable
```

### Step 3: Verify Deployment

1. **Check Deployment**
   - [ ] Build succeeds
   - [ ] App loads at staging URL
   - [ ] No console errors

2. **Test Demo Mode**
   - [ ] Click "Try Demo Mode"
   - [ ] Demo welcome page loads
   - [ ] Can enter demo mode
   - [ ] Venues load correctly
   - [ ] Matches appear

3. **Test Core Flows**
   - [ ] Check-in works
   - [ ] Matching works
   - [ ] Messaging works
   - [ ] Settings work

**Expected Result:** Staging deployment works identically to local dev

---

## 📊 Phase 2: Beta Operations Setup (Day 1-2)

### Step 1: Feedback Collection Channel

**Option A: Email**
- Set up dedicated email: `beta@mingle.com` (or similar)
- Add to Settings → Send Feedback form
- Monitor daily

**Option B: Discord/Slack**
- Create beta tester channel
- Share invite link with testers
- Monitor for feedback

**Option C: Firebase Feedback Collection**
- Already implemented in `src/pages/Feedback.tsx`
- View feedback in Firebase Console
- Set up daily review process

### Step 2: Sentry Alerts Configuration

1. **Go to Sentry Dashboard**
2. **Set Up Alerts:**
   - [ ] Critical errors (error rate > 1%)
   - [ ] Page load failures
   - [ ] API failures
   - [ ] Match creation failures

3. **Notification Channels:**
   - [ ] Email alerts
   - [ ] Slack/Discord webhooks (optional)

### Step 3: Success Metrics Dashboard

**Create Tracking Sheet:**
- Sign-ups
- Check-ins
- Matches created
- Messages sent
- Active users
- Error rate
- Session duration

**Tools:**
- Firebase Analytics (already configured)
- Google Sheets (manual tracking)
- Custom dashboard (future)

---

## 👥 Phase 3: Beta Tester Invites (Day 2)

### Step 1: Prepare Invite List

**Beta Tester Criteria:**
- [ ] 10-20 testers
- [ ] Mix of demographics
- [ ] Active users (will actually test)
- [ ] Can provide feedback

### Step 2: Send Invites

**Email Template:**
```
Subject: You're Invited to Test Mingle Beta!

Hi [Name],

I'm excited to invite you to test Mingle, the anti-dating app dating app.

What is Mingle?
- Meet people at the same venue, at the same time
- Matches expire after 24 hours (encourages real conversation)
- Limited messages (3 per person) to focus on meeting up

How to Access:
1. Visit [your-staging-url]
2. Click "Try Demo Mode"
3. Start exploring!

What I Need:
- Test the app and provide feedback
- Report any bugs you find
- Share your honest thoughts

Beta Guide: [link to BETA_TESTER_GUIDE.md]

Thank you for helping make Mingle better!

[Your Name]
```

### Step 3: Provide Onboarding

- [ ] Share `BETA_TESTER_GUIDE.md`
- [ ] Share staging URL
- [ ] Explain demo mode access
- [ ] Set expectations (timeline, feedback format)

---

## 📈 Phase 4: Monitoring & Iteration (Ongoing)

### Daily Tasks

1. **Check Sentry**
   - [ ] Review error reports
   - [ ] Fix critical bugs immediately
   - [ ] Log non-critical bugs for later

2. **Review Feedback**
   - [ ] Check feedback channel (email/Discord/Firebase)
   - [ ] Respond to testers
   - [ ] Prioritize feedback

3. **Monitor Analytics**
   - [ ] Check user metrics
   - [ ] Track conversion rates
   - [ ] Identify drop-off points

### Weekly Review

1. **Week 1 Review**
   - [ ] Compile all feedback
   - [ ] Identify top 3 issues
   - [ ] Plan fixes for Week 2

2. **Week 2 Review**
   - [ ] Review metrics vs targets
   - [ ] Identify feature gaps
   - [ ] Plan enhancements

---

## ✅ Beta Launch Checklist

### Pre-Launch (Complete Before Inviting Testers)
- [ ] Staging deployment working
- [ ] Demo mode tested in staging
- [ ] All core flows verified
- [ ] Feedback collection channel set up
- [ ] Sentry alerts configured
- [ ] Beta tester guide ready
- [ ] Invite list prepared

### Launch Day
- [ ] Send beta tester invites
- [ ] Share onboarding guide
- [ ] Monitor Sentry for errors
- [ ] Check analytics
- [ ] Be available for questions

### Week 1
- [ ] Daily monitoring
- [ ] Respond to feedback
- [ ] Fix critical bugs
- [ ] Weekly review meeting

---

## 🎯 Success Metrics

### Technical Metrics
- Error rate < 1%
- Page load time < 2s
- Uptime > 99%

### User Metrics
- Sign-up completion rate > 70%
- Check-in rate > 50%
- Match rate > 30%
- Message send rate > 20%

### Beta-Specific Metrics
- Beta tester engagement > 60%
- Feedback response rate > 40%
- Bug report quality (detailed vs vague)

---

## 🚨 Critical Issues to Watch

1. **Venue Loading Failures**
   - Monitor console logs
   - Check Firebase connection
   - Verify venue data

2. **Match Creation Errors**
   - Track match success rate
   - Check Firebase rules
   - Verify user data

3. **Message Send Failures**
   - Monitor message delivery
   - Check message limits
   - Verify chat functionality

4. **Authentication Problems**
   - Monitor sign-up/sign-in errors
   - Check Firebase Auth
   - Verify demo mode creation

---

## 📝 Post-Beta (Before Public Launch)

### Must Complete
- [ ] Security audit
- [ ] Performance optimization
- [ ] Legal/compliance review
- [ ] Push notifications
- [ ] Photo verification
- [ ] Moderation system

### Should Complete
- [ ] Advanced analytics
- [ ] User education/tutorials
- [ ] Help documentation
- [ ] FAQ section

---

## 🔗 Resources

- **Beta Tester Guide:** `BETA_TESTER_GUIDE.md`
- **Testing Checklist:** `TESTING_CHECKLIST.md`
- **Quick Verification:** `QUICK_VERIFICATION.md`
- **Environment Variables:** `ENV_VARIABLES.md`

---

**Status:** Ready to begin after real-life testing  
**Next:** Complete real-life testing, then follow this guide

