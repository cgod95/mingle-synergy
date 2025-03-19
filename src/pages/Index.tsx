
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-[#3A86FF] mb-4">Proximity</h1>
        <p className="text-xl mb-8">Connect with people in real world venues</p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/sign-up')}
            className="w-full bg-[#3A86FF] hover:bg-[#3A86FF]/90 py-6 text-lg"
          >
            Create Account <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button 
            onClick={() => navigate('/sign-in')}
            variant="outline"
            className="w-full py-6 text-lg"
          >
            Sign In
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Index;
