import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Heart, MapPin, MessageCircle, Users, Zap } from 'lucide-react';
import Layout from '@/components/Layout';
import DemoModeIndicator from '@/components/DemoModeIndicator';

export default function LandingPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Demo Mode Indicator */}
        <DemoModeIndicator variant="compact" />
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          
          <div className="container mx-auto px-4 py-20">
            <div className="text-center space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 border-blue-200">
                  🚀 The Anti-Dating App
                </Badge>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl md:text-6xl font-bold leading-tight text-slate-900 max-w-4xl mx-auto"
              >
                Stop Swiping.
                <span className="block text-blue-600">Start Living.</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
              >
                Mingle is the dating app that actually gets you off your phone and into real conversations. 
                No more swiping. No more ghosting. Just meaningful connections in real places.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              >
                <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link to="/onboarding" className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold border-2 hover:bg-slate-50">
                  <Link to="/signin">
                    I'm Back
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Demo Info Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="py-16 bg-gradient-to-r from-yellow-50 to-orange-50"
        >
          <div className="container mx-auto px-4">
            <DemoModeIndicator variant="full" />
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="py-20 bg-white"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Why Mingle is Different
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                We're not just another dating app. We're changing how people connect.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Real Places, Real People</h3>
                <p className="text-slate-600">
                  Check into venues and see who's actually there. No more wondering if they're real or just a bot.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100"
              >
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">No More Ghosting</h3>
                <p className="text-slate-600">
                  When you match, you're both physically present. Meaningful conversations happen naturally.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
              >
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Chemistry</h3>
                <p className="text-slate-600">
                  Skip the endless texting. Meet in person and see if there's real chemistry right away.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="py-20 bg-slate-50"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                How Mingle Works
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Three simple steps to meaningful connections
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-center relative"
              >
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Check In</h3>
                <p className="text-slate-600">
                  Arrive at a venue and check in. Let others know you're here and open to meeting new people.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="text-center relative"
              >
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Discover</h3>
                <p className="text-slate-600">
                  See who else is checked in. Browse profiles and find people who share your interests.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="text-center relative"
              >
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Connect</h3>
                <p className="text-slate-600">
                  Like someone? Start a conversation. If they like you back, you can meet in person right away.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Social Proof */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="py-20 bg-white"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
              Join Thousands of People Who've Found Real Connections
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-slate-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">5,000+</div>
                <div className="text-slate-600">Successful Matches</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-slate-600">Venues Partnered</div>
              </div>
            </div>

            <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Link to="/onboarding" className="flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Mingle</h3>
              <p className="text-slate-300 max-w-md mx-auto">
                The dating app that gets you off your phone and into real conversations. 
                No swiping. No ghosting. Just meaningful connections.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link to="/terms" className="text-slate-300 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-slate-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/safety" className="text-slate-300 hover:text-white transition-colors">
                Safety Guidelines
              </Link>
            </div>
            
            <div className="text-slate-400 text-sm">
              © 2024 Mingle. Built with ❤️ for real connections.
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
} 