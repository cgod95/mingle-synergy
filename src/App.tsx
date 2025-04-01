import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Philosophy from './pages/Philosophy';
import LocationPermission from './pages/LocationPermission';
import NotificationPermission from './pages/NotificationPermission';
import Signup from './pages/EmailSignUp';
import CreateProfile from './pages/CreateProfile';
import UploadPhotos from './pages/UploadPhotos';
import Preferences from './pages/Preferences';
import VenuesPage from './pages/VenuesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/philosophy" element={<Philosophy />} />
        <Route path="/location-permission" element={<LocationPermission />} />
        <Route path="/notification-permission" element={<NotificationPermission />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/upload-photos" element={<UploadPhotos />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;