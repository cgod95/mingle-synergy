// 🧠 Purpose: Verification page with temporary bypass for development
// File: /src/pages/Verification.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PrivateLayout from '@/components/PrivateLayout';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import logger from '@/utils/Logger';

export default function Verification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerification = async () => {
    setIsVerifying(true);
    
    try {
      // Temporary bypass - always resolves true for development
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate verification process
      
      logger.info('Verification completed successfully');
      
      toast({
        title: "Verification Successful",
        description: "Your account has been verified successfully.",
      });
      
      // Navigate to main app
      navigate('/venues');
    } catch (error) {
      logger.error('Verification failed', error);
      
      toast({
        title: "Verification Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <PrivateLayout>
      <div className="flex items-center justify-center min-h-[80vh] pb-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Verify Your Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">
              Please verify your phone number or email to continue using Mingle.
            </p>
            <Button 
              className="w-full" 
              onClick={handleVerification}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify Account'}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Development mode: Verification always succeeds
            </p>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </PrivateLayout>
  );
}
