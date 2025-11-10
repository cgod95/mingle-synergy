import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, X, Sparkles, Users, MapPin, MessageCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDemoFreeWindow, formatDemoFreeRemaining } from '@/utils/demoFree';
import config from '@/config';

interface DemoModeIndicatorProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({ 
  className = '', 
  variant = 'compact' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [freeWindow, setFreeWindow] = useState(getDemoFreeWindow());

  useEffect(() => {
    if (!config.DEMO_MODE) return;

    // Update countdown every minute
    const interval = setInterval(() => {
      setFreeWindow(getDemoFreeWindow());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed top-4 right-4 z-50 ${className}`}
      >
        <Badge 
          variant="secondary" 
          className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 cursor-pointer transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Demo Mode
          {freeWindow.isActive && freeWindow.expiresAt && (
            <span className="ml-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDemoFreeRemaining(freeWindow)}
            </span>
          )}
        </Badge>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-80"
            >
              <Card className="shadow-lg border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-yellow-800 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Demo Mode Active
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                      className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm">
                    <p className="text-yellow-700">
                      You're experiencing Mingle in demo mode with simulated data.
                    </p>
                    
                    {freeWindow.isActive && freeWindow.expiresAt && (
                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                        <div className="flex items-center text-yellow-800 font-medium mb-1">
                          <Clock className="w-4 h-4 mr-2" />
                          Free Access Expires
                        </div>
                        <div className="text-yellow-700 text-xs">
                          {formatDemoFreeRemaining(freeWindow)} remaining
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-yellow-700">
                        <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>20+ mock users available</span>
                      </div>
                      <div className="flex items-center text-yellow-700">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>8 demo venues to explore</span>
                      </div>
                      <div className="flex items-center text-yellow-700">
                        <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Simulated matches & messages</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-yellow-200">
                      <p className="text-xs text-yellow-600">
                        <strong>Demo Credentials:</strong><br />
                        Email: test@example.com<br />
                        Password: password123
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Full variant for landing page or onboarding
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-2xl mx-auto ${className}`}
    >
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-yellow-600 mr-2" />
            <CardTitle className="text-xl font-bold text-yellow-800">
              Welcome to the Mingle Demo!
            </CardTitle>
          </div>
          <p className="text-yellow-700">
            Experience the anti-dating app with simulated data and features
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-slate-800">20+ Users</div>
              <div className="text-sm text-slate-600">Mock profiles to explore</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-slate-800">5 Venues</div>
              <div className="text-sm text-slate-600">Demo locations to check in</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-slate-800">Full Chat</div>
              <div className="text-sm text-slate-600">Simulated conversations</div>
            </div>
          </div>
          
          <div className="bg-white/70 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-600" />
              Quick Start Guide
            </h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                <span>Sign in with <code className="bg-slate-100 px-1 rounded text-xs">test@example.com</code> / <code className="bg-slate-100 px-1 rounded text-xs">password123</code></span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                <span>Complete your profile and preferences</span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                <span>Check into venues and start matching!</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-yellow-600">
              This is a demonstration of Mingle's core features. All data is simulated for demo purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DemoModeIndicator; 