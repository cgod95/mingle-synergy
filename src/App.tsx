
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Index from "./pages/Index";
import VenueList from "./pages/VenueList";
import ActiveVenue from "./pages/ActiveVenue";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Onboarding from "./pages/Onboarding";
import Matches from "./pages/Matches";

const queryClient = new QueryClient();

const App = () => {
  // Simple check to see if user is on auth/onboarding pages
  const isAuthPage = (pathname: string) => {
    return ['/sign-up', '/sign-in', '/onboarding'].includes(pathname);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {({ location }) => (
            <>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/venues" element={<VenueList />} />
                <Route path="/venue/:id" element={<ActiveVenue />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {!isAuthPage(location.pathname) && <BottomNav />}
            </>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
