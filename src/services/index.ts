
import { AuthService, UserService, VenueService, MatchService, InterestService } from '@/types/services';

// Import mock services
import mockAuthService from './mock/mockAuthService';
import mockUserService from './mock/mockUserService';
import mockVenueService from './mock/mockVenueService';
import mockMatchService from './mock/mockMatchService';
import mockInterestService from './mock/mockInterestService';
import mockVerificationService from './mock/mockVerificationService';

// Import Firebase services (these will only be used if not in AI editor)
import firebaseAuthService from './firebase/authService';
import firebaseUserService from './firebase/userService';
import firebaseVenueService from './firebase/venueService';
import firebaseMatchService from './firebase/matchService';
import firebaseInterestService from './firebase/interestService';
import firebaseVerificationService from './firebase/verificationService';

// Check if we're in the AI editor environment
const isAIEditor = typeof window !== 'undefined' && window.location.hostname.includes('lovableproject.com');
const USE_MOCK = isAIEditor || 
  import.meta.env.VITE_USE_MOCK === 'true' || 
  (process.env.NODE_ENV === 'development' && import.meta.env.VITE_USE_MOCK !== 'false');

console.log('Environment check: Using mock services =', USE_MOCK, 
  isAIEditor ? '(Running in AI editor)' : '');

// Initialize services
let services;

// ALWAYS use mock services in the AI editor
if (isAIEditor) {
  console.log('Running in AI editor environment - using mock services only');
  
  services = {
    auth: mockAuthService,
    user: mockUserService,
    venue: mockVenueService,
    match: mockMatchService,
    interest: mockInterestService,
    verification: mockVerificationService
  };
} else {
  try {
    if (USE_MOCK) {
      console.log('Using mock services based on environment configuration');
      services = {
        auth: mockAuthService,
        user: mockUserService,
        venue: mockVenueService,
        match: mockMatchService,
        interest: mockInterestService,
        verification: mockVerificationService
      };
    } else {
      console.log('Using Firebase services');
      services = {
        auth: firebaseAuthService,
        user: firebaseUserService,
        venue: firebaseVenueService,
        match: firebaseMatchService,
        interest: firebaseInterestService,
        verification: firebaseVerificationService
      };
    }
  } catch (error) {
    console.error('Error initializing services, using mock fallback:', error);
    services = {
      auth: mockAuthService,
      user: mockUserService,
      venue: mockVenueService,
      match: mockMatchService,
      interest: mockInterestService,
      verification: mockVerificationService
    };
  }
}

export default services;
export const { auth, user, venue, match, verification, interest } = services;
