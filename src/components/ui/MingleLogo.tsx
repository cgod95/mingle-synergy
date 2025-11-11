// Abstract Mingle Logo - Connection/Intersection Symbol
import { motion } from 'framer-motion';

interface MingleLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
};

const textSizeMap = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl'
};

export default function MingleLogo({ size = 'md', showText = true, className = '' }: MingleLogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizeMap[size]} relative`}
      >
        {/* Abstract intersection symbol - two circles connecting */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Left circle */}
          <circle
            cx="12"
            cy="16"
            r="8"
            fill="url(#indigoGradient)"
            opacity="0.9"
          />
          {/* Right circle */}
          <circle
            cx="20"
            cy="16"
            r="8"
            fill="url(#purpleGradient)"
            opacity="0.9"
          />
          {/* Intersection highlight */}
          <circle
            cx="16"
            cy="16"
            r="6"
            fill="url(#intersectionGradient)"
          />
          {/* Connection lines */}
          <path
            d="M 16 8 L 16 12 M 16 20 L 16 24"
            stroke="url(#indigoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
            <linearGradient id="intersectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      {showText && (
        <motion.span
          className={`${textSizeMap[size]} font-bold text-neutral-900 dark:text-white`}
          whileHover={{ scale: 1.05 }}
        >
          Mingle
        </motion.span>
      )}
    </div>
  );
}

