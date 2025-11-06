import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, CheckCircle, MapPin, MessageCircle, Star } from 'lucide-react';

// Heart animation for likes
export const HeartAnimation: React.FC<{ isLiked: boolean; onClick?: () => void }> = ({ 
  isLiked, 
  onClick 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <motion.div
        animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
        />
      </motion.div>
      {isLiked && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute -top-2 -right-2"
        >
          <div className="w-3 h-3 bg-red-500 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Match animation
export const MatchAnimation: React.FC<{ isVisible: boolean; onComplete?: () => void }> = ({ 
  isVisible, 
  onComplete 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onAnimationComplete={onComplete}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-full p-8 shadow-2xl"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1,
                repeat: 2,
                ease: "easeInOut"
              }}
            >
              <Heart className="w-16 h-16 text-red-500 fill-red-500" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-bold text-center mt-4 text-gray-800"
            >
              It's a Match! 💕
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center mt-2 text-gray-600"
            >
              Start chatting now!
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Check-in animation
export const CheckInAnimation: React.FC<{ isVisible: boolean; venueName: string }> = ({ 
  isVisible, 
  venueName 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-20 left-4 right-4 z-40"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-green-500 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.6 }}
              >
                <CheckCircle className="w-6 h-6" />
              </motion.div>
              <div>
                <h3 className="font-semibold">Checked in!</h3>
                <p className="text-sm opacity-90">{venueName}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Message sent animation
export const MessageSentAnimation: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute -top-2 -right-2"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5 }}
            className="bg-blue-500 text-white rounded-full p-1"
          >
            <MessageCircle className="w-4 h-4" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Loading pulse animation
export const LoadingPulse: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`${sizeClasses[size]} bg-gray-300 rounded-full`}
    />
  );
};

// Success checkmark animation
export const SuccessCheckmark: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-green-500 text-white rounded-full p-2"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CheckCircle className="w-5 h-5" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Venue check-in button animation
export const VenueCheckInButton: React.FC<{ 
  isCheckedIn: boolean; 
  onClick: () => void;
  children: React.ReactNode;
}> = ({ isCheckedIn, onClick, children }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg p-4 w-full ${
        isCheckedIn 
          ? 'bg-green-500 text-white' 
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {isCheckedIn && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 bg-green-400"
          style={{ borderRadius: 'inherit' }}
        />
      )}
      <motion.div
        animate={isCheckedIn ? { 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-center space-x-2"
      >
        <MapPin className="w-5 h-5" />
        <span>{children}</span>
      </motion.div>
    </motion.button>
  );
};

// Rating star animation
export const RatingStar: React.FC<{ 
  isFilled: boolean; 
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isFilled, onClick, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <motion.div
        animate={isFilled ? { 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        } : {}}
        transition={{ duration: 0.3 }}
      >
        <Star 
          className={`${sizeClasses[size]} ${
            isFilled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
          }`}
        />
      </motion.div>
    </motion.div>
  );
};

// Page transition animation
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Card hover animation
export const AnimatedCard: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      whileHover={{ 
        y: -4,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-lg shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Notification badge animation
export const NotificationBadge: React.FC<{ 
  count: number;
  children: React.ReactNode;
}> = ({ count, children }) => {
  return (
    <div className="relative">
      {children}
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
        >
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}; 