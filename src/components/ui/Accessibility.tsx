import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff,
  Keyboard,
  Accessibility
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAriaLabel } from './accessibility-utils';
import { cn } from '@/lib/utils';

// Accessibility Context
interface AccessibilityContextType {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocusTrap: (element: HTMLElement | null) => void;
  isKeyboardUser: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Accessibility Provider
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect keyboard user
    const handleKeyDown = () => setIsKeyboardUser(true);
    const handleMouseDown = () => setIsKeyboardUser(false);
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    // Check for user preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);
    
    // Check for high contrast mode
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrastMode(highContrastQuery.matches);
    
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrastMode(e.matches);
    highContrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      mediaQuery.removeEventListener('change', handleMotionChange);
      highContrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      
      // Clear the message after a short delay
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const setFocusTrap = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        announceToScreenReader,
        setFocusTrap,
        isKeyboardUser,
        highContrastMode,
        reducedMotion
      }}
    >
      {children}
      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </AccessibilityContext.Provider>
  );
};

// Focus Trap Component
interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  onEscape?: () => void;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  active = true, 
  onEscape,
  className 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setFocusTrap } = useAccessibility();

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the first element
    if (firstElement) {
      setFocusTrap(firstElement);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, onEscape, setFocusTrap]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Skip Link Component
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ 
  href, 
  children 
}) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
  >
    {children}
  </a>
);

// Screen Reader Only Text
export const SrOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Accessible Button Component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  description?: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  description,
  loading = false,
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  ...props
}) => {
  const { announceToScreenReader } = useAccessibility();
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (description) {
      announceToScreenReader(description);
    }
    
    props.onClick?.(e);
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-pressed={isPressed}
      aria-describedby={description ? `${props.id || 'button'}-desc` : undefined}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
      {description && (
        <span id={`${props.id || 'button'}-desc`} className="sr-only">
          {description}
        </span>
      )}
    </button>
  );
};

// Accessible Modal Component
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  description,
  className
}) => {
  const { announceToScreenReader } = useAccessibility();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      announceToScreenReader(`${title} modal opened`);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, title, announceToScreenReader]);

  if (!isOpen) return null;

  return (
    <FocusTrap active={isOpen} onEscape={onClose}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
          role="presentation"
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby={description ? "modal-description" : undefined}
            className={cn(
              "relative bg-white rounded-lg shadow-xl max-w-md w-full p-6",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Description */}
            {description && (
              <p id="modal-description" className="text-sm text-gray-600 mb-4">
                {description}
              </p>
            )}

            {/* Content */}
            <div>{children}</div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

// Accessible Form Field Component
interface AccessibleFormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  id,
  error,
  required = false,
  children,
  description,
  className
}) => {
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      
      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
        required
      })}
      
      {error && (
        <div 
          id={errorId} 
          className="text-sm text-destructive" 
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};

// Keyboard Navigation Hook
export const useKeyboardNavigation = (items: unknown[], onSelect: (index: number) => void) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSelect(focusedIndex);
        }
        break;
      case 'Escape':
        setFocusedIndex(-1);
        break;
    }
  };

  return { focusedIndex, handleKeyDown, setFocusedIndex };
};

// High Contrast Mode Hook
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
};

// Reduced Motion Hook
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Focus Management Hook
export const useFocusManagement = () => {
  const focusStack = useRef<HTMLElement[]>([]);

  const pushFocus = (element: HTMLElement) => {
    focusStack.current.push(element);
  };

  const popFocus = () => {
    const element = focusStack.current.pop();
    if (element) {
      element.focus();
    }
  };

  const returnFocus = () => {
    const element = focusStack.current[focusStack.current.length - 1];
    if (element) {
      element.focus();
    }
  };

  return { pushFocus, popFocus, returnFocus };
};

export default AccessibilityProvider;

// Skip to main content link
export const SkipToMainContent: React.FC = () => (
  <motion.a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    Skip to main content
  </motion.a>
);

// Accessible image with proper alt text
export const AccessibleImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  decorative?: boolean;
}> = ({ src, alt, className = '', decorative = false }) => (
  <img
    src={src}
    alt={decorative ? '' : alt}
    className={className}
    role={decorative ? 'presentation' : undefined}
  />
);

// Live region for announcements
export const LiveRegion: React.FC<{ 
  children: React.ReactNode;
  ariaLive?: 'polite' | 'assertive' | 'off';
}> = ({ children, ariaLive = 'polite' }) => (
  <div aria-live={ariaLive} aria-atomic="true" className="sr-only">
    {children}
  </div>
);

// Accessibility settings panel
export const AccessibilitySettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  useEffect(() => {
    // Apply high contrast mode
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    // Apply screen reader mode
    if (screenReaderMode) {
      document.documentElement.classList.add('screen-reader-mode');
    } else {
      document.documentElement.classList.remove('screen-reader-mode');
    }
  }, [highContrast, reducedMotion, screenReaderMode]);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Accessibility className="w-4 h-4 mr-2" />
        Accessibility
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-80 z-50">
          <CardHeader>
            <CardTitle className="text-lg">Accessibility Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="high-contrast" className="text-sm font-medium">
                  High Contrast
                </label>
                <p className="text-xs text-gray-500">
                  Increase contrast for better visibility
                </p>
              </div>
              <input
                id="high-contrast"
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="reduced-motion" className="text-sm font-medium">
                  Reduced Motion
                </label>
                <p className="text-xs text-gray-500">
                  Reduce animations and transitions
                </p>
              </div>
              <input
                id="reduced-motion"
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="screen-reader" className="text-sm font-medium">
                  Screen Reader Mode
                </label>
                <p className="text-xs text-gray-500">
                  Optimize for screen readers
                </p>
              </div>
              <input
                id="screen-reader"
                type="checkbox"
                checked={screenReaderMode}
                onChange={(e) => setScreenReaderMode(e.target.checked)}
                className="rounded"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Keyboard shortcuts help
export const KeyboardShortcuts: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Keyboard className="w-5 h-5 mr-2" />
            Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Navigation</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Tab</span>
                  <span>Navigate between elements</span>
                </div>
                <div className="flex justify-between">
                  <span>Shift + Tab</span>
                  <span>Navigate backwards</span>
                </div>
                <div className="flex justify-between">
                  <span>Enter / Space</span>
                  <span>Activate buttons</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">App Shortcuts</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Ctrl/Cmd + ?</span>
                  <span>Show this help</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl/Cmd + K</span>
                  <span>Search venues</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl/Cmd + M</span>
                  <span>Open messages</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setIsVisible(false)}
            className="w-full"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// ARIA landmarks
export const MainLandmark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <main role="main" aria-label="Main content" tabIndex={-1}>
    {children}
  </main>
);

export const NavigationLandmark: React.FC<{ 
  children: React.ReactNode;
  label?: string;
}> = ({ children, label = "Main navigation" }) => (
  <nav role="navigation" aria-label={label} tabIndex={-1}>
    {children}
  </nav>
);

export const SearchLandmark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div role="search" aria-label="Search">
    {children}
  </div>
);

export const BannerLandmark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <header role="banner">
    {children}
  </header>
);

export const ContentInfoLandmark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <footer role="contentinfo">
    {children}
  </footer>
);

// Accessible loading indicator
export const AccessibleLoadingIndicator: React.FC<{
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}> = ({ isLoading, loadingText = "Loading...", children }) => (
  <div aria-live="polite" aria-busy={isLoading}>
    {isLoading ? (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
        <span className="text-sm text-gray-600">{loadingText}</span>
      </div>
    ) : (
      children
    )}
  </div>
);

// High contrast mode support
export const HighContrastMode: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="[&_*]:border-[#000000] [&_*]:text-[#000000] [&_*]:bg-[#ffffff] [&_*]:outline-[#000000] [&_*]:outline-2 [&_*]:outline-offset-2">
    {children}
  </div>
);

// Reduced motion support
export const ReducedMotion: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="motion-reduce:[&_*]:animate-none motion-reduce:[&_*]:transition-none">
    {children}
  </div>
);

// Focus visible styles
export const FocusVisible: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="[&_*:focus-visible]:outline-2 [&_*:focus-visible]:outline-offset-2 [&_*:focus-visible]:outline-primary">
    {children}
  </div>
);

// Announcement component for screen readers
export const Announcement: React.FC<{ 
  message: string;
  priority?: 'polite' | 'assertive';
}> = ({ message, priority = 'polite' }) => {
  const [announcements, setAnnouncements] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (message) {
      setAnnouncements(prev => [...prev, message]);
      const timer = setTimeout(() => {
        setAnnouncements(prev => prev.filter(m => m !== message));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <LiveRegion aria-live={priority} aria-atomic={true}>
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </LiveRegion>
  );
};

// Keyboard shortcut display
export const KeyboardShortcut: React.FC<{ 
  keys: string[];
  description: string;
}> = ({ keys, description }) => (
  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
    <span>{description}</span>
    <div className="flex space-x-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
            {key}
          </kbd>
          {index < keys.length - 1 && <span>+</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
); 