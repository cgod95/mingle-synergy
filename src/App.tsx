
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppStateProvider } from "@/context/AppStateContext";
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

// Lazy load components that aren't immediately needed
const LazyMatches = lazy(() => import("./pages/Matches"));
const LazyProfile = lazy(() => import("./pages/Profile"));

// Protected route with proper error handling
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-[#3A86FF] border-t-transparent rounded-full"></div>
    </div>;
  }
  
  // For development, bypass auth checks
  return <>{children}</>;
};

// Layout component with error boundary
const AppLayout = () => {
  const location = useLocation();
  
  // Simple check to see if user is on auth/onboarding pages
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
        <Route path="/venues" element={<VenueList />} />
        <Route path="/venue/:id" element={<ActiveVenue />} />
        <Route path="/simple-venue/:id" element={<SimpleVenueView />} />
        <Route path="/profile" element={
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <LazyProfile />
          </Suspense>
        } />
        <Route path="/matches" element={
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <LazyMatches />
          </Suspense>
        } />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/onboarding" element={<Onboarding />} />
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
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppLayout />
              </BrowserRouter>
            </TooltipProvider>
          </AppStateProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
