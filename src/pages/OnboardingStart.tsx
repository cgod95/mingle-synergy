import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function OnboardingStart() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-white flex flex-col justify-between">
      {/* Top content */}
      <div className="p-6 space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-3xl font-bold text-center text-gray-900"
        >
          Mingle
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="text-center text-gray-600 text-base"
        >
          The anti-dating app dating app.
          <br />
          You match only when you're actually there.
          <br />
          No profiles, no pressure, just presence.
        </motion.p>
      </div>

      {/* Sticky CTA */}
      <div className="p-6 sticky bottom-0 bg-white border-t">
        <button
          onClick={() => navigate('/signup')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Get Started
        </button>
      </div>
    </div>
  );
} 