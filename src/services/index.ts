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

// Import mock status from Firebase config
import { isMock } from '@/firebase/config';

// Export services based on mock status - force mock for development
const services = {
  auth: mockAuthService, // Always use mock auth for now
  user: isMock ? mockUserService : firebaseUserService,
  venue: isMock ? mockVenueService : firebaseVenueService,
  match: isMock ? mockMatchService : firebaseMatchService,
  verification: isMock ? mockVerificationService : firebaseVerificationService,
};

export default services;
