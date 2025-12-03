import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Additional safeguard: Ensure React DevTools is disabled (already set in index.html)
// This is a backup in case DevTools tries to inject after page load
if (typeof window !== 'undefined') {
  // @ts-ignore - React DevTools global hook
  if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };
  } else {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled = true;
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
