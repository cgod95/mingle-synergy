// 🧠 Purpose: Comprehensive type definitions to replace generic Record<string, unknown> and any types

// Base types for common data structures
export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
}

// User-related types
export interface UserProfile extends BaseEntity {
  email: string;
  name: string;
  age: number;
  bio?: string;
  photos: string[];
  isCheckedIn: boolean;
  isVisible: boolean;
  interests: string[];
  currentVenue?: string;
  checkInTime?: number;
  lastActive: number;
  preferences: UserPreferences;
  verificationStatus: VerificationStatus;
}

export interface UserPreferences {
  ageRange: {
    min: number;
    max: number;
  };
  maxDistance: number;
  interests: string[];
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  matchNotifications: boolean;
  messageNotifications: boolean;
  venueNotifications: boolean;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Venue-related types
export interface Venue extends BaseEntity {
  name: string;
  type: VenueType;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  image: string;
  checkInCount: number;
  expiryTime: number;
  zones: string[];
  checkedInUsers: string[];
  specials: VenueSpecial[];
}

export type VenueType = 'bar' | 'club' | 'cafe' | 'restaurant' | 'venue';

export interface VenueSpecial {
  title: string;
  description: string;
  validUntil?: number;
}

// Match-related types
export interface Match extends BaseEntity {
  user1Id: string;
  user2Id: string;
  venueId: string;
  venueName: string;
  timestamp: number;
  messages: Message[];
  isExpired: boolean;
  userRequestedReconnect: boolean;
  matchedUserRequestedReconnect: boolean;
  reconnectRequestedAt?: number;
  userConfirmedWeMet: boolean;
  matchedUserConfirmedWeMet: boolean;
}

export interface Message extends BaseEntity {
  senderId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

// Onboarding types
export interface OnboardingStep {
  id: OnboardingStepId;
  completed: boolean;
  completedAt?: number;
  data?: OnboardingStepData;
}

export type OnboardingStepId = 'email' | 'profile' | 'photos' | 'preferences' | 'verification' | 'complete';

export interface OnboardingStepData {
  email?: string;
  profile?: UserProfileData;
  photos?: PhotoData[];
  preferences?: UserPreferences;
  verification?: VerificationData;
}

export interface UserProfileData {
  name: string;
  age: number;
  bio: string;
}

export interface PhotoData {
  url: string;
  type: 'profile' | 'verification';
  uploadedAt: number;
}

export interface VerificationData {
  status: VerificationStatus;
  verifiedAt?: number;
  rejectionReason?: string;
}

export interface OnboardingProgress extends BaseEntity {
  userId: string;
  currentStep: OnboardingStepId;
  steps: Record<OnboardingStepId, OnboardingStep>;
  isComplete: boolean;
  startedAt: number;
  completedAt?: number;
}

// Reconnect types
export interface ReconnectRequest extends BaseEntity {
  matchId: string;
  requesterId: string;
  recipientId: string;
  status: ReconnectStatus;
  expiresAt: number;
  message?: string;
}

export type ReconnectStatus = 'pending' | 'accepted' | 'rejected';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

// Form types
export interface FormField {
  name: string;
  value: string | number | boolean;
  error?: string;
  touched: boolean;
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Event types
export interface AppEvent {
  type: string;
  payload: unknown;
  timestamp: number;
  userId?: string;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, string | number | boolean>;
  userId?: string;
  timestamp: number;
}

// Configuration types
export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  websocketUrl?: string;
  features: FeatureFlags;
  // Additional config properties
  DEMO_MODE: boolean;
  USE_MOCK: boolean;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_MEASUREMENT_ID: string;
  VAPID_PUBLIC_KEY: string;
  ANALYTICS_ID: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

export interface FeatureFlags {
  verification: boolean;
  reconnect: boolean;
  pushNotifications: boolean;
  analytics: boolean;
  performanceMonitoring: boolean;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Network types
export interface NetworkState {
  isOnline: boolean;
  isConnected: boolean;
  lastSeen: number;
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStore {
  [key: string]: CacheEntry<unknown>;
} 