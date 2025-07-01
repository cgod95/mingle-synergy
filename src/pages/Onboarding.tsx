import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { Button } from '@/components/ui/button';
import { MapPin, Bell, Check, ArrowLeft } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [locationRequesting, setLocationRequesting] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  const navigate = useNavigate();
  const { setOnboardingStepComplete } = useOnboarding();

  const devBypass = true;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (step === 1 && locationRequesting) {
      timeoutId = setTimeout(() => {
        setLocationRequesting(false);
        setLocationError(true);
      }, 15000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [step, locationRequesting]);

  // Check notification permission status when reaching notification step
  useEffect(() => {
    if (step === 2) {
      if (!("Notification" in window)) {
        setNotificationStatus('unsupported');
      } else if (Notification.permission === "granted") {
        setNotificationStatus('granted');
      } else if (Notification.permission === "denied") {
        setNotificationStatus('denied');
      } else {
        setNotificationStatus('pending');
      }
    }
  }, [step]);

  const requestLocationWithTimeout = () => {
    if (devBypass) {
      localStorage.setItem('locationEnabled', 'mock');
      setStep(2);
      return;
    }

    setLocationRequesting(true);
    setLocationError(false);
    setLocationDenied(false);

    if (!navigator.geolocation) {
      setLocationRequesting(false);
      setLocationError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem('locationEnabled', 'true');
        localStorage.setItem('latitude', position.coords.latitude.toString());
        localStorage.setItem('longitude', position.coords.longitude.toString());
        setLocationRequesting(false);
        setStep(2);
      },
      (error) => {
        setLocationRequesting(false);
        if (error.code === 1) {
          setLocationDenied(true);
        } else {
          setLocationError(true);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleNotificationPermission = async () => {
    if (devBypass) {
      localStorage.setItem('notificationsEnabled', 'true');
      handleComplete();
      return;
    }

    try {
      const permission = await notificationService.requestPermission();
      localStorage.setItem('notificationsEnabled', permission ? 'true' : 'false');
      
      if (permission) {
        setNotificationStatus('granted');
      } else {
        setNotificationStatus('denied');
      }
      
      // Continue regardless of permission result
      setTimeout(() => {
        handleComplete();
      }, 1000);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setNotificationStatus('denied');
      localStorage.setItem('notificationsEnabled', 'false');
      
      // Continue anyway
      setTimeout(() => {
        handleComplete();
      }, 1000);
    }
  };

  const handleComplete = () => {
    setOnboardingStepComplete('email');
    navigate('/create-profile');
  };

  const getNotificationStepContent = () => {
    switch (notificationStatus) {
      case 'granted':
        return (
          <div className="text-center p-4">
            <div className="text-green-500 mb-2">✓ Notifications enabled</div>
            <p className="text-sm text-gray-600">You'll receive notifications for matches and messages.</p>
          </div>
        );
      case 'denied':
        return (
          <div className="text-center p-4">
            <div className="text-yellow-500 mb-2">⚠ Notifications disabled</div>
            <p className="text-sm text-gray-600">You can enable notifications later in settings.</p>
          </div>
        );
      case 'unsupported':
        return (
          <div className="text-center p-4">
            <div className="text-gray-500 mb-2">📱 Notifications not supported</div>
            <p className="text-sm text-gray-600">Your browser doesn't support notifications.</p>
          </div>
        );
      default:
        return (
          <div className="text-center p-4">
            <p className="text-sm text-gray-600">We'll ask for permission to send you notifications.</p>
          </div>
        );
    }
  };

  const steps = [
    {
      title: 'Our Philosophy',
      description: 'Meet real people at real venues — not just another dating app.',
      icon: <Check className="w-12 h-12 text-coral-500" />,
      action: () => setStep(step + 1),
    },
    {
      title: 'Enable Location',
      description: 'We use your location to show you people nearby in real venues.',
      icon: <MapPin className="w-12 h-12 text-coral-500" />,
      action: requestLocationWithTimeout,
    },
    {
      title: 'Enable Notifications',
      description: 'Get notified when someone likes you or when you match.',
      icon: <Bell className="w-12 h-12 text-coral-500" />,
      action: handleNotificationPermission,
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-white to-gray-100 p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-4">{currentStep.icon}</div>
        <h1 className="text-2xl font-bold mb-2">{currentStep.title}</h1>
        <p className="text-gray-600 mb-6">{currentStep.description}</p>

        {step === 2 && getNotificationStepContent()}

        {step < steps.length - 1 && (
          <Button
            onClick={currentStep.action}
            className="w-full bg-coral-500 text-white py-3"
            disabled={step === 1 && locationRequesting}
          >
            {step === 2 && notificationStatus === 'granted' ? 'Continue' : 'Continue'}
          </Button>
        )}

        {step === 2 && (
          <button
            className="w-full mt-4 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold bg-white hover:bg-gray-100"
            onClick={handleComplete}
          >
            Skip for now
          </button>
        )}

        {step > 0 && (
          <button
            className="mt-4 text-sm text-gray-500 flex items-center justify-center"
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;