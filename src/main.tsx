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
      // Ensure it's disabled
      hook.isDisabled = true;
    }
    
    // Check for multiple React instances (React error #300 detection)
    // @ts-ignore
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.size > 1) {
      console.error('Multiple React instances detected! This will cause React error #300.');
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
