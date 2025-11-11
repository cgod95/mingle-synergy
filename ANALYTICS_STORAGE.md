# Analytics Storage - Where Events Are Stored

## Overview

Analytics events are tracked and stored in multiple locations depending on configuration:

## Primary Storage (Production)

### 1. Plausible Analytics
- **Location:** Plausible.io cloud service
- **Configuration:** Set `VITE_ANALYTICS_PROVIDER=plausible` and `VITE_ANALYTICS_ID=your-domain`
- **Access:** Dashboard at https://plausible.io
- **Data:** Anonymized, privacy-focused analytics
- **Events:** Custom events tracked via `analytics.track(eventName, properties)`

### 2. PostHog Analytics
- **Location:** PostHog cloud service
- **Configuration:** Set `VITE_ANALYTICS_PROVIDER=posthog` and `VITE_ANALYTICS_ID=your-api-key`
- **Access:** Dashboard at https://app.posthog.com
- **Data:** User behavior, events, funnels
- **Events:** Custom events tracked via `analytics.track(eventName, properties)`

## Secondary Storage (Fallback/Debug)

### 3. LocalStorage (Browser)
- **Location:** Browser's localStorage
- **Key:** `mingle_analytics_events` (in `analytics.ts`)
- **Purpose:** Fallback storage, debugging, offline queue
- **Max Events:** 1000 events kept in memory
- **Note:** Cleared when browser data is cleared

### 4. Firebase Analytics (If Configured)
- **Location:** Firebase Analytics dashboard
- **Configuration:** Set via Firebase config
- **Access:** Firebase Console → Analytics
- **Events:** Automatic page views + custom events

## Onboarding Analytics Events

The following onboarding events are tracked:

1. **`onboarding_started`** - When user begins onboarding
   - Properties: `step`, `timestamp`
   - Stored in: Plausible/PostHog + localStorage

2. **`onboarding_step_completed`** - When user completes a step
   - Properties: `step` (profile/photo/preferences), `step_number`, `time_spent`
   - Stored in: Plausible/PostHog + localStorage

3. **`onboarding_completed`** - When user finishes onboarding
   - Properties: `total_time`, `steps_completed`, `skipped_steps`
   - Stored in: Plausible/PostHog + localStorage

4. **`onboarding_abandoned`** - When user leaves mid-onboarding
   - Properties: `last_step`, `time_spent`, `reason`
   - Stored in: Plausible/PostHog + localStorage

5. **`onboarding_resumed`** - When user returns to onboarding
   - Properties: `last_completed_step`, `time_since_start`
   - Stored in: Plausible/PostHog + localStorage

## Accessing Analytics Data

### Plausible
1. Go to https://plausible.io
2. Login with your account
3. Select your domain
4. View events in "Custom Events" section

### PostHog
1. Go to https://app.posthog.com
2. Login with your account
3. Navigate to "Events" or "Insights"
4. Filter by event name (e.g., `onboarding_started`)

### LocalStorage (Debug)
```javascript
// In browser console:
const events = JSON.parse(localStorage.getItem('mingle_analytics_events') || '[]');
console.log(events);
```

## Privacy & Compliance

- **Anonymized:** User IDs are hashed/anonymized
- **GDPR Compliant:** Plausible is GDPR compliant
- **No PII:** No personally identifiable information stored
- **Opt-out:** Users can disable via browser settings

## Configuration

Set these environment variables:

```bash
# For Plausible
VITE_ANALYTICS_PROVIDER=plausible
VITE_ANALYTICS_ID=your-domain.com

# OR for PostHog
VITE_ANALYTICS_PROVIDER=posthog
VITE_ANALYTICS_ID=your-posthog-api-key
```

## Current Status

- ✅ Analytics service configured (`src/services/appAnalytics.ts`)
- ✅ Spec analytics events (`src/services/specAnalytics.ts`)
- ✅ Onboarding events tracking (to be implemented)
- ⏳ Dashboard access: Configure your provider credentials

