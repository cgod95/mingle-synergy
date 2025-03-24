
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useToast } from "@/components/ui/use-toast";
import services from '@/services';
import { useAppState } from '@/context/AppStateContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import VerificationStep from '@/components/verification/VerificationStep';
import { User } from '@/types';

const Verification = () => {
  const { currentUser } = useAppState();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/sign-in');
    }
  }, [currentUser, navigate]);
  
  const handleVerificationComplete = () => {
    setVerificationComplete(true);
    toast({
      title: "Verification submitted",
      description: "Your verification has been submitted successfully."
    });
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Verification" />
      
      <div className="flex-1 flex flex-col">
        {verificationComplete ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Verification Submitted</h1>
            <p className="text-muted-foreground text-center mb-8">
              Thank you for verifying your identity. We'll review your submission shortly.
            </p>
            
            <p className="text-sm text-muted-foreground">Redirecting you to the home page...</p>
          </div>
        ) : currentUser ? (
          <VerificationStep
            currentUser={currentUser as User}
            onComplete={handleVerificationComplete}
            onBack={handleBack}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;
