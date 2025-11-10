# Sentry Alerts Setup Guide - January 2025

**Purpose:** Configure Sentry alerts for critical errors during beta testing  
**Status:** Setup Required  
**Last Updated:** January 2025

---

## 🎯 Overview

Sentry is already configured in the codebase (`src/utils/errorHandler.ts`). This guide covers setting up alerts in the Sentry dashboard to notify you of critical errors during beta testing.

---

## 📋 Prerequisites

1. **Sentry Account:** Sign up at https://sentry.io (free tier available)
2. **Project Created:** Create a project for "Mingle" (React)
3. **DSN Configured:** Add `VITE_SENTRY_DSN` to your `.env` file

---

## 🔧 Step 1: Configure Sentry DSN

### Add to `.env` file:
```bash
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_ENABLE_SENTRY=true  # Enable in development for testing
VITE_ENVIRONMENT=production  # or staging, development
```

### Verify Configuration:
- Check `src/utils/errorHandler.ts` - `initErrorTracking()` is called
- Check `src/main.tsx` - Should call `initErrorTracking()` on app start

---

## 🚨 Step 2: Set Up Critical Alerts

### Alert 1: Critical Error Rate
**Purpose:** Alert when error rate exceeds threshold

**Setup:**
1. Go to Sentry Dashboard → Alerts → Create Alert
2. **Alert Name:** "Critical Error Rate"
3. **Conditions:**
   - When: "The number of events in a project is greater than X"
   - X: 10 (adjust based on beta size)
   - Time Window: 1 hour
4. **Actions:**
   - Send email notification
   - (Optional) Send to Slack/Discord webhook

**Threshold:** 10+ errors per hour = critical

---

### Alert 2: Page Load Failures
**Purpose:** Alert when page loads fail

**Setup:**
1. **Alert Name:** "Page Load Failures"
2. **Conditions:**
   - When: "An issue is seen more than X times"
   - X: 5
   - Time Window: 15 minutes
   - Filter: `transaction:page_load`
3. **Actions:**
   - Send email notification

**Threshold:** 5+ page load failures in 15 minutes

---

### Alert 3: API Failures
**Purpose:** Alert when API calls fail

**Setup:**
1. **Alert Name:** "API Failures"
2. **Conditions:**
   - When: "An issue is seen more than X times"
   - X: 10
   - Time Window: 1 hour
   - Filter: `transaction:/api/*` or `transaction:firebase/*`
3. **Actions:**
   - Send email notification

**Threshold:** 10+ API failures per hour

---

### Alert 4: Match Creation Failures
**Purpose:** Alert when match creation fails (critical feature)

**Setup:**
1. **Alert Name:** "Match Creation Failures"
2. **Conditions:**
   - When: "An issue is seen more than X times"
   - X: 3
   - Time Window: 1 hour
   - Filter: `message:match_creation` or `context:match-creation`
3. **Actions:**
   - Send email notification
   - Send to Slack/Discord (high priority)

**Threshold:** 3+ match creation failures per hour

---

### Alert 5: Authentication Failures
**Purpose:** Alert when sign-up/sign-in fails

**Setup:**
1. **Alert Name:** "Authentication Failures"
2. **Conditions:**
   - When: "An issue is seen more than X times"
   - X: 5
   - Time Window: 1 hour
   - Filter: `message:auth/*` or `context:authentication`
3. **Actions:**
   - Send email notification

**Threshold:** 5+ auth failures per hour

---

## 📊 Step 3: Set Up Performance Monitoring

### Alert 6: Slow Page Loads
**Purpose:** Alert when page loads are slow

**Setup:**
1. **Alert Name:** "Slow Page Loads"
2. **Conditions:**
   - When: "The p95 of a transaction is greater than X"
   - X: 3000ms (3 seconds)
   - Time Window: 1 hour
   - Filter: `transaction:page_load`
3. **Actions:**
   - Send email notification

**Threshold:** p95 > 3 seconds

---

## 🔔 Step 4: Notification Channels

### Email Notifications
1. Go to Sentry → Settings → Notifications
2. Add your email address
3. Configure notification preferences:
   - Critical alerts: Immediate
   - Warning alerts: Daily digest

### Slack Integration (Optional)
1. Go to Sentry → Settings → Integrations
2. Add Slack integration
3. Configure webhook URL
4. Set up channel: `#mingle-beta-alerts`

### Discord Integration (Optional)
1. Go to Sentry → Settings → Integrations
2. Add Discord integration
3. Configure webhook URL
4. Set up channel: `#beta-alerts`

---

## 📈 Step 5: Dashboard Setup

### Create Beta Monitoring Dashboard

**Widgets to Add:**
1. **Error Rate (Last 24h)** - Line chart
2. **Top Errors** - Table (top 10)
3. **Page Load Performance** - Histogram
4. **API Success Rate** - Percentage
5. **Active Users** - Number (from Firebase Analytics)

**Access:** Sentry Dashboard → Dashboards → Create Dashboard

---

## ✅ Verification Checklist

- [ ] Sentry DSN configured in `.env`
- [ ] `initErrorTracking()` called in `main.tsx`
- [ ] Critical Error Rate alert created
- [ ] Page Load Failures alert created
- [ ] API Failures alert created
- [ ] Match Creation Failures alert created
- [ ] Authentication Failures alert created
- [ ] Email notifications configured
- [ ] (Optional) Slack/Discord integration configured
- [ ] Dashboard created with key metrics
- [ ] Test alert by triggering an error

---

## 🧪 Testing Alerts

### Test Error Tracking:
1. Add a test error button in dev:
```typescript
<button onClick={() => {
  throw new Error('Test error for Sentry');
}}>Test Sentry</button>
```

2. Trigger the error
3. Check Sentry dashboard - error should appear
4. Verify alert triggers (if configured)

### Test Alert Notifications:
1. Lower alert thresholds temporarily
2. Trigger multiple errors
3. Verify email/Slack notification received
4. Restore original thresholds

---

## 📝 Monitoring During Beta

### Daily Checks:
- [ ] Review Sentry dashboard for new errors
- [ ] Check error rate trends
- [ ] Review top errors
- [ ] Check performance metrics

### Weekly Reviews:
- [ ] Analyze error patterns
- [ ] Identify recurring issues
- [ ] Plan fixes for top errors
- [ ] Review alert effectiveness

---

## 🚨 Critical Error Response

### When Alert Triggers:
1. **Immediate:** Check Sentry dashboard
2. **Assess:** Determine severity and impact
3. **Fix:** Address critical errors immediately
4. **Communicate:** Notify beta testers if needed
5. **Monitor:** Watch for resolution

### Severity Levels:
- **Critical:** App unusable, fix immediately
- **High:** Major feature broken, fix within 24h
- **Medium:** Minor feature broken, fix within 1 week
- **Low:** Cosmetic issue, fix when possible

---

## 📚 Resources

- **Sentry Docs:** https://docs.sentry.io/
- **Alert Configuration:** https://docs.sentry.io/product/alerts/
- **Performance Monitoring:** https://docs.sentry.io/product/performance/

---

## ✅ Next Steps

1. Set up Sentry account (if not done)
2. Configure DSN in `.env`
3. Create alerts (start with Critical Error Rate)
4. Test error tracking
5. Set up dashboard
6. Monitor during beta

---

**Status:** Ready for setup  
**Time Required:** 1-2 hours  
**Priority:** High (critical for beta monitoring)

