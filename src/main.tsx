import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize error tracking (Sentry) per spec section 9
import { initErrorTracking } from "./utils/errorHandler";
initErrorTracking();

// Demo data seeds (safe no-ops if already seeded)
import { ensureDemoThreadsSeed } from "./lib/chatStore";
import { ensureDemoLikesSeed } from "./lib/likesStore";

try { ensureDemoLikesSeed(); } catch {}
try { ensureDemoThreadsSeed(); } catch {}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
