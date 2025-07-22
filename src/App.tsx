// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import ProtectedRoute from "@/components/ProtectedRoute"
import SignIn from "@/pages/SignIn"
import SignUp from "@/pages/SignUp"
import OnboardingProfile from "@/pages/OnboardingProfile"
import UploadPhotos from "@/pages/UploadPhotos"
import Preferences from "@/pages/Preferences"
import VenueList from "@/pages/VenueList"
import ActiveVenue from "@/pages/ActiveVenue"
import Matches from "@/pages/Matches"
import Chat from "@/pages/Chat"
import MessagesPage from "@/pages/MessagesPage"
import UserProfilePage from "@/pages/UserProfilePage"
import Reconnect from "@/pages/Reconnect"
import Profile from "@/pages/Profile"
import ProfileEdit from "@/pages/ProfileEdit"
import Safety from "@/pages/Safety"
import Privacy from "@/pages/Privacy"
import Terms from "@/pages/Terms"
import NotFound from "@/pages/NotFound"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/create-profile" element={
          <ProtectedRoute>
            <OnboardingProfile />
          </ProtectedRoute>
        } />
        <Route path="/upload-photos" element={
          <ProtectedRoute>
            <UploadPhotos />
          </ProtectedRoute>
        } />
        <Route path="/preferences" element={
          <ProtectedRoute>
            <Preferences />
          </ProtectedRoute>
        } />
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/venues" element={<VenueList />} />
          <Route path="/venue/:id" element={<ActiveVenue />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/chat/:matchId" element={<Chat />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
          <Route path="/reconnect" element={<Reconnect />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App