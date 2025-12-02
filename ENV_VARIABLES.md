# Environment Variables Documentation

**Last Updated:** January 2025  
**Purpose:** Complete reference for all environment variables used in Mingle

---

## 🚀 Quick Start

1. Copy `.env.example` to `.env` (if it exists)
2. Set required variables for your environment
3. For demo mode, set `VITE_DEMO_MODE=true`
4. See sections below for detailed descriptions

---

## 📋 Required Variables (Production)

### Firebase Configuration
These are required for production Firebase integration:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🎮 Demo Mode Variables

### Core Demo Mode
```bash
# Enable demo mode (uses mock data, no Firebase required)
VITE_DEMO_MODE=true

# Demo mode is automatically enabled in development mode
# (MODE=development) even if VITE_DEMO_MODE is not set
```

**Important:** When demo mode is enabled:
- Firebase initialization is **completely skipped** - no Firebase credentials needed
- Authentication uses UserContext instead of Firebase Auth
- All services use mock implementations
- No Firebase errors will occur even without Firebase configuration

### Demo Free Access Window
```bash
# Option 1: Set specific expiry date (ISO format)
VITE_DEMO_FREE_ACCESS_UNTIL=2025-02-01T00:00:00Z

# Option 2: Set number of days from now
VITE_DEMO_FREE_ACCESS_DAYS=7

# Default: 7 days if neither is set
```

**Behavior:**
- If `VITE_DEMO_FREE_ACCESS_UNTIL` is set, uses that date
- Else if `VITE_DEMO_FREE_ACCESS_DAYS` is set, calculates from now
- Else defaults to 7 days from first access

---

## 🔧 Feature Flags

### Chat & Messaging
```bash
# Unlock full chat when both users reconnect at same venue (default: ON)
VITE_UNLOCK_FULL_CHAT_ON_COLOCATION=true

# Allow remote reconnect chat (default: OFF)
VITE_ALLOW_REMOTE_RECONNECT_CHAT=false

# Limit messages per user per match (default: 3, unlimited in demo mode)
VITE_LIMIT_MESSAGES_PER_USER=3
```

### UI & Privacy
```bash
# Blur photos until match (default: OFF)
VITE_BLUR_PHOTOS_UNTIL_MATCH=false

# Require photo for check-in (default: OFF for demo)
VITE_STRICT_PHOTO_REQUIRED_FOR_CHECKIN=false
```

### Reconnect Flow
```bash
# Enable reconnect flow (default: ON)
VITE_RECONNECT_FLOW_ENABLED=true
```

### Notifications
```bash
# Enable push notifications (default: OFF)
VITE_PUSH_NOTIFICATIONS_ENABLED=false
```

### Offline Mode
```bash
# Enable offline mode (default: OFF)
VITE_OFFLINE_MODE_ENABLED=false
```

---

## ⚙️ Application Configuration

### Environment
```bash
# Application environment (development | staging | production)
VITE_ENVIRONMENT=development

# Defaults to 'development' if not set
```

### API & WebSocket
```bash
# API URL (default: http://localhost:3000)
VITE_API_URL=http://localhost:3000

# WebSocket URL for real-time features (optional)
VITE_WS_URL=ws://localhost:3001
```

### Feature Toggles
```bash
# Enable verification feature
VITE_ENABLE_VERIFICATION=false

# Enable reconnect feature
VITE_ENABLE_RECONNECT=true

# Enable push notifications
VITE_ENABLE_PUSH_NOTIFICATIONS=false

# Enable analytics
VITE_ENABLE_ANALYTICS=true

# Enable performance monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### Push Notifications
```bash
# VAPID public key for push notifications (optional)
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

### Analytics
```bash
# Analytics ID (optional)
VITE_ANALYTICS_ID=your-analytics-id
```

### Sentry Error Tracking
```bash
# Sentry DSN for error tracking (required for production)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Enable Sentry in development mode (default: false, auto-enabled in production)
VITE_ENABLE_SENTRY=false

# Sentry environment tag (default: uses VITE_ENVIRONMENT or MODE)
VITE_SENTRY_ENVIRONMENT=development
```

---

## 🧪 Development & Testing

### Mock Services
```bash
# Use mock services instead of Firebase (default: false, auto-enabled in dev)
VITE_USE_MOCK=false

# Automatically enabled when MODE=development
```

### Firebase Emulator (Local Development)
```bash
# Auth emulator host
VITE_FIREBASE_AUTH_EMULATOR_HOST=http://localhost:9099

# Firestore emulator host
VITE_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080

# Storage emulator host
VITE_FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

---

## 📝 Example Configurations

### Demo Mode (No Firebase Required)
```bash
VITE_DEMO_MODE=true
VITE_DEMO_FREE_ACCESS_DAYS=7
VITE_ENVIRONMENT=development
```

### Development with Firebase
```bash
VITE_ENVIRONMENT=development
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Production
```bash
VITE_ENVIRONMENT=production
VITE_DEMO_MODE=false
VITE_FIREBASE_API_KEY=your-production-key
VITE_FIREBASE_AUTH_DOMAIN=your-production-domain
VITE_FIREBASE_PROJECT_ID=your-production-project-id
# ... all other Firebase vars
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
```

---

## 🔍 Variable Reference by Category

### Demo Mode
- `VITE_DEMO_MODE` - Enable demo mode
- `VITE_DEMO_FREE_ACCESS_UNTIL` - Expiry date (ISO)
- `VITE_DEMO_FREE_ACCESS_DAYS` - Days until expiry

### Firebase (Required for Production)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### Feature Flags
- `VITE_UNLOCK_FULL_CHAT_ON_COLOCATION`
- `VITE_ALLOW_REMOTE_RECONNECT_CHAT`
- `VITE_LIMIT_MESSAGES_PER_USER`
- `VITE_BLUR_PHOTOS_UNTIL_MATCH`
- `VITE_STRICT_PHOTO_REQUIRED_FOR_CHECKIN`
- `VITE_RECONNECT_FLOW_ENABLED`
- `VITE_PUSH_NOTIFICATIONS_ENABLED`
- `VITE_OFFLINE_MODE_ENABLED`

### Feature Toggles
- `VITE_ENABLE_VERIFICATION`
- `VITE_ENABLE_RECONNECT`
- `VITE_ENABLE_PUSH_NOTIFICATIONS`
- `VITE_ENABLE_ANALYTICS`
- `VITE_ENABLE_PERFORMANCE_MONITORING`

### Configuration
- `VITE_ENVIRONMENT`
- `VITE_API_URL`
- `VITE_WS_URL`
- `VITE_USE_MOCK`
- `VITE_VAPID_PUBLIC_KEY`
- `VITE_ANALYTICS_ID`

---

## 🚨 Important Notes

1. **Demo Mode Defaults:**
   - Automatically enabled when `MODE=development`
   - Unlimited messages, matches, and features
   - **No Firebase required** - Firebase initialization is completely skipped in demo mode
   - Uses UserContext for authentication instead of Firebase Auth
   - All Firebase-related errors are prevented when demo mode is active

2. **Firebase Initialization:**
   - Firebase only initializes when:
     - `VITE_DEMO_MODE` is not `true` AND
     - `MODE` is not `development` AND
     - Valid Firebase credentials (`VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID`) are provided
   - In demo mode, Firebase exports (`auth`, `firestore`, `storage`) will be `null` and components handle this gracefully

3. **Variable Prefix:**
   - All variables must start with `VITE_` to be exposed to the client
   - Variables without `VITE_` prefix are not accessible in the browser

4. **Security:**
   - Never commit `.env` files to git
   - Use `.env.example` as a template
   - Firebase API keys are safe to expose (they're public keys)

5. **Defaults:**
   - Most variables have sensible defaults
   - Demo mode is auto-enabled in development
   - Check `src/config.ts` and `src/lib/flags.ts` for defaults

---

## 📚 Related Files

- `src/config.ts` - Main configuration file
- `src/lib/flags.ts` - Feature flags
- `src/utils/demoFree.ts` - Demo free access window logic
- `README.md` - Quick reference

---

**For Beta Launch:** Set `VITE_DEMO_MODE=true` and `VITE_DEMO_FREE_ACCESS_DAYS=7` for beta testers.




