// Firebase Services Unified Exports
export { default as authService } from './authService';
export { default as userService } from './userService';
export { default as matchService } from './matchService';
export { default as venueService } from './venueService';
export { default as onboardingService } from './onboardingService';
export { default as verificationService } from './verificationService';
export { default as interestService } from './interestService';
export { default as contactService } from './contactService';

// Standalone function exports
export { likeUser, likeUserWithMutualDetection } from './matchService'; 