import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  MessageCircle, 
  Heart, 
  ArrowRight, 
  X, 
  CheckCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface QuickStartGuideProps {
  className?: string;
  variant?: 'modal' | 'inline';
  onClose?: () => void;
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ 
  className = '', 
  variant = 'inline',
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: "Check Into Venues",
      description: "Find and check into venues near you to see who's there",
      action: "Go to Venues",
      actionLink: "/checkin",
      demoInfo: "5 demo venues available"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Browse People",
      description: "See profiles of people who are checked in at the same venue",
      action: "View Venue",
      actionLink: "/checkin",
      demoInfo: "20+ mock users to explore"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Like & Match",
      description: "Like someone you're interested in. If they like you back, it's a match!",
      action: "Start Matching",
      actionLink: "/checkin",
      demoInfo: "Simulated matching system"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-violet-600" />,
      title: "Start Chatting",
      description: "Once matched, start a conversation and plan to meet in person",
      action: "View Matches",
      actionLink: "/matches",
      demoInfo: "Full chat simulation"
    }
  ];

  const currentStepData = steps[currentStep];

  if (variant === 'modal') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="shadow-2xl border-0">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Quick Start
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  How to Use Mingle
                </CardTitle>
                <p className="text-slate-600 text-sm">
                  Follow these steps to get the most out of your demo experience
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step Content */}
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-4"
                >
                  <div className="flex justify-center">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {currentStepData.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-3">
                      {currentStepData.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {currentStepData.demoInfo}
                    </Badge>
                  </div>
                </motion.div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Step {currentStep + 1} of {steps.length}</span>
                    <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="flex-1"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button asChild className="flex-1">
                      <Link to={currentStepData.actionLink}>
                        {currentStepData.action}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Skip */}
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full text-sm text-slate-500 hover:text-slate-700"
                >
                  Skip tutorial
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Inline variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full ${className}`}
    >
      <Card className="bg-gradient-to-r from-blue-50 to-violet-50 border-blue-200">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
            <CardTitle className="text-lg font-bold text-slate-900">
              Quick Start Guide
            </CardTitle>
          </div>
          <p className="text-slate-600 text-sm">
            Get started with Mingle in 4 simple steps
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`text-center p-3 rounded-lg transition-all cursor-pointer ${
                  currentStep === index 
                    ? 'bg-blue-100 border-2 border-blue-300' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="flex justify-center mb-2">
                  {step.icon}
                </div>
                <div className="text-xs font-medium text-slate-800 mb-1">
                  {step.title}
                </div>
                <div className="text-xs text-slate-600">
                  {step.description}
                </div>
                {currentStep === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-2 pt-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-slate-600">
              Click on any step to learn more
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickStartGuide; 