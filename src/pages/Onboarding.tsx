
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingCarousel from '@/components/onboarding/OnboardingCarousel';
import LocationPermission from '@/components/onboarding/LocationPermission';
import PageTransition from '@/components/ui/PageTransition';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<'carousel' | 'location'>('carousel');
  const navigate = useNavigate();
  
  const handleCarouselComplete = () => {
    setCurrentStep('location');
  };
  
  const handleLocationComplete = () => {
    // Mark onboarding as complete
    localStorage.setItem('onboardingComplete', 'true');
    // Navigate to venues page or another appropriate page
    navigate('/venues');
  };
  
  return (
    <div className="min-h-screen bg-bg-primary">
      <PageTransition>
        {currentStep === 'carousel' && (
          <OnboardingCarousel onComplete={handleCarouselComplete} />
        )}
        
        {currentStep === 'location' && (
          <LocationPermission 
            onComplete={handleLocationComplete}
            onSkip={handleLocationComplete}
          />
        )}
      </PageTransition>
    </div>
  );
};

export default Onboarding;
