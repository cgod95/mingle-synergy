// 🧠 Purpose: Entry point for the React app. Ensures Tailwind CSS loads and renders the app properly.

import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from './context/AuthContext.tsx';
import { OnboardingProvider } from './context/OnboardingContext.tsx';
import { AppStateProvider } from './context/AppStateContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { UserProvider } from './context/UserContext.tsx';
import App from "./App";
import "./index.css"; // ✅ Tailwind must be imported here
import { Toaster } from '@/components/ui/toaster';

// Initialize services
import '@/services/analytics';
import '@/services/performanceMonitoring';
import '@/services/infrastructure';
import '@/services/dataManagement';
import '@/services/advancedFeatures';
import '@/services/businessFeatures';
import '@/services/technicalExcellence';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <OnboardingProvider>
        <AppStateProvider>
          <NotificationProvider>
            <UserProvider>
              <Toaster />
              <App />
            </UserProvider>
          </NotificationProvider>
        </AppStateProvider>
      </OnboardingProvider>
    </AuthProvider>
  </React.StrictMode>
);
