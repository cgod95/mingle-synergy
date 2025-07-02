// Subscription service for premium features and payment processing

import { analytics } from './analytics';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  trialDays?: number;
}

export interface UserSubscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  startDate: number;
  endDate?: number;
  trialEndDate?: number;
  autoRenew: boolean;
  paymentMethod?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

class SubscriptionService {
  private plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Basic features for everyone',
      price: 0,
      currency: 'USD',
      interval: 'monthly',
      features: [
        '5 matches per day',
        'Basic messaging',
        'Venue discovery',
        'Profile creation'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Enhanced experience with unlimited features',
      price: 9.99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'Unlimited matches',
        'Unlimited messaging',
        'See who liked you',
        'Advanced filters',
        'Priority support',
        'Read receipts',
        'Undo last swipe'
      ],
      popular: true,
      trialDays: 7
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      description: 'Best value with 2 months free',
      price: 99.99,
      currency: 'USD',
      interval: 'yearly',
      features: [
        'All Premium features',
        '2 months free',
        'Exclusive events access',
        'Profile boost',
        'Travel mode'
      ],
      trialDays: 7
    }
  ];

  private userSubscription: UserSubscription | null = null;
  private paymentMethods: PaymentMethod[] = [];

  constructor() {
    this.loadUserData();
  }

  // Plan management
  getPlans(): SubscriptionPlan[] {
    return [...this.plans];
  }

  getPlan(planId: string): SubscriptionPlan | undefined {
    return this.plans.find(plan => plan.id === planId);
  }

  getCurrentPlan(): SubscriptionPlan | null {
    if (!this.userSubscription) {
      return this.getPlan('free');
    }
    return this.getPlan(this.userSubscription.planId);
  }

  // Subscription management
  async subscribe(planId: string, paymentMethodId?: string): Promise<UserSubscription> {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    if (plan.price === 0) {
      // Free plan
      this.userSubscription = {
        id: `sub_${Date.now()}`,
        planId,
        status: 'active',
        startDate: Date.now(),
        autoRenew: false
      };
    } else {
      // Paid plan
      const trialEndDate = plan.trialDays ? Date.now() + (plan.trialDays * 24 * 60 * 60 * 1000) : undefined;
      
      this.userSubscription = {
        id: `sub_${Date.now()}`,
        planId,
        status: trialEndDate ? 'trial' : 'active',
        startDate: Date.now(),
        endDate: plan.interval === 'monthly' ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (365 * 24 * 60 * 60 * 1000),
        trialEndDate,
        autoRenew: true,
        paymentMethod: paymentMethodId
      };
    }

    this.saveUserData();
    analytics.track('subscription_started', { planId, planName: plan.name });
    
    return this.userSubscription;
  }

  async cancelSubscription(): Promise<void> {
    if (!this.userSubscription) {
      throw new Error('No active subscription');
    }

    this.userSubscription.status = 'canceled';
    this.userSubscription.autoRenew = false;
    this.saveUserData();

    analytics.track('subscription_canceled', { planId: this.userSubscription.planId });
  }

  async reactivateSubscription(): Promise<void> {
    if (!this.userSubscription || this.userSubscription.status !== 'canceled') {
      throw new Error('No canceled subscription to reactivate');
    }

    this.userSubscription.status = 'active';
    this.userSubscription.autoRenew = true;
    this.saveUserData();

    analytics.track('subscription_reactivated', { planId: this.userSubscription.planId });
  }

  // Payment methods
  async addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    const newPaymentMethod: PaymentMethod = {
      ...paymentMethod,
      id: `pm_${Date.now()}`
    };

    if (newPaymentMethod.isDefault) {
      this.paymentMethods.forEach(pm => pm.isDefault = false);
    }

    this.paymentMethods.push(newPaymentMethod);
    this.saveUserData();

    analytics.track('payment_method_added', { type: paymentMethod.type });
    return newPaymentMethod;
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    this.paymentMethods = this.paymentMethods.filter(pm => pm.id !== paymentMethodId);
    this.saveUserData();

    analytics.track('payment_method_removed');
  }

  getPaymentMethods(): PaymentMethod[] {
    return [...this.paymentMethods];
  }

  // Feature access
  hasFeature(feature: string): boolean {
    const currentPlan = this.getCurrentPlan();
    if (!currentPlan) return false;

    return currentPlan.features.includes(feature);
  }

  canMatch(): boolean {
    if (this.hasFeature('Unlimited matches')) return true;
    
    // Check daily match limit for free users
    const today = new Date().toDateString();
    const dailyMatches = this.getDailyMatches(today);
    return dailyMatches < 5;
  }

  canMessage(): boolean {
    return this.hasFeature('Unlimited messaging');
  }

  canSeeLikes(): boolean {
    return this.hasFeature('See who liked you');
  }

  // Usage tracking
  private getDailyMatches(date: string): number {
    const stored = localStorage.getItem(`daily_matches_${date}`);
    return stored ? parseInt(stored, 10) : 0;
  }

  trackMatch(): void {
    if (!this.canMatch()) {
      throw new Error('Daily match limit reached. Upgrade to Premium for unlimited matches.');
    }

    const today = new Date().toDateString();
    const current = this.getDailyMatches(today);
    localStorage.setItem(`daily_matches_${today}`, (current + 1).toString());
  }

  // Billing and invoices
  async getInvoices(): Promise<Array<{
    id: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed';
    date: number;
    description: string;
  }>> {
    // In a real app, this would fetch from your payment processor
    return [];
  }

  async updateBillingInfo(billingInfo: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }): Promise<void> {
    // In a real app, this would update billing info with your payment processor
    localStorage.setItem('billing_info', JSON.stringify(billingInfo));
  }

  // Promotional codes
  async applyPromoCode(code: string): Promise<{
    valid: boolean;
    discount?: number;
    message?: string;
  }> {
    // In a real app, this would validate with your backend
    const validCodes: Record<string, number> = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'FREEMONTH': 100
    };

    const discount = validCodes[code];
    if (discount) {
      analytics.track('promo_code_applied', { code, discount });
      return { valid: true, discount, message: `Discount applied: ${discount}% off` };
    }

    return { valid: false, message: 'Invalid promo code' };
  }

  // Data persistence
  private saveUserData(): void {
    try {
      localStorage.setItem('user_subscription', JSON.stringify(this.userSubscription));
      localStorage.setItem('payment_methods', JSON.stringify(this.paymentMethods));
    } catch (error) {
      console.error('Error saving subscription data:', error);
    }
  }

  private loadUserData(): void {
    try {
      const subscriptionData = localStorage.getItem('user_subscription');
      if (subscriptionData) {
        this.userSubscription = JSON.parse(subscriptionData);
      }

      const paymentMethodsData = localStorage.getItem('payment_methods');
      if (paymentMethodsData) {
        this.paymentMethods = JSON.parse(paymentMethodsData);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  }

  // Public API
  getUserSubscription(): UserSubscription | null {
    return this.userSubscription ? { ...this.userSubscription } : null;
  }

  isSubscribed(): boolean {
    return this.userSubscription?.status === 'active' || this.userSubscription?.status === 'trial';
  }

  isTrialActive(): boolean {
    if (!this.userSubscription?.trialEndDate) return false;
    return Date.now() < this.userSubscription.trialEndDate;
  }

  getTrialDaysLeft(): number {
    if (!this.userSubscription?.trialEndDate) return 0;
    const daysLeft = Math.ceil((this.userSubscription.trialEndDate - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  }
}

// Create singleton instance
export const subscriptionService = new SubscriptionService();

// Export convenience functions
export const hasPremiumFeature = (feature: string) => subscriptionService.hasFeature(feature);
export const canUserMatch = () => subscriptionService.canMatch();
export const canUserMessage = () => subscriptionService.canMessage();
export const isUserSubscribed = () => subscriptionService.isSubscribed();
export const getCurrentPlan = () => subscriptionService.getCurrentPlan(); 