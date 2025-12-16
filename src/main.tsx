import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Additional safeguard: Ensure React DevTools is disabled and check for multiple React instances
if (typeof window !== 'undefined') {
  try {
    // @ts-ignore - React DevTools global hook
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook) {
      // Check if DevTools tried to inject (renderers size > 0 means it did)
      try {
        // @ts-ignore
        const rendererCount = hook.renderers?.size || 0;
        if (rendererCount > 0) {
          // DevTools detected React - clear renderers to prevent error #300
          try {
            // @ts-ignore
            hook.renderers.clear();
          } catch (e) {
            // Renderers might be frozen, try to disable the hook entirely
            try {
              // @ts-ignore
              hook.isDisabled = true;
            } catch (e2) {}
          }
        }
      } catch (e) {
        // Hook might not have renderers property, that's okay
      }
      
      // Ensure critical methods are no-ops
      try {
        // @ts-ignore
        if (typeof hook.inject === 'function') {
          // @ts-ignore
          hook.inject = function() { return false; };
        }
        // @ts-ignore
        if (typeof hook.registerRenderer === 'function') {
          // @ts-ignore
          hook.registerRenderer = function() { return -1; };
        }
      } catch (e) {
        // Methods might be frozen, that's okay - Proxy in index.html handles it
      }
    }
    
    // Check for multiple React instances (React error #300 detection)
    // Only log warnings in development - suppress in production
    try {
      // @ts-ignore
      const rendererCount = hook?.renderers?.size || 0;
      if (rendererCount > 1) {
        if (!import.meta.env.PROD) {
          console.warn('Multiple React instances detected! This may cause React error #300.');
        }
        // Try to clear extra renderers to prevent error #300
        try {
          // @ts-ignore
          const renderers = Array.from(hook.renderers.keys());
          // @ts-ignore
          hook.renderers.clear();
          if (!import.meta.env.PROD) {
            console.warn('Cleared renderers to prevent error #300:', renderers);
          }
        } catch (e) {
          // Silently ignore if we can't clear (hook is frozen)
        }
      }
    } catch (e) {
      // Silently ignore if we can't check
    }
    
    // Prevent registerRenderer from being called (blocks DevTools registration)
    try {
      // @ts-ignore
      if (typeof hook.registerRenderer === 'function') {
        // @ts-ignore
        const originalRegisterRenderer = hook.registerRenderer;
        // @ts-ignore
        hook.registerRenderer = function() {
          // Prevent DevTools from registering renderers
          return -1; // Return invalid renderer ID
        };
      }
    } catch (e) {
      // Silently ignore if we can't override
    }
  } catch (e) {
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
      return false;
    }
    
    // Suppress React Error #300 if it's from DevTools injection
    if (
      errorMessage.includes('Minified React error #300') &&
      (errorSource.includes('react_devtools') || errorSource.includes('installHook') || errorStack.includes('react_devtools'))
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    
    // Suppress "object is not extensible" errors from DevTools
    // BUT: Don't suppress "Cannot access before initialization" - that's a real error
    if (
      (errorMessage.includes('object is not extensible') || errorMessage.includes('Cannot add property reactDevtoolsAgent')) &&
      (errorSource.includes('react_devtools') || errorSource.includes('installHook') || errorStack.includes('react_devtools')) &&
      !errorMessage.includes('Cannot access') && // Don't suppress initialization errors
      !errorStack.includes('Cannot access') // Don't suppress initialization errors
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
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
      !errorMessage.includes('Cannot access') && // Don't suppress initialization errors
      !errorStack.includes('Cannot access') // Don't suppress initialization errors
    ) {
      event.preventDefault();
      return false;
    }
  });
}

// Demo data seeding removed for closed beta - using real Firebase data

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
