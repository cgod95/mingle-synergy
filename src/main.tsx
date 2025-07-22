// 🧠 Purpose: Entry point of the React app that wraps the entire application with necessary providers
// and renders the root component tree. This version ensures the toast provider is correctly wrapped
// before any component (like AuthProvider) tries to use it.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { BrowserRouter as Router } from "react-router-dom";
import "@/index.css";
import ErrorBoundary from "@/components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <Toaster position="top-center" />
      <AuthProvider>
        <OnboardingProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </OnboardingProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
