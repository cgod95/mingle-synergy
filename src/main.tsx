import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize error tracking (Sentry) per spec section 9
import { initErrorTracking } from "./utils/errorHandler";
initErrorTracking();

// Initialize demo services (only in demo mode)
// Only enable demo mode if explicitly set OR in development (not production)
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || 
  (import.meta.env.MODE === 'development' && !import.meta.env.PROD);

if (isDemoMode) {
  // Only initialize demo services in demo mode
  // Use dynamic imports to avoid loading demo code in production builds
  Promise.all([
    import("./services/demoNotificationService").then(() => {
      // Service auto-starts demo notifications on import
    }),
    import("./lib/chatStore").then(({ ensureDemoThreadsSeed }) => {
      ensureDemoThreadsSeed().catch(() => {});
    }),
    import("./lib/likesStore").then(({ ensureDemoLikesSeed }) => {
      try { ensureDemoLikesSeed(); } catch {}
    })
  ]).catch((error) => {
    // Silently fail if demo services can't be loaded
    console.warn('Failed to load demo services:', error);
  });
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
