import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services/notificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Bell, ArrowLeft } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import Layout from '@/components/Layout';
import config from '@/config';
import analytics from '@/services/appAnalytics';
import { logError } from '@/utils/errorHandler';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [locationRequesting, setLocationRequesting] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  const [startTime] = useState(Date.now());
  const navigate = useNavigate();
  const { setOnboardingStepComplete } = useOnboarding();

  const devBypass = config.DEMO_MODE || config.USE_MOCK;

  // Track onboarding started/resumed
  useEffect(() => {
    const hasStarted = localStorage.getItem('onboarding_started');
    if (!hasStarted) {
      analytics.track('onboarding_started', {
        step: 'location',
        timestamp: Date.now(),
      });
      localStorage.setItem('onboarding_started', 'true');
    } else {
      // User is resuming onboarding
      const lastStep = localStorage.getItem('onboarding_last_step') || '0';
      analytics.track('onboarding_resumed', {
        last_completed_step: lastStep,
        time_since_start: Date.now() - parseInt(localStorage.getItem('onboarding_start_time') || '0'),
      });
    }
    localStorage.setItem('onboarding_start_time', startTime.toString());
  }, [startTime]);

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
          // Permission denied - allow user to continue with manual venue selection
          setLocationDenied(true);
          localStorage.setItem('locationEnabled', 'denied');
          localStorage.setItem('locationPermissionGranted', 'false');
          // Allow user to continue - they can select venues manually
          setTimeout(() => {
            setStep(2); // Continue to notifications step
          }, 1500);
        } else {
          // Other error (timeout, etc.) - allow retry or continue
          setLocationError(true);
          localStorage.setItem('locationEnabled', 'error');
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
      logError(error as Error, { context: 'Onboarding.handleNotificationPermission' });
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
    localStorage.setItem('onboarding_last_step', 'onboarding');
    navigate('/create-profile'); // Navigate to profile creation first
  };

  const handleSkip = () => {
    // Skip notifications step
    localStorage.setItem('notificationsEnabled', 'false');
    localStorage.setItem('onboarding_last_step', 'notifications_skipped');
    handleComplete();
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
      title: 'Enable Location',
      description: 'We use your location to show you venues nearby and auto-detect where you are.',
      icon: <MapPin className="w-12 h-12 text-indigo-600" />,
      action: requestLocationWithTimeout,
      canSkip: false,
    },
    {
      title: 'Enable Notifications',
      description: 'Get notified when someone likes you or when you match.',
      icon: <Bell className="w-12 h-12 text-indigo-600" />,
      action: handleNotificationPermission,
      canSkip: true,
    },
  ];

  const currentStep = steps[step];

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen min-h-[100dvh] bg-neutral-900 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className="w-full border-2 border-neutral-700 bg-neutral-800 shadow-xl">
              <CardHeader className="text-center space-y-4 border-b border-neutral-700">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center"
                >
                  <div className="p-4 rounded-full bg-indigo-900/50">
                    {currentStep.icon}
                  </div>
                </motion.div>
                <CardTitle className="text-heading-2">
                  {currentStep.title}
                </CardTitle>
                <p className="text-neutral-400">{currentStep.description}</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {step === 1 && locationDenied && (
                  <div className="text-center p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <div className="text-yellow-400 mb-2">Location access denied</div>
                    <p className="text-sm text-neutral-400">You can still use Mingle by selecting venues manually.</p>
                  </div>
                )}
                
                {step === 1 && locationError && !locationDenied && (
                  <div className="text-center p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                    <div className="text-red-400 mb-2">Location error</div>
                    <p className="text-sm text-neutral-400">Unable to get your location. You can select venues manually.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={requestLocationWithTimeout}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
                
                {step === 2 && getNotificationStepContent()}

                {step < steps.length - 1 && (
                  <Button
                    onClick={currentStep.action}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                    disabled={step === 1 && locationRequesting}
                  >
                    {step === 1 && (locationDenied || locationError) ? 'Continue Anyway' : 
                     step === 2 && notificationStatus === 'granted' ? 'Continue' : 'Continue'}
                  </Button>
                )}
                
                {step === 1 && (locationDenied || locationError) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLocationDenied(false);
                      setLocationError(false);
                      setStep(2);
                    }}
                    className="w-full border-2 border-neutral-600 hover:bg-neutral-700 text-neutral-300"
                  >
                    Continue Without Location
                  </Button>
                )}

                {step === 2 && currentStep.canSkip && (
                  <Button
                    variant="outline"
                    className="w-full border-2 border-neutral-600 hover:bg-neutral-700 text-neutral-300"
                    onClick={handleSkip}
                  >
                    Skip for now
                  </Button>
                )}

                {step > 0 && (
                  <button
                    className="mt-4 text-sm text-neutral-400 flex items-center justify-center w-full hover:text-indigo-400 transition-colors min-h-[44px]"
                    onClick={() => {
                      localStorage.setItem('onboarding_last_step', (step - 1).toString());
                      setStep(step - 1);
                    }}
                  >
                    <ArrowLeft size={16} className="mr-1" /> Back
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Onboarding;