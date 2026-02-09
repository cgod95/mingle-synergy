/**
 * LocationPermissionPrompt - Industry-standard pre-permission screen
 * Shows BEFORE the native iOS dialog to explain why location is needed.
 * This dramatically improves permission grant rates.
 */
import React from 'react';
import { MapPin, Shield, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';

interface LocationPermissionPromptProps {
  open: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}

export const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({
  open,
  onAllow,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-neutral-800 rounded-2xl p-6 max-w-sm w-full border border-neutral-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex items-center justify-center ring-2 ring-indigo-500/20">
                <MapPin className="w-10 h-10 text-indigo-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white text-center mb-2">
              Find Venues Near You
            </h2>

            {/* Description */}
            <p className="text-neutral-400 text-center text-sm mb-6 leading-relaxed">
              Mingle uses your location to show nearby venues and people checked in around you.
            </p>

            {/* Trust signals */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-sm text-neutral-300">See venues and people nearby</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-sm text-neutral-300">Only used while the app is open</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-indigo-400" strokeWidth={2} />
                </div>
                <p className="text-sm text-neutral-300">Your exact location is never shown to others</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={onAllow}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold min-h-[48px] shadow-lg"
              >
                Enable Location
              </Button>
              <button
                onClick={onDismiss}
                className="w-full px-4 py-3 text-neutral-400 hover:text-neutral-200 rounded-xl font-medium transition-colors min-h-[44px]"
              >
                Not Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * LocationDeniedBanner - Shows inline when location is denied
 * Provides a way to open iOS Settings
 */
interface LocationDeniedBannerProps {
  className?: string;
}

export const LocationDeniedBanner: React.FC<LocationDeniedBannerProps> = ({ className }) => {
  const handleOpenSettings = () => {
    // On iOS native, this deep-links to app settings
    // On web, we just inform the user
    const isNative = typeof (window as any).Capacitor !== 'undefined' && 
                     (window as any).Capacitor.isNativePlatform?.();
    
    if (isNative) {
      // Capacitor can open app settings
      try {
        import('@capacitor/core').then(({ Capacitor }) => {
          if (Capacitor.isNativePlatform()) {
            // Open system settings for the app
            const url = 'app-settings:';
            window.open(url, '_system');
          }
        });
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className={`rounded-xl border border-amber-700/50 bg-amber-900/20 p-4 ${className || ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MapPin className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-200 mb-1">Location access needed</p>
          <p className="text-xs text-amber-300/70 mb-3">
            Enable location in your device settings to see venues near you and check in.
          </p>
          <button
            onClick={handleOpenSettings}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Open Settings →
          </button>
        </div>
      </div>
    </div>
  );
};
