import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import SignIn from '@/pages/SignIn';
import VenueList from '@/pages/VenueList';
import CreateProfile from '@/pages/CreateProfile';
import LandingPage from '@/pages/LandingPage';
import Profile from '@/pages/Profile';
import ProfileEdit from '@/pages/ProfileEdit';
import ActiveVenue from '@/pages/ActiveVenue';
import MatchesPage from '@/pages/MatchesPage';
import ChatPage from '@/pages/ChatPage';
import MessagesPage from '@/pages/MessagesPage';
import NotFound from '@/pages/NotFound';
import Onboarding from '@/pages/Onboarding';
import OnboardingStart from '@/pages/OnboardingStart';
import AuthChoice from '@/pages/AuthChoice';
import Preferences from '@/pages/Preferences';
import PhotoUpload from '@/pages/PhotoUpload';
import UploadPhotos from '@/pages/UploadPhotos';
import Verification from '@/pages/Verification';
import Safety from '@/pages/Safety';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import LegalPages from '@/pages/LegalPages';
import CheckInSuccess from '@/pages/CheckInSuccess';
import ReconnectsPage from '@/pages/ReconnectsPage';
import RequestsPage from '@/pages/RequestsPage';
import UserProfilePage from '@/pages/UserProfilePage';
import Reconnect from '@/pages/Reconnect';
import ChatThreadPage from '@/pages/ChatThreadPage';
import MatchDetails from '@/pages/MatchDetails';
import LikedUsers from '@/pages/LikedUsers';
import SettingsPage from '@/pages/SettingsPage';
import Logout from '@/pages/Logout';

const onboardingStepToRoute = {
  email: '/onboarding',
  profile: '/create-profile',
  photo: '/photo-upload',
  preferences: '/preferences',
};

const App = () => {
  const { user, loading } = useAuth();
  const { onboardingProgress, getNextOnboardingStep, isOnboardingComplete } = useOnboarding();

  console.log("[App.tsx] loading:", loading);
  console.log("[App.tsx] user:", user);
  console.log("[App.tsx] onboardingComplete:", isOnboardingComplete);

  if (loading) return <div className="p-8">Loading...</div>;

  // Helper: get the next onboarding route if not complete
  const nextOnboardingRoute = !isOnboardingComplete ? onboardingStepToRoute[getNextOnboardingStep() || 'email'] : '/venues';

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/sign-in" element={<Navigate to="/signin" replace />} />
        <Route path="/auth-choice" element={<AuthChoice />} />
        <Route path="/onboarding-start" element={isOnboardingComplete ? <Navigate to="/venues" /> : <OnboardingStart />} />
        
        {/* Legal and public pages */}
        <Route path="/safety" element={<Safety />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/legal/*" element={<LegalPages />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        <Route path="/onboarding" element={isOnboardingComplete ? <Navigate to="/venues" /> : user ? <Onboarding /> : <Navigate to="/signin" />} />
        <Route path="/create-profile" element={isOnboardingComplete ? <Navigate to="/venues" /> : user ? <CreateProfile /> : <Navigate to="/signin" />} />
        <Route path="/photo-upload" element={isOnboardingComplete ? <Navigate to="/venues" /> : user ? <PhotoUpload /> : <Navigate to="/signin" />} />
        <Route path="/preferences" element={isOnboardingComplete ? <Navigate to="/venues" /> : user ? <Preferences /> : <Navigate to="/signin" />} />
        <Route path="/upload-photos" element={isOnboardingComplete ? <Navigate to="/venues" /> : user ? <UploadPhotos /> : <Navigate to="/signin" />} />
        <Route path="/verification" element={user ? <Verification /> : <Navigate to="/signin" />} />
        <Route path="/venues" element={user && isOnboardingComplete ? <VenueList /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/profile" element={user && isOnboardingComplete ? <Profile /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/profile/edit" element={user && isOnboardingComplete ? <ProfileEdit /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/profile/:userId" element={user && isOnboardingComplete ? <UserProfilePage /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/venue/:id" element={user && isOnboardingComplete ? <ActiveVenue /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/check-in-success" element={user && isOnboardingComplete ? <CheckInSuccess /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/liked-users" element={user && isOnboardingComplete ? <LikedUsers /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/matches" element={user && isOnboardingComplete ? <MatchesPage /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/match/:id" element={user && isOnboardingComplete ? <MatchDetails /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/messages" element={user && isOnboardingComplete ? <MessagesPage /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/messages/:matchId" element={user && isOnboardingComplete ? <ChatThreadPage /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/chat/:matchId" element={user && isOnboardingComplete ? <ChatPage /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/requests" element={user && isOnboardingComplete ? <RequestsPage /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/reconnects" element={user && isOnboardingComplete ? <ReconnectsPage /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/reconnect" element={user && isOnboardingComplete ? <Reconnect /> : user ? <Navigate to={nextOnboardingRoute} /> : <Navigate to="/signin" />} />
        <Route path="/logout" element={<Logout />} />
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;