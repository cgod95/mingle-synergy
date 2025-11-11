import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Users, 
  MapPin, 
  MessageCircle, 
  Heart, 
  ArrowRight,
  Info,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemoExperienceProps {
  variant?: 'landing' | 'onboarding' | 'compact' | 'full';
  onAction?: () => void;
}

export const DemoExperience: React.FC<DemoExperienceProps> = ({ 
  variant = 'full',
  onAction 
}) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: "Check Into Venues",
      description: "Find and check into venues near you to see who's there",
      demoInfo: "5 demo venues available",
      color: "blue"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Browse People",
      description: "See profiles of people who are checked in at the same venue",
      demoInfo: "20+ mock users to explore",
      color: "green"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Like & Match",
      description: "Like someone you're interested in. If they like you back, it's a match!",
      demoInfo: "Simulated matching system",
      color: "red"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-600" />,
      title: "Start Chatting",
      description: "Once matched, start a conversation and plan to meet in person",
      demoInfo: "Full chat simulation",
      color: "purple"
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, features.length]);

  const handleGetStarted = () => {
    if (onAction) {
      onAction();
    } else {
      navigate('/onboarding');
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50"
      >
        <Badge 
          variant="secondary" 
          className="bg-gradient-to-r from-gray-100 to-blue-100 text-blue-800 border-gray-200 hover:from-gray-200 hover:to-blue-200 cursor-pointer transition-all duration-300 shadow-lg"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
          Demo Mode
        </Badge>
        
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full right-0 mt-2 w-80"
            >
              <Card className="shadow-2xl border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-800 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Live Demo
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPlaying(false)}
                      className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3 text-sm"
                  >
                    <div className="flex items-center text-gray-700">
                      {features[currentFeature].icon}
                      <div className="ml-3">
                        <div className="font-semibold">{features[currentFeature].title}</div>
                        <div className="text-xs opacity-75">{features[currentFeature].demoInfo}</div>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (variant === 'landing') {
    return (
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="py-16 bg-gradient-to-r from-gray-50 via-blue-50 to-blue-100"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto"
          >
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="flex items-center justify-center mb-4"
                >
                  <div className="p-3 bg-gray-100 rounded-full mr-3">
                    <Sparkles className="w-8 h-8 text-gray-600" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-800">
                    Experience Mingle Demo
                  </CardTitle>
                </motion.div>
                <p className="text-gray-700 text-lg">
                  Try the anti-dating app with simulated data and features
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-center p-4 bg-white/70 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-center mb-3">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-3">
                        {feature.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {feature.demoInfo}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                
                <div className="bg-white/70 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                    Quick Start Guide
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-700">
                    <div className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                      <span>Sign in with <code className="bg-slate-100 px-2 py-1 rounded text-xs">test@example.com</code> / <code className="bg-slate-100 px-2 py-1 rounded text-xs">password123</code></span>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                      <span>Complete your profile and preferences</span>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                      <span>Check into venues and start matching!</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Demo Experience
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-xs text-gray-600 mt-4">
                    This is a demonstration of Mingle's core features. All data is simulated for demo purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>
    );
  }

  // Full variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex items-center justify-center mb-4"
          >
            <div className="p-3 bg-gray-100 rounded-full mr-3">
              <Sparkles className="w-8 h-8 text-gray-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Welcome to the Mingle Demo!
            </CardTitle>
          </motion.div>
          <p className="text-gray-700 text-lg">
            Experience the anti-dating app with simulated data and features
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center p-4 bg-white/70 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-center mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {feature.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  {feature.demoInfo}
                </Badge>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-white/70 rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              Quick Start Guide
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-700">
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <span>Sign in with <code className="bg-slate-100 px-2 py-1 rounded text-xs">test@example.com</code> / <code className="bg-slate-100 px-2 py-1 rounded text-xs">password123</code></span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <span>Complete your profile and preferences</span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <span>Check into venues and start matching!</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Demo Experience
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-gray-600 mt-4">
              This is a demonstration of Mingle's core features. All data is simulated for demo purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DemoExperience; 