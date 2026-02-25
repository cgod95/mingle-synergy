import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logger from "@/utils/Logger";

export default function OnboardingPhoto() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { completeStep, getCurrentStep } = useOnboarding();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Check if user has completed previous step
    const currentStep = getCurrentStep();
    if (currentStep && currentStep !== 'photo') {
      // Redirect to appropriate step
      if (currentStep === 'profile') {
        navigate('/create-profile');
      } else {
        navigate('/checkin');
      }
    }
  }, [currentUser, navigate, getCurrentStep]);

  const handlePhotoUpload = async () => {
    setIsUploading(true);
    
    try {
      // Simulate photo upload process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Complete the photos step
      await completeStep('photos');
      
      logger.info('Photo upload step completed');
      
      toast({
        title: "Photos Uploaded",
        description: "Your photos have been uploaded successfully.",
      });
      
      // Navigate to next step
      navigate('/checkin');
    } catch (error) {
      logger.error('Photo upload failed', error);
      
      toast({
        title: "Upload Failed",
        description: "Please try uploading your photos again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    navigate('/create-profile');
  };

  const handleSkip = async () => {
    try {
      // Complete step even if skipped
      await completeStep('photos');
      navigate('/checkin');
    } catch (error) {
      logger.error('Failed to skip photo step', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start pt-[12vh] min-h-screen min-h-[100dvh] bg-neutral-900 px-4 text-center">
      <Card className="w-full max-w-md bg-neutral-800 shadow-xl">
        <CardHeader className="text-center space-y-2 border-b border-neutral-700">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-violet-500 to-pink-500 bg-clip-text text-transparent">
            Upload Your Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-neutral-300 mb-6">
            Add some photos to your profile to help others get to know you better.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handlePhotoUpload}
              disabled={isUploading}
              className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-2xl"
            >
              {isUploading ? 'Uploading...' : 'Upload Photos'}
            </Button>
            
            <Button 
              onClick={handleSkip}
              variant="outline"
              className="w-full h-12 border-neutral-600 hover:bg-neutral-700 text-neutral-300 rounded-xl"
            >
              Skip for Now
            </Button>
            
            <Button 
              onClick={handleBack}
              variant="ghost"
              className="w-full h-12 text-violet-400 hover:text-violet-300 hover:bg-violet-900/30 rounded-xl"
            >
              Back
            </Button>
          </div>
          
          <p className="text-xs text-neutral-500">
            You can add photos later from your profile settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 