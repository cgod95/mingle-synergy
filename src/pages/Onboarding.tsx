import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { MapPin, Bell, Check, Mail, ArrowLeft } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [locationRequesting, setLocationRequesting] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

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

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem('onboardingComplete', 'true');
      navigate('/create-profile');
    } catch (error: any) {
      console.error('Error signing up:', error);
      setAuthError(error.message);
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
      action: async () => {
        const permission = await notificationService.requestPermission();
        localStorage.setItem('notificationsEnabled', permission ? 'true' : 'false');
        setStep(step + 1);
      },
    },
    {
      title: 'Sign Up',
      description: 'Enter your email and create a password to get started.',
      icon: <Mail className="w-12 h-12 text-coral-500" />,
      content: (
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
          {authError && <p className="text-red-500 text-sm">{authError}</p>}
        </div>
      ),
      action: handleSignUp,
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-4">{currentStep.icon}</div>
        <h1 className="text-2xl font-bold mb-2">{currentStep.title}</h1>
        <p className="text-gray-600 mb-6">{currentStep.description}</p>

        {currentStep.content && <div className="mb-4">{currentStep.content}</div>}

        <Button onClick={currentStep.action} className="w-full bg-coral-500 text-white py-3">
          {step === steps.length - 1 ? 'Finish' : 'Continue'}
        </Button>

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