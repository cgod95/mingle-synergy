
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { Button } from '@/components/ui/button';
import { MapPin, Bell, Check } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [locationRequesting, setLocationRequesting] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const navigate = useNavigate();
  
  // Add timeout effect to detect stuck permission dialogs
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (step === 1 && locationRequesting) {
      // If the permission request gets stuck for more than 15 seconds
      timeoutId = setTimeout(() => {
        setLocationRequesting(false);
        setLocationError(true);
      }, 15000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [step, locationRequesting]);
  
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
        setLocationDenied(false);
        
        // Check if the browser supports geolocation
        if (!navigator.geolocation) {
          // If geolocation is not supported, allow moving forward anyway in development
          if (process.env.NODE_ENV === 'development') {
            localStorage.setItem('locationEnabled', 'mock');
            setLocationRequesting(false);
            setStep(2);
          } else {
            setLocationRequesting(false);
            setLocationError(true);
          }
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Success
            localStorage.setItem('locationEnabled', 'true');
            localStorage.setItem('latitude', position.coords.latitude.toString());
            localStorage.setItem('longitude', position.coords.longitude.toString());
            setLocationRequesting(false);
            setStep(2); // Move to next step
          },
          (error) => {
            // Error/Denied
            console.error('Location error:', error);
            setLocationRequesting(false);
            
            if (error.code === 1) { // PERMISSION_DENIED
              setLocationDenied(true);
            } else {
              setLocationError(true);
            }
            
            // In development mode, allow proceeding anyway
            if (process.env.NODE_ENV === 'development') {
              localStorage.setItem('locationEnabled', 'mock');
            }
          },
          { timeout: 10000, maximumAge: 60000 }
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
    <div className="flex flex-col min-h-screen bg-white p-6 items-center justify-center relative">
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
            
            {locationDenied && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm border border-red-100 mb-4">
                <p className="font-medium text-red-700">Location access denied</p>
                <p className="mt-1 text-sm text-red-600">
                  Mingle requires location access to function properly. Please enable location in your browser settings.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => {
                      localStorage.setItem('locationEnabled', 'mock');
                      setStep(2);
                    }}
                    className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-xs"
                  >
                    Continue anyway (Development only)
                  </button>
                )}
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
            
            {locationRequesting && (
              <div className="mt-4 text-center mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Having trouble? If the permission dialog doesn't appear:
                </p>
                <button
                  onClick={() => {
                    setLocationRequesting(false);
                    setLocationError(false);
                    setLocationDenied(false);
                    // Wait a moment before trying again
                    setTimeout(() => currentStep.action(), 500);
                  }}
                  className="px-4 py-2 text-sm bg-gray-200 rounded-lg"
                >
                  Try Again
                </button>
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
