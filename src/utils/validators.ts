// 🧠 Purpose: Centralized validation utilities for form and API input validation
import logger from '@/utils/Logger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  test: (value: unknown) => boolean;
  message: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!/^\+?[\d\s\-()]+$/.test(phone)) {
    errors.push('Please enter a valid phone number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Age validation
export const validateAge = (age: number): ValidationResult => {
  const errors: string[] = [];
  
  if (!age || isNaN(age)) {
    errors.push('Age is required');
  } else if (age < 18) {
    errors.push('You must be at least 18 years old');
  } else if (age > 100) {
    errors.push('Please enter a valid age');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Location validation
export const validateLocation = (location: { lat: number; lng: number }): ValidationResult => {
  const errors: string[] = [];
  
  if (!location) {
    errors.push('Location is required');
  } else if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    errors.push('Invalid location format');
  } else if (location.lat < -90 || location.lat > 90) {
    errors.push('Invalid latitude');
  } else if (location.lng < -180 || location.lng > 180) {
    errors.push('Invalid longitude');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Message validation
export const validateMessage = (message: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!message) {
    errors.push('Message is required');
  } else if (message.length > 1000) {
    errors.push('Message must be less than 1000 characters');
  } else if (message.trim().length === 0) {
    errors.push('Message cannot be empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// File validation
export const validateFile = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
} = {}): ValidationResult => {
  const errors: string[] = [];
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
  
  if (!file) {
    errors.push('File is required');
  } else {
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// URL validation
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!url) {
    errors.push('URL is required');
  } else {
    try {
      new URL(url);
    } catch {
      errors.push('Please enter a valid URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generic object validation
export const validateObject = (obj: Record<string, unknown>, rules: Record<string, ValidationRule[]>): ValidationResult => {
  const errors: string[] = [];
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = obj[field];
    
    for (const rule of fieldRules) {
      if (!rule.test(value)) {
        errors.push(rule.message);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  const sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  const cleaned = sanitized.replace(/[<>"'&]/g, '');
  
  // Trim whitespace
  return cleaned.trim();
};

// Validate and sanitize form data
export const validateAndSanitizeForm = (formData: Record<string, unknown>, validationRules: Record<string, ValidationRule[]>): {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData: Record<string, unknown>;
} => {
  const errors: Record<string, string[]> = {};
  const sanitizedData: Record<string, unknown> = {};
  let isValid = true;
  
  for (const [field, value] of Object.entries(formData)) {
    const fieldRules = validationRules[field] || [];
    const fieldErrors: string[] = [];
    
    // Apply validation rules
    for (const rule of fieldRules) {
      if (!rule.test(value)) {
        fieldErrors.push(rule.message);
      }
    }
    
    // Sanitize string values
    if (typeof value === 'string') {
      sanitizedData[field] = sanitizeInput(value);
    } else {
      sanitizedData[field] = value;
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  }
  
  if (!isValid) {
    logger.warn('Form validation failed', { errors, formData });
  }
  
  return {
    isValid,
    errors,
    sanitizedData
  };
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const userRequests = requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded', { identifier, maxRequests, windowMs });
      return false;
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    return true;
  };
};

// Export common validation rules
export const commonValidationRules = {
  email: [
    { test: (value: unknown) => !!value, message: 'Email is required' },
    { test: (value: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string), message: 'Please enter a valid email address' }
  ],
  password: [
    { test: (value: unknown) => !!value, message: 'Password is required' },
    { test: (value: unknown) => (value as string).length >= 8, message: 'Password must be at least 8 characters long' },
    { test: (value: unknown) => /(?=.*[a-z])/.test(value as string), message: 'Password must contain at least one lowercase letter' },
    { test: (value: unknown) => /(?=.*[A-Z])/.test(value as string), message: 'Password must contain at least one uppercase letter' },
    { test: (value: unknown) => /(?=.*\d)/.test(value as string), message: 'Password must contain at least one number' }
  ],
  username: [
    { test: (value: unknown) => !!value, message: 'Username is required' },
    { test: (value: unknown) => (value as string).length >= 3, message: 'Username must be at least 3 characters long' },
    { test: (value: unknown) => (value as string).length <= 30, message: 'Username must be less than 30 characters' },
    { test: (value: unknown) => /^[a-zA-Z0-9_]+$/.test(value as string), message: 'Username can only contain letters, numbers, and underscores' }
  ]
}; 