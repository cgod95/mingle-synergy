import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bell, Check, ArrowLeft, Heart, Users, Zap, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { motion, AnimatePresence } from 'framer-motion';
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
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/create-profile');
  };

  const getNotificationStepContent = () => {
    switch (notificationStatus) {
      case 'granted':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <div className="text-green-600 mb-2 font-semibold">✓ Notifications enabled</div>
            <p className="text-sm text-green-700">You'll receive notifications for matches and messages.</p>
          </motion.div>
        );
      case 'denied':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <div className="text-yellow-600 mb-2 font-semibold">⚠ Notifications disabled</div>
            <p className="text-sm text-yellow-700">You can enable notifications later in settings.</p>
          </motion.div>
        );
      case 'unsupported':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="text-gray-600 mb-2 font-semibold">📱 Notifications not supported</div>
            <p className="text-sm text-gray-700">Your browser doesn't support notifications.</p>
          </motion.div>
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
      title: 'Welcome to Mingle',
      subtitle: 'The Anti-Dating App',
      description: 'No more swiping. No more ghosting. Just real connections in real places.',
      icon: <Heart className="w-12 h-12 text-red-500" />,
      action: () => setStep(step + 1),
      features: [
        'Check into real venues',
        'See who\'s actually there',
        'Start meaningful conversations'
      ]
    },
    {
      title: 'Enable Location',
      subtitle: 'Find People Nearby',
      description: 'We use your location to show you people at venues near you.',
      icon: <MapPin className="w-12 h-12 text-blue-500" />,
      action: requestLocationWithTimeout,
      features: [
        'Discover venues around you',
        'See who\'s checked in',
        'Find people with similar interests'
      ]
    },
    {
      title: 'Enable Notifications',
      subtitle: 'Stay Connected',
      description: 'Get notified when someone likes you or when you match.',
      icon: <Bell className="w-12 h-12 text-green-500" />,
      action: handleNotificationPermission,
      features: [
        'Instant match notifications',
        'Message alerts',
        'Venue recommendations'
      ]
    },
  ];

  const currentStep = steps[step];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">Step {step + 1} of {steps.length}</span>
              <span className="text-sm text-slate-500">{Math.round(((step + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-6 pb-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Badge variant="secondary" className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 border-blue-200">
                  {currentStep.subtitle}
                </Badge>
              </motion.div>

              {/* Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex justify-center"
              >
                {currentStep.icon}
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  {currentStep.title}
                </CardTitle>
                <p className="text-slate-600 leading-relaxed">
                  {currentStep.description}
                </p>
              </motion.div>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="space-y-2"
              >
                {currentStep.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className="flex items-center text-sm text-slate-600"
                  >
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </motion.div>
                ))}
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <AnimatePresence mode="wait">
                {step === 2 && (
                  <motion.div
                    key="notification-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {getNotificationStepContent()}
                  </motion.div>
                )}
              </AnimatePresence>

              {step < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <Button
                    onClick={currentStep.action}
                    className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={step === 1 && locationRequesting}
                    size="lg"
                  >
                    {step === 1 && locationRequesting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Getting location...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <Button
                    variant="outline"
                    className="w-full border-2 hover:bg-slate-50"
                    onClick={handleComplete}
                    size="lg"
                  >
                    Skip for now
                  </Button>
                </motion.div>
              )}

              {step > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="mt-4 text-sm text-slate-500 flex items-center justify-center w-full hover:text-slate-700 transition-colors"
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </motion.button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Onboarding;