import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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
