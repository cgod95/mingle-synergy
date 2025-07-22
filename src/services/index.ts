import config from '@/config';
import FirebaseAuthService from './firebase/authService';
import FirebaseUserService from './firebase/userService';
import FirebaseVenueService from './firebase/venueService';
import FirebaseMatchService from './firebase/matchService';
import FirebaseInterestService from './firebase/interestService';
import FirebaseReconnectService, { MockReconnectService } from './reconnectService';

import MockUserService from './mock/mockUserService';
import MockVenueService from './mock/mockVenueService';
import MockMatchService from './mock/mockMatchService';
import MockInterestService from './mock/mockInterestService';
import { mockSubscriptionService } from './mock';
import SubscriptionService, { subscriptionService as realSubscriptionService } from './subscriptionService';

// AuthService always uses Firebase
export const authService = FirebaseAuthService;

// All other services switch based on config
export const userService = config.DEMO_MODE ? MockUserService : FirebaseUserService;
export const venueService = config.DEMO_MODE ? MockVenueService : FirebaseVenueService;
export const matchService = config.DEMO_MODE ? MockMatchService : FirebaseMatchService;
export const interestService = config.DEMO_MODE ? MockInterestService : FirebaseInterestService;
export const subscriptionService = config.DEMO_MODE ? mockSubscriptionService : realSubscriptionService;

// Reconnect service implementation
export const reconnectService = config.DEMO_MODE ? 
  new MockReconnectService() : 
  new FirebaseReconnectService();

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
