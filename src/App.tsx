import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VenueDiscovery from './pages/VenueDiscovery';
import VenueDetails from './pages/VenueDetails';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Matches from './pages/Matches';
import Auth from './pages/Auth';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Onboarding from './pages/Onboarding';
import SimpleVenue from './pages/SimpleVenue';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/profile/:id" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          } />
          <Route path="/venues" element={<VenueDiscovery />} />
          <Route path="/simple-venue/:venueId" element={<VenueDetails />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
