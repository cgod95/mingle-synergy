import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useOnboarding } from '@/context/OnboardingContext';

interface OnboardingCarouselProps {
  onComplete?: () => void;
}

const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { setOnboardingStepComplete } = useOnboarding();
  
  const slides = [
    {
      title: "This isn't a dating app",
      subtitle: "It's better.",
      description: "An anti-dating app that helps you meet people in real life, not just chat endlessly online.",
      icon: MessageSquare,
      gradient: "from-[#7C3AED] to-[#6D28D9]",
      bgGlow: "bg-[#7C3AED]/20"
    },
    {
      title: "Seize the moment",
      subtitle: "Matches expire.",
      description: "When you match, introduce yourself! Don't wait — make real connections happen now.",
      icon: Clock,
      gradient: "from-[#8B5CF6] to-[#7C3AED]",
      bgGlow: "bg-[#8B5CF6]/20"
    },
    {
      title: "Same place, same time",
      subtitle: "Actually nearby.",
      description: "See people at the same venue as you, right now. No more guessing if they're really there.",
      icon: MapPin,
      gradient: "from-[#A78BFA] to-[#8B5CF6]",
      bgGlow: "bg-[#A78BFA]/20"
    },
    {
      title: "Say hi in person",
      subtitle: "The real connection.",
      description: "The most powerful way to connect is face to face. Walk over and introduce yourself.",
      icon: Users,
      gradient: "from-[#7C3AED] to-[#6D28D9]",
      bgGlow: "bg-[#7C3AED]/20"
    }
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
    setOnboardingStepComplete('email');
    setOnboardingStepComplete('profile');
    setOnboardingStepComplete('photo');
    
    if (onComplete) {
      onComplete();
    } else {
      navigate('/profile/edit');
    }
  };

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] overflow-hidden relative">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15)_0%,_transparent_50%)]" />
      
      {/* Skip button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleSkip}
          className="text-[#6B7280] hover:text-white text-sm font-medium transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-md mx-auto text-center"
          >
            {/* Icon with glow */}
            <motion.div 
              className="relative mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {/* Glow background */}
              <div className={`absolute inset-0 ${currentSlideData.bgGlow} blur-3xl rounded-full scale-150`} />
              
              {/* Icon container */}
              <div className={`relative w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${currentSlideData.gradient} flex items-center justify-center shadow-2xl shadow-[#7C3AED]/30`}>
                <IconComponent className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
            </motion.div>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#A78BFA] text-sm font-semibold uppercase tracking-wider mb-3"
            >
              {currentSlideData.subtitle}
            </motion.p>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
            >
              {currentSlideData.title}
            </motion.h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[#9CA3AF] text-lg leading-relaxed max-w-sm mx-auto"
            >
              {currentSlideData.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Bottom section */}
      <div className="p-6 pb-10 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-[#7C3AED]' 
                    : 'w-2 bg-[#2D2D3A] hover:bg-[#3D3D4A]'
                }`}
              />
            ))}
          </div>
          
          {/* Next button */}
          <Button
            onClick={handleNext}
            className="w-full py-6 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white rounded-2xl font-semibold text-base shadow-lg shadow-[#7C3AED]/25 transition-all hover:shadow-[#7C3AED]/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              {currentSlide < slides.length - 1 ? 'Continue' : 'Get Started'}
              <ChevronRight className="w-5 h-5" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCarousel;
