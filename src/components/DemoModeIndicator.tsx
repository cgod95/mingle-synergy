import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, X, Sparkles, Users, MapPin, MessageCircle, Clock } from 'lucide-react';
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
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <Badge 
          variant="secondary" 
          className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 cursor-pointer transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Closed Beta
          {freeWindow.isActive && freeWindow.expiresAt && (
            <span className="ml-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDemoFreeRemaining(freeWindow)}
            </span>
          )}
        </Badge>
        
        {isExpanded && (
          <div className="absolute top-full right-0 mt-2 w-80">
              <Card className="shadow-lg border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-yellow-800 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Closed Beta
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
                      You're experiencing Mingle in closed beta with real users and venues.
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
                        <span>Real users connecting</span>
                      </div>
                      <div className="flex items-center text-yellow-700">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Real venues to explore</span>
                      </div>
                      <div className="flex items-center text-yellow-700">
                        <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Real matches & conversations</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>
        )}
      </div>
    );
  }

  // Full variant for landing page or onboarding
  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-yellow-600 mr-2" />
            <CardTitle className="text-xl font-bold text-yellow-800">
              Welcome to Mingle Closed Beta!
            </CardTitle>
          </div>
          <p className="text-yellow-700">
            Experience the anti-dating app with real users and venues
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-slate-800">Real Users</div>
              <div className="text-sm text-slate-600">Connect with real people</div>
            </div>
            <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
              <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-slate-800">Real Venues</div>
              <div className="text-sm text-slate-600">Check in at real locations</div>
            </div>
            <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
              <MessageCircle className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-slate-800">Real Chat</div>
              <div className="text-sm text-slate-600">Real conversations</div>
            </div>
          </div>
          
          <div className="bg-neutral-800/80 rounded-lg p-4 border border-yellow-700/50">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-600" />
              Quick Start Guide
            </h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                <span>Create your account and complete your profile</span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                <span>Set your preferences and upload photos</span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                <span>Check into venues and start matching with real people!</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-yellow-600">
              This is a closed beta of Mingle. You're connecting with real users at real venues.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoModeIndicator; 