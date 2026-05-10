import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initCapacitor, isNativePlatform } from "./lib/capacitor";

// Unregister stale service workers once per session and only when present.
// Previously this ran on every load and forced a full cache wipe, dramatically
// slowing repeat startup. The flag below guards against repeat work.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const SW_FLAG = 'mingle:sw-purged-v1';
  const purged = (() => {
    try { return sessionStorage.getItem(SW_FLAG) === '1'; } catch { return false; }
  })();

  if (!purged) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => {
        if (registrations.length === 0) return undefined;
        return Promise.all(registrations.map(r => r.unregister().catch(() => false)));
      })
      .then(() => {
        if ('caches' in window) {
          return caches.keys().then((names) =>
            Promise.all(names.map((n) => caches.delete(n).catch(() => false)))
          );
        }
        return undefined;
      })
      .catch(() => undefined)
      .finally(() => {
        try { sessionStorage.setItem(SW_FLAG, '1'); } catch { /* noop */ }
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
