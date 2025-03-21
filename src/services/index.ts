
import { AuthService, UserService, VenueService, MatchService } from '@/types/services';

// Import services
import firebaseAuthService from './firebase/authService';
import mockAuthService from './mock/mockAuthService';
import mockUserService from './mock/mockUserService';
import mockVenueService from './mock/mockVenueService';
import mockMatchService from './mock/mockMatchService';
import firebaseUserService from './firebase/userService';
import firebaseVenueService from './firebase/venueService';

// Firebase service implementations will be imported here as they're developed
// import firebaseMatchService from './firebase/matchService';

// Determine which implementation to use
// Setting default to use mock services
const USE_MOCK = true;

// Export services
const services = {
  auth: USE_MOCK ? mockAuthService : firebaseAuthService,
  user: USE_MOCK ? mockUserService : firebaseUserService, // Updated to use Firebase implementation
  venue: USE_MOCK ? mockVenueService : firebaseVenueService, // Updated to use Firebase implementation
  match: USE_MOCK ? mockMatchService : null, // Will be replaced with firebaseMatchService
};

export default services;
