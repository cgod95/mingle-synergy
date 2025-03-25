
import { AuthService, UserService, VenueService, MatchService } from '@/types/services';

// Import services
import firebaseAuthService from './firebase/authService';
import mockAuthService from './mock/mockAuthService';
import mockUserService from './mock/mockUserService';
import mockVenueService from './mock/mockVenueService';
import mockMatchService from './mock/mockMatchService';
import firebaseUserService from './firebase/userService';
import firebaseVenueService from './firebase/venueService';
import firebaseMatchService from './firebase/matchService';
import firebaseVerificationService from './firebase/verificationService';
import mockVerificationService from './mock/mockVerificationService';
import { matchService } from './MatchService';
import { userService } from './UserService';

// Determine which implementation to use
// Setting to use mock services for Lovable development environment
const USE_MOCK = true;

// Export services
const services = {
  auth: USE_MOCK ? mockAuthService : firebaseAuthService,
  user: USE_MOCK ? mockUserService : firebaseUserService,
  venue: USE_MOCK ? mockVenueService : firebaseVenueService,
  match: USE_MOCK ? mockMatchService : firebaseMatchService,
  verification: USE_MOCK ? mockVerificationService : firebaseVerificationService,
  // Add the new direct match service
  directMatch: matchService,
  // Add the new direct user service
  directUser: userService
};

export default services;
