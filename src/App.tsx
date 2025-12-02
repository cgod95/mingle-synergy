import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { useEffect, lazy, Suspense, useState, useRef } from "react";
import AppShell from "./components/layout/AppShell";
import config from "./config";
import { LoadingSpinner as StandardLoadingSpinner } from './components/ui/LoadingSpinner';

import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";
import MingleLoader from "./components/ui/MingleLoader";
// Import ChatRoomGuard directly (not lazy) to avoid Router context timing issues with useNavigate
import ChatRoomGuard from "./pages/ChatRoomGuard";

// Lazy load pages for code splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const DemoWelcome = lazy(() => import("./pages/DemoWelcome"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const CheckInPage = lazy(() => import("./pages/CheckInPage"));
const VenueDetails = lazy(() => import("./pages/VenueDetails"));
const Matches = lazy(() => import("./pages/Matches"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const ProfileUpload = lazy(() => import("./pages/ProfileUpload"));
const CreateProfile = lazy(() => import("./pages/CreateProfile"));
const PhotoUpload = lazy(() => import("./pages/PhotoUpload"));
const Preferences = lazy(() => import("./pages/Preferences"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Verification = lazy(() => import("./pages/Verification"));
const Billing = lazy(() => import("./pages/Billing"));
const UsageStats = lazy(() => import("./pages/UsageStats"));
const Help = lazy(() => import("./pages/Help"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const Debug = lazy(() => import("./pages/Debug"));
const Feedback = lazy(() => import("./pages/Feedback"));

// Minimal loading component - uses standardized LoadingSpinner
const PageLoader = () => {
  // In demo mode, return null to prevent loading spinner flicker
  if (config.DEMO_MODE) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white flex items-center justify-center">
      <StandardLoadingSpinner size="lg" message="Loading..." />
    </div>
  );
};

import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext.tsx";
import { OnboardingProvider } from "./context/OnboardingContext";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Toaster } from "./components/ui/toaster";
import { NetworkErrorBanner } from "./components/ui/NetworkErrorBanner";
import analytics from "./services/appAnalytics";

function AppRoutes() {
  const location = useLocation();
  const lastPathnameRef = React.useRef<string>('');

  // Track page views - prevent duplicate tracking
  useEffect(() => {
    // Only track if pathname actually changed
    if (lastPathnameRef.current !== location.pathname) {
      lastPathnameRef.current = location.pathname;
      analytics.page(location.pathname);
    }
  }, [location.pathname]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo-welcome" element={<DemoWelcome />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        {/* Onboarding / auth */}
        <Route path="/upload" element={<AuthRoute><ProfileUpload /></AuthRoute>} />
        <Route path="/create-profile" element={<AuthRoute><CreateProfile /></AuthRoute>} />
        <Route path="/photo-upload" element={<AuthRoute><PhotoUpload /></AuthRoute>} />
        <Route path="/preferences" element={<AuthRoute><Preferences /></AuthRoute>} />
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
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/debug" element={<Debug />} />
        </Route>
        {/* Chat room - full screen, bypasses AppShell */}
        {/* ChatRoomGuard must be inside Route to have Router context */}
        <Route 
          path="/chat/:id" 
          element={
            <ProtectedRoute>
              <ChatRoomGuard />
            </ProtectedRoute>
          } 
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/checkin" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  // Skip initialization delay in demo mode to prevent flickering
  const [isInitializing, setIsInitializing] = useState(!config.DEMO_MODE);

  useEffect(() => {
    // In demo mode, skip the initialization delay
    if (config.DEMO_MODE) {
      setIsInitializing(false);
      return;
    }

    // Simulate app initialization (like Tinder's loader) - only in production
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500); // Show loader for 1.5s minimum

    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return <MingleLoader />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <OnboardingProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AppRoutes />
            </BrowserRouter>
            <Toaster />
            {/* Global network error banner - shows when offline or network errors occur */}
            <NetworkErrorBanner />
          </OnboardingProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
