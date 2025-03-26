import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppStateProvider } from "@/context/AppStateContext";
import { ToastProvider } from "@/components/ui/toast/ToastContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import BottomNav from "./components/BottomNav";
import NetworkStatus from "./components/ui/NetworkStatus";
import UpdateNotification from "./components/ui/UpdateNotification";
import Index from "./pages/Index";
import VenueList from "./pages/VenueList";
import ActiveVenue from "./pages/ActiveVenue";
import SimpleVenueView from "./pages/SimpleVenueView";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Onboarding from "./pages/Onboarding";
import Matches from "./pages/Matches";
import TestBackend from "./components/TestBackend";
import OnboardingCarousel from "./components/onboarding/OnboardingCarousel";
import { lazy, Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoadingScreen from "./components/ui/LoadingScreen";
import { initializeLocationServices, locationService } from "@/services/locationService";
import { notificationService } from "@/services/notificationService";

const LazyMatches = lazy(() => import("./pages/Matches"));
const LazyProfile = lazy(() => import("./pages/Profile"));

const AppLayout = () => {
  const location = useLocation();
  const { currentUser, isLoading } = useAuth();
  const [onboardingSeen, setOnboardingSeen] = useState<boolean>(() => {
    return localStorage.getItem('onboardingSeen') === 'true' || 
           localStorage.getItem('onboardingComplete') === 'true';
  });
  
  useEffect(() => {
    const isComplete = localStorage.getItem('onboardingSeen') === 'true' || 
                       localStorage.getItem('onboardingComplete') === 'true';
    setOnboardingSeen(isComplete);
  }, [currentUser]);
  
  useEffect(() => {
    if (currentUser) {
      // Initialize location services
      initializeLocationServices();
      
      // Start location tracking
      locationService.startTracking(currentUser.uid)
        .catch(error => {
          console.error('Location tracking error:', error);
        });
      
      // Initialize notifications with enhanced error handling
      const initNotifications = async () => {
        try {
          const permissionGranted = await notificationService.requestPermission();
          
          if (permissionGranted) {
            console.log('Notification permission granted');
            if (currentUser.uid) {
              notificationService.updateUserNotificationSettings(currentUser.uid, true);
            }
            
            // Setup notification handler
            const unsubscribe = notificationService.setupForegroundHandler((payload) => {
              // Show in-app notification using toast system
              console.log('Received foreground message', payload);
            });
            
            // Show a welcome notification
            notificationService.showNotification(
              'Proximity Notifications Enabled',
              { body: 'You\'ll now receive notifications about matches and messages.' }
            );
            
            return () => {
              if (unsubscribe) unsubscribe();
            };
          } else {
            console.log('Notification permission denied');
            if (currentUser.uid) {
              notificationService.updateUserNotificationSettings(currentUser.uid, false);
            }
          }
        } catch (error) {
          console.error('Error initializing notifications:', error);
        }
      };
      
      initNotifications();
      
      return () => {
        // Stop location tracking when component unmounts or user changes
        locationService.stopTracking();
      };
    }
  }, [currentUser]);
  
  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingSeen', 'true');
    localStorage.setItem('onboardingComplete', 'true');
    setOnboardingSeen(true);
  };
  
  const skipOnboarding = () => {
    return !!currentUser && onboardingSeen;
  };
  
  const isAuthPage = () => {
    return ['/sign-up', '/sign-in', '/onboarding', '/onboarding-carousel'].includes(location.pathname);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  return (
    <ErrorBoundary
      fallback={<div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">The application encountered an unexpected error.</p>
        <button 
          onClick={() => window.location.href = '/venues'}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg"
        >
          Return to Home
        </button>
      </div>}
    >
      <Routes>
        <Route path="/" element={
          onboardingSeen ? 
            (currentUser ? <Navigate to="/venues" replace /> : <Navigate to="/sign-in" replace />) : 
            <Navigate to="/onboarding-carousel" replace />
        } />
        
        <Route path="/sign-up" element={
          onboardingSeen ? <SignUp /> : <Navigate to="/onboarding-carousel" replace />
        } />
        
        <Route path="/sign-in" element={
          onboardingSeen ? <SignIn /> : <Navigate to="/onboarding-carousel" replace />
        } />
        
        <Route path="/onboarding" element={
          skipOnboarding() ? <Navigate to="/venues" replace /> : <Onboarding />
        } />
        
        <Route path="/onboarding-carousel" element={
          skipOnboarding() ? 
            <Navigate to="/venues" replace /> : 
            <OnboardingCarousel onComplete={handleOnboardingComplete} />
        } />
        
        <Route path="/venues" element={
          <PrivateRoute>
            <VenueList />
          </PrivateRoute>
        } />
        
        <Route path="/venue/:id" element={
          <PrivateRoute>
            <ActiveVenue />
          </PrivateRoute>
        } />
        
        <Route path="/simple-venue/:id" element={
          <PrivateRoute>
            <SimpleVenueView />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingScreen message="Loading profile..." />}>
              <LazyProfile />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/matches" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingScreen message="Loading matches..." />}>
              <LazyMatches />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/test-backend" element={<TestBackend />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {!isAuthPage() && <BottomNav />}
      <NetworkStatus />
      <UpdateNotification />
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <ErrorBoundary
      fallback={<div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Application Error</h2>
        <p className="text-muted-foreground mb-4">We're having trouble loading the app.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg"
        >
          Reload Application
        </button>
      </div>}
    >
      <AuthProvider>
        <AppStateProvider>
          <TooltipProvider>
            <ToastProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppLayout />
              </BrowserRouter>
            </ToastProvider>
          </TooltipProvider>
        </AppStateProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
