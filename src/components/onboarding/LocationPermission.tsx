
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface LocationPermissionProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({ onComplete, onSkip }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const requestLocation = async () => {
    setIsRequesting(true);
    setError(null);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      // Store in localStorage that permission was granted
      localStorage.setItem('locationPermissionGranted', 'true');
      
      // Here you would typically save the location to the user profile
      console.log('Location permission granted:', position);
      
      // Signal completion
      onComplete();
    } catch (error) {
      console.error('Location permission error:', error);
      setError('We couldn\'t access your location. Please check your browser settings and try again.');
    } finally {
      setIsRequesting(false);
    }
  };
  
  const handleSkip = () => {
    localStorage.setItem('locationPermissionSeen', 'true');
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <div className="flex-1 flex flex-col justify-center p-8">
        <div className="max-w-sm mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin size={48} className="text-brand-primary" />
            </div>
            
            <h1 className="text-2xl font-semibold text-text-primary mb-2">
              Enable Location Services
            </h1>
            
            <p className="text-text-secondary mb-4">
              Mingle needs your location to show you venues and people nearby. We only use your location when the app is open.
            </p>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
          </div>
          
          <Button
            onClick={requestLocation}
            disabled={isRequesting}
            className="w-full py-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full font-medium mb-3"
          >
            {isRequesting ? 'Requesting...' : 'Allow Location Access'}
          </Button>
          
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full py-6 text-text-secondary font-medium"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermission;
