import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import NotFound from './pages/NotFound';
import CreateProfile from './pages/CreateProfile';
import ActiveVenue from './pages/ActiveVenue';
import LikedUsers from './pages/LikedUsers';
import UploadPhotos from './pages/UploadPhotos';
import Preferences from './pages/Preferences';
import Onboarding from './pages/Onboarding';
import VenueList from './pages/VenueList';

import { UserProvider } from './context/UserContext';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <UserProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/upload-photos" element={<UploadPhotos />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/venues" element={<VenueList />} />
          <Route path="/venue/:id" element={<ActiveVenue />} />
          <Route path="/liked-users" element={<LikedUsers />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </UserProvider>
  );
};

export default App;