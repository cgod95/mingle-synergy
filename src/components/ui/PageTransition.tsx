import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'push' | 'pop' | 'fade';
}

const PUSH_VARIANTS = {
  initial: { opacity: 0, x: '20%' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '-20%' },
};

const POP_VARIANTS = {
  initial: { opacity: 0, x: '-20%' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '20%' },
};

const FADE_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const INSTANT = { duration: 0 };
const IOS_EASE = { duration: 0.22, ease: [0.32, 0.72, 0, 1] };

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '',
  direction = 'fade',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const variants = direction === 'push' ? PUSH_VARIANTS : direction === 'pop' ? POP_VARIANTS : FADE_VARIANTS;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : variants.initial}
      animate={variants.animate}
      exit={prefersReducedMotion ? undefined : variants.exit}
      transition={prefersReducedMotion ? INSTANT : IOS_EASE}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered list animation for items
export const StaggeredList: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.05 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual staggered item
export const StaggeredItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Fade in animation for content
export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Scale in animation for cards and modals
export const ScaleIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.25, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
