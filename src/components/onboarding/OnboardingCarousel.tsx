
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingCarouselProps {
  onComplete?: () => void;
}

const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const slides = [
    {
      title: "This isn't a dating app",
      description: "It's an anti-dating app that helps you meet people in real life, not just chat endlessly online.",
      icon: <MessageSquare className="h-16 w-16 text-brand-primary" />
    },
    {
      title: "Seize the moment",
      description: "When you match, you have just 3 hours to introduce yourself. No endless waiting - just real connections.",
      icon: <Clock className="h-16 w-16 text-brand-primary" />
    },
    {
      title: "Be in the same place",
      description: "We show you people who are at the same venue as you right now. No more guessing if they're really nearby.",
      icon: <MapPin className="h-16 w-16 text-brand-primary" />
    },
    {
      title: "Say hi in person",
      description: "The most powerful way to connect is face to face. We give you the courage to walk over and introduce yourself.",
      icon: <Users className="h-16 w-16 text-brand-primary" />
    }
  ];
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Last slide, complete onboarding and go to sign up
      if (onComplete) {
        onComplete();
      } else {
        localStorage.setItem('onboardingSeen', 'true');
      }
      navigate('/sign-up');
    }
  };
  
  const handleSkip = () => {
    // Skip onboarding, mark as seen and go to sign up
    if (onComplete) {
      onComplete();
    } else {
      localStorage.setItem('onboardingSeen', 'true');
    }
    navigate('/sign-up');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            {slides[currentSlide].icon}
          </div>
          
          <h1 className="text-2xl font-semibold text-text-primary mb-3">
            {slides[currentSlide].title}
          </h1>
          
          <p className="text-text-secondary mb-8 text-base leading-relaxed">
            {slides[currentSlide].description}
          </p>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full",
                  index === currentSlide ? "bg-brand-primary" : "bg-text-tertiary/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleNext}
            className="w-full py-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full font-medium text-base"
          >
            {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
          </Button>
          
          {currentSlide < slides.length - 1 && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full py-6 text-text-secondary font-medium text-base mt-4"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingCarousel;
