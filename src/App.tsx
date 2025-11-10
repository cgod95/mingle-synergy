import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppShell from "./components/layout/AppShell";

import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";

import LandingPage from "./pages/LandingPage";
import DemoWelcome from "./pages/DemoWelcome";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CheckInPage from "./pages/CheckInPage";
import VenueDetails from "./pages/VenueDetails";
import Matches from "./pages/Matches";
// ChatIndex removed - unified into Matches page
import ChatRoomGuard from "./pages/ChatRoomGuard";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileUpload from "./pages/ProfileUpload";
import SettingsPage from "./pages/SettingsPage";
import Privacy from "./pages/Privacy";
import Verification from "./pages/Verification";
import Billing from "./pages/Billing";
import UsageStats from "./pages/UsageStats";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Debug from "./pages/Debug";

import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext.tsx";
import { OnboardingProvider } from "./context/OnboardingContext";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Toaster } from "./components/ui/toaster";
import analytics from "./services/appAnalytics";

function AppRoutes() {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    analytics.page(location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/demo-welcome" element={<DemoWelcome />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              {/* Onboarding / auth */}
              <Route path="/upload" element={<AuthRoute><ProfileUpload /></AuthRoute>} />
              {/* App shell */}
              <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route path="/checkin" element={<CheckInPage />} />
                <Route path="/venues/:id" element={<VenueDetails />} />
                <Route path="/matches" element={<Matches />} />
                {/* ChatIndex removed - unified into Matches page */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<ProfileEdit />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/usage" element={<UsageStats />} />
                <Route path="/help" element={<Help />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/debug" element={<Debug />} />
              </Route>
              {/* Chat room - full screen, bypasses AppShell */}
              <Route path="/chat/:id" element={<ProtectedRoute><ChatRoomGuard /></ProtectedRoute>} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/checkin" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <OnboardingProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            <Toaster />
          </OnboardingProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
