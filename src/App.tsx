
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VenueDiscovery from './pages/VenueDiscovery';
import VenueDetails from './pages/VenueDetails';
import { AuthProvider } from './context/AuthContext';
import NetworkStatus from './components/ui/NetworkStatus';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<VenueDiscovery />} />
          <Route path="/venues" element={<VenueDiscovery />} />
          <Route path="/simple-venue/:venueId" element={<VenueDetails />} />
        </Routes>
        <NetworkStatus />
      </AuthProvider>
    </Router>
  );
}

export default App;
