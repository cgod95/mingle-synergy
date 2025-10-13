import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import logger from '@/utils/Logger';

export default function OnboardingPreferences() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { nextStep, prevStep, setStepComplete } = useOnboarding();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleFinish = async () => {
    try {
      await setStepComplete('preferences');
      await nextStep(); // This will complete onboarding and navigate to /venues
    } catch (error) {
      logger.error('Error completing preferences step:', error);
    }
  };

  const handleBack = () => {
    prevStep();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">Set Your Preferences</h1>
      <p className="text-gray-600 mb-8">Tell us what you're looking for</p>
      <div className="flex gap-4">
        <button 
          onClick={handleBack}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
        >
          Back
        </button>
        <button 
          onClick={handleFinish}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
        >
          Finish Onboarding
        </button>
      </div>
    </div>
  );
} 