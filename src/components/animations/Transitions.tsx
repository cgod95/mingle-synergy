import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  pageVariants,
  pageTransition,
  cardVariants,
  listVariants,
  staggerContainer,
  buttonVariants,
  fadeInVariants,
  slideUpVariants,
  scaleInVariants
} from './animations';

// Page wrapper component
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

// Animated card component
export function AnimatedCard({ 
  children, 
  className = "",
  onClick
}: { 
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// Animated button component
export function AnimatedButton({ 
  children, 
  className = "",
  onClick,
  disabled = false
}: { 
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover={disabled ? "initial" : "hover"}
      whileTap={disabled ? "initial" : "tap"}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

// Staggered list component
export function StaggeredList({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}

// Animated list item
export function AnimatedListItem({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={listVariants}>
      {children}
    </motion.div>
  );
}

// Fade in wrapper
export function FadeIn({ 
  children, 
  delay = 0,
  duration = 0.2
}: { 
  children: ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay, duration }}
    >
      {children}
    </motion.div>
  );
}

// Slide up wrapper
export function SlideUp({ 
  children, 
  delay = 0,
  duration = 0.2
}: { 
  children: ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      variants={slideUpVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay, duration }}
    >
      {children}
    </motion.div>
  );
}

// Scale in wrapper
export function ScaleIn({ 
  children, 
  delay = 0,
  duration = 0.3
}: { 
  children: ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      variants={scaleInVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay, duration }}
    >
      {children}
    </motion.div>
  );
}

// Loading spinner component - CSS-based for performance
export function LoadingSpinner() {
  return (
    <div className="w-6 h-6 border-2 border-neutral-300 border-t-violet-600 rounded-full animate-spin" />
  );
}

// Pulse animation wrapper
export function Pulse({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}

// Bounce animation wrapper
export function Bounce({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}
