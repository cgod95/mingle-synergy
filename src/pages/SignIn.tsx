// 🧠 Purpose: Create the SignIn page to allow existing users to log in. Uses AuthContext for consistent auth handling.

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import MingleHeader from '@/components/layout/MingleHeader';

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
      <div className="min-h-screen min-h-[100dvh] bg-neutral-900 flex flex-col items-center justify-center px-4 py-12 safe-y">
        <MingleHeader />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm mt-8"
        >
          <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-xl">
            <CardHeader className="text-center space-y-2 pb-6 relative">
              <Button
                variant="ghost"
                onClick={() => {
                  try {
                    navigate('/', { replace: true });
                  } catch (error) {
                    // Fallback navigation
                    navigate(-1);
                  }
                }}
                className="absolute top-0 left-0 text-neutral-300 hover:text-white"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Welcome back</CardTitle>
              <p className="text-sm text-neutral-400">Sign in to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-300">Email</label>
              <Input 
                placeholder="Enter your email" 
                    type="email"
                    autoComplete="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
                    required
                    disabled={busy}
              />
            </div>
            <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-300">Password</label>
              <Input 
                type="password" 
                    autoComplete="current-password"
                placeholder="Enter your password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
                    required
                    disabled={busy}
              />
            </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg"
                  >
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}
            <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-neutral-800 text-neutral-500">Don't have an account?</span>
                </div>
              </div>
              
              <Button
                asChild
                variant="outline"
                className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              >
                <Link to="/signup">Sign up</Link>
              </Button>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
