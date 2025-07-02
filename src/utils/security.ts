// Security utilities for data validation and sanitization

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate user profile data
 */
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

/**
 * Validate message content
 */
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

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Generate secure random string
 */
export const generateSecureId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}; 