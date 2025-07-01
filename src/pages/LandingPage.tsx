import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col justify-between">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center text-center px-6 py-20 space-y-8"
      >
        <h1 className="text-4xl font-bold leading-tight">Welcome to Mingle</h1>
        <p className="text-lg text-gray-600 max-w-xl">
          The anti-dating app dating app. No swiping. No noise. Just meaningful encounters in real places.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Link
            to="/onboarding"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Sign Up
          </Link>
          <Link
            to="/signin"
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition"
          >
            Sign In
          </Link>
        </div>
      </motion.div>

      {/* Footer Philosophy */}
      <footer className="text-center text-sm text-gray-500 p-6">
        Built with a different philosophy. Mingle isn't about chasing likes — it's about being present.
      </footer>
    </div>
  );
} 