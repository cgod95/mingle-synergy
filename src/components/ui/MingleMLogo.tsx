// Mingle "M" Monogram Logo
import { motion } from 'framer-motion';

interface MingleMLogoProps {
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

const logoSizeMap = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl'
};

export default function MingleMLogo({ size = 'md', showText = true, className = '' }: MingleMLogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizeMap[size]} rounded-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg`}
      >
        <span className={`${logoSizeMap[size]} font-bold text-white`}>
          M
        </span>
      </motion.div>
      {showText && (
        <motion.span
          className={`${textSizeMap[size]} font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent`}
          whileHover={{ scale: 1.05 }}
        >
          Mingle
        </motion.span>
      )}
    </div>
  );
}


