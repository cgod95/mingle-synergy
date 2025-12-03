import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Disable React DevTools in production to prevent multiple React instance conflicts
// This prevents installHook.js from causing React error #300
if (import.meta.env.PROD) {
  // @ts-ignore - React DevTools global hook
  if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
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
