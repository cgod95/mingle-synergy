// Export mock services
import mockAuthService from './mockAuthService';
import mockUserService from './mockUserService';
import mockVenueService from './mockVenueService';
import mockMatchService from './mockMatchService';
import mockVerificationService from './mockVerificationService';
import mockInterestService from './mockInterestService';

export {
  mockAuthService,
  mockUserService,
  mockVenueService,
  mockMatchService,
  mockVerificationService,
  mockInterestService
};

export const mockSubscriptionService = {
  getPlans: async () => [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'monthly',
      features: [
        'Basic matching',
        'Limited daily likes',
        'Basic chat',
        'Profile creation'
      ],
      limits: {
        dailyLikes: 10,
        dailySuperLikes: 0,
        dailyRewinds: 0,
        profileBoosts: 0,
        messageFilters: 0,
        advancedFilters: 0,
        readReceipts: false,
        unlimitedMessages: false,
        prioritySupport: false
      }
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      interval: 'monthly',
      features: [
        'Unlimited likes',
        'Super likes',
        'Rewind last swipe',
        'Profile boost',
        'Advanced filters',
        'Read receipts',
        'Unlimited messages',
        'Priority support'
      ],
      limits: {
        dailyLikes: -1,
        dailySuperLikes: 5,
        dailyRewinds: 3,
        profileBoosts: 1,
        messageFilters: 5,
        advancedFilters: 10,
        readReceipts: true,
        unlimitedMessages: true,
        prioritySupport: true
      },
      popular: true
    }
  ]
};
