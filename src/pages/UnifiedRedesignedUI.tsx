import { motion } from 'framer-motion';
import { Home, Heart, MessageCircle, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/profile', icon: <User />, label: 'Profile' },
  { to: '/matches', icon: <Heart />, label: 'Matches' },
  { to: '/matches', icon: <MessageCircle />, label: 'Chat' },
];

export default function UnifiedRedesignedUI() {
  const location = useLocation();

  return (
    <div className="min-h-screen min-h-[100dvh] bg-neutral-900 pt-4 pb-24 px-4 relative">
      {/* Motion wrapper */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="max-w-md mx-auto"
      >
        <h1 className="text-3xl font-bold mb-4 text-white">Welcome to Mingle</h1>
        <p className="text-neutral-400 mb-6">
          This screen demonstrates the Hinge-inspired layout with floating nav and transitions.
        </p>
        <div className="rounded-2xl bg-neutral-800 border border-neutral-700 shadow-lg p-6 space-y-4">
          <div className="text-neutral-200 font-medium">Example Content Block</div>
          <div className="h-32 bg-neutral-700 rounded-lg" />
          <div className="h-32 bg-neutral-700 rounded-lg" />
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 nav-blur-ios rounded-full shadow-lg px-6 py-2 flex justify-between w-[90%] max-w-md border border-neutral-700 z-50">
        {navItems.map(({ to, icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center text-xs min-h-[44px] justify-center ${
                isActive ? 'text-indigo-400' : 'text-neutral-500'
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 