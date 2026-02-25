/**
 * NewMatchModal - In-app popup for new matches
 * 
 * Displays a celebratory modal when users get a new match
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, MessageCircle, Heart, Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hapticHeavy } from '@/lib/haptics';

function FloatingHearts() {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      size: 12 + Math.random() * 14,
      opacity: 0.3 + Math.random() * 0.4,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: '110%', x: `${p.x}%`, opacity: 0, scale: 0.5 }}
          animate={{
            y: '-10%',
            opacity: [0, p.opacity, p.opacity, 0],
            scale: [0.5, 1, 1, 0.7],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
          }}
          className="absolute"
          style={{ fontSize: p.size }}
        >
          <Heart className="text-pink-400/60 fill-pink-400/40" style={{ width: p.size, height: p.size }} />
        </motion.div>
      ))}
    </div>
  );
}

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  partnerName: string;
  partnerPhoto?: string;
  venueName?: string;
}

export function NewMatchModal({
  isOpen,
  onClose,
  matchId,
  partnerName,
  partnerPhoto,
  venueName
}: NewMatchModalProps) {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const noMotion = { duration: 0 };

  useEffect(() => {
    if (isOpen) {
      hapticHeavy(); // Strong haptic for match celebration
      // Show content with delay for animation
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    onClose();
    navigate(`/chat/${matchId}`);
  };

  const handleKeepBrowsing = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8, y: 20 }}
            transition={prefersReducedMotion ? noMotion : { type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-700/50 relative overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 transition-colors z-10"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>

              {/* Decorative background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl" />
              </div>

              {!prefersReducedMotion && <FloatingHearts />}

              <AnimatePresence>
                {showContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative z-10"
                  >
                    {/* Match celebration header */}
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: [0, 1.3, 1], rotate: [-20, 10, 0] }}
                        transition={{ type: "spring", delay: 0.2, damping: 12, stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 mb-4 shadow-lg shadow-pink-500/30"
                      >
                        <Heart className="w-10 h-10 text-white fill-white" />
                      </motion.div>
                      
                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 bg-clip-text text-transparent mb-2"
                      >
                        It's a Match!
                      </motion.h2>
                      
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-neutral-400 text-sm"
                      >
                        You and {partnerName} liked each other
                        {venueName && ` at ${venueName}`}
                      </motion.p>
                    </div>

                    {/* Partner photo */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="flex justify-center mb-6"
                    >
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-violet-500 p-1">
                          <div className="w-full h-full rounded-full overflow-hidden bg-neutral-800">
                            {partnerPhoto ? (
                              <img
                                src={partnerPhoto}
                                alt={partnerName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-neutral-500">
                                {partnerName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {!prefersReducedMotion && (
                          <motion.div
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0, 0.5]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0 rounded-full border-2 border-pink-400/50"
                          />
                        )}
                      </div>
                    </motion.div>

                    {/* Partner name */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center text-xl font-semibold text-white mb-6"
                    >
                      {partnerName}
                    </motion.p>

                    {/* Notification prompt - contextual, only shown once */}
                    {'Notification' in window && Notification.permission === 'default' && !localStorage.getItem('notif_prompt_shown') && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="mb-4 p-3 rounded-xl bg-violet-900/30 border border-violet-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-violet-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-neutral-300">Get notified when {partnerName} replies</p>
                          </div>
                          <button
                            onClick={async () => {
                              localStorage.setItem('notif_prompt_shown', 'true');
                              try {
                                await Notification.requestPermission();
                              } catch {}
                            }}
                            className="text-xs font-semibold text-violet-400 hover:text-violet-300 whitespace-nowrap"
                          >
                            Enable
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Action buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-3"
                    >
                      <Button
                        onClick={handleSendMessage}
                        className="w-full py-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 min-h-[48px]"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Send a Message
                      </Button>
                      
                      <Button
                        onClick={handleKeepBrowsing}
                        variant="ghost"
                        className="w-full py-6 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl min-h-[44px]"
                      >
                        Keep Browsing
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default NewMatchModal;

