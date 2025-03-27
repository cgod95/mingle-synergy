
import { AuthService, UserService, VenueService, MatchService, InterestService } from '@/types/services';

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
import firebaseInterestService from './firebase/interestService';
import firebaseVerificationService from './firebase/verificationService';
import mockVerificationService from './mock/mockVerificationService';

// Import Firebase availability status
import { isFirebaseAvailable } from '@/firebase/safeFirebase';

// Environment flags to control which services to use
const isAIEditor = typeof window !== 'undefined' && window.location.hostname.includes('lovableproject.com');
const USE_MOCK = isAIEditor || 
  import.meta.env.VITE_USE_MOCK === 'true' || 
  (process.env.NODE_ENV === 'development' && import.meta.env.VITE_USE_MOCK !== 'false') || 
  !isFirebaseAvailable();

console.log('Environment check: Using mock services =', USE_MOCK, 
  isAIEditor ? '(Running in AI editor)' : '');

// Service factory
const services = {
  auth: USE_MOCK ? mockAuthService : firebaseAuthService,
  user: USE_MOCK ? mockUserService : firebaseUserService,
  venue: USE_MOCK ? mockVenueService : firebaseVenueService,
  match: USE_MOCK ? mockMatchService : firebaseMatchService,
  verification: USE_MOCK ? mockVerificationService : firebaseVerificationService,
  interest: USE_MOCK ? mockInterestService : firebaseInterestService,
};

console.log(`Using ${USE_MOCK ? 'mock' : 'Firebase'} services`);

export default services;
export const { auth, user, venue, match, verification, interest } = services;
