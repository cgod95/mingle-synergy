import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { AuthProvider } from "./context/AuthContext";

import VenueList from "./pages/VenueList";
import VenueDetails from "./components/venue/VenueDetails";
import Matches from "./pages/Matches";
import ChatIndex from "./pages/ChatIndex";
import ChatRoom from "./pages/ChatRoom";
import ProfileUpload from "./pages/ProfileUpload";
import CheckInPage from "./pages/CheckInPage";
import SignIn from "./pages/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/checkin" replace />} />
            <Route path="/signin" element={<AuthRoute><SignIn /></AuthRoute>} />

            <Route path="/checkin" element={<ProtectedRoute><CheckInPage /></ProtectedRoute>} />
            <Route path="/venues" element={<ProtectedRoute><VenueList /></ProtectedRoute>} />
            <Route path="/venues/:id" element={<ProtectedRoute><VenueDetails /></ProtectedRoute>} />

            <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatIndex /></ProtectedRoute>} />
            <Route path="/chat/:matchId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><ProfileUpload /></ProtectedRoute>} />
            <Route path="*" element={<div className="p-6">404 — Not found</div>} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
}
