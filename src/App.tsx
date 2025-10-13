import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import Layout from "@/components/Layout";

// Lazy-loaded pages
const LandingPage = React.lazy(() => import("@/pages/LandingPage"));
const SignUp = React.lazy(() => import("@/pages/SignUp"));
const SignIn = React.lazy(() => import("@/pages/SignIn"));
const OnboardingProfile = React.lazy(() => import("@/pages/OnboardingProfile"));
const UploadPhotos = React.lazy(() => import("@/pages/UploadPhotos"));
const Preferences = React.lazy(() => import("@/pages/Preferences"));
const VenuesPage = React.lazy(() => import("@/pages/Venues"));
const ActiveVenue = React.lazy(() => import("@/pages/ActiveVenue"));
const ProfilePage = React.lazy(() => import("@/pages/Profile"));
const MatchesPage = React.lazy(() => import("@/pages/MatchesPage"));
const MatchDetails = React.lazy(() => import("@/pages/MatchDetails"));
const ChatPage = React.lazy(() => import("@/pages/ChatPage"));
const Reconnect = React.lazy(() => import("@/pages/Reconnect"));
const LikedUsers = React.lazy(() => import("@/pages/LikedUsers"));
const SettingsPage = React.lazy(() => import("@/pages/SettingsPage"));
const Safety = React.lazy(() => import("@/pages/Safety"));
const Terms = React.lazy(() => import("@/pages/Terms"));
const Privacy = React.lazy(() => import("@/pages/Privacy"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const MessagesPage = React.lazy(() => import("@/pages/MessagesPage"));
const AuditPage = React.lazy(() => import("@/pages/AuditPage"));
const Philosophy = React.lazy(() => import("@/pages/Philosophy"));
const LocationOnboarding = React.lazy(() => import("@/pages/LocationOnboarding")); // Placeholder
const NotificationsOnboarding = React.lazy(() => import("@/pages/NotificationsOnboarding")); // Placeholder

// Fallback while loading components
const Loading = () => <div className="flex items-center justify-center h-screen">Loading...</div>;

// Onboarding Route Component (allows access to onboarding steps)
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const { isOnboardingComplete } = useOnboarding();

  console.log('[OnboardingRoute] currentUser:', currentUser);
  console.log('[OnboardingRoute] isOnboardingComplete:', isOnboardingComplete);

  if (!currentUser) {
    console.log('[OnboardingRoute] Redirecting to /sign-in');
    return <Navigate to="/sign-in" replace />;
  }
  if (isOnboardingComplete) {
    console.log('[OnboardingRoute] Onboarding complete, redirecting to /venues');
    return <Navigate to="/venues" replace />;
  }

  // Always start at /philosophy if onboarding is not complete
  const path = window.location.pathname;
  if (!path.startsWith('/philosophy') && !path.startsWith('/sign-up') && !path.startsWith('/create-profile') && !path.startsWith('/upload-photos')) {
    console.log('[OnboardingRoute] Redirecting to /philosophy');
    return <Navigate to="/philosophy" replace />;
  }

  console.log('[OnboardingRoute] Rendering onboarding child route:', path);
  return <>{children}</>;
};

// Protected Route Component (requires completed onboarding)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const { isOnboardingComplete } = useOnboarding();

  if (!currentUser) return <Navigate to="/sign-in" replace />;
  if (!isOnboardingComplete) return <Navigate to="/upload-photos" replace />;

  return <Layout>{children}</Layout>;
};

// Auth Route Component (prevents access to sign-in/sign-up if already logged in)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const { isOnboardingComplete } = useOnboarding();

  if (!currentUser) {
    return <>{children}</>;
  }

  // Authenticated user
  if (isOnboardingComplete) {
    return <Navigate to="/venues" replace />;
  }

  // Onboarding not complete – send them to the beginning of onboarding
  return <Navigate to="/philosophy" replace />;
};

const App = () => {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route
            path="/sign-up"
            element={
              <AuthRoute>
                <SignUp />
              </AuthRoute>
            }
          />
          <Route
            path="/sign-in"
            element={
              <AuthRoute>
                <SignIn />
              </AuthRoute>
            }
          />

          {/* Onboarding Routes */}
          <Route
            path="/philosophy"
            element={
              <OnboardingRoute>
                <Philosophy />
              </OnboardingRoute>
            }
          />
          <Route
            path="/location"
            element={
              <OnboardingRoute>
                <LocationOnboarding />
              </OnboardingRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <OnboardingRoute>
                <NotificationsOnboarding />
              </OnboardingRoute>
            }
          />
          <Route
            path="/create-profile"
            element={
              <OnboardingRoute>
                <OnboardingProfile />
              </OnboardingRoute>
            }
          />
          <Route
            path="/upload-photos"
            element={
              <OnboardingRoute>
                <UploadPhotos />
              </OnboardingRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <OnboardingRoute>
                <Preferences />
              </OnboardingRoute>
            }
          />

          {/* Main App Routes */}
          <Route
            path="/venues"
            element={
              <ProtectedRoute>
                <VenuesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/venues/:id"
            element={
              <ProtectedRoute>
                <ActiveVenue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <MatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match/:id"
            element={
              <ProtectedRoute>
                <MatchDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:matchId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reconnect"
            element={
              <ProtectedRoute>
                <Reconnect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/liked-users"
            element={
              <ProtectedRoute>
                <LikedUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <AuditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Legal/Info Routes */}
          <Route path="/safety" element={<Safety />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Error Routes */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;