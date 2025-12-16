// DEMO_MODE flag: set to true for demo/mock mode, false for Firebase backend
// CRITICAL: Use environment variable, not hardcoded value
// BETA FIX: Only enable demo mode if EXPLICITLY set to 'true'
// This allows Firebase to work in development for beta testing
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

import FirebaseAuthService from './firebase/authService';
import FirebaseUserService from './firebase/userService';
import FirebaseVenueService from './firebase/venueService';
import FirebaseMatchService from './firebase/matchService';
import FirebaseInterestService from './firebase/interestService';

import MockUserService from './mock/mockUserService';
import MockVenueService from './mock/mockVenueService';
import MockMatchService from './mock/mockMatchService';
import MockInterestService from './mock/mockInterestService';
import { mockSubscriptionService } from './mock';
import SubscriptionService from './subscriptionService';
// If you have a mockReconnectService, import it here

// AuthService always uses Firebase
export const authService = FirebaseAuthService;

// All other services switch based on DEMO_MODE
export const userService = DEMO_MODE ? MockUserService : FirebaseUserService;
export const venueService = DEMO_MODE ? MockVenueService : FirebaseVenueService;
export const matchService = DEMO_MODE ? MockMatchService : FirebaseMatchService;
export const interestService = DEMO_MODE ? MockInterestService : FirebaseInterestService;
export const subscriptionService = DEMO_MODE ? mockSubscriptionService : new SubscriptionService();
// For now, set reconnectService to undefined in both modes
export const reconnectService = undefined; // TODO: Add mockReconnectService if needed

// Default export for convenience
const services = {
  auth: authService,
  user: userService,
  venue: venueService,
  match: matchService,
  interest: interestService,
  reconnect: reconnectService,
};
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
