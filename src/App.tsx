import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import AppShell from "./components/layout/AppShell";

import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";

// Lazy load pages for code splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const DemoWelcome = lazy(() => import("./pages/DemoWelcome"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const CheckInPage = lazy(() => import("./pages/CheckInPage"));
const VenueDetails = lazy(() => import("./pages/VenueDetails"));
const Matches = lazy(() => import("./pages/Matches"));
const ChatRoomGuard = lazy(() => import("./pages/ChatRoomGuard"));
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

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-neutral-600">Loading...</p>
    </div>
  </div>
);

import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext.tsx";
import { OnboardingProvider } from "./context/OnboardingContext";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Toaster } from "./components/ui/toaster";
import { NetworkErrorBanner } from "./components/ui/NetworkErrorBanner";
import analytics from "./services/appAnalytics";

function AppRoutes() {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    analytics.page(location.pathname);
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
        <Route path="/chat/:id" element={<ProtectedRoute><ChatRoomGuard /></ProtectedRoute>} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/checkin" replace />} />
      </Routes>
    </Suspense>
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
            {/* Global network error banner - shows when offline or network errors occur */}
            <NetworkErrorBanner />
          </OnboardingProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
