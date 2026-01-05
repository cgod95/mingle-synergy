// NewMatchModal - Dark theme with brand purple

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    if (isOpen) {
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-[#111118] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#2D2D3A] relative overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#1a1a24] hover:bg-[#2D2D3A] transition-colors z-10"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>

              {/* Decorative background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#7C3AED]/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#6D28D9]/20 rounded-full blur-3xl" />
              </div>

              <AnimatePresence>
                {showContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative z-10"
                  >
                    {/* Header */}
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2, damping: 15 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] mb-4 shadow-lg shadow-[#7C3AED]/30"
                      >
                        <Heart className="w-8 h-8 text-white fill-white" />
                      </motion.div>
                      
                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-white mb-2"
                      >
                        It's a Match!
                      </motion.h2>
                      
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-[#9CA3AF] text-sm"
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
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] p-1">
                          <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a24]">
                            {partnerPhoto ? (
                              <img
                                src={partnerPhoto}
                                alt={partnerName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#6B7280]">
                                {partnerName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Animated ring */}
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
                          className="absolute inset-0 rounded-full border-2 border-[#7C3AED]/50"
                        />
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

                    {/* Action buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-3"
                    >
                      <Button
                        onClick={handleSendMessage}
                        className="w-full h-14 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white font-semibold rounded-xl shadow-lg shadow-[#7C3AED]/25"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Send a Message
                      </Button>
                      
                      <Button
                        onClick={handleKeepBrowsing}
                        variant="ghost"
                        className="w-full h-12 text-[#9CA3AF] hover:text-white hover:bg-[#1a1a24] rounded-xl"
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
