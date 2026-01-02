import React, { useState, useEffect } from 'react';
import { MapPin, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getLocationPermissionStatus, 
  requestLocationPermission,
  LocationPermissionStatus 
} from '@/utils/locationPermission';

interface LocationStatusBannerProps {
  onPermissionGranted?: () => void;
  className?: string;
}

/**
 * LocationStatusBanner - Shows when location permission is denied or unavailable
 * Provides clear messaging and a way to re-request permission
 */
export function LocationStatusBanner({ onPermissionGranted, className = '' }: LocationStatusBannerProps) {
  const [status, setStatus] = useState<LocationPermissionStatus>('prompt');
  const [dismissed, setDismissed] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // Check initial status
    const currentStatus = getLocationPermissionStatus();
    setStatus(currentStatus);
    
    // If location is already granted, never show the banner
    if (currentStatus === 'granted') {
      // Also persist this so we don't show banner on future visits
      localStorage.setItem('locationPermissionGranted', 'true');
      return;
    }
    
    // Check if location was previously granted (persisted)
    const previouslyGranted = localStorage.getItem('locationPermissionGranted');
    if (previouslyGranted === 'true') {
      setDismissed(true);
      return;
    }
    
    // Check if previously dismissed permanently
    const permanentlyDismissed = localStorage.getItem('locationBannerDismissed');
    if (permanentlyDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleEnableLocation = async () => {
    setRequesting(true);
    try {
      const granted = await requestLocationPermission();
      if (granted) {
        setStatus('granted');
        // Persist that location was granted so banner never shows again
        localStorage.setItem('locationPermissionGranted', 'true');
        onPermissionGranted?.();
      } else {
        setStatus('denied');
      }
    } catch {
      setStatus('denied');
    } finally {
      setRequesting(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Use localStorage for permanent dismissal (persists across sessions)
    localStorage.setItem('locationBannerDismissed', 'true');
  };

  // Don't show if permission granted, unsupported, or dismissed
  if (status === 'granted' || status === 'unsupported' || dismissed) {
    return null;
  }

  // Show prompt banner (encouraging but not alarming)
  if (status === 'prompt') {
    return (
      <div className={`bg-indigo-900/40 border border-indigo-600/50 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              Enable Location for Better Experience
            </h3>
            <p className="text-xs text-indigo-200 mb-3">
              Location access lets you check in to venues and see people nearby. 
              You can still browse venues without it.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleEnableLocation}
                disabled={requesting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 h-auto"
              >
                {requesting ? 'Enabling...' : 'Enable Location'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-indigo-300 hover:text-white text-xs px-3 py-1.5 h-auto"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show denied banner (warning but with recovery option)
  return (
    <div className={`bg-amber-900/30 border border-amber-600/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-600/30 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-1">
            Location Access Limited
          </h3>
          <p className="text-xs text-amber-200 mb-3">
            Without location, you can browse venues but won't be able to check in or see nearby people.
            Enable location in your browser settings to unlock all features.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleEnableLocation}
              disabled={requesting}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-1.5 h-auto"
            >
              {requesting ? 'Requesting...' : 'Try Again'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-amber-300 hover:text-white text-xs px-3 py-1.5 h-auto"
            >
              <X className="w-3 h-3 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact location warning for inline use
 */
export function LocationRequiredMessage({ action = 'check in' }: { action?: string }) {
  const [requesting, setRequesting] = useState(false);
  
  const handleRequest = async () => {
    setRequesting(true);
    try {
      await requestLocationPermission();
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-amber-400 text-sm">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>Location required to {action}.</span>
      <button
        onClick={handleRequest}
        disabled={requesting}
        className="underline hover:text-amber-300 transition-colors"
      >
        {requesting ? 'Enabling...' : 'Enable'}
      </button>
    </div>
  );
}

export default LocationStatusBanner;





