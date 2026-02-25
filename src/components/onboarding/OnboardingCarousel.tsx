import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Heart, Users, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface OnboardingCarouselProps {
  onComplete?: () => void;
}

const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  
  const slides = [
    {
      step: '01',
      title: "Check in",
      description: "Walk into a venue. Scan the QR code or tap to check in. We confirm you're actually there.",
      icon: <QrCode className="h-14 w-14 text-violet-400" />,
    },
    {
      step: '02',
      title: "Match",
      description: "See who else is here. Like someone? If they like you back, you're matched.",
      icon: <Heart className="h-14 w-14 text-violet-400" />,
    },
    {
      step: '03',
      title: "Meet",
      description: "You're in the same place. Skip the small talk over text. Go meet them.",
      icon: <Users className="h-14 w-14 text-violet-400" />,
    },
    {
      step: '04',
      title: "The rules",
      description: "Matches expire in 24 hours. You get 10 messages each. No algorithm — you see everyone at the venue.",
      icon: <ShieldCheck className="h-14 w-14 text-violet-400" />,
    },
  ];
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleSkip = () => {
    handleComplete();
  };
  
  const handleComplete = () => {
    localStorage.setItem('onboardingSeen', 'true');
    
    if (onComplete) {
      onComplete();
    } else {
      navigate('/create-profile', { replace: true });
    }
  };
  
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-neutral-900">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="max-w-md mx-auto w-full text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: -40 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            >
              <div className="flex justify-center mb-3">
                <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">
                  {slides[currentSlide].step}
                </span>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-2xl bg-violet-600/15 flex items-center justify-center">
                  {slides[currentSlide].icon}
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-3">
                {slides[currentSlide].title}
              </h1>
              
              <p className="text-neutral-300 text-base leading-relaxed max-w-xs mx-auto">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-center space-x-2 mt-10">
            {slides.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentSlide 
                    ? "bg-violet-500 w-6" 
                    : "bg-neutral-700 w-1.5"
                )}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-md mx-auto space-y-3">
          <Button
            onClick={handleNext}
            className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-semibold text-base"
          >
            {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
          </Button>
          
          {currentSlide < slides.length - 1 && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full h-12 text-neutral-400 hover:text-neutral-200 font-medium text-base"
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
