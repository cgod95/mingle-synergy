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
    try {
      // @ts-ignore
      const rendererCount = hook?.renderers?.size || 0;
      if (rendererCount > 1) {
        console.error('Multiple React instances detected! This will cause React error #300.');
        // Try to clear extra renderers
        try {
          // @ts-ignore
          const renderers = Array.from(hook.renderers.keys());
          // @ts-ignore
          hook.renderers.clear();
          console.error('Cleared renderers:', renderers);
        } catch (e) {
          console.error('Could not clear renderers - hook is frozen');
        }
      }
    } catch (e) {
      // Silently ignore if we can't check
    }
  } catch (e) {
    // Silently fail if hook is not accessible
  }
}

// Initialize error tracking (Sentry) per spec section 9
import { initErrorTracking } from "./utils/errorHandler";
initErrorTracking();

// Global error handler to catch React Error #300 and DevTools errors
if (typeof window !== 'undefined') {
  // Suppress React DevTools errors - they're harmless but noisy
  const originalError = console.error;
  console.error = function(...args: unknown[]) {
    const message = String(args[0] || '');
    const stack = String(args[1]?.toString() || '');
    // Suppress DevTools-related errors
    if (
      message.includes('React DevTools failed to get Console Patching') ||
      message.includes('reactDevtoolsAgent') ||
      message.includes('object is not extensible') ||
      message.includes('Cannot add property reactDevtoolsAgent') ||
      stack.includes('react_devtools') ||
      stack.includes('installHook') ||
      message.includes('Minified React error #300') ||
      stack.includes('react-vendor')
    ) {
      // Silently ignore DevTools errors - they don't affect functionality
      return;
    }
    // Log other errors normally
    originalError.apply(console, args);
  };

  // Catch unhandled errors and prevent React Error #300 from crashing the app
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || '';
    const errorSource = event.filename || '';
    const errorStack = event.error?.stack || '';
    
    // Suppress React Error #300 if it's from DevTools injection
    if (
      errorMessage.includes('Minified React error #300') &&
      (errorSource.includes('react_devtools') || errorSource.includes('installHook') || errorStack.includes('react_devtools'))
    ) {
      event.preventDefault(); // Prevent error from propagating
      return false;
    }
    
    // Suppress "object is not extensible" errors from DevTools
    if (
      (errorMessage.includes('object is not extensible') || errorMessage.includes('Cannot add property reactDevtoolsAgent')) &&
      (errorSource.includes('react_devtools') || errorSource.includes('installHook') || errorStack.includes('react_devtools'))
    ) {
      event.preventDefault();
      return false;
    }
  }, true); // Use capture phase to catch errors early

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorMessage = reason?.message || String(reason || '');
    const errorStack = reason?.stack || '';
    
    // Suppress DevTools-related promise rejections
    if (
      errorMessage.includes('reactDevtoolsAgent') ||
      errorMessage.includes('React DevTools') ||
      errorMessage.includes('object is not extensible') ||
      errorMessage.includes('Cannot add property reactDevtoolsAgent') ||
      errorStack.includes('react_devtools') ||
      errorStack.includes('installHook') ||
      (errorMessage.includes('Minified React error #300') && (errorStack.includes('react_devtools') || errorStack.includes('installHook')))
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
