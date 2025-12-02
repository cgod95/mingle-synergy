// Comprehensive form validation utilities to prevent validation bugs

import { useState } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string, allData?: Record<string, string>) => { isValid: boolean; error?: string };
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  hasErrors: boolean;
}

export interface FieldValidationResult {
  isValid: boolean;
  errors: string[];
}

// Common validation rules
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => ({
      isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      error: 'Please enter a valid email address'
    })
  },
  
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    custom: (value: string) => {
      const hasLower = /[a-z]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[@$!%*?&]/.test(value);
      
      if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
        return {
          isValid: false,
          error: 'Password must contain at least one lowercase letter, uppercase letter, number, and special character'
        };
      }
      return { isValid: true };
    }
  },
  
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/
  },
  
  bio: {
    required: false,
    maxLength: 500
  },
  
  phone: {
    required: false,
    pattern: /^[+]?[1-9][\d]{0,15}$/
  }
};

// Validate a single field
export const validateField = (
  value: string, 
  rules: ValidationRule, 
  fieldName: string
): FieldValidationResult => {
  const errors: string[] = [];
  
  // Required check
  if (rules.required && (!value || value.trim() === '')) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }
  
  // Skip other validations if field is empty and not required
  if (!value || value.trim() === '') {
    return { isValid: true, errors: [] };
  }
  
  const trimmedValue = value.trim();
  
  // Min length check
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
  }
  
  // Max length check
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    errors.push(`${fieldName} must be less than ${rules.maxLength} characters`);
  }
  
  // Pattern check
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    errors.push(`${fieldName} format is invalid`);
  }
  
  // Custom validation
  if (rules.custom) {
    const customResult = rules.custom(trimmedValue);
    if (!customResult.isValid && customResult.error) {
      errors.push(customResult.error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate entire form
export const validateForm = (
  data: Record<string, string>,
  schema: Record<string, ValidationRule>
): FormValidationResult => {
  const errors: Record<string, string[]> = {};
  let hasErrors = false;
  
  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = data[fieldName] || '';
    const fieldResult = validateField(value, rules, fieldName);
    
    if (!fieldResult.isValid) {
      errors[fieldName] = fieldResult.errors;
      hasErrors = true;
    }
  }
  
  return {
    isValid: !hasErrors,
    errors,
    hasErrors
  };
};

// Real-time validation hook for forms
export const useFormValidation = (
  schema: Record<string, ValidationRule>,
  initialData: Record<string, string> = {}
) => {
  const [data, setData] = useState<Record<string, string>>(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const updateField = (fieldName: string, value: string) => {
    const newData = { ...data, [fieldName]: value };
    setData(newData);
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: [] }));
    }
    
    // Validate field if it's been touched
    if (touched[fieldName]) {
      const fieldResult = validateField(value, schema[fieldName], fieldName);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldResult.errors
      }));
    }
  };
  
  const validateFieldOnBlur = (fieldName: string) => {
    const value = data[fieldName] || '';
    const fieldResult = validateField(value, schema[fieldName], fieldName);
    
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldResult.errors
    }));
  };
  
  const validateAll = () => {
    const result = validateForm(data, schema);
    setErrors(result.errors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(schema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    return result;
  };
  
  const reset = () => {
    setData(initialData);
    setErrors({});
    setTouched({});
  };
  
  const hasErrors = Object.values(errors).some(errorArray => errorArray.length > 0);
  
  return {
    data,
    errors,
    touched,
    hasErrors,
    updateField,
    validateFieldOnBlur,
    validateAll,
    reset
  };
};

// Pre-built validation schemas for common forms
export const formSchemas = {
  signIn: {
    email: validationRules.email,
    password: validationRules.password
  },
  
  signUp: {
    email: validationRules.email,
    password: validationRules.password,
    confirmPassword: {
      required: true,
      custom: (value: string, allData?: Record<string, string>) => {
        const password = allData?.password || '';
        return {
          isValid: value === password,
          error: value === password ? undefined : 'Passwords do not match'
        };
      }
    }
  },
  
  profile: {
    name: validationRules.name,
    bio: validationRules.bio
  },
  
  contact: {
    name: validationRules.name,
    email: validationRules.email,
    phone: validationRules.phone
  }
};

// Error message helpers
export const getFieldError = (errors: Record<string, string[]>, fieldName: string): string => {
  return errors[fieldName]?.[0] || '';
};

export const hasFieldError = (errors: Record<string, string[]>, fieldName: string): boolean => {
  return errors[fieldName]?.length > 0 || false;
}; 