import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated SVG background icons */}
      <motion.svg
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="absolute top-0 left-0 w-96 h-96 text-yellow-300 animate-spin-slow pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 0 }}
      >
        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="12" />
        <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="4" strokeDasharray="8 8" />
      </motion.svg>
      <motion.svg
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 0.12, y: 0 }}
        transition={{ duration: 1.4, delay: 0.5 }}
        className="absolute bottom-0 right-0 w-80 h-80 text-pink-300 animate-pulse pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 0 }}
      >
        <rect x="30" y="30" width="140" height="140" rx="40" stroke="currentColor" strokeWidth="10" />
      </motion.svg>
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-xl w-full text-center relative z-10"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg"
        >
          Connect <span className="text-yellow-300 animate-pulse">Where</span> You Are
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-lg md:text-xl mb-8 text-white/90"
        >
          Meet new people at venues near you. Check in, like, match, and chat with people who are here right now.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } },
          }}
          className="space-y-4"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Link
              to="/sign-up"
              className="block w-full bg-white text-purple-700 font-semibold py-3 px-6 rounded-2xl text-lg hover:bg-purple-100 transition shadow-lg"
            >
              Create Account
            </Link>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Link
              to="/sign-in"
              className="block w-full text-white text-sm underline hover:text-yellow-200 transition"
            >
              Already have an account? Sign In
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="mt-10 text-xs text-white/70 space-x-4"
        >
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/safety" className="hover:underline">Safety</Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage; 