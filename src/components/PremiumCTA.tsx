/**
 * PremiumCTA - Call-to-action for premium features
 * 
 * Displays when users hit message limits or other premium gates
 * This is a placeholder for future premium features
 */

import { motion } from 'framer-motion';
import { Crown, MessageCircle, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PremiumCTAProps {
  variant?: 'message-limit' | 'feature-gate' | 'inline';
  onDismiss?: () => void;
  className?: string;
}

export function PremiumCTA({ variant = 'message-limit', onDismiss, className = '' }: PremiumCTAProps) {
  const handleUpgrade = () => {
    // TODO: Implement premium upgrade flow
    // For now, just show a message that this feature is coming soon
    alert('Premium features coming soon! Stay tuned.');
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-200">Unlock unlimited messages</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleUpgrade}
          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  if (variant === 'feature-gate') {
    return (
      <Card className={`bg-gradient-to-br from-neutral-900 to-neutral-800 border-amber-500/20 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Premium Feature</h3>
          <p className="text-sm text-neutral-400 mb-4">
            This feature is available for premium members.
          </p>
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Go Premium
          </Button>
          {onDismiss && (
            <Button 
              variant="ghost" 
              onClick={onDismiss}
              className="w-full mt-2 text-neutral-400 hover:text-white"
            >
              Not now
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default: message-limit variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className}`}
    >
      <Card className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 border-amber-500/30 overflow-hidden">
        <CardContent className="p-6 relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Message limit reached</h3>
                <p className="text-xs text-neutral-400">Upgrade to keep chatting</p>
              </div>
            </div>

            <p className="text-sm text-neutral-300 mb-4">
              You've used all your free messages with this match. Go premium to unlock unlimited conversations and exclusive features.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Unlimited messages</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>See who likes you</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Priority in venue lists</span>
              </div>
            </div>

            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/20"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>

            {onDismiss && (
              <Button 
                variant="ghost" 
                onClick={onDismiss}
                className="w-full mt-2 text-neutral-500 hover:text-white"
              >
                Maybe later
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PremiumCTA;


