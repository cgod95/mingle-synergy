import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function OnboardingStart() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen min-h-[100dvh] bg-neutral-900 flex flex-col justify-between">
      {/* Top content */}
      <div className="p-6 space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-3xl font-bold text-center bg-gradient-to-r from-violet-400 via-violet-500 to-pink-500 bg-clip-text text-transparent"
        >
          Mingle
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="text-center text-neutral-400 text-base"
        >
          The anti-dating app dating app.
          <br />
          You match only when you're actually there.
          <br />
          No profiles, no pressure, just presence.
        </motion.p>
      </div>

      {/* Sticky CTA */}
      <div className="p-6 sticky bottom-0 bg-neutral-900 border-t border-neutral-800" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => navigate('/signup')}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition min-h-[48px]"
        >
          Get Started
        </button>
      </div>
    </div>
  );
} 