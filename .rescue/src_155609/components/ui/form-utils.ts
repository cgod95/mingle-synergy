import * as React from "react"
import { FieldPath, FieldValues, useFormContext } from "react-hook-form"

// Enhanced form validation utilities
export const formValidations = {
  required: (value: unknown) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required'
    }
    return true
  },
  
  email: (value: string) => {
    if (!value) return true // Let required handle empty
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return true
  },
  
  phone: (value: string) => {
    if (!value) return true
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number'
    }
    return true
  },
  
  minLength: (min: number) => (value: string) => {
    if (!value) return true
    if (value.length < min) {
      return `Must be at least ${min} characters`
    }
    return true
  },
  
  maxLength: (max: number) => (value: string) => {
    if (!value) return true
    if (value.length > max) {
      return `Must be no more than ${max} characters`
    }
    return true
  },
  
  age: (min: number, max: number) => (value: number) => {
    if (!value) return true
    if (value < min || value > max) {
      return `Age must be between ${min} and ${max}`
    }
    return true
  },
  
  password: (value: string) => {
    if (!value) return true
    if (value.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/(?=.*\d)/.test(value)) {
      return 'Password must contain at least one number'
    }
    return true
  },
  
  url: (value: string) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return 'Please enter a valid URL'
    }
  },
  
  numeric: (value: string) => {
    if (!value) return true
    if (!/^\d+$/.test(value)) {
      return 'Please enter a valid number'
    }
    return true
  },
  
  positiveNumber: (value: number) => {
    if (!value) return true
    if (value <= 0) {
      return 'Please enter a positive number'
    }
    return true
  }
};

// Hook for form validation
export const useFormValidation = () => {
  return {
    validate: (value: unknown, validators: Array<(value: unknown) => true | string>) => {
      for (const validator of validators) {
        const result = validator(value);
        if (result !== true) {
          return result;
        }
      }
      return true;
    },
    
    validateField: (value: unknown, fieldValidators: Record<string, (value: unknown) => true | string>) => {
      const errors: Record<string, string> = {};
      
      for (const [field, validator] of Object.entries(fieldValidators)) {
        const result = validator(value);
        if (result !== true) {
          errors[field] = result;
        }
      }
      
      return Object.keys(errors).length === 0 ? null : errors;
    }
  };
};

// Types
export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

export type FormItemContextValue = {
  id: string
}

// Contexts
export const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

export const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

// Hook
export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// Re-export useFormContext for convenience
export { useFormContext } 