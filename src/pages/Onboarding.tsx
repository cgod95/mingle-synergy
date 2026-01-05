import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services/notificationService';
import { Button } from '@/components/ui/button';
import { MapPin, Bell, ChevronRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import Layout from '@/components/Layout';
import config from '@/config';
import analytics from '@/services/appAnalytics';
import { logError } from '@/utils/errorHandler';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [locationRequesting, setLocationRequesting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied' | 'error'>('pending');
  const [notificationStatus, setNotificationStatus] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  const [startTime] = useState(Date.now());
  const navigate = useNavigate();
  const { setOnboardingStepComplete } = useOnboarding();

  const devBypass = config.DEMO_MODE || config.USE_MOCK;

  useEffect(() => {
    const hasStarted = localStorage.getItem('onboarding_started');
    if (!hasStarted) {
      analytics.track('onboarding_started', {
        step: 'location',
        timestamp: Date.now(),
      });
      localStorage.setItem('onboarding_started', 'true');
    }
    localStorage.setItem('onboarding_start_time', startTime.toString());
  }, [startTime]);

  useEffect(() => {
    if (step === 1) {
      if (!("Notification" in window)) {
        setNotificationStatus('unsupported');
      } else if (Notification.permission === "granted") {
        setNotificationStatus('granted');
      } else if (Notification.permission === "denied") {
        setNotificationStatus('denied');
      }
    }
  }, [step]);

  const requestLocation = () => {
    if (devBypass) {
      localStorage.setItem('locationEnabled', 'mock');
      setLocationStatus('granted');
      setTimeout(() => setStep(1), 800);
      return;
    }

    setLocationRequesting(true);
    setLocationStatus('pending');

    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationRequesting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem('locationEnabled', 'true');
        localStorage.setItem('latitude', position.coords.latitude.toString());
        localStorage.setItem('longitude', position.coords.longitude.toString());
        setLocationStatus('granted');
        setLocationRequesting(false);
        setTimeout(() => setStep(1), 800);
      },
      (error) => {
        setLocationRequesting(false);
        if (error.code === 1) {
          setLocationStatus('denied');
          localStorage.setItem('locationEnabled', 'denied');
        } else {
          setLocationStatus('error');
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
      setNotificationStatus('granted');
      setTimeout(handleComplete, 800);
      return;
    }

    try {
      const permission = await notificationService.requestPermission();
      localStorage.setItem('notificationsEnabled', permission === 'granted' ? 'true' : 'false');
      setNotificationStatus(permission === 'granted' ? 'granted' : 'denied');
      setTimeout(handleComplete, 800);
    } catch (error) {
      logError(error as Error, { context: 'Onboarding.handleNotificationPermission' });
      setNotificationStatus('denied');
      localStorage.setItem('notificationsEnabled', 'false');
      setTimeout(handleComplete, 800);
    }
  };

  const handleComplete = () => {
    setOnboardingStepComplete('email');
    localStorage.setItem('locationPermissionGranted', 'true');
    navigate('/create-profile');
  };

  const handleSkipNotifications = () => {
    localStorage.setItem('notificationsEnabled', 'false');
    handleComplete();
  };

  const handleContinueWithoutLocation = () => {
    localStorage.setItem('locationEnabled', 'denied');
    setStep(1);
  };

  const steps = [
    {
      id: 'location',
      icon: MapPin,
      title: "Enable Location",
      description: "Find venues near you and auto-detect where you are. You can also select venues manually.",
      action: requestLocation,
      actionLabel: "Enable Location",
      skipLabel: "Continue without",
      onSkip: handleContinueWithoutLocation,
    },
    {
      id: 'notifications',
      icon: Bell,
      title: "Stay in the loop",
      description: "Get notified when someone likes you or when you match. Don't miss a connection.",
      action: handleNotificationPermission,
      actionLabel: "Enable Notifications",
      skipLabel: "Maybe later",
      onSkip: handleSkipNotifications,
    },
  ];

  const currentStepData = steps[step];
  const IconComponent = currentStepData.icon;

  const getStatusIcon = () => {
    if (step === 0) {
      if (locationStatus === 'granted') return <CheckCircle className="w-5 h-5 text-green-400" />;
      if (locationStatus === 'denied' || locationStatus === 'error') return <AlertCircle className="w-5 h-5 text-amber-400" />;
    }
    if (step === 1) {
      if (notificationStatus === 'granted') return <CheckCircle className="w-5 h-5 text-green-400" />;
      if (notificationStatus === 'denied') return <AlertCircle className="w-5 h-5 text-amber-400" />;
    }
    return null;
  };

  const getStatusMessage = () => {
    if (step === 0) {
      if (locationStatus === 'granted') return "Location enabled! Finding venues near you...";
      if (locationStatus === 'denied') return "Location denied. You can still select venues manually.";
      if (locationStatus === 'error') return "Couldn't get location. You can select venues manually.";
    }
    if (step === 1) {
      if (notificationStatus === 'granted') return "Notifications enabled! You won't miss a match.";
      if (notificationStatus === 'denied') return "You can enable notifications later in settings.";
      if (notificationStatus === 'unsupported') return "Your browser doesn't support notifications.";
    }
    return null;
  };

  const showStatusMessage = (step === 0 && locationStatus !== 'pending') || 
                            (step === 1 && notificationStatus !== 'pending');

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.12)_0%,_transparent_50%)]" />
        
        {/* Progress indicator */}
        <div className="absolute top-6 left-0 right-0 z-20 px-6">
          <div className="max-w-md mx-auto flex gap-2">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  index <= step ? 'bg-[#7C3AED]' : 'bg-[#2D2D3A]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 py-20 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              {/* Card */}
              <div className="bg-[#111118] border border-[#2D2D3A] rounded-3xl p-8 shadow-2xl">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative mb-6"
                >
                  <div className="absolute inset-0 bg-[#7C3AED]/20 blur-2xl rounded-full scale-150" />
                  <div className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30">
                    <IconComponent className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold text-white text-center mb-3"
                >
                  {currentStepData.title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[#9CA3AF] text-center mb-8 leading-relaxed"
                >
                  {currentStepData.description}
                </motion.p>

                {/* Status message */}
                <AnimatePresence>
                  {showStatusMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <div className={`flex items-center gap-3 p-4 rounded-xl ${
                        (step === 0 && locationStatus === 'granted') || (step === 1 && notificationStatus === 'granted')
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-amber-500/10 border border-amber-500/20'
                      }`}>
                        {getStatusIcon()}
                        <p className="text-sm text-[#9CA3AF]">{getStatusMessage()}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action button */}
                {!showStatusMessage && (
                  <Button
                    onClick={currentStepData.action}
                    disabled={locationRequesting}
                    className="w-full py-6 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white rounded-xl font-semibold shadow-lg shadow-[#7C3AED]/25 transition-all disabled:opacity-50"
                  >
                    {locationRequesting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Requesting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {currentStepData.actionLabel}
                        <ChevronRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                )}

                {/* Continue after status */}
                {showStatusMessage && (
                  <Button
                    onClick={() => {
                      if (step === 0) setStep(1);
                      else handleComplete();
                    }}
                    className="w-full py-6 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white rounded-xl font-semibold shadow-lg shadow-[#7C3AED]/25"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </Button>
                )}

                {/* Skip button */}
                {!showStatusMessage && currentStepData.onSkip && (
                  <button
                    onClick={currentStepData.onSkip}
                    className="w-full mt-4 py-3 text-[#6B7280] hover:text-white text-sm font-medium transition-colors"
                  >
                    {currentStepData.skipLabel}
                  </button>
                )}
              </div>

              {/* Step indicator text */}
              <p className="text-center text-[#6B7280] text-sm mt-6">
                Step {step + 1} of {steps.length}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Onboarding;
