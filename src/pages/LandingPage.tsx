import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

export default function LandingPage() {
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
          <Button asChild className="w-full">
            <Link to="/onboarding">
              Sign Up
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