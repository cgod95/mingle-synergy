// 🧠 Purpose: Create the SignIn page to allow existing users to log in. Uses AuthContext for consistent auth handling.

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function SignIn() {
  const { signInUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await signInUser(email, password);
      // After sign in, ProtectedRoute will handle onboarding redirect if needed
      // Otherwise, go to check-in page
      navigate('/checkin');
    } catch (e: any) {
      // Provide user-friendly error messages
      const errorMessage = e?.message || 'Failed to sign in';
      if (errorMessage.includes('user-not-found') || errorMessage.includes('No account found')) {
        setError('No account found with this email. Please sign up instead.');
      } else if (errorMessage.includes('wrong-password') || errorMessage.includes('Invalid')) {
        setError('Incorrect password. Please try again.');
      } else if (errorMessage.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (errorMessage.includes('too-many-requests')) {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen min-h-[100dvh] bg-neutral-900 overflow-y-auto safe-y">
        <div className="flex flex-col min-h-screen min-h-[100dvh] px-4 py-8">
          {/* Back button */}
          <div className="flex-shrink-0 mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                try {
                  navigate('/', { replace: true });
                } catch (error) {
                  navigate(-1);
                }
              }}
              className="text-neutral-400 hover:text-white -ml-2"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Content — scrollable, not squished */}
          <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto">
            {/* Logo */}
            <div className="text-center mb-8 flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED] flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-sm text-neutral-400 mt-1">Sign in to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-4 flex-shrink-0">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-300">Email</label>
                <Input 
                  placeholder="Enter your email" 
                  type="email"
                  inputMode="email"
                  autoComplete="email" 
                  autoCapitalize="none" 
                  autoCorrect="off"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl h-12"
                  required
                  disabled={busy}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-300">Password</label>
                <Input 
                  type="password" 
                  autoComplete="current-password"
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl h-12"
                  required
                  disabled={busy}
                />
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-900/30 rounded-xl"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
              <Button 
                type="submit"
                className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={busy || !email.trim() || !password.trim()}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            {/* Sign up link */}
            <div className="text-center mt-8 flex-shrink-0">
              <p className="text-sm text-neutral-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
