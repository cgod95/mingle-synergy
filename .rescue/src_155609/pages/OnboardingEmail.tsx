import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";

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
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Mingle</h1>
      <p className="text-gray-600 mb-8">Let's get started with your profile</p>
      <button 
        onClick={handleContinue}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        Continue
      </button>
    </div>
  );
} 