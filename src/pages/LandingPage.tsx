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
        className="flex flex-col items-center justify-center text-center px-4 py-20 space-y-8"
      >
        <h1 className="text-4xl font-bold leading-tight text-neutral-900">Welcome to Mingle</h1>
        <p className="text-lg text-neutral-800 max-w-xl">
          The anti-dating app dating app. No swiping. No noise. Just meaningful encounters in real places.
        </p>

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

          <Button asChild className="w-full">
            <Link to="/signup">
              Create Account
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/signin">
              Sign In
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Footer Philosophy */}
      <footer className="text-center text-sm text-neutral-500 p-6">
        Built with a different philosophy. Mingle isn't about chasing likes — it's about being present.
      </footer>
    </Layout>
  );
} 