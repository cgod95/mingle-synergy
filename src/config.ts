// 🧠 Purpose: Central config using environment variables with development fallbacks
import type { AppConfig, FeatureFlags } from '@/types/common';

const config: AppConfig = {
  environment: (import.meta.env.VITE_ENVIRONMENT as 'development' | 'staging' | 'production') || 'development',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  websocketUrl: import.meta.env.VITE_WS_URL,
  features: {
    verification: import.meta.env.VITE_ENABLE_VERIFICATION === 'true',
    reconnect: import.meta.env.VITE_ENABLE_RECONNECT === 'true',
    pushNotifications: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    performanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  },
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.MODE === 'development',
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.MODE === 'development',
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
  ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID || '',
  ENVIRONMENT: (import.meta.env.VITE_ENVIRONMENT as 'development' | 'staging' | 'production') || 'development',
};

export default config; 