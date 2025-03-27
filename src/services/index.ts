
import { 
  MockAuthService, 
  MockUserService, 
  MockVenueService, 
  MockMatchService,
  MockInterestService
} from './mock';

// Always use mock services in the Lovable environment
console.log('Using mock services for development');

// Export mock services directly
export const authService = new MockAuthService();
export const userService = new MockUserService();
export const venueService = new MockVenueService();
export const matchService = new MockMatchService();
export const interestService = new MockInterestService();

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
