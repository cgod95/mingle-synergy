import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { motion } from "framer-motion";

export default function OnboardingEmail() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { nextStep } = useOnboarding();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-sm"
      >
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Welcome to Mingle
        </h1>
        <p className="text-neutral-300 mb-8">Let's get started with your profile</p>
        <button 
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-all"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
} 