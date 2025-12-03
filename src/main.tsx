import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Additional safeguard: Ensure React DevTools is disabled and check for multiple React instances
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    // @ts-ignore - React DevTools global hook
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook) {
      // Ensure it's disabled without trying to modify frozen properties
      try {
        if (typeof hook.isDisabled !== 'undefined' && hook.isDisabled !== true) {
          hook.isDisabled = true;
        }
        // Override critical methods if not frozen
        if (typeof hook.inject === 'function') {
          hook.inject = function() { return false; };
        }
        if (typeof hook.onCommitFiberRoot === 'function') {
          hook.onCommitFiberRoot = function() {};
        }
        if (typeof hook.onCommitFiberUnmount === 'function') {
          hook.onCommitFiberUnmount = function() {};
        }
      } catch (e) {
        // Hook might be frozen, that's okay - it means it's already disabled
      }
    }
    
    // Check for multiple React instances (React error #300 detection)
    // @ts-ignore
    if (hook?.renderers?.size > 1) {
      console.error('Multiple React instances detected! This will cause React error #300.');
      console.error('Renderers:', Array.from(hook.renderers.keys()));
    }
  } catch (e) {
    // Silently fail if hook is not accessible
  }
}

// Initialize error tracking (Sentry) per spec section 9
import { initErrorTracking } from "./utils/errorHandler";
initErrorTracking();

// Demo data seeding removed for closed beta - using real Firebase data

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
