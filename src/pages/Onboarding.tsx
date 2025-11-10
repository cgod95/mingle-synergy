import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Bell, Check, ArrowLeft } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import Layout from '@/components/Layout';

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
      const permission = await notificationService.requestNotificationPermission();
      localStorage.setItem('notificationsEnabled', permission === 'granted' ? 'true' : 'false');
      
      if (permission === 'granted') {
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
    localStorage.setItem('locationPermissionGranted', 'true');
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/create-profile'); // Navigate to profile creation first
  };

  const getNotificationStepContent = () => {
    switch (notificationStatus) {
      case 'granted':
        return (
          <div className="text-center p-4">
            <div className="text-green-500 mb-2">✓ Notifications enabled</div>
            <p className="text-sm text-neutral-600">You'll receive notifications for matches and messages.</p>
          </div>
        );
      case 'denied':
        return (
          <div className="text-center p-4">
            <div className="text-yellow-500 mb-2">⚠ Notifications disabled</div>
            <p className="text-sm text-neutral-600">You can enable notifications later in settings.</p>
          </div>
        );
      case 'unsupported':
        return (
          <div className="text-center p-4">
            <div className="text-neutral-500 mb-2">📱 Notifications not supported</div>
            <p className="text-sm text-neutral-600">Your browser doesn't support notifications.</p>
          </div>
        );
      default:
        return (
          <div className="text-center p-4">
            <p className="text-sm text-neutral-600">We'll ask for permission to send you notifications.</p>
          </div>
        );
    }
  };

  const steps = [
    {
      title: 'Our Philosophy',
      description: 'Meet real people at real venues — not just another dating app.',
      icon: <Check className="w-12 h-12 text-indigo-600" />,
      action: () => setStep(step + 1),
    },
    {
      title: 'Enable Location',
      description: 'We use your location to show you people nearby in real venues.',
      icon: <MapPin className="w-12 h-12 text-purple-600" />,
      action: requestLocationWithTimeout,
    },
    {
      title: 'Enable Notifications',
      description: 'Get notified when someone likes you or when you match.',
      icon: <Bell className="w-12 h-12 text-pink-600" />,
      action: handleNotificationPermission,
    },
  ];

  const currentStep = steps[step];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-xl">
          <CardHeader className="text-center space-y-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                {currentStep.icon}
              </div>
            </motion.div>
            <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              {currentStep.title}
            </CardTitle>
            <p className="text-neutral-700">{currentStep.description}</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {step === 2 && getNotificationStepContent()}

            {step < steps.length - 1 && (
              <Button
                onClick={currentStep.action}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
                disabled={step === 1 && locationRequesting}
              >
                {step === 2 && notificationStatus === 'granted' ? 'Continue' : 'Continue'}
              </Button>
            )}

            {step === 2 && (
              <Button
                variant="outline"
                className="w-full border-2 border-indigo-200 hover:bg-indigo-50"
                onClick={handleComplete}
              >
                Skip for now
              </Button>
            )}

            {step > 0 && (
              <button
                className="mt-4 text-sm text-neutral-600 flex items-center justify-center w-full"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={16} className="mr-1" /> Back
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Onboarding;