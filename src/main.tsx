// 🧠 Purpose: Entry point for the React app. Ensures Tailwind CSS loads and renders the app properly.

import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from './context/AuthContext.tsx';
import { OnboardingProvider } from './context/OnboardingContext.tsx';
import { AppStateProvider } from './context/AppStateContext.tsx';
import App from "./App";
import "./index.css"; // ✅ Tailwind must be imported here
import { Toaster } from '@/components/ui/toaster';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <OnboardingProvider>
        <AppStateProvider>
          <Toaster />
          <App />
        </AppStateProvider>
      </OnboardingProvider>
    </AuthProvider>
  </React.StrictMode>
);
