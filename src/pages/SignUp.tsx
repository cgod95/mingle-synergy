// 🧠 Purpose: Sign Up page - dark theme with purple brand colors

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, UserPlus } from 'lucide-react';

const PENDING_VENUE_CHECKIN_KEY = 'pendingVenueCheckIn';

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
      navigate('/create-profile');
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
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15)_0%,_transparent_50%)]" />
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-[#6B7280] hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30 mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join Mingle</h1>
            <p className="text-[#6B7280]">Start meeting people in real life</p>
          </div>

          {/* Form Card */}
          <div className="bg-[#111118] rounded-2xl border border-[#2D2D3A] p-6 shadow-xl">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#9CA3AF]">Email</label>
                <Input 
                  placeholder="Enter your email" 
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0a0a0f] border-[#2D2D3A] text-white placeholder:text-[#4B5563] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] h-12 rounded-xl"
                  required
                  disabled={busy}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#9CA3AF]">Password</label>
                <Input 
                  placeholder="Create a password" 
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="bg-[#0a0a0f] border-[#2D2D3A] text-white placeholder:text-[#4B5563] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] h-12 rounded-xl"
                  required
                  disabled={busy}
                />
                <p className="text-xs text-[#6B7280]">Must be at least 6 characters</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              <Button 
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white font-semibold rounded-xl shadow-lg shadow-[#7C3AED]/25 transition-all disabled:opacity-50"
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

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2D2D3A]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-[#111118] text-[#6B7280]">Already have an account?</span>
              </div>
            </div>

            <Link 
              to="/signin"
              className="w-full inline-flex items-center justify-center h-12 rounded-xl border border-[#2D2D3A] text-[#9CA3AF] hover:bg-[#1a1a24] hover:text-white hover:border-[#7C3AED]/50 transition-all font-medium text-sm"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
