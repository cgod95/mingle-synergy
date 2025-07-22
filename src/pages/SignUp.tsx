// 🧠 Purpose: Create the SignUp page to allow new users to register. This integrates with AuthContext and onboarding flow.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/components/PublicLayout';
import { useAuth } from '@/context/AuthContext';
import { analytics } from '@/services/analytics';
import { sanitizeInput, validateEmail, validatePassword } from '@/utils/security';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate and sanitize inputs
    try {
      const sanitizedEmail = sanitizeInput.email(email);
      const passwordValidation = validatePassword(password);
      
      if (!passwordValidation.isValid) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      setError('');

      // Track sign-up attempt
      analytics.track('sign_up_attempted', {
        email: sanitizedEmail,
        timestamp: Date.now()
      });

      // Use AuthContext signUp method which handles navigation
      await signUp(sanitizedEmail, password);
      
      // Track successful sign-up
      analytics.track('sign_up_success', {
        timestamp: Date.now()
      });

      // Navigation is handled by AuthContext
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Track sign-up error
      analytics.track('sign_up_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });

      setError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Create Account</CardTitle>
            <p className="text-sm text-neutral-600">Join Mingle to start connecting</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Email</label>
              <Input 
                type="email"
                placeholder="Enter your email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Password</label>
              <Input 
                type="password" 
                placeholder="Create a password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Confirm Password</label>
              <Input 
                type="password" 
                placeholder="Confirm your password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            <Button 
              onClick={handleSignUp} 
              className="w-full" 
              disabled={!email.trim() || !password.trim() || !confirmPassword.trim() || loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <p className="text-xs text-center text-neutral-600">
              Already have an account? <a className="underline text-neutral-900" href="/signin">Sign in</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
} 