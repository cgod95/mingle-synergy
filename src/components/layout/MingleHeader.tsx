// Mingle Branding Header Component
// Displays Mingle logo/branding in top left across all pages

import { Link } from 'react-router-dom';
import MingleMLogo from '@/components/ui/MingleMLogo';

export default function MingleHeader() {
  return (
    <header
      className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/checkin"
            aria-label="Mingle - Go to check in"
            className="group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md p-1"
          >
            <MingleMLogo size="md" showText={true} />
          </Link>
        </div>
      </div>
    </header>
  );
}



