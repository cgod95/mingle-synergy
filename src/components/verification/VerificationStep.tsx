
import React from 'react';
import { User } from '@/types';
import SelfieVerification from './SelfieVerification';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VerificationStepProps {
  currentUser: User;
  onComplete: () => void;
  onBack?: () => void;
}

const VerificationStep: React.FC<VerificationStepProps> = ({ 
  currentUser, 
  onComplete,
  onBack
}) => {
  return (
    <div className="flex-1 flex flex-col p-4">
      {onBack && (
        <Button 
          variant="ghost" 
          className="w-10 h-10 rounded-full p-0 mb-4" 
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      
      <SelfieVerification 
        userId={currentUser.id} 
        onVerificationComplete={onComplete} 
      />
    </div>
  );
};

export default VerificationStep;
