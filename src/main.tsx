import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initCapacitor, isNativePlatform } from "./lib/capacitor";

// CRITICAL: Unregister ALL service workers to prevent stale cache issues
// This ensures users always get fresh content after deployments
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // Immediately unregister all service workers
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success && !import.meta.env.PROD) {
          console.log('[SW] Unregistered service worker:', registration.scope);
        }
      });
    }
  }).catch((error) => {
    // Silently fail - SW unregistration is best-effort
    if (!import.meta.env.PROD) {
      console.warn('[SW] Failed to unregister service workers:', error);
    }
  });

  // Also clear all caches to ensure fresh content
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName).then((success) => {
            if (success && !import.meta.env.PROD) {
              console.log('[Cache] Deleted cache:', cacheName);
            }
          });
        })
      );
    }).catch((error) => {
      // Silently fail - cache clearing is best-effort
      if (!import.meta.env.PROD) {
        console.warn('[Cache] Failed to clear caches:', error);
      }
    });
  }
}

// Initialize Capacitor for native iOS/Android
if (isNativePlatform) {
  initCapacitor();
}

// DevTools hook: only disable in production builds to avoid noise.
// In development, leave DevTools intact so hooks tracking works correctly.
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    const hook = (window as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__ as Record<string, unknown> | undefined;
    if (hook) {
      hook.isDisabled = true;
    }
  } catch {
    // Silently fail if hook is not accessible
  }
}

// Initialize error tracking (Sentry) per spec section 9
import { initErrorTracking } from "./utils/errorHandler";
initErrorTracking();

// Production: only suppress DevTools-specific noise that doesn't affect the app
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  const originalConsoleError = console.error;
  console.error = function(...args: unknown[]) {
    const msg = String(args[0] || '');
    // Only suppress DevTools injection noise - never suppress React rendering errors
    if (
      msg.includes('React DevTools failed to get Console Patching') ||
      msg.includes('Cannot add property reactDevtoolsAgent') ||
      (msg.includes('object is not extensible') && msg.includes('reactDevtools'))
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// Demo data seeding removed for closed beta - using real Firebase data

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
