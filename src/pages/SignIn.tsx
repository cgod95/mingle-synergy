// 🧠 Purpose: Create the SignIn page to allow existing users to log in. This completes the /signin route and uses Firebase Auth for authentication.

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // After sign in, ProtectedRoute will handle onboarding redirect if needed
      // Otherwise, go to check-in page
      navigate('/checkin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
              <p className="text-sm text-neutral-400">Sign in to continue</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-4">
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
                  onClick={handleSignIn}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!email.trim() || !password.trim()}
                >
                  Sign In
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
