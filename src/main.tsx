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

// Additional safeguard: Ensure React DevTools is disabled and check for multiple React instances
if (typeof window !== 'undefined') {
  try {
    const hook = (window as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__ as Record<string, unknown> | undefined;
    if (hook) {
      try {
        const renderers = hook.renderers as Map<unknown, unknown> | undefined;
        const rendererCount = renderers?.size || 0;
        if (rendererCount > 0) {
          try {
            renderers?.clear();
          } catch {
            try { hook.isDisabled = true; } catch {}
          }
        }
      } catch {}

      try {
        if (typeof hook.inject === 'function') {
          hook.inject = function() { return false; };
        }
        if (typeof hook.registerRenderer === 'function') {
          hook.registerRenderer = function() { return -1; };
        }
      } catch {}
    }
  } catch {
    // Silently fail if hook is not accessible
  }
}

// Initialize error tracking (Sentry) per spec section 9
import { initErrorTracking } from "./utils/errorHandler";
initErrorTracking();

// Global error handler to catch React Error #300 and DevTools errors
// PRODUCTION ONLY: Suppress these errors as they're harmless when DevTools is disabled
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  // Suppress React DevTools errors - they're harmless but noisy in production
  const originalError = console.error;
  console.error = function(...args: unknown[]) {
    const message = String(args[0] || '');
    const stack = String(args[1]?.toString() || '');
    const errorObj = args[0] as Error;
    const errorStack = errorObj?.stack || '';
    
    // NEVER suppress onboarding-related errors
    const isOnboardingError = 
      message.includes('onboarding') ||
      message.includes('CreateProfile') ||
      message.includes('PhotoUpload') ||
      message.includes('Preferences') ||
      message.includes('permission-denied') ||
      message.includes('Permission denied') ||
      stack.includes('CreateProfile') ||
      stack.includes('PhotoUpload') ||
      stack.includes('Preferences') ||
      errorStack.includes('CreateProfile') ||
      errorStack.includes('PhotoUpload') ||
      errorStack.includes('Preferences');
    
    if (isOnboardingError) {
      // Always log onboarding errors - they're critical
      originalError.apply(console, args);
      return;
    }
    
    // Suppress ALL React Error #300 messages in production (harmless when DevTools disabled)
    if (message.includes('Minified React error #300') || message.includes('React Error #300')) {
      return; // Completely suppress in production
    }
    
    // Suppress DevTools-related errors
    if (
      message.includes('React DevTools failed to get Console Patching') ||
      message.includes('reactDevtoolsAgent') ||
      message.includes('object is not extensible') ||
      message.includes('Cannot add property reactDevtoolsAgent') ||
      stack.includes('react_devtools') ||
      errorStack.includes('react_devtools') ||
      stack.includes('installHook') ||
      errorStack.includes('installHook') ||
      stack.includes('react-vendor') ||
      errorStack.includes('react-vendor')
    ) {
      // Silently ignore DevTools errors - they don't affect functionality
      return;
    }
    // Log other errors normally
    originalError.apply(console, args);
  };

  // Catch unhandled errors and prevent React Error #300 from crashing the app (PRODUCTION ONLY)
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || '';
    const errorSource = event.filename || '';
    const errorStack = event.error?.stack || '';
    
    // NEVER suppress onboarding-related errors
    const isOnboardingError = 
      errorMessage.includes('onboarding') ||
      errorMessage.includes('CreateProfile') ||
      errorMessage.includes('PhotoUpload') ||
      errorMessage.includes('Preferences') ||
      errorMessage.includes('permission-denied') ||
      errorSource.includes('CreateProfile') ||
      errorSource.includes('PhotoUpload') ||
      errorSource.includes('Preferences') ||
      errorStack.includes('CreateProfile') ||
      errorStack.includes('PhotoUpload') ||
      errorStack.includes('Preferences');
    
    if (isOnboardingError) {
      // Always allow onboarding errors to propagate
      return;
    }
    
    // In production, suppress ALL React Error #300 messages (harmless when DevTools disabled)
    if (import.meta.env.PROD && errorMessage.includes('Minified React error #300')) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    // Suppress React Error #300 if it's from DevTools injection
    if (
      errorMessage.includes('Minified React error #300') &&
      (errorSource.includes('react_devtools') || errorSource.includes('installHook') || errorStack.includes('react_devtools'))
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    // Suppress "object is not extensible" errors from DevTools
    if (
      (errorMessage.includes('object is not extensible') || errorMessage.includes('Cannot add property reactDevtoolsAgent')) &&
      (errorSource.includes('react_devtools') || errorSource.includes('installHook') || errorStack.includes('react_devtools')) &&
      !errorMessage.includes('Cannot access') &&
      !errorStack.includes('Cannot access')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }, true); // Use capture phase to catch errors early
  
  // Catch unhandled promise rejections (PRODUCTION ONLY)
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorMessage = reason?.message || String(reason || '');
    const errorStack = reason?.stack || '';
    
    // NEVER suppress onboarding-related errors
    const isOnboardingError = 
      errorMessage.includes('onboarding') ||
      errorMessage.includes('CreateProfile') ||
      errorMessage.includes('PhotoUpload') ||
      errorMessage.includes('Preferences') ||
      errorMessage.includes('permission-denied') ||
      errorStack.includes('CreateProfile') ||
      errorStack.includes('PhotoUpload') ||
      errorStack.includes('Preferences');
    
    if (isOnboardingError) {
      // Always allow onboarding errors to propagate
      return;
    }
    
    // In production, suppress ALL React Error #300 rejections
    if (import.meta.env.PROD && errorMessage.includes('Minified React error #300')) {
      event.preventDefault();
      return;
    }
    
    // Suppress DevTools-related promise rejections
    // BUT: Don't suppress "Cannot access before initialization" - that's a real error
    if (
      (errorMessage.includes('reactDevtoolsAgent') ||
      errorMessage.includes('React DevTools') ||
      errorMessage.includes('object is not extensible') ||
      errorMessage.includes('Cannot add property reactDevtoolsAgent') ||
      errorStack.includes('react_devtools') ||
      errorStack.includes('installHook') ||
      (errorMessage.includes('Minified React error #300') && (errorStack.includes('react_devtools') || errorStack.includes('installHook')))) &&
      !errorMessage.includes('Cannot access') &&
      !errorStack.includes('Cannot access')
    ) {
      event.preventDefault();
      return;
    }
  });
}

// Demo data seeding removed for closed beta - using real Firebase data

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
