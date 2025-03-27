
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { Button } from '@/components/ui/button';
import { MapPin, Bell, Check } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [locationRequesting, setLocationRequesting] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const navigate = useNavigate();
  
  const steps = [
    {
      title: "Welcome to Mingle",
      description: "Connect with people in real venues, in real time.",
      icon: <Check className="w-12 h-12 text-coral-500" />,
      action: () => setStep(1)
    },
    {
      title: "Enable Location",
      description: "Mingle needs your location to find venues and people near you.",
      icon: <MapPin className="w-12 h-12 text-coral-500" />,
      action: () => {
        setLocationRequesting(true);
        setLocationError(false);
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            localStorage.setItem('locationEnabled', 'true');
            setLocationRequesting(false);
            setStep(2);
          }, 
          (error) => {
            console.error('Location error:', error);
            setLocationRequesting(false);
            setLocationError(true);
            
            // Don't block progression in development mode
            if (process.env.NODE_ENV === 'development') {
              localStorage.setItem('locationEnabled', 'mock');
            }
          },
          { timeout: 10000 }
        );
      }
    },
    {
      title: "Enable Notifications",
      description: "Get notified when you match with someone or receive a message.",
      icon: <Bell className="w-12 h-12 text-coral-500" />,
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
      description: "Now let's start meeting people at venues.",
      icon: <Check className="w-12 h-12 text-coral-500" />,
      action: () => {
        localStorage.setItem('onboardingComplete', 'true');
        localStorage.setItem('onboardingSeen', 'true');
        navigate('/venues');
      }
    }
  ];
  
  const currentStep = steps[step];
  
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          {currentStep.icon}
        </div>
        
        <h1 className="text-2xl font-bold mb-4">{currentStep.title}</h1>
        <p className="text-gray-600 mb-8">{currentStep.description}</p>
        
        {step === 1 && (
          <>
            {locationRequesting && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm mb-4">
                <p>Please allow location access when prompted</p>
              </div>
            )}
            
            {locationError && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm mb-4">
                <p className="text-red-700 font-medium">Location access is needed to use Mingle</p>
                <p className="mt-1 text-xs text-red-600">
                  In development mode, click Continue to proceed anyway
                </p>
              </div>
            )}
          </>
        )}
        
        <Button 
          onClick={currentStep.action}
          className="w-full py-3 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-medium"
        >
          {step === steps.length - 1 ? 'Get Started' : 'Continue'}
        </Button>
        
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
