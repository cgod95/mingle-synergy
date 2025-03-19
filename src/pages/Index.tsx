
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  
  // Check if user is authenticated (mock for now)
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  useEffect(() => {
    if (isAuthenticated) {
      // If authenticated, redirect to venues page
      navigate('/venues');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-[#3A86FF] mb-2">Proximity</h1>
          <p className="text-muted-foreground text-lg">Connect with people in the real world</p>
        </div>
        
        <div className="w-full max-w-md space-y-4 animate-scale-in" style={{ animationDelay: '100ms' }}>
          <Button 
            onClick={() => navigate('/sign-up')}
            className="w-full py-6 bg-[#3A86FF] hover:bg-[#3A86FF]/90 text-lg"
          >
            Create Account <ArrowRight className="ml-2" />
          </Button>
          
          <Button 
            onClick={() => navigate('/sign-in')}
            variant="outline"
            className="w-full py-6 text-lg"
          >
            Sign In
          </Button>
        </div>
        
        <p className="mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '200ms' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Index;
