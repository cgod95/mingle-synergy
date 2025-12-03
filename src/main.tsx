import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Additional safeguard: Ensure React DevTools is disabled (already set in index.html)
// This is a backup in case DevTools tries to inject after page load
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    // @ts-ignore - React DevTools global hook
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook) {
      // Ensure it's disabled without trying to modify frozen properties
      if (typeof hook.isDisabled !== 'undefined') {
        hook.isDisabled = true;
      }
    }
  } catch (e) {
    // Silently fail if hook is frozen or not accessible
    console.warn('Could not disable React DevTools:', e);
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
