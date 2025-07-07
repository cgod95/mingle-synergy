import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { AccessibilityProvider } from '@/components/ui/Accessibility';
import { SkipLink } from '@/components/ui/Accessibility';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { NetworkErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingOverlay } from '@/components/ui/EnhancedLoadingStates';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';

// Lazy load all page components for better performance
const SignIn = lazy(() => import('@/pages/SignIn'));
const VenueList = lazy(() => import('@/pages/VenueList'));
const CreateProfile = lazy(() => import('@/pages/CreateProfile'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Profile = lazy(() => import('@/pages/Profile'));
const ProfileEdit = lazy(() => import('@/pages/ProfileEdit'));
const ActiveVenue = lazy(() => import('@/pages/ActiveVenue'));
const MatchesPage = lazy(() => import('@/pages/MatchesPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const OnboardingStart = lazy(() => import('@/pages/OnboardingStart'));
const AuthChoice = lazy(() => import('@/pages/AuthChoice'));
const Preferences = lazy(() => import('@/pages/Preferences'));
const PhotoUpload = lazy(() => import('@/pages/PhotoUpload'));
const UploadPhotos = lazy(() => import('@/pages/UploadPhotos'));
const Verification = lazy(() => import('@/pages/Verification'));
const Safety = lazy(() => import('@/pages/Safety'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const LegalPages = lazy(() => import('@/pages/LegalPages'));
const CheckInSuccess = lazy(() => import('@/pages/CheckInSuccess'));
const ChatThreadPage = lazy(() => import('@/pages/ChatThreadPage'));
const MatchDetails = lazy(() => import('@/pages/MatchDetails'));
const LikedUsers = lazy(() => import('@/pages/LikedUsers'));
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const Logout = lazy(() => import('@/pages/Logout'));
const SimpleVenueView = lazy(() => import('@/pages/SimpleVenueView'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const Help = lazy(() => import('@/pages/Help'));
const Contact = lazy(() => import('@/pages/Contact'));
const About = lazy(() => import('@/pages/About'));
const Billing = lazy(() => import('@/pages/Billing'));
const UsageStats = lazy(() => import('@/pages/UsageStats'));
const AdvancedAdmin = lazy(() => import('@/pages/AdvancedAdmin'));

const onboardingStepToRoute = {
  email: '/onboarding',
  profile: '/create-profile',
  photo: '/photo-upload',
  preferences: '/preferences',
};

const App = () => {
  const { user, loading } = useAuth();
  const { onboardingProgress, getNextOnboardingStep } = useOnboarding();

  // Use localStorage flags for onboarding/profile completion
  const isOnboardingComplete = localStorage.getItem('onboardingComplete') === 'true' && localStorage.getItem('profileComplete') === 'true';

  console.log("[App.tsx] loading (render):", loading);
  console.log("[App.tsx] user:", user);
  console.log("[App.tsx] onboardingComplete:", isOnboardingComplete);

  // Helper: get the next onboarding route if not complete
  const nextOnboardingRoute = !isOnboardingComplete ? onboardingStepToRoute[getNextOnboardingStep() || 'email'] : '/venues';

  // FORCIBLY BYPASS SPINNER IF LOADING IS FALSE
  if (loading) {
    return (
      <LoadingOverlay isLoading={true} message="Loading your experience...">
        <div className="min-h-screen bg-gray-50" />
      </LoadingOverlay>
    );
  }

  // If loading is false, always render the main app, even if user is null
  return (
    <ErrorBoundary>
      <NetworkErrorBoundary>
        <AccessibilityProvider>
          <Router>
            {/* Skip to main content link for accessibility */}
            <SkipLink href="#main-content">
              Skip to main content
            </SkipLink>
            
            <div id="main-content">
              <Routes>
                <Route path="/" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <LandingPage />
                  </Suspense>
                } />
                <Route path="/signin" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <SignIn />
                  </Suspense>
                } />
                <Route path="/sign-in" element={<Navigate to="/signin" replace />} />
                <Route path="/auth-choice" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <AuthChoice />
                  </Suspense>
                } />
                <Route path="/onboarding-start" element={isOnboardingComplete ? <Navigate to="/venues" /> : (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <OnboardingStart />
                  </Suspense>
                )} />
                
                {/* Legal and public pages */}
                <Route path="/safety" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Safety />
                  </Suspense>
                } />
                <Route path="/terms" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Terms />
                  </Suspense>
                } />
                <Route path="/privacy" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Privacy />
                  </Suspense>
                } />
                <Route path="/legal/*" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <LegalPages />
                  </Suspense>
                } />
                <Route path="/settings" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <SettingsPage />
                  </Suspense>
                } />
                
                <Route path="/onboarding" element={isOnboardingComplete ? <Navigate to="/venues" /> : user ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Onboarding />
                  </Suspense>
                ) : <Navigate to="/signin" />} />
                <Route path="/create-profile" element={isOnboardingComplete ? <Navigate to="/venues" /> : user ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <CreateProfile />
                  </Suspense>
                ) : <Navigate to="/signin" />} />
                <Route path="/photo-upload" element={isOnboardingComplete ? <Navigate to="/venues" /> : user ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <PhotoUpload />
                  </Suspense>
                ) : <Navigate to="/signin" />} />
                <Route path="/preferences" element={isOnboardingComplete ? <Navigate to="/venues" /> : user ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Preferences />
                  </Suspense>
                ) : <Navigate to="/signin" />} />
                <Route path="/upload-photos" element={isOnboardingComplete ? <Navigate to="/venues" /> : user ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <UploadPhotos />
                  </Suspense>
                ) : <Navigate to="/signin" />} />
                <Route path="/verification" element={user ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Verification />
                  </Suspense>
                ) : <Navigate to="/signin" />} />
                <Route path="/venues" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <VenueList />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                
                {/* Home route for authenticated users */}
                <Route path="/home" element={user && isOnboardingComplete ? <Navigate to="/venues" /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                
                <Route path="/profile" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Profile />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/profile/edit" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <ProfileEdit />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/profile/:userId" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <UserProfilePage />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/venue/:id" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <ActiveVenue />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/simple-venue/:venueId" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <SimpleVenueView />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/check-in-success" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <CheckInSuccess />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/liked-users" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <LikedUsers />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/matches" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <MatchesPage />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/match/:id" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <MatchDetails />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/messages" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <MessagesPage />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/messages/:matchId" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <ChatThreadPage />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/chat/:matchId" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <ChatPage />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/logout" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Logout />
                  </Suspense>
                } />
                <Route path="/admin" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <AdminDashboard />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/help" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Help />
                  </Suspense>
                } />
                <Route path="/contact" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Contact />
                  </Suspense>
                } />
                <Route path="/about" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <About />
                  </Suspense>
                } />
                <Route path="/billing" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <Billing />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/usage-stats" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <UsageStats />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                <Route path="/advanced-admin" element={user && isOnboardingComplete ? (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <AdvancedAdmin />
                  </Suspense>
                ) : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
                {/* Catch all route */}
                <Route path="*" element={
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <NotFound />
                  </Suspense>
                } />
              </Routes>
            </div>
          </Router>
        </AccessibilityProvider>
      </NetworkErrorBoundary>
    </ErrorBoundary>
  );
};

export default App;