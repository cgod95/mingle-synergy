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
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
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
    } catch (error) {
      console.error('Location permission denied:', error);
      localStorage.setItem('locationPermissionGranted', 'false');
      return false;
    }
  }

  // Show a modal explaining why we need location permission - keep compatibility with existing implementation
  showLocationExplanationModal(onAccept: () => void) {
    // Create modal element
    const modalContainer = document.createElement('div');
    modalContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // Modal content
    modalContainer.innerHTML = `
      <div class="bg-white rounded-lg p-6 m-4 max-w-sm">
        <h3 class="text-xl font-bold mb-4">Allow Location Access</h3>
        <p class="mb-4">Mingle needs your location to show you venues and people nearby. We only use your location when the app is open.</p>
        <div class="flex justify-end space-x-3">
          <button id="location-later" class="px-4 py-2 text-gray-600">Later</button>
          <button id="location-allow" class="px-4 py-2 bg-brand-primary text-white rounded-lg">Allow</button>
        </div>
      </div>
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
          maximumAge: 0
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
