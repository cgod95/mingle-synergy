import React, { useEffect, useRef, useState } from 'react';
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
import { useKeyboardNavigation, getAriaLabel } from './accessibility-utils';

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

// Screen reader only text
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Focus trap for modals
export const FocusTrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
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

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
};

// Accessible button with proper ARIA attributes
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  ariaLabel, 
  ariaDescribedBy, 
  ariaExpanded, 
  ariaPressed, 
  disabled = false,
  className = ''
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    aria-expanded={ariaExpanded}
    aria-pressed={ariaPressed}
    className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
  >
    {children}
  </button>
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
  'aria-live'?: 'polite' | 'assertive';
  'aria-atomic'?: boolean;
}> = ({ children, 'aria-live': ariaLive = 'polite', 'aria-atomic': ariaAtomic = true }) => (
  <div
    aria-live={ariaLive}
    aria-atomic={ariaAtomic}
    className="sr-only"
  >
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
  <main role="main" aria-label="Main content">
    {children}
  </main>
);

export const NavigationLandmark: React.FC<{ 
  children: React.ReactNode;
  label?: string;
}> = ({ children, label = "Main navigation" }) => (
  <nav role="navigation" aria-label={label}>
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

// Accessible form field
export const AccessibleFormField: React.FC<{
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, id, error, required = false, children }) => (
  <div className="space-y-2">
    <label 
      htmlFor={id} 
      className="block text-sm font-medium text-gray-700"
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
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

// Re-export for convenience
export { useKeyboardNavigation, getAriaLabel };

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

// Accessibility provider for global settings
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FocusVisible>
      <ReducedMotion>
        {children}
      </ReducedMotion>
    </FocusVisible>
  );
}; 