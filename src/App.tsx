import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";

import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import VenueList from "./pages/VenueList";
import Profile from "./pages/Profile";
import NotFoundStandalone from "./pages/NotFoundStandalone";
import PublicVenue from "./pages/PublicVenue";
import VenueDetails from "./components/venue/VenueDetails";
import Pair from "./pages/Pair";
import Chat from "./pages/Chat";

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <OnboardingProvider>
            <div data-testid="app-loaded" style={{ display: "none" }} />
            <Header />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />

              <Route
                path="/venues"
                element={
                  <ProtectedRoute>
                    <VenueList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/venues/:id"
                element={
                  <ProtectedRoute>
                    <VenueDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pair"
                element={
                  <ProtectedRoute>
                    <Pair />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:id"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />              <Route path="/v/:id" element={<PublicVenue />} />


              <Route path="/404" element={<NotFoundStandalone />} />
              <Route path="*" element={<NotFoundStandalone />} />
            </Routes>
          </OnboardingProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
