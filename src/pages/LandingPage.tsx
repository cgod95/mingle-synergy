import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Zap } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { createDemoUser } = useAuth();

  const handleDemoMode = () => {
    createDemoUser();
    navigate('/demo-welcome');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white flex flex-col items-center justify-center text-center px-4 py-20 space-y-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg mb-4"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-5xl font-bold leading-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to Mingle
        </h1>
        <p className="text-lg text-neutral-800 max-w-xl mb-2 font-medium">
          The anti-dating app dating app. No swiping. No noise. Just meaningful encounters in real places.
        </p>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 p-4 max-w-xl">
          <p className="text-sm text-neutral-700 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span>How it works: Check into venues → See people there → Like to match → Chat (3 messages) → Meet up!</span>
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm space-y-4">
          {/* Demo Mode Button - Prominent */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handleDemoMode}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try Demo Mode
            </Button>
            <p className="text-xs text-neutral-500 mt-2">
              Experience the full app instantly - no signup required
            </p>
          </motion.div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">Or</span>
            </div>
          </div>

          <Button asChild className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold shadow-md">
            <Link to="/signup">
              Create Account
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full border-2 border-indigo-200 hover:bg-indigo-50">
            <Link to="/signin">
              Sign In
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Footer Philosophy */}
      <footer className="text-center text-sm text-neutral-600 p-6 max-w-xl mx-auto">
        <p className="font-medium">Built with a different philosophy.</p>
        <p className="text-neutral-500 mt-1">Mingle isn't about chasing likes — it's about being present.</p>
      </footer>
    </Layout>
  );
} 