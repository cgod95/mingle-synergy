import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { DemoExperience } from "@/components/DemoExperience";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser: user, isLoading: loading } = useAuth();
  const { isOnboardingComplete } = useOnboarding();

  useEffect(() => {
    if (loading) return;
    if (user && isOnboardingComplete) {
      navigate("/venues");
    } else if (user && !isOnboardingComplete) {
      navigate("/create-profile");
    }
  }, [user, isOnboardingComplete, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-lg text-gray-500 font-inter">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mingle-background font-inter">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-8"
      >
        <DemoExperience variant="landing" />
      </motion.div>
    </div>
  );
} 