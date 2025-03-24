import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppStateProvider } from "@/context/AppStateContext";
import { ToastProvider } from "@/components/ui/toast/ToastContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import BottomNav from "./components/BottomNav";
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
import { lazy, Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LazyMatches = lazy(() => import("./pages/Matches"));
const LazyProfile = lazy(() => import("./pages/Profile"));

const AppLayout = () => {
  const location = useLocation();
  
  const isAuthPage = () => {
    return ['/sign-up', '/sign-in', '/onboarding'].includes(location.pathname);
  };

  return (
    <ErrorBoundary
      fallback={<div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">The application encountered an unexpected error.</p>
        <button 
          onClick={() => window.location.href = '/venues'}
          className="px-4 py-2 bg-[#3A86FF] text-white rounded-lg"
        >
          Return to Home
        </button>
      </div>}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/venues" replace />} />
        
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
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
            <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
              <LazyProfile />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="/matches" element={
          <PrivateRoute>
            <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
              <LazyMatches />
            </Suspense>
          </PrivateRoute>
        } />
        
        <Route path="/test-backend" element={<TestBackend />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {!isAuthPage() && <BottomNav />}
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallback={<div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Application Error</h2>
          <p className="text-muted-foreground mb-4">We're having trouble loading the app.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#3A86FF] text-white rounded-lg"
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
    </QueryClientProvider>
  );
};

export default App;
