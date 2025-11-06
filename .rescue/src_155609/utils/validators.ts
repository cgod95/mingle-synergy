// 🧠 Purpose: Centralized validation functions for security and data integrity
import type { ValidationRule, ValidationSchema } from '@/types/common';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Text sanitization and validation
export const sanitizeText = (text: string, maxLength: number = 1000): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Remove potentially dangerous HTML/script tags
  const sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
  
  return sanitized.slice(0, maxLength);
};

export const isValidText = (text: string, minLength: number = 1, maxLength: number = 1000): boolean => {
  if (!text || typeof text !== 'string') return false;
  const sanitized = sanitizeText(text, maxLength);
  return sanitized.length >= minLength && sanitized.length <= maxLength;
};

// Age validation
export const isValidAge = (age: number): boolean => {
  return Number.isInteger(age) && age >= 18 && age <= 120;
};

// Name validation
export const isValidName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const sanitized = sanitizeText(name, 50);
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  
  return sanitized.length >= 2 && 
         sanitized.length <= 50 && 
         nameRegex.test(sanitized);
};

// Bio validation
export const isValidBio = (bio: string): boolean => {
  if (!bio || typeof bio !== 'string') return false;
  
  const sanitized = sanitizeText(bio, 500);
  return sanitized.length >= 10 && sanitized.length <= 500;
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Phone number validation (basic)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
  return phoneRegex.test(phone);
};

// Password strength validation
export const isStrongPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// File validation
export const isValidImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const isValidFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

// Venue-specific validation
export const isValidVenueName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const sanitized = sanitizeText(name, 100);
  return sanitized.length >= 2 && sanitized.length <= 100;
};

export const isValidVenueAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false;
  
  const sanitized = sanitizeText(address, 200);
  return sanitized.length >= 5 && sanitized.length <= 200;
};

// Message validation
export const isValidMessage = (message: string): boolean => {
  if (!message || typeof message !== 'string') return false;
  
  const sanitized = sanitizeText(message, 1000);
  return sanitized.length >= 1 && sanitized.length <= 1000;
};

// Interest validation
export const isValidInterest = (interest: string): boolean => {
  if (!interest || typeof interest !== 'string') return false;
  
  const sanitized = sanitizeText(interest, 50);
  return sanitized.length >= 2 && sanitized.length <= 50;
};

// Rate limiting validation
export const isValidRateLimit = (timestamp: number, lastActionTime: number, minIntervalMs: number = 1000): boolean => {
  return timestamp - lastActionTime >= minIntervalMs;
};

// Form validation helpers
export const validateFormField = (value: unknown, rules: ValidationRule): string | null => {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required';
  }
  
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }
  }
  
  if (rules.custom) {
    const result = rules.custom(value);
    if (typeof result === 'string') {
      return result;
    }
    if (!result) {
      return 'Invalid value';
    }
  }
  
  return null;
};

export const validateForm = (data: Record<string, unknown>, schema: ValidationSchema): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const error = validateFormField(data[field], rules);
    if (error) {
      errors[field] = error;
    }
  }
  
  return errors;
};

// Common validation schemas
export const userProfileSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: (value) => isValidName(value as string) || 'Please enter a valid name',
  },
  age: {
    required: true,
    custom: (value) => isValidAge(value as number) || 'Age must be between 18 and 120',
  },
  bio: {
    required: true,
    minLength: 10,
    maxLength: 500,
    custom: (value) => isValidBio(value as string) || 'Bio must be between 10 and 500 characters',
  },
  email: {
    required: true,
    custom: (value) => isValidEmail(value as string) || 'Please enter a valid email address',
  },
};

export const messageSchema: ValidationSchema = {
  text: {
    required: true,
    minLength: 1,
    maxLength: 1000,
    custom: (value) => isValidMessage(value as string) || 'Message must be between 1 and 1000 characters',
  },
};

export const venueSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    custom: (value) => isValidVenueName(value as string) || 'Please enter a valid venue name',
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 200,
    custom: (value) => isValidVenueAddress(value as string) || 'Please enter a valid address',
  },
};

// Export all validation functions
export const validators = {
  isValidEmail,
  sanitizeText,
  isValidText,
  isValidAge,
  isValidName,
  isValidBio,
  isValidUrl,
  isValidPhone,
  isStrongPassword,
  isValidImageFile,
  isValidFileSize,
  isValidVenueName,
  isValidVenueAddress,
  isValidMessage,
  isValidInterest,
  isValidRateLimit,
  validateFormField,
  validateForm,
  userProfileSchema,
  messageSchema,
  venueSchema,
}; 