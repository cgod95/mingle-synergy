// 🧠 Purpose: Create the SignUp page to allow new users to create accounts. Matches SignIn page design with dark theme.

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import MingleHeader from '@/components/layout/MingleHeader';

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
    
    // Basic validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setBusy(false);
      return;
    }

    try {
      await signUpUser(email, password);
      // New users should go through onboarding flow
      navigate('/create-profile');
    } catch (e: any) {
      // Provide user-friendly error messages
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
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-4 py-12">
        <MingleHeader />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm mt-8"
        >
          <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <Button
                variant="ghost"
                onClick={() => {
                  try {
                    navigate('/demo-welcome');
                  } catch (error) {
                    // Fallback navigation
                    navigate(-1);
                  }
                }}
                className="absolute top-4 left-4 text-neutral-300 hover:text-white border border-neutral-600 hover:border-neutral-500 rounded-md px-3 py-2"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Create account</CardTitle>
              <p className="text-sm text-white">Join Mingle and start meeting people</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
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
                    placeholder="Password (min 6 characters)" 
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
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
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
      </form>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-neutral-800 text-white">Already have an account?</span>
                </div>
              </div>
              
              <Button
                asChild
                variant="outline"
                className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              >
                <Link to="/signin">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
