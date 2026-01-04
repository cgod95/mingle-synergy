// 🧠 Purpose: Mark onboarding as complete after preferences are saved

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import userService from "@/services/firebase/userService";

// Session storage key for pending venue check-in (for QR code deep link handling)
const PENDING_VENUE_CHECKIN_KEY = 'pendingVenueCheckIn';

export const useCompleteOnboarding = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();

  const handleCompleteOnboarding = useCallback(async () => {
    if (!user) return;
    
    try {
      await userService.completeOnboarding(user.uid);
      
      // Check for pending venue check-in from QR code deep link
      const pendingVenueId = sessionStorage.getItem(PENDING_VENUE_CHECKIN_KEY);
      if (pendingVenueId) {
        sessionStorage.removeItem(PENDING_VENUE_CHECKIN_KEY);
        // Navigate to check-in page with the venue ID and source
        navigate(`/checkin?venueId=${pendingVenueId}&source=qr`);
      } else {
        navigate("/checkin");
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // You might want to show a toast notification here
    }
  }, [user, navigate]);

  return { handleCompleteOnboarding };
}; 