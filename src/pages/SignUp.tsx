import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function SignUp() {
  const { signUpUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setBusy(false);
      return;
    }

    try {
      await signUpUser(email, password);
      navigate('/welcome');
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to sign up';
      if (errorMessage.includes('email-already-in-use')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (errorMessage.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (errorMessage.includes('weak-password')) {
        setError('Password is too weak. Please use a stronger password.');
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
              className="text-violet-400 hover:text-violet-300 hover:bg-violet-900/30 -ml-2"
              size="icon"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto">
            {/* Logo */}
            <div className="text-center mb-8 flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED] flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <h1 className="text-3xl font-bold text-white">Create account</h1>
              <p className="text-base text-neutral-300 mt-2">Join Mingle and start meeting people</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-4 flex-shrink-0">
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
                  placeholder="Password (min 6 characters)" 
                  type="password" 
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl h-12"
                  required
                  disabled={busy}
                />
                <p className="text-xs text-neutral-500">Must be at least 6 characters</p>
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
                className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={busy || !email.trim() || !password.trim()}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
            
            {/* Sign in link */}
            <div className="text-center mt-8 flex-shrink-0">
              <p className="text-sm text-neutral-400">
                Already have an account?{' '}
                <Link to="/signin" className="text-violet-400 hover:text-violet-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
