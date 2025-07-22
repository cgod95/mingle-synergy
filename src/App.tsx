/**
 * Purpose: Defines the routing structure of the app.
 * Uses ProtectedRoute for guarded routes and lazy-loads all pages for performance.
 * Handles redirects and onboarding flow.
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { OnboardingStepGuard } from '@/components/OnboardingStepGuard';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const SignIn = lazy(() => import('@/pages/SignIn'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const OnboardingProfile = lazy(() => import('@/pages/OnboardingProfile'));
const UploadPhotos = lazy(() => import('@/pages/UploadPhotos'));
const Preferences = lazy(() => import('@/pages/Preferences'));
const VenueList = lazy(() => import('@/pages/VenueList'));
const Profile = lazy(() => import('@/pages/Profile'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/create-profile" element={<OnboardingProfile />} />
      <Route path="/upload-photos" element={
        <OnboardingStepGuard requiredSteps={['profile']}>
          <UploadPhotos />
        </OnboardingStepGuard>
      } />
      <Route path="/preferences" element={
        <OnboardingStepGuard requiredSteps={['profile', 'photos']}>
          <Preferences />
        </OnboardingStepGuard>
      } />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/venues" element={<VenueList />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </Suspense>
);

export default App;