import config from '@/config';
import FirebaseAuthService from './firebase/authService';
import FirebaseUserService from './firebase/userService';
import FirebaseVenueService from './firebase/venueService';
import FirebaseMatchService from './firebase/matchService';
import FirebaseInterestService from './firebase/interestService';
import FirebaseReconnectService from './reconnectService';
import SubscriptionService, { subscriptionService as realSubscriptionService } from './subscriptionService';

// All services use Firebase implementation
export const authService = FirebaseAuthService;
export const userService = FirebaseUserService;
export const venueService = FirebaseVenueService;
export const matchService = FirebaseMatchService;
export const interestService = FirebaseInterestService;
export const subscriptionService = realSubscriptionService;
export const reconnectService = new FirebaseReconnectService();

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
