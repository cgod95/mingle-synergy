// 🧠 Purpose: Mark onboarding as complete after preferences are saved

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import userService from "@/services/firebase/userService";
import logger from '@/utils/Logger';

export const useCompleteOnboarding = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();

  const handleCompleteOnboarding = useCallback(async () => {
    if (!user) return;
    
    try {
      await userService.completeOnboarding(user.uid);
      navigate("/venues");
    } catch (error) {
      logger.error('Error completing onboarding:', error);
      // You might want to show a toast notification here
    }
  }, [user, navigate]);

  return { handleCompleteOnboarding };
}; 