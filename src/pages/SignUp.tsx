
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import PageTransition from '@/components/ui/PageTransition';
import OptimizedImage from '@/components/ui/OptimizedImage';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const { signUp } = useAuth();
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }
    
    if (!password) {
      setErrorMessage('Please enter a password');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords don\'t match');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    
    try {
      setIsLoading(true);
      await signUp(email, password);
      toast({
        title: "Account created successfully!",
        description: "Let's set up your profile next.",
        variant: "default"
      });
      // Navigation handled by AuthContext, will go to create-profile
    } catch (error) {
      console.error('Sign up error:', error);
      setErrorMessage('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <OptimizedImage
                src="/logo.png"
                alt="Proximity Logo"
                className="w-20 h-20"
                placeholderName="Proximity"
              />
            </div>
            <h1 className="text-3xl font-bold text-brand-primary mb-2">Proximity</h1>
            <p className="text-text-secondary font-medium">Connect with people in the real world</p>
          </div>
          
          <div className="bg-bg-secondary rounded-2xl border border-border p-6 shadow-sm animate-scale-in">
            <h2 className="text-2xl font-semibold mb-6 text-text-primary">Create your account</h2>
            
            {errorMessage && <ErrorMessage message={errorMessage} />}
            
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-text-primary">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-text-primary">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <LoadingIndicator size="sm" color="white" /> 
                    <span className="ml-2">Creating account...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign Up <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm">
              <p className="text-text-secondary">
                Already have an account? <Link to="/sign-in" className="text-brand-primary">Sign in</Link>
              </p>
            </div>
          </div>
          
          <p className="text-xs text-text-tertiary mt-8 text-center">
            By continuing, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default SignUp;
