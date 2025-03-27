
import { 
  default as mockAuthService, 
  default as MockAuthService
} from './mock/mockAuthService';
import { 
  default as mockUserService,
  default as MockUserService
} from './mock/mockUserService';
import { 
  default as mockVenueService,
  default as MockVenueService
} from './mock/mockVenueService';
import { 
  default as mockMatchService,
  default as MockMatchService
} from './mock/mockMatchService';
import { 
  default as mockInterestService,
  default as MockInterestService
} from './mock/mockInterestService';
import { 
  default as mockVerificationService,
  default as MockVerificationService
} from './mock/mockVerificationService';

// Always use mock services in the Lovable environment
console.log('Using mock services for development');

// Export mock services directly
export const authService = mockAuthService;
export const userService = mockUserService;
export const venueService = mockVenueService;
export const matchService = mockMatchService;
export const interestService = mockInterestService;
export const verification = mockVerificationService;

// For backward compatibility with existing imports
const services = {
  auth: authService,
  user: userService,
  venue: venueService,
  match: matchService,
  interest: interestService,
  verification
};

// Export as default for files that use import services from '@/services'
export default services;

/* 
FIREBASE TRANSITION GUIDE:

When moving to your real development environment:

1. Uncomment and modify the code below to dynamically choose services:

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let services;

if (USE_MOCK) {
  services = {
    authService: new MockAuthService(),
    userService: new MockUserService(),
    venueService: new MockVenueService(),
    matchService: new MockMatchService(),
    interestService: new MockInterestService()
  };
} else {
  // Uncomment and implement Firebase services
  // import { 
  //   FirebaseAuthService, 
  //   FirebaseUserService, 
  //   FirebaseVenueService, 
  //   FirebaseMatchService,
  //   FirebaseInterestService
  // } from './firebase';
  
  services = {
    // authService: new FirebaseAuthService(),
    // userService: new FirebaseUserService(),
    // venueService: new FirebaseVenueService(),
    // matchService: new FirebaseMatchService(),
    // interestService: new FirebaseInterestService()
  };
}

export const { 
  authService, 
  userService, 
  venueService, 
  matchService, 
  interestService 
} = services;

2. Ensure your Firebase config is properly set up in your environment variables
3. Implement the Firebase service classes to match the interfaces used by the mock services
*/
