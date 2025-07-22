import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import userService from "@/services/firebase/userService";

export default function useRequireOnboarding() {
  const { currentUser, isLoading } = useAuth();
  const { setIsOnboardingComplete } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser || isLoading) return;
    userService.isOnboardingComplete(currentUser.uid).then((complete) => {
      setIsOnboardingComplete(complete);
      if (!complete && !location.pathname.startsWith("/create-profile")) {
        navigate("/create-profile");
      }
    });
  }, [currentUser, isLoading]);
} 