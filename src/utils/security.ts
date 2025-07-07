// Enhanced security utilities for input sanitization, rate limiting, and privacy controls

// Simple HTML sanitizer
const simpleSanitize = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Rate limiting implementation
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [now]);
      return true;
    }

    const requests = this.requests.get(identifier)!;
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }

    const requests = this.requests.get(identifier)!;
    const recentRequests = requests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// Global rate limiters for different actions
export const rateLimiters = {
  auth: new RateLimiter(60000, 5), // 5 auth attempts per minute
  messaging: new RateLimiter(60000, 20), // 20 messages per minute
  matching: new RateLimiter(60000, 10), // 10 match attempts per minute
  profile: new RateLimiter(60000, 5), // 5 profile updates per minute
  api: new RateLimiter(60000, 100), // 100 API calls per minute
};

// Input sanitization utilities
export const sanitizeInput = {
  // Sanitize text input
  text: (input: string): string => {
    if (typeof input !== 'string') return '';
    
    // Remove null bytes and control characters
    // eslint-disable-next-line no-control-regex
    let sanitized = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Limit length
    if (sanitized.length > 1000) {
      sanitized = sanitized.substring(0, 1000);
    }
    
    return sanitized;
  },

  // Sanitize HTML content
  html: (input: string): string => {
    if (typeof input !== 'string') return '';
    return simpleSanitize(input);
  },

  // Sanitize email
  email: (input: string): string => {
    if (typeof input !== 'string') return '';
    
    const email = input.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    return email;
  },

  // Sanitize phone number
  phone: (input: string): string => {
    if (typeof input !== 'string') return '';
    
    // Remove all non-digit characters except +
    const cleaned = input.replace(/[^\d+]/g, '');
    
    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(cleaned)) {
      throw new Error('Invalid phone number format');
    }
    
    return cleaned;
  },

  // Sanitize URL
  url: (input: string): string => {
    if (typeof input !== 'string') return '';
    
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid URL protocol');
      }
      return url.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  },

  // Sanitize file name
  filename: (input: string): string => {
    if (typeof input !== 'string') return '';
    
    // Remove dangerous characters
    // eslint-disable-next-line no-control-regex
    let sanitized = input.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '');
    
    // Limit length
    if (sanitized.length > 255) {
      const ext = sanitized.split('.').pop();
      const name = sanitized.substring(0, 255 - ext!.length - 1);
      sanitized = `${name}.${ext}`;
    }
    
    return sanitized;
  }
};

// Privacy controls
export class PrivacyManager {
  private static instance: PrivacyManager;
  private settings: Map<string, boolean> = new Map();

  static getInstance(): PrivacyManager {
    if (!PrivacyManager.instance) {
      PrivacyManager.instance = new PrivacyManager();
    }
    return PrivacyManager.instance;
  }

  // Privacy settings
  setPrivacySetting(key: string, value: boolean): void {
    this.settings.set(key, value);
    localStorage.setItem(`privacy_${key}`, value.toString());
  }

  getPrivacySetting(key: string, defaultValue: boolean = true): boolean {
    if (this.settings.has(key)) {
      return this.settings.get(key)!;
    }
    
    const stored = localStorage.getItem(`privacy_${key}`);
    if (stored !== null) {
      const value = stored === 'true';
      this.settings.set(key, value);
      return value;
    }
    
    return defaultValue;
  }

  // Check if user allows data collection
  canCollectAnalytics(): boolean {
    return this.getPrivacySetting('analytics', true);
  }

  // Check if user allows location sharing
  canShareLocation(): boolean {
    return this.getPrivacySetting('location', true);
  }

  // Check if user allows profile visibility
  isProfileVisible(): boolean {
    return this.getPrivacySetting('profile_visible', true);
  }

  // Check if user allows matching
  canBeMatched(): boolean {
    return this.getPrivacySetting('matching', true);
  }

  // Data export functionality
  exportUserData(): string {
    const data = {
      profile: this.getProfileData(),
      matches: this.getMatchData(),
      messages: this.getMessageData(),
      preferences: this.getPreferenceData(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Data deletion
  async deleteUserData(): Promise<void> {
    // Clear local storage
    const keysToRemove = Array.from(localStorage.keys()).filter((key: string) => 
      key.startsWith('user_') || key.startsWith('match_') || key.startsWith('message_')
    );
    
    keysToRemove.forEach((key: string) => localStorage.removeItem(key));
    
    // Clear privacy settings
    this.settings.clear();
    
    // In a real app, you'd also call your backend to delete user data
    console.log('User data deletion requested');
  }

  private getProfileData(): Record<string, unknown> {
    return JSON.parse(localStorage.getItem('user_profile') || '{}');
  }

  private getMatchData(): unknown[] {
    return JSON.parse(localStorage.getItem('mockMatches') || '[]');
  }

  private getMessageData(): unknown[] {
    return JSON.parse(localStorage.getItem('mockMessages') || '[]');
  }

  private getPreferenceData(): Record<string, unknown> {
    return JSON.parse(localStorage.getItem('user_preferences') || '{}');
  }
}

// Session management
export class SessionManager {
  private static instance: SessionManager;
  private sessionTimeout: number = 30 * 60 * 1000; // 30 minutes
  private lastActivity: number = Date.now();

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Update last activity
  updateActivity(): void {
    this.lastActivity = Date.now();
    localStorage.setItem('last_activity', this.lastActivity.toString());
  }

  // Check if session is valid
  isSessionValid(): boolean {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;
    
    if (timeSinceLastActivity > this.sessionTimeout) {
      this.clearSession();
      return false;
    }
    
    return true;
  }

  // Extend session
  extendSession(): void {
    this.updateActivity();
  }

  // Clear session
  clearSession(): void {
    this.lastActivity = 0;
    localStorage.removeItem('last_activity');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  }

  // Set session timeout
  setSessionTimeout(timeoutMs: number): void {
    this.sessionTimeout = timeoutMs;
  }
}

// Content Security Policy
export const generateCSP = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.mingle.com wss://api.mingle.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};

// Security headers
export const securityHeaders = {
  'Content-Security-Policy': generateCSP(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// Export convenience functions
export const privacyManager = PrivacyManager.getInstance();
export const sessionManager = SessionManager.getInstance();

// Legacy validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePhone = (phone: string): boolean => {
  try {
    sanitizeInput.phone(phone);
    return true;
  } catch {
    return false;
  }
};

export const validateProfileData = (data: Record<string, unknown>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (data.bio && typeof data.bio === 'string' && data.bio.length > 500) {
    errors.push('Bio must be less than 500 characters');
  }
  
  if (data.age && typeof data.age === 'number' && (data.age < 18 || data.age > 100)) {
    errors.push('Age must be between 18 and 100');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMessage = (message: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!message || message.trim().length === 0) {
    errors.push('Message cannot be empty');
  }
  
  if (message.length > 1000) {
    errors.push('Message must be less than 1000 characters');
  }
  
  // Check for potentially harmful content
  const harmfulPatterns = [
    /\b(spam|scam|fake)\b/gi,
    /(http|https):\/\/[^\s]+/g, // URLs
    /\b\d{10,}\b/g // Long numbers (phone/credit card)
  ];
  
  harmfulPatterns.forEach(pattern => {
    if (pattern.test(message)) {
      errors.push('Message contains potentially harmful content');
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateSecureId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Input validation and sanitization
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// XSS Protection
export const sanitizeHtml = (input: string): string => {
  // Remove potentially dangerous HTML tags and attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>/g, '');
};

export const escapeHtml = (input: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
};

// CSRF Protection
export const generateCSRFToken = (): string => {
  return crypto.getRandomValues(new Uint8Array(32))
    .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 64;
};

// Data Encryption
export const encryptData = async (data: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataBuffer
  );
  
  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

export const decryptData = async (encryptedData: string, key: string): Promise<string> => {
  const decoder = new TextDecoder();
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(char => char.charCodeAt(0))
  );
  
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  return decoder.decode(decrypted);
};

// Input Validation Middleware
export const validateInput = (schema: Record<string, { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp; type?: string }>) => {
  return (data: Record<string, unknown>): { isValid: boolean; errors: Record<string, string[]> } => {
    const errors: Record<string, string[]> = {};
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field] as string;
      const fieldErrors: string[] = [];
      
      if (rules.required && (!value || value.trim() === '')) {
        fieldErrors.push(`${field} is required`);
      }
      
      if (value && rules.minLength && value.length < rules.minLength) {
        fieldErrors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (value && rules.maxLength && value.length > rules.maxLength) {
        fieldErrors.push(`${field} must be less than ${rules.maxLength} characters`);
      }
      
      if (value && rules.pattern && !rules.pattern.test(value)) {
        fieldErrors.push(`${field} format is invalid`);
      }
      
      if (value && rules.type === 'email' && !validateEmail(value)) {
        fieldErrors.push(`${field} must be a valid email address`);
      }
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
};

// Secure Storage
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const encrypted = encryptData(value, import.meta.env.VITE_STORAGE_KEY || 'default-key');
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      // Fallback to regular storage for non-sensitive data
      localStorage.setItem(key, value);
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = await decryptData(encrypted, import.meta.env.VITE_STORAGE_KEY || 'default-key');
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      // Fallback to regular storage
      return localStorage.getItem(key);
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  }
};

// Audit Logging
export const auditLog = (action: string, details: Record<string, unknown>): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId: sessionStorage.getItem('sessionId') || 'unknown'
  };
  
  // In production, send to secure logging service
  console.log('AUDIT LOG:', logEntry);
  
  // Store locally for debugging
  const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  logs.push(logEntry);
  
  // Keep only last 100 logs
  if (logs.length > 100) {
    logs.splice(0, logs.length - 100);
  }
  
  localStorage.setItem('auditLogs', JSON.stringify(logs));
};

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: Record<string, unknown>;
}

interface SecurityConfig {
  maxInputLength: number;
  allowedTags: string[];
  blockedPatterns: RegExp[];
}

const validateAndSanitizeInput = (input: string, config: SecurityConfig): ValidationResult => {
  const errors: string[] = [];
  let sanitizedData: Record<string, unknown> = {};

  // Check length
  if (input.length > config.maxInputLength) {
    errors.push(`Input exceeds maximum length of ${config.maxInputLength} characters`);
  }

  // Check for blocked patterns
  const hasBlockedPattern = config.blockedPatterns.some(pattern => pattern.test(input));
  if (hasBlockedPattern) {
    errors.push('Input contains blocked content');
  }

  // Sanitize HTML
  const sanitizedInput = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: config.allowedTags,
    ALLOWED_ATTR: []
  });

  sanitizedData = { sanitizedInput };

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}; 