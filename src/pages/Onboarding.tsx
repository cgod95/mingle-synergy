
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  
  const steps = [
    {
      title: "Welcome to Mingle",
      description: "Connect with people in real venues, in real time.",
      action: () => setStep(1)
    },
    {
      title: "Enable Location",
      description: "Mingle needs your location to find venues and people near you.",
      action: () => {
        navigator.geolocation.getCurrentPosition(
          () => {
            localStorage.setItem('locationEnabled', 'true');
            setStep(2);
          }, 
          () => {
            alert('Location access is required for Mingle to work properly');
          }
        );
      }
    },
    {
      title: "Enable Notifications",
      description: "Get notified when you match with someone or receive a message.",
      action: async () => {
        if ('Notification' in window) {
          const permission = await notificationService.requestPermission();
          localStorage.setItem('notificationsEnabled', permission ? 'true' : 'false');
        }
        setStep(3);
      }
    },
    {
      title: "You're All Set!",
      description: "Now let's create your profile to start meeting people.",
      action: () => {
        localStorage.setItem('onboardingComplete', 'true');
        navigate('/profile/edit');
      }
    }
  ];
  
  const currentStep = steps[step];
  
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 items-center justify-center">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">{currentStep.title}</h1>
        <p className="text-gray-600 mb-8">{currentStep.description}</p>
        
        <button 
          onClick={currentStep.action}
          className="w-full py-3 bg-coral-500 text-white rounded-lg font-medium"
        >
          {step === steps.length - 1 ? 'Complete' : 'Continue'}
        </button>
        
        <div className="flex justify-center mt-8 space-x-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-2 rounded-full ${i === step ? 'bg-coral-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
