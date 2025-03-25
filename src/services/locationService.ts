
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/services/firebase';
import { auth } from '@/services/firebase';

// Location services setup
export const initializeLocationServices = () => {
  // Request permission with clear messaging
  if ('geolocation' in navigator) {
    // Check if we've already asked for permission
    if (!localStorage.getItem('locationPermissionGranted')) {
      // Show a custom modal explaining location usage first
      showLocationExplanationModal(() => {
        requestLocationPermission();
      });
    }
  }
};

// Request location permission with proper error handling
export const requestLocationPermission = async (): Promise<boolean> => {
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
};

// Show a modal explaining why we need location permission
export const showLocationExplanationModal = (onAccept: () => void) => {
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
};

// Get the current user location
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
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
};
