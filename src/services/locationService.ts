import { GeoPoint, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, firestore } from '@/firebase/config';
import { auth } from '@/firebase/config';

export class LocationService {
  private watchId: number | null = null;
  
  // Start tracking location
  startTracking(userId: string) {
    if (!navigator.geolocation) {
      return Promise.reject(new Error('Geolocation not supported'));
    }
    
    return new Promise((resolve, reject) => {
      this.watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Update user location in Firestore
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              location: new GeoPoint(latitude, longitude),
              lastLocationUpdate: new Date().toISOString(),
              lastLocation: {
                latitude,
                longitude,
                timestamp: serverTimestamp()
              }
            });
            
            resolve(position);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 10000
        }
      );
    });
  }
  
  // Stop tracking location
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
  
  // Get nearby venues
  async getNearbyVenues(lat: number, lng: number, radiusKm = 1): Promise<never[]> {
    // Implement with GeoFirestore if available, or use simple distance calculation
    // This is a placeholder for the actual implementation
    return [];
  }

  // Location services setup - keep compatibility with existing implementation
  initializeLocationServices() {
    // Request permission with clear messaging
    if ('geolocation' in navigator) {
      // Check if we've already asked for permission
      if (!localStorage.getItem('locationPermissionGranted')) {
        // Show a custom modal explaining location usage first
        this.showLocationExplanationModal(() => {
          this.requestLocationPermission();
        });
      }
    }
  }

  // Request location permission with proper error handling - keep compatibility with existing implementation
  async requestLocationPermission(): Promise<boolean> {
    // Check if geolocation API is available
    if (!navigator.geolocation) {
      console.warn('Geolocation API not supported in this browser');
      localStorage.setItem('locationPermissionGranted', 'false');
      return false;
    }

    // Check Permissions-Policy before attempting
    if (typeof document !== 'undefined' && 'featurePolicy' in document) {
      try {
        // @ts-expect-error - featurePolicy may not be in TypeScript types
        const allowed = document.featurePolicy.allowsFeature('geolocation');
        if (!allowed) {
          console.error('Geolocation is blocked by Permissions-Policy. Please check server configuration.');
          localStorage.setItem('locationPermissionGranted', 'false');
          return false;
        }
      } catch (e) {
        // Feature Policy API not available, continue
      }
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache location for 5 minutes to avoid repeated prompts
        });
      });
      
      console.log('Location permission granted');
      localStorage.setItem('locationPermissionGranted', 'true');
      
      // Store location in user profile
      if (auth.currentUser) {
        const userRef = doc(firestore, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          lastLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: serverTimestamp()
          }
        });
      }
      
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || String(error || '');
      const errorCode = error?.code;
      
      // Handle permissions policy violations
      if (
        errorMessage.includes('permissions policy') || 
        errorMessage.includes('Permissions policy') ||
        errorMessage.includes('Permissions-Policy') ||
        (errorMessage.includes('permission denied') && errorMessage.includes('policy'))
      ) {
        console.error('Geolocation blocked by Permissions-Policy. The server configuration needs to allow geolocation=(self).');
        localStorage.setItem('locationPermissionGranted', 'false');
        return false;
      }
      
      // Handle specific error codes
      if (errorCode === 1) {
        console.warn('User denied geolocation permission');
      } else if (errorCode === 2) {
        console.warn('Geolocation position unavailable');
      } else if (errorCode === 3) {
        console.warn('Geolocation request timed out');
      } else {
        console.error('Location permission error:', error);
      }
      
      localStorage.setItem('locationPermissionGranted', 'false');
      return false;
    }
  }

  // Show a modal explaining why we need location permission - keep compatibility with existing implementation
  showLocationExplanationModal(onAccept: () => void) {
    // Create modal element
    const modalContainer = document.createElement('div');
    modalContainer.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]';
    modalContainer.style.animation = 'fadeIn 0.2s ease-out';
    
    // Modal content - dark theme, industry-standard pre-permission
    modalContainer.innerHTML = `
      <div class="bg-neutral-800 rounded-2xl p-6 m-4 max-w-sm border border-neutral-700 shadow-2xl" style="animation: slideUp 0.3s ease-out">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgb(129,140,248)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
        <h3 class="text-xl font-bold mb-2 text-white text-center">Find Venues Near You</h3>
        <p class="mb-6 text-neutral-400 text-center text-sm leading-relaxed">Mingle uses your location to show nearby venues and people. Your location is only used while the app is open and is never shared publicly.</p>
        <div class="flex flex-col gap-3">
          <button id="location-allow" class="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors min-h-[48px]">Enable Location</button>
          <button id="location-later" class="w-full px-4 py-3 text-neutral-400 hover:text-neutral-200 rounded-xl font-medium transition-colors min-h-[44px]">Not Now</button>
        </div>
      </div>
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    `;
    
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    document.getElementById('location-allow')?.addEventListener('click', () => {
      onAccept();
      document.body.removeChild(modalContainer);
    });
    
    document.getElementById('location-later')?.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });
  }

  // Get the current user location - keep compatibility with existing implementation
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    if (!('geolocation' in navigator)) {
      return null;
    }
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache location for 5 minutes
        });
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();

// Export these functions for backward compatibility
export const initializeLocationServices = (): void => {
  locationService.initializeLocationServices();
};

export const requestLocationPermission = (): Promise<boolean> => {
  return locationService.requestLocationPermission();
};

export const showLocationExplanationModal = (onAccept: () => void): void => {
  locationService.showLocationExplanationModal(onAccept);
};

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
  return locationService.getCurrentLocation();
};
