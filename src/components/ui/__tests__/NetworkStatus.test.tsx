
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NetworkStatus from '../NetworkStatus';

describe('NetworkStatus', () => {
  // Mock the navigator.onLine property
  const originalNavigator = { ...navigator };
  let navigatorSpy: any;

  beforeEach(() => {
    // Create a spy object that will track calls to navigator properties
    navigatorSpy = {
      get onLine() {
        return true; // Default to online
      }
    };
    
    // Mock window event listeners
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when online', () => {
    Object.defineProperty(window, 'navigator', {
      value: { ...navigatorSpy, onLine: true },
      writable: true
    });
    
    const { container } = render(<NetworkStatus />);
    expect(container.firstChild).toBeNull();
  });

  it('should register event listeners on mount', () => {
    render(<NetworkStatus />);
    expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});
