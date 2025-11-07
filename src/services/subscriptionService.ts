// Subscription service for premium features and payment processing

import { analytics } from './analytics';

// Extend Window interface for Stripe
declare global {
  interface Window {
    Stripe?: (key: string) => {
      createToken: (element: HTMLElement) => Promise<{ token?: { id: string }; error?: { message: string } }>;
      createPaymentMethod: (params: { type: string; card: HTMLElement }) => Promise<{ paymentMethod?: { id: string }; error?: { message: string } }>;
      confirmCardPayment: (clientSecret: string, params: { payment_method: string }) => Promise<{ paymentIntent?: { status: string }; error?: { message: string } }>;
    };
  }
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    dailyLikes: number;
    dailySuperLikes: number;
    dailyRewinds: number;
    profileBoosts: number;
    messageFilters: number;
    advancedFilters: number;
    readReceipts: boolean;
    unlimitedMessages: boolean;
    prioritySupport: boolean;
  };
  popular?: boolean;
  bestValue?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  tierId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  features: string[];
  usage: {
    dailyLikes: number;
    dailySuperLikes: number;
    dailyRewinds: number;
    profileBoosts: number;
    messageFilters: number;
    advancedFilters: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export class SubscriptionService {
  private stripe: {
    createToken: (element: HTMLElement) => Promise<{ token?: { id: string }; error?: { message: string } }>;
    createPaymentMethod: (params: { type: string; card: HTMLElement }) => Promise<{ paymentMethod?: { id: string }; error?: { message: string } }>;
    confirmCardPayment: (clientSecret: string, params: { payment_method: string }) => Promise<{ paymentIntent?: { status: string }; error?: { message: string } }>;
  } | null = null;
  private readonly tiers: SubscriptionTier[] = [
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
        dailyLikes: -1, // unlimited
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
    },
    {
      id: 'premium_yearly',
      name: 'Premium',
      price: 99.99,
      interval: 'yearly',
      features: [
        'All Premium features',
        '2 months free',
        'Exclusive events access',
        'Profile verification badge'
      ],
      limits: {
        dailyLikes: -1,
        dailySuperLikes: 10,
        dailyRewinds: 5,
        profileBoosts: 2,
        messageFilters: 10,
        advancedFilters: 20,
        readReceipts: true,
        unlimitedMessages: true,
        prioritySupport: true
      },
      bestValue: true
    }
  ];

  private subscriptions: Map<string, UserSubscription> = new Map();
  private paymentMethods: Map<string, PaymentMethod[]> = new Map();

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe() {
    if (typeof window !== 'undefined' && window.Stripe) {
      this.stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    }
  }

  // Get all available tiers
  getTiers(): SubscriptionTier[] {
    return this.tiers;
  }

  // Get tier by ID
  getTier(tierId: string): SubscriptionTier | undefined {
    return this.tiers.find(tier => tier.id === tierId);
  }

  // Get user's current subscription
  getUserSubscription(userId: string): UserSubscription | null {
    const subscription = this.subscriptions.get(userId);
    if (!subscription || subscription.status !== 'active') {
      return null;
    }
    return subscription;
  }

  // Check if user has a specific feature
  hasFeature(userId: string, feature: string): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) {
      // Check free tier features
      const freeTier = this.getTier('free');
      return freeTier?.features.includes(feature) || false;
    }

    const tier = this.getTier(subscription.tierId);
    return tier?.features.includes(feature) || false;
  }

  // Check if user can perform an action (respecting limits)
  canPerformAction(userId: string, action: keyof UserSubscription['usage']): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) {
      // Check free tier limits
      const freeTier = this.getTier('free');
      const limit = freeTier?.limits[action] || 0;
      return limit === -1 || subscription?.usage[action] < limit;
    }

    const tier = this.getTier(subscription.tierId);
    const limit = tier?.limits[action] || 0;
    
    // -1 means unlimited
    if (limit === -1) return true;
    
    return subscription.usage[action] < limit;
  }

  // Record usage of a feature
  recordUsage(userId: string, action: keyof UserSubscription['usage']): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) {
      // Handle free tier usage
      const freeTier = this.getTier('free');
      const limit = freeTier?.limits[action] || 0;
      
      if (limit === -1) return true;
      
      // For free tier, we'd need to track usage differently
      // This is a simplified implementation
      return true;
    }

    if (!this.canPerformAction(userId, action)) {
      return false;
    }

    subscription.usage[action]++;
    subscription.updatedAt = new Date();
    
    analytics.track('feature_usage', {
      user_id: userId,
      feature: action,
      subscription_tier: subscription.tierId
    });

    return true;
  }

  // Create subscription (simulate Stripe integration)
  async createSubscription(
    userId: string, 
    tierId: string, 
    paymentMethodId: string
  ): Promise<UserSubscription> {
    const tier = this.getTier(tierId);
    if (!tier) {
      throw new Error('Invalid subscription tier');
    }

    const now = new Date();
    const periodEnd = new Date(now);
    
    if (tier.interval === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const subscription: UserSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      tierId,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      stripeCustomerId: `cus_${userId}`,
      stripeSubscriptionId: `sub_${userId}`,
      features: tier.features,
      usage: {
        dailyLikes: 0,
        dailySuperLikes: 0,
        dailyRewinds: 0,
        profileBoosts: 0,
        messageFilters: 0,
        advancedFilters: 0
      },
      createdAt: now,
      updatedAt: now
    };

    this.subscriptions.set(userId, subscription);

    analytics.track('subscription_created', {
      user_id: userId,
      tier_id: tierId,
      price: tier.price,
      interval: tier.interval
    });

    return subscription;
  }

  // Cancel subscription
  async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
      subscription.status = 'active'; // Still active until period ends
    } else {
      subscription.status = 'canceled';
    }

    subscription.updatedAt = new Date();

    analytics.track('subscription_canceled', {
      user_id: userId,
      tier_id: subscription.tierId,
      cancel_at_period_end: cancelAtPeriodEnd
    });
  }

  // Upgrade subscription
  async upgradeSubscription(userId: string, newTierId: string): Promise<UserSubscription> {
    const currentSubscription = this.getUserSubscription(userId);
    const newTier = this.getTier(newTierId);

    if (!newTier) {
      throw new Error('Invalid subscription tier');
    }

    if (currentSubscription) {
      // Cancel current subscription
      await this.cancelSubscription(userId, true);
    }

    // Create new subscription
    const newSubscription = await this.createSubscription(userId, newTierId, 'pm_default');

    analytics.track('subscription_upgraded', {
      user_id: userId,
      from_tier: currentSubscription?.tierId || 'free',
      to_tier: newTierId
    });

    return newSubscription;
  }

  // Get payment methods for user
  getUserPaymentMethods(userId: string): PaymentMethod[] {
    return this.paymentMethods.get(userId) || [];
  }

  // Add payment method
  async addPaymentMethod(
    userId: string, 
    paymentMethod: Omit<PaymentMethod, 'id' | 'isDefault'>
  ): Promise<PaymentMethod> {
    const methods = this.getUserPaymentMethods(userId);
    const newMethod: PaymentMethod = {
      ...paymentMethod,
      id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isDefault: methods.length === 0
    };

    this.paymentMethods.set(userId, [...methods, newMethod]);

    analytics.track('payment_method_added', {
      user_id: userId,
      payment_method_type: paymentMethod.type
    });

    return newMethod;
  }

  // Remove payment method
  async removePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    const methods = this.getUserPaymentMethods(userId);
    const updatedMethods = methods.filter(method => method.id !== paymentMethodId);
    
    this.paymentMethods.set(userId, updatedMethods);

    analytics.track('payment_method_removed', {
      user_id: userId,
      payment_method_id: paymentMethodId
    });
  }

  // Get subscription analytics
  getSubscriptionAnalytics(): {
    totalSubscribers: number;
    revenueByTier: Record<string, number>;
    churnRate: number;
    averageRevenuePerUser: number;
  } {
    const activeSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.status === 'active');

    const totalSubscribers = activeSubscriptions.length;
    
    const revenueByTier: Record<string, number> = {};
    let totalRevenue = 0;

    activeSubscriptions.forEach(sub => {
      const tier = this.getTier(sub.tierId);
      if (tier) {
        revenueByTier[sub.tierId] = (revenueByTier[sub.tierId] || 0) + tier.price;
        totalRevenue += tier.price;
      }
    });

    const averageRevenuePerUser = totalSubscribers > 0 ? totalRevenue / totalSubscribers : 0;

    // Simplified churn calculation
    const canceledThisMonth = Array.from(this.subscriptions.values())
      .filter(sub => sub.status === 'canceled' && 
        sub.updatedAt.getMonth() === new Date().getMonth())
      .length;

    const churnRate = totalSubscribers > 0 ? (canceledThisMonth / totalSubscribers) * 100 : 0;

    return {
      totalSubscribers,
      revenueByTier,
      churnRate,
      averageRevenuePerUser
    };
  }

  // Reset daily usage (should be called daily)
  resetDailyUsage(): void {
    const now = new Date();
    
    this.subscriptions.forEach(subscription => {
      const lastReset = new Date(subscription.updatedAt);
      const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceReset >= 1) {
        subscription.usage = {
          dailyLikes: 0,
          dailySuperLikes: 0,
          dailyRewinds: 0,
          profileBoosts: 0,
          messageFilters: 0,
          advancedFilters: 0
        };
        subscription.updatedAt = now;
      }
    });
  }
}

export default SubscriptionService; 