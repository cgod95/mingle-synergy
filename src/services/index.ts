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
// If you have a mockReconnectService, import it here

// AuthService always uses Firebase
export const authService = FirebaseAuthService;

// All other services switch based on DEMO_MODE
export const userService = DEMO_MODE ? MockUserService : FirebaseUserService;
export const venueService = DEMO_MODE ? MockVenueService : FirebaseVenueService;
export const matchService = DEMO_MODE ? MockMatchService : FirebaseMatchService;
export const interestService = DEMO_MODE ? MockInterestService : FirebaseInterestService;

// Lazy initialization for SubscriptionService to avoid TDZ issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _subscriptionServiceInstance: any = null;

function getSubscriptionInstance() {
  if (!_subscriptionServiceInstance) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SubscriptionService = require('./subscriptionService').default;
    _subscriptionServiceInstance = new SubscriptionService();
  }
  return _subscriptionServiceInstance;
}

type ActionType = "dailyLikes" | "dailySuperLikes" | "dailyRewinds" | "profileBoosts" | "messageFilters" | "advancedFilters";

export const subscriptionService = DEMO_MODE ? mockSubscriptionService : {
  getTiers() { return getSubscriptionInstance().getTiers(); },
  getTier(tierId: string) { return getSubscriptionInstance().getTier(tierId); },
  getUserSubscription(userId: string) { return getSubscriptionInstance().getUserSubscription(userId); },
  hasFeature(userId: string, feature: string) { return getSubscriptionInstance().hasFeature(userId, feature); },
  canPerformAction(userId: string, action: ActionType) { return getSubscriptionInstance().canPerformAction(userId, action); },
  recordUsage(userId: string, action: ActionType) { return getSubscriptionInstance().recordUsage(userId, action); },
  createSubscription(userId: string, tierId: string, paymentMethodId: string) { 
    return getSubscriptionInstance().createSubscription(userId, tierId, paymentMethodId); 
  },
  cancelSubscription(userId: string, cancelAtPeriodEnd?: boolean) { 
    return getSubscriptionInstance().cancelSubscription(userId, cancelAtPeriodEnd); 
  },
  upgradeSubscription(userId: string, newTierId: string) { 
    return getSubscriptionInstance().upgradeSubscription(userId, newTierId); 
  },
  getUserPaymentMethods(userId: string) { return getSubscriptionInstance().getUserPaymentMethods(userId); },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addPaymentMethod(userId: string, paymentMethod: any) { 
    return getSubscriptionInstance().addPaymentMethod(userId, paymentMethod); 
  },
  removePaymentMethod(userId: string, paymentMethodId: string) { 
    return getSubscriptionInstance().removePaymentMethod(userId, paymentMethodId); 
  },
  getSubscriptionAnalytics() { return getSubscriptionInstance().getSubscriptionAnalytics(); },
  resetDailyUsage() { return getSubscriptionInstance().resetDailyUsage(); },
};

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
