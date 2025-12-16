// Comprehensive business features service

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    matches: number;
    messages: number;
    venues: number;
    premiumFeatures: boolean;
  };
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  nextBillingDate?: Date;
  trialEndsAt?: Date;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalMatches: number;
  totalMessages: number;
  totalVenues: number;
  revenue: {
    monthly: number;
    yearly: number;
    total: number;
  };
  growth: {
    users: number;
    revenue: number;
    matches: number;
  };
}

export interface UserReport {
  userId: string;
  email: string;
  joinDate: Date;
  lastActive: Date;
  subscription: UserSubscription | null;
  activity: {
    matches: number;
    messages: number;
    venues: number;
    logins: number;
  };
  status: 'active' | 'inactive' | 'suspended';
}

export interface VenueReport {
  venueId: string;
  name: string;
  location: string;
  popularity: number;
  matches: number;
  checkIns: number;
  revenue: number;
  status: 'active' | 'inactive';
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  databaseStatus: 'connected' | 'disconnected' | 'error';
  cacheStatus: 'connected' | 'disconnected' | 'error';
}

class BusinessFeaturesService {
  private subscriptions: Map<string, UserSubscription> = new Map();
  private plans: SubscriptionPlan[] = [];
  private adminMetrics: AdminMetrics | null = null;

  constructor() {
    this.initializePlans();
  }

  // Subscription Management
  private initializePlans(): void {
    this.plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Basic matching',
          'Limited messages',
          'Basic venue access'
        ],
        limits: {
          matches: 10,
          messages: 50,
          venues: 5,
          premiumFeatures: false
        }
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Unlimited matches',
          'Unlimited messages',
          'All venues',
          'Premium features',
          'Priority support'
        ],
        limits: {
          matches: -1, // Unlimited
          messages: -1, // Unlimited
          venues: -1, // Unlimited
          premiumFeatures: true
        },
        popular: true
      },
      {
        id: 'premium_yearly',
        name: 'Premium (Yearly)',
        price: 99.99,
        currency: 'USD',
        interval: 'yearly',
        features: [
          'Unlimited matches',
          'Unlimited messages',
          'All venues',
          'Premium features',
          'Priority support',
          '2 months free'
        ],
        limits: {
          matches: -1,
          messages: -1,
          venues: -1,
          premiumFeatures: true
        }
      }
    ];
  }

  async getPlans(): Promise<SubscriptionPlan[]> {
    // In demo mode, return plans with unlimited limits
    // BETA FIX: Only check VITE_DEMO_MODE, not development mode
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      return this.plans.map(plan => ({
        ...plan,
        limits: {
          matches: -1, // Unlimited
          messages: -1, // Unlimited
          venues: -1, // Unlimited
          premiumFeatures: true,
        },
      }));
    }
    return [...this.plans];
  }

  async getPlan(planId: string): Promise<SubscriptionPlan | null> {
    return this.plans.find(plan => plan.id === planId) || null;
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    return this.subscriptions.get(userId) || null;
  }

  async createSubscription(
    userId: string,
    planId: string,
    paymentMethod?: string
  ): Promise<UserSubscription> {
    const plan = await this.getPlan(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const now = new Date();
    const endDate = new Date(now);
    
    if (plan.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription: UserSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      planId,
      status: 'active',
      startDate: now,
      endDate,
      autoRenew: true,
      paymentMethod,
      nextBillingDate: endDate
    };

    this.subscriptions.set(userId, subscription);
    return subscription;
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) {
      return false;
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    this.subscriptions.set(userId, subscription);
    
    return true;
  }

  async updateSubscription(
    userId: string,
    planId: string
  ): Promise<UserSubscription | null> {
    const currentSubscription = this.subscriptions.get(userId);
    if (!currentSubscription) {
      return null;
    }

    const newPlan = await this.getPlan(planId);
    if (!newPlan) {
      throw new Error('Plan not found');
    }

    const updatedSubscription: UserSubscription = {
      ...currentSubscription,
      planId,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    this.subscriptions.set(userId, updatedSubscription);
    return updatedSubscription;
  }

  async checkSubscriptionStatus(userId: string): Promise<'active' | 'expired' | 'cancelled'> {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) {
      return 'expired';
    }

    if (subscription.status === 'cancelled') {
      return 'cancelled';
    }

    if (subscription.endDate < new Date()) {
      subscription.status = 'expired';
      this.subscriptions.set(userId, subscription);
      return 'expired';
    }

    return 'active';
  }

  // Admin Dashboard
  async getAdminMetrics(): Promise<AdminMetrics> {
    // In a real app, this would fetch from your backend
    if (this.adminMetrics) {
      return this.adminMetrics;
    }

    const totalUsers = 1250;
    const activeUsers = 890;
    const premiumUsers = 340;
    const totalMatches = 5670;
    const totalMessages = 23400;
    const totalVenues = 156;

    this.adminMetrics = {
      totalUsers,
      activeUsers,
      premiumUsers,
      totalMatches,
      totalMessages,
      totalVenues,
      revenue: {
        monthly: 3400,
        yearly: 40800,
        total: 44200
      },
      growth: {
        users: 12.5,
        revenue: 8.3,
        matches: 15.7
      }
    };

    return this.adminMetrics;
  }

  async getUserReports(
    filters: {
      status?: string;
      subscription?: string;
      dateRange?: { start: Date; end: Date };
    } = {},
    limit: number = 50
  ): Promise<UserReport[]> {
    // In a real app, this would fetch from your backend
    const mockReports: UserReport[] = Array.from({ length: limit }, (_, i) => ({
      userId: `user_${i + 1}`,
      email: `user${i + 1}@example.com`,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      subscription: i % 3 === 0 ? {
        id: `sub_${i}`,
        userId: `user_${i + 1}`,
        planId: 'premium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true
      } : null,
      activity: {
        matches: Math.floor(Math.random() * 50),
        messages: Math.floor(Math.random() * 200),
        venues: Math.floor(Math.random() * 20),
        logins: Math.floor(Math.random() * 100)
      },
      status: ['active', 'inactive', 'suspended'][Math.floor(Math.random() * 3)] as 'active' | 'inactive' | 'suspended'
    }));

    return mockReports;
  }

  async getVenueReports(
    filters: {
      status?: string;
      popularity?: 'high' | 'medium' | 'low';
    } = {},
    limit: number = 50
  ): Promise<VenueReport[]> {
    // In a real app, this would fetch from your backend
    const mockReports: VenueReport[] = Array.from({ length: limit }, (_, i) => ({
      venueId: `venue_${i + 1}`,
      name: `Venue ${i + 1}`,
      location: `Location ${i + 1}`,
      popularity: Math.random(),
      matches: Math.floor(Math.random() * 100),
      checkIns: Math.floor(Math.random() * 500),
      revenue: Math.floor(Math.random() * 10000),
      status: Math.random() > 0.1 ? 'active' : 'inactive'
    }));

    return mockReports;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    // In a real app, this would check actual system metrics
    const uptime = Math.random() * 100;
    const responseTime = Math.random() * 1000;
    const errorRate = Math.random() * 5;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (errorRate > 3 || responseTime > 800) {
      status = 'critical';
    } else if (errorRate > 1 || responseTime > 500) {
      status = 'warning';
    }

    return {
      status,
      uptime,
      responseTime,
      errorRate,
      activeConnections: Math.floor(Math.random() * 1000),
      databaseStatus: 'connected',
      cacheStatus: 'connected'
    };
  }

  // Analytics and Reporting
  async generateRevenueReport(
    startDate: Date,
    endDate: Date,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<Array<{ date: string; revenue: number; subscriptions: number }>> {
    // In a real app, this would fetch from your analytics database
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 1000),
      subscriptions: Math.floor(Math.random() * 50)
    }));
  }

  async generateUserGrowthReport(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: string; newUsers: number; activeUsers: number }>> {
    // In a real app, this would fetch from your analytics database
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 20),
      activeUsers: Math.floor(Math.random() * 500) + 200
    }));
  }

  async generateEngagementReport(): Promise<{
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    retentionRate: {
      day1: number;
      day7: number;
      day30: number;
    };
  }> {
    // In a real app, this would fetch from your analytics database
    return {
      dailyActiveUsers: Math.floor(Math.random() * 500) + 200,
      weeklyActiveUsers: Math.floor(Math.random() * 2000) + 1000,
      monthlyActiveUsers: Math.floor(Math.random() * 8000) + 5000,
      averageSessionDuration: Math.floor(Math.random() * 30) + 10,
      retentionRate: {
        day1: Math.random() * 0.4 + 0.3, // 30-70%
        day7: Math.random() * 0.3 + 0.2, // 20-50%
        day30: Math.random() * 0.2 + 0.1 // 10-30%
      }
    };
  }

  // Admin Actions
  async suspendUser(userId: string, reason: string): Promise<boolean> {
    // In a real app, this would update the user status in your database
    console.log(`Suspending user ${userId} for reason: ${reason}`);
    return true;
  }

  async unsuspendUser(userId: string): Promise<boolean> {
    // In a real app, this would update the user status in your database
    console.log(`Unsuspending user ${userId}`);
    return true;
  }

  async deleteUser(userId: string): Promise<boolean> {
    // In a real app, this would delete the user from your database
    console.log(`Deleting user ${userId}`);
    return true;
  }

  async updateVenueStatus(venueId: string, status: 'active' | 'inactive'): Promise<boolean> {
    // In a real app, this would update the venue status in your database
    console.log(`Updating venue ${venueId} status to ${status}`);
    return true;
  }

  // Export Functions
  async exportUserData(userId: string): Promise<string> {
    // In a real app, this would generate a comprehensive user data export
    const userData = {
      userId,
      exportDate: new Date().toISOString(),
      data: {
        profile: {},
        matches: [],
        messages: [],
        activity: []
      }
    };

    return JSON.stringify(userData, null, 2);
  }

  async exportAdminReport(
    reportType: 'users' | 'venues' | 'revenue' | 'system',
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    // In a real app, this would generate the requested report
    const report = {
      type: reportType,
      generatedAt: new Date().toISOString(),
      data: {}
    };

    return format === 'json' 
      ? JSON.stringify(report, null, 2)
      : this.convertToCSV(report);
  }

  private convertToCSV(data: unknown): string {
    // Simple CSV conversion - in a real app, you'd use a proper CSV library
    return 'data,value\n' + Object.entries(data as Record<string, unknown>)
      .map(([key, value]) => `${key},${value}`)
      .join('\n');
  }

  // Utility Functions
  async refreshMetrics(): Promise<void> {
    this.adminMetrics = null;
    await this.getAdminMetrics();
  }

  getSubscriptionStats(): {
    total: number;
    active: number;
    cancelled: number;
    expired: number;
  } {
    const subscriptions = Array.from(this.subscriptions.values());
    
    return {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      expired: subscriptions.filter(s => s.status === 'expired').length
    };
  }
}

// Export singleton instance
export const businessFeatures = new BusinessFeaturesService(); 