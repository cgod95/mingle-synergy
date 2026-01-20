// Mingle Branding Header Component
// Displays Mingle logo/branding in top left across all pages
// With iOS safe area support

import { Link } from 'react-router-dom';
import MingleMLogo from '@/components/ui/MingleMLogo';

export default function MingleHeader() {
  return (
    <header
      className="sticky top-0 z-50 nav-blur-ios border-b border-neutral-800/50 shadow-lg"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link
            to="/checkin"
            aria-label="Mingle - Go to check in"
            className="group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg p-2 -ml-2 active:scale-95 transition-transform touch-target"
          >
            <MingleMLogo size="md" showText={true} />
          </Link>
        </div>
      </div>
    </header>
  );
}
