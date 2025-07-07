// 🧠 Purpose: Create the SignIn page to allow existing users to log in. This completes the /signin route and uses Firebase Auth for authentication.

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { analytics } from '@/services/analytics';
import { sanitizeInput, validateEmail, validatePassword } from '@/utils/security';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
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

      // Track sign-in attempt
      analytics.track('sign_in_attempted', {
        email: sanitizedEmail,
        timestamp: Date.now()
      });

      await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      
      // Track successful sign-in
      analytics.track('sign_in_success', {
        timestamp: Date.now()
      });

      navigate('/venues');
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Track sign-in error
      analytics.track('sign_in_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });

      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Welcome back</CardTitle>
            <p className="text-sm text-neutral-600">Sign in to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Email</label>
              <Input 
                placeholder="Enter your email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Password</label>
              <Input 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            <Button 
              onClick={handleSignIn} 
              className="w-full" 
              disabled={!email.trim() || !password.trim()}
            >
              Sign In
            </Button>
            <p className="text-xs text-center text-neutral-600">
              Don't have an account? <a className="underline text-neutral-900" href="/onboarding">Sign up</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
