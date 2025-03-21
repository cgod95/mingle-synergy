
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
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

const queryClient = new QueryClient();

// Protected route component for testing - automatically passes through to children
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    // Could add a loading spinner here
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Uncomment for production use
  // if (!currentUser) {
  //   return <Navigate to="/sign-in" />;
  // }
  
  return <>{children}</>;
};

// Layout component that conditionally renders BottomNav
const AppLayout = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Simple check to see if user is on auth/onboarding pages
  const isAuthPage = () => {
    return ['/sign-up', '/sign-in', '/onboarding'].includes(location.pathname);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<VenueList />} />
        <Route path="/venues" element={<VenueList />} />
        <Route path="/venue/:id" element={<ActiveVenue />} />
        <Route path="/simple-venue/:id" element={<SimpleVenueView />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {!isAuthPage() && <BottomNav />}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
