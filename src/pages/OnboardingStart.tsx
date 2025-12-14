import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MingleMLogo from '@/components/ui/MingleMLogo';

export default function OnboardingStart() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-neutral-900 flex flex-col justify-between">
      {/* Top content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <MingleMLogo size="lg" showText={false} className="text-white mb-4" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        >
          Mingle
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="text-center text-neutral-300 text-base max-w-sm"
        >
          The anti-dating app dating app.
          <br />
          You match only when you're actually there.
          <br />
          No profiles, no pressure, just presence.
        </motion.p>
      </div>

      {/* Sticky CTA */}
      <div className="p-6 sticky bottom-0 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800">
        <button
          onClick={() => navigate('/signup')}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-full transition-all shadow-lg"
        >
          Get Started
        </button>
      </div>
    </div>
  );
} 