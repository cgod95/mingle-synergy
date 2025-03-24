
import React from 'react';
import { motion } from 'framer-motion';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -10
  }
};

// Page transition settings
const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3
};

// Common motion components
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
};

// Fade in variants
const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const FadeIn: React.FC<{ 
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 0.5 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

// Scale in variants
const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export const ScaleIn: React.FC<{ 
  children: React.ReactNode;
  delay?: number; 
  duration?: number;
}> = ({ children, delay = 0, duration = 0.3 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleInVariants}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20, 
        delay 
      }}
    >
      {children}
    </motion.div>
  );
};

// List item staggered animation
export const StaggeredList: React.FC<{ 
  children: React.ReactNode;
  staggerDelay?: number;
}> = ({ children, staggerDelay = 0.05 }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
};

export const StaggeredItem: React.FC<{ 
  children: React.ReactNode;
}> = ({ children }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div variants={itemVariants}>
      {children}
    </motion.div>
  );
};
