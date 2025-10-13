// Application configuration
const config = {
  // Firebase configuration
  FIREBASE_CONFIG: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },

  // App settings
  APP_NAME: 'Mingle',
  APP_VERSION: '1.0.0',
  
  // Feature flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  
  // API settings
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.mingle.com',
  
  // Match settings
  MATCH_EXPIRY_HOURS: 3,
  MAX_MESSAGES_PER_MATCH: 3,
  
  // Venue settings
  VENUE_CHECKIN_TIMEOUT_MINUTES: 120,
  
  // Development settings
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

export default config; 