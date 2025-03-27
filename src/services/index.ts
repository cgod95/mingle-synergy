
import { AuthService, UserService, VenueService, MatchService } from '@/types/services';

// Import services
import firebaseAuthService from './firebase/authService';
import mockAuthService from './mock/mockAuthService';
import mockUserService from './mock/mockUserService';
import mockVenueService from './mock/mockVenueService';
import mockMatchService from './mock/mockMatchService';
import mockInterestService from './mock/mockInterestService';
import firebaseUserService from './firebase/userService';
import firebaseVenueService from './firebase/venueService';
import firebaseMatchService from './firebase/matchService';
import firebaseVerificationService from './firebase/verificationService';
import mockVerificationService from './mock/mockVerificationService';

// Import Firebase availability status
import { isMock } from '@/firebase/config';

// Environment flags to control which services to use
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || 
                process.env.NODE_ENV === 'development' || 
                isMock;

// Service factory
const services = {
  auth: USE_MOCK ? mockAuthService : firebaseAuthService,
  user: USE_MOCK ? mockUserService : firebaseUserService,
  venue: USE_MOCK ? mockVenueService : firebaseVenueService,
  match: USE_MOCK ? mockMatchService : firebaseMatchService,
  verification: USE_MOCK ? mockVerificationService : firebaseVerificationService,
  interest: mockInterestService, // Always use mock interest service for now
};

console.log(`Using ${USE_MOCK ? 'mock' : 'Firebase'} services`);

export default services;
export const interestService = mockInterestService; // Explicitly export interest service
