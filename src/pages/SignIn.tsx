import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      // Navigation handled by AuthContext
    } catch (error) {
      console.error('Sign in error:', error);
      // Error handling is done in the useAuth hook
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-primary mb-2">Proximity</h1>
          <p className="text-text-secondary font-medium">Connect with people in the real world</p>
        </div>
        
        <div className="bg-bg-secondary rounded-2xl border border-border p-6 shadow-sm animate-scale-in">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">Welcome back</h2>
          
          <form onSubmit={handleSignIn} className="space-y-4">
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
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-text-primary">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-primary">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'} {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <p className="text-text-secondary">
              Don't have an account? <Link to="/sign-up" className="text-brand-primary">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
