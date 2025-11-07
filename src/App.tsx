import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";

import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";

import CheckInPage from "./pages/CheckInPage";
import VenueDetails from "./components/venue/VenueDetails";
import Matches from "./pages/Matches";
import ChatIndex from "./pages/ChatIndex";
import ChatRoom from "./pages/ChatRoom";
import ChatRoomGuard from "./pages/ChatRoomGuard";
import Profile from "./pages/Profile";
import ProfileUpload from "./pages/ProfileUpload";
import Debug from "./pages/Debug";

import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext.tsx";

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <BrowserRouter>
        <Routes>
          {/* Onboarding / auth */}
          <Route path="/upload" element={<AuthRoute><ProfileUpload /></AuthRoute>} />
          {/* App shell */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/checkin" replace />} />
            <Route path="/checkin" element={<CheckInPage />} />
            <Route path="/venues/:id" element={<VenueDetails />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/chats" element={<ChatIndex />} />
            <Route path="/chat/:id" element={<ChatRoomGuard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/debug" element={<Debug />} />
          </Route>
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/checkin" replace />} />
        </Routes>
      </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  );
}
